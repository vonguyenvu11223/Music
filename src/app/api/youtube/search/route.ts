import { NextRequest, NextResponse } from "next/server";

const YT_SEARCH = "https://www.googleapis.com/youtube/v3/search";
const YT_VIDEOS = "https://www.googleapis.com/youtube/v3/videos";

export const dynamic = "force-dynamic";

/** Parse ISO 8601 duration (PT3M45S) → milliseconds */
function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const h = Number(m[1] ?? 0);
  const min = Number(m[2] ?? 0);
  const sec = Number(m[3] ?? 0);
  return (h * 3600 + min * 60 + sec) * 1000;
}

type YTSearchItem = {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium?: { url: string };
      high?: { url: string };
      default?: { url: string };
    };
    publishedAt: string;
  };
};

type YTSearchResponse = {
  items?: YTSearchItem[];
  nextPageToken?: string;
  pageInfo?: { totalResults: number };
  error?: { message: string; code: number };
};

type YTVideoItem = {
  id: string;
  contentDetails: { duration: string };
};

type YTVideosResponse = {
  items?: YTVideoItem[];
};

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY is not set in .env.local" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const maxResults = Math.min(Number(searchParams.get("limit") ?? "20"), 25);
    const pageToken = searchParams.get("pageToken") ?? "";

    if (!q) {
      return NextResponse.json({ items: [], nextPageToken: null, total: 0 });
    }

    // Step 1: Search YouTube for music videos
    const searchUrl = new URL(YT_SEARCH);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoCategoryId", "10"); // Music category
    searchUrl.searchParams.set("q", q);
    searchUrl.searchParams.set("maxResults", String(maxResults));
    searchUrl.searchParams.set("key", apiKey);
    searchUrl.searchParams.set("regionCode", "VN"); // Ưu tiên nội dung Việt Nam
    searchUrl.searchParams.set("relevanceLanguage", "vi");
    if (pageToken) searchUrl.searchParams.set("pageToken", pageToken);

    const searchRes = await fetch(searchUrl.toString(), {
      next: { revalidate: 0 },
    });

    if (!searchRes.ok) {
      const err = await searchRes.text();
      throw new Error(`YouTube Search API error: ${searchRes.status} — ${err}`);
    }

    const searchData = (await searchRes.json()) as YTSearchResponse;

    if (searchData.error) {
      throw new Error(`YouTube: ${searchData.error.message} (code ${searchData.error.code})`);
    }

    const rawItems = searchData.items ?? [];
    if (!rawItems.length) {
      return NextResponse.json({ items: [], nextPageToken: null, total: 0 });
    }

    // Step 2: Get video durations (separate API call)
    const videoIds = rawItems.map((i) => i.id.videoId).join(",");
    const videosUrl = new URL(YT_VIDEOS);
    videosUrl.searchParams.set("part", "contentDetails");
    videosUrl.searchParams.set("id", videoIds);
    videosUrl.searchParams.set("key", apiKey);

    const videosRes = await fetch(videosUrl.toString(), {
      next: { revalidate: 0 },
    });

    const videosData = videosRes.ok
      ? ((await videosRes.json()) as YTVideosResponse)
      : { items: [] };

    const durationMap = new Map<string, number>();
    for (const v of videosData.items ?? []) {
      durationMap.set(v.id, parseDuration(v.contentDetails.duration));
    }

    // Step 3: Build response
    const items = rawItems.map((item) => {
      const videoId = item.id.videoId;
      const thumb =
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        "";
      return {
        id: videoId,
        title: item.snippet.title
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'"),
        artist: item.snippet.channelTitle.replace(/ - Topic$| VEVO$| Official$/i, ""),
        album: "",
        durationMs: durationMap.get(videoId) ?? 0,
        youtubeVideoId: videoId,
        imageUrl: thumb,
        // No streamUrl — will be played via YouTube IFrame Player
        streamUrl: undefined,
      };
    });

    return NextResponse.json({
      items,
      nextPageToken: searchData.nextPageToken ?? null,
      total: searchData.pageInfo?.totalResults ?? items.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[youtube/search]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
