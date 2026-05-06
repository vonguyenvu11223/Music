import { NextResponse } from "next/server";

const YT_SEARCH = "https://www.googleapis.com/youtube/v3/search";

type YTSearchItem = {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
};

type YTSearchResponse = {
  items?: YTSearchItem[];
  error?: { message: string; code: number };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { title?: string; artist?: string };
    const title = body.title?.trim() ?? "";
    const artist = body.artist?.trim() ?? "";
    if (!title || !artist) return NextResponse.json(null);

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return NextResponse.json(null, { status: 500 });

    const searchUrl = new URL(YT_SEARCH);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoCategoryId", "10"); // Music
    searchUrl.searchParams.set("q", `${title} ${artist}`);
    searchUrl.searchParams.set("maxResults", "5");
    searchUrl.searchParams.set("key", apiKey);

    const ytRes = await fetch(searchUrl.toString(), { cache: "no-store" });
    if (!ytRes.ok) return NextResponse.json(null);

    const json = (await ytRes.json()) as YTSearchResponse;
    if (json.error) return NextResponse.json(null, { status: 500 });

    const first = json.items?.[0];
    if (!first) return NextResponse.json(null);

    const thumb =
      first.snippet.thumbnails.high?.url ??
      first.snippet.thumbnails.medium?.url ??
      first.snippet.thumbnails.default?.url ??
      "";

    return NextResponse.json({
      youtubeVideoId: first.id.videoId,
      imageUrl: thumb,
      // Keep streamUrl as undefined – playback via YouTubePlayer component
      streamUrl: undefined,
    });
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
