import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type TrackPayload = {
  trackId: string;
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  durationMs?: number;
  spotifyUri?: string;
  youtubeVideoId?: string;
};

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const { data, error } = await supabase
    .from("recently_played")
    .select("*")
    .order("last_played_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ items: [] }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await req.json()) as TrackPayload;
  if (!body?.trackId || !body?.title || !body?.artist) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const row = {
    user_id: user.id,
    track_id: body.trackId,
    title: body.title,
    artist: body.artist,
    album: body.album ?? null,
    image_url: body.imageUrl ?? null,
    duration_ms: body.durationMs ?? null,
    spotify_uri: body.spotifyUri ?? null,
    youtube_video_id: body.youtubeVideoId ?? null,
    last_played_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("recently_played")
    .upsert(row, { onConflict: "user_id,track_id" });

  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}

