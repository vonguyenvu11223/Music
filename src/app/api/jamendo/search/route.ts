import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.jamendo.com/v3.0";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.JAMENDO_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "JAMENDO_CLIENT_ID is not set in .env.local" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);
    const offset = Math.max(Number(searchParams.get("offset") ?? "0"), 0);

    if (!q) {
      return NextResponse.json({ items: [], hasMore: false, total: 0 });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      format: "json",
      limit: String(limit),
      offset: String(offset),
      namesearch: q,
      audioformat: "mp32",
      include: "musicinfo",
      imagesize: "500",
    });

    const res = await fetch(`${BASE}/tracks?${params}`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Jamendo API error: ${res.status} – ${err}`);
    }

    type JamendoTrackRaw = {
      id: string;
      name: string;
      artist_name: string;
      album_name?: string;
      duration?: number;
      audio: string;
      image?: string;
    };
    type JamendoResponse = {
      results?: JamendoTrackRaw[];
      headers?: { results_count?: number };
    };

    const data = (await res.json()) as JamendoResponse;
    const raw = data.results ?? [];
    const total = data.headers?.results_count ?? raw.length;

    const items = raw
      .filter((t) => !!t.audio) // only tracks with a playable stream
      .map((t) => ({
        id: t.id,
        title: t.name,
        artist: t.artist_name,
        album: t.album_name ?? "",
        durationMs: t.duration ? t.duration * 1000 : undefined,
        streamUrl: t.audio, // direct mp3 stream — ready to play!
        imageUrl: t.image ?? "",
      }));

    return NextResponse.json({
      items,
      total,
      hasMore: offset + limit < total,
      nextOffset: offset + limit < total ? offset + limit : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[jamendo/search]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
