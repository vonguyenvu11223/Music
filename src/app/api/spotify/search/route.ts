import { NextRequest, NextResponse } from "next/server";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_URL = "https://api.spotify.com/v1";

let tokenCache: { token: string; expires: number } | null = null;

async function getToken() {
  if (tokenCache && Date.now() < tokenCache.expires) {
    return tokenCache.token;
  }

  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!id || !secret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET env vars");
  }

  const auth = Buffer.from(`${id}:${secret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    // Next.js 15+: use next option instead of cache
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Spotify token error: ${res.status} – ${err}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    token: data.access_token,
    expires: Date.now() + data.expires_in * 1000 - 10_000,
  };

  return tokenCache.token;
}

type SpotifyItem = {
  id: string;
  name: string;
  artists: { name: string }[];
  album?: { name: string; images?: { url: string }[] };
  duration_ms?: number;
};

type SpotifySearchResponse = {
  tracks?: {
    items: SpotifyItem[];
    next: string | null;
    offset: number;
    limit: number;
    total: number;
  };
};

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const limit = Math.min(Number(searchParams.get("limit") ?? "15"), 50);
    const offset = Math.max(Number(searchParams.get("offset") ?? "0"), 0);

    if (!q) {
      return NextResponse.json({ items: [], nextOffset: null });
    }

    const token = await getToken();

    const url = `${API_URL}/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}&offset=${offset}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Spotify search error: ${res.status} – ${err}`);
    }

    const data = (await res.json()) as SpotifySearchResponse;
    const tracks = data.tracks;

    // Compute nextOffset: if Spotify says there's a `next`, return the next offset
    const nextOffset =
      tracks?.next != null ? (tracks.offset ?? 0) + (tracks.limit ?? limit) : null;

    return NextResponse.json({
      items: tracks?.items ?? [],
      nextOffset,
      total: tracks?.total ?? 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[spotify/search]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
