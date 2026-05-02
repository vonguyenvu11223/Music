import { NextResponse } from "next/server";
import { matchSpotifyToJamendo, type JamendoTrack } from "@/lib/musicMatcher";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { title?: string; artist?: string };
    const title = body.title?.trim() ?? "";
    const artist = body.artist?.trim() ?? "";
    if (!title || !artist) return NextResponse.json(null);

    const clientId = process.env.JAMENDO_CLIENT_ID;
    if (!clientId) return NextResponse.json(null, { status: 500 });

    const jamendoRes = await fetch(
      "https://api.jamendo.com/v3.0/tracks?" +
        new URLSearchParams({
          client_id: clientId,
          format: "json",
          limit: "12",
          namesearch: title,
          artist_name: artist,
          audioformat: "mp32",
          include: "musicinfo",
        }),
      { cache: "no-store" },
    );
    if (!jamendoRes.ok) return NextResponse.json(null);
    const json = (await jamendoRes.json()) as { results?: JamendoTrack[] };
    const candidates: JamendoTrack[] = json.results ?? [];

    const match = matchSpotifyToJamendo({ title, artist }, candidates);
    if (!match) return NextResponse.json(null);

    return NextResponse.json({
      jamendoId: match.id,
      streamUrl: match.audio,
      imageUrl: match.image,
    });
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
