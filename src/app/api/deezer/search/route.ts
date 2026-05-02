import { NextRequest, NextResponse } from "next/server";

const DEEZER_API = "https://api.deezer.com";

export const dynamic = "force-dynamic";

type DeezerTrackRaw = {
  id: number;
  title: string;
  duration: number; // seconds
  preview: string; // 30s mp3 stream URL — free, no auth needed
  artist: {
    id: number;
    name: string;
    picture_medium?: string;
  };
  album: {
    id: number;
    title: string;
    cover_medium?: string;
    cover_big?: string;
  };
};

type DeezerResponse = {
  data?: DeezerTrackRaw[];
  total?: number;
  next?: string;
  error?: { type: string; message: string; code: number };
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const limit = Math.min(Number(searchParams.get("limit") ?? "25"), 50);
    const index = Math.max(Number(searchParams.get("index") ?? "0"), 0);

    if (!q) {
      return NextResponse.json({ items: [], total: 0, hasMore: false, nextIndex: null });
    }

    const url = new URL(`${DEEZER_API}/search`);
    url.searchParams.set("q", q);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("index", String(index));
    url.searchParams.set("output", "json");

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Deezer API error: ${res.status}`);
    }

    const data = (await res.json()) as DeezerResponse;

    if (data.error) {
      throw new Error(`Deezer: ${data.error.message} (code ${data.error.code})`);
    }

    const raw = data.data ?? [];
    const total = data.total ?? 0;
    const hasMore = !!data.next;
    const nextIndex = hasMore ? index + limit : null;

    const items = raw
      .filter((t) => !!t.preview) // chỉ lấy track có preview stream
      .map((t) => ({
        id: String(t.id),
        title: t.title,
        artist: t.artist.name,
        album: t.album.title ?? "",
        durationMs: t.duration * 1000,
        // preview là stream mp3 30 giây — Deezer cho free
        streamUrl: t.preview,
        imageUrl: t.album.cover_big ?? t.album.cover_medium ?? "",
        artistImageUrl: t.artist.picture_medium ?? "",
      }));

    return NextResponse.json({ items, total, hasMore, nextIndex });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[deezer/search]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
