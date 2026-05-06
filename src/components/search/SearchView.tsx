"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/search/SearchBar";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import toast from "react-hot-toast";
import { Play, Music2, AlertCircle } from "lucide-react";

function YtIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
    </svg>
  );
}
import Image from "next/image";
import { usePlayerStore } from "@/store/playerStore";
import { cn } from "@/lib/utils";

type YTTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  youtubeVideoId: string;
  imageUrl: string;
  streamUrl?: undefined;
};

type SearchResult = {
  items: YTTrack[];
  total: number;
  nextPageToken: string | null;
};

async function searchYouTube(
  q: string,
  pageToken?: string,
): Promise<SearchResult> {
  const params = new URLSearchParams({ q, limit: "20" });
  if (pageToken) params.set("pageToken", pageToken);
  const res = await fetch(`/api/youtube/search?${params}`);
  const json = (await res.json()) as SearchResult & { error?: string };
  if (!res.ok) throw new Error(json.error ?? "Lỗi tìm kiếm");
  return {
    items: json.items ?? [],
    total: json.total ?? 0,
    nextPageToken: json.nextPageToken ?? null,
  };
}

function formatMs(ms?: number) {
  if (!ms) return "";
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export function SearchView() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<string[]>([]); // page token history for "Back"

  const playTrack = usePlayerStore((s) => s.playTrack);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  // Debounce input
  useEffect(() => {
    const t = setTimeout(() => {
      setPageToken(undefined);
      setHistory([]);
      setDebounced(query.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const enabled = debounced.length >= 2;

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["yt-search", debounced, pageToken],
    queryFn: () => searchYouTube(debounced, pageToken),
    enabled,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const handlePlay = (track: YTTrack, allTracks: YTTrack[]) => {
    const queue = allTracks.map((t) => ({
      id: `yt-${t.id}`,
      title: t.title,
      artist: t.artist,
      imageUrl: t.imageUrl || undefined,
      durationMs: t.durationMs,
      youtubeVideoId: t.youtubeVideoId,
    }));
    const idx = allTracks.findIndex((t) => t.id === track.id);
    playTrack(
      {
        id: `yt-${track.id}`,
        title: track.title,
        artist: track.artist,
        imageUrl: track.imageUrl || undefined,
        durationMs: track.durationMs,
        youtubeVideoId: track.youtubeVideoId,
      },
      { queue, index: idx },
    );
    toast.success(`▶ ${track.title}`, { duration: 1500, icon: "🎵" });
  };

  const isActive = (id: string) => currentTrack?.id === `yt-${id}` && isPlaying;

  const goNext = () => {
    if (!data?.nextPageToken) return;
    setHistory((h) => [...h, pageToken ?? ""]);
    setPageToken(data.nextPageToken);
  };

  const goPrev = () => {
    const prev = [...history];
    const token = prev.pop() ?? undefined;
    setHistory(prev);
    setPageToken(token);
  };

  return (
    <div className="space-y-5">
      <SearchBar value={query} onChange={setQuery} />

      {/* Empty state */}
      {!enabled && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/3 p-12 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
            <YtIcon className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-white/80">
              Tìm kiếm nhạc của bạn!
            </p>
            <p className="mt-1 text-sm text-white/50">
              Nhạc Việt Nam, Kpop, Vpop, Quốc tế…
              <br />
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-300">Lỗi tìm kiếm</p>
            <p className="mt-0.5 text-xs text-red-300/70">
              {error instanceof Error
                ? error.message
                : "Có lỗi xảy ra. Thử lại sau."}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isFetching && <LoadingSkeleton rows={8} />}

      {/* Results */}
      {!isFetching && data && data.items.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <YtIcon className="h-4 w-4 text-red-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Kết quả — &quot;{debounced}&quot;
              </p>
            </div>
            <p className="text-xs text-white/30">
              {data.total.toLocaleString()} video
            </p>
          </div>

          {/* Track list */}
          <div className="divide-y divide-white/5">
            {data.items.map((track, i) => {
              const active = isActive(track.id);
              return (
                <button
                  key={track.id}
                  onClick={() => handlePlay(track, data.items)}
                  className={cn(
                    "group w-full px-4 py-3 text-left transition",
                    active ? "bg-red-500/10" : "hover:bg-white/5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Index / playing */}
                    <div className="w-5 shrink-0 text-center text-xs tabular-nums text-white/30 group-hover:hidden">
                      {active ? (
                        <span className="animate-pulse text-red-400">♫</span>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <div className="hidden w-5 shrink-0 place-items-center group-hover:grid">
                      <Play className="h-3 w-3 fill-white text-white" />
                    </div>

                    {/* Thumbnail */}
                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
                      {track.imageUrl ? (
                        <Image
                          src={track.imageUrl}
                          alt={track.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Music2 className="h-4 w-4 text-white/30" />
                        </div>
                      )}
                      {/* YouTube play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-red-500">
                          <Play className="h-3.5 w-3.5 fill-white text-white translate-x-px" />
                        </div>
                      </div>
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                          <span className="animate-pulse text-lg">♫</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "truncate text-sm font-semibold transition",
                          active
                            ? "text-red-400"
                            : "text-white group-hover:text-red-400",
                        )}
                      >
                        {track.title}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <YtIcon className="h-3 w-3 shrink-0 text-red-500/60" />
                        <span className="truncate text-xs text-white/50">
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="w-10 shrink-0 text-right text-xs tabular-nums text-white/35">
                      {formatMs(track.durationMs)}
                    </div>

                    {/* Play btn */}
                    <div
                      className={cn(
                        "ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full transition",
                        "opacity-0 group-hover:opacity-100",
                        "bg-red-500 text-white",
                      )}
                    >
                      <Play className="h-3.5 w-3.5 translate-x-px" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
            <button
              onClick={goPrev}
              disabled={history.length === 0}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-30 cursor-pointer"
            >
              ← Trang trước
            </button>
            <button
              onClick={goNext}
              disabled={!data.nextPageToken}
              className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-30 cursor-pointer"
            >
              Trang sau →
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {!isFetching && enabled && data && data.items.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm font-medium text-white/60">
            Không tìm thấy kết quả cho &quot;{debounced}&quot;
          </p>
          <p className="mt-1 text-xs text-white/35">
            Thử tên bài hát hoặc nghệ sĩ khác
          </p>
        </div>
      )}
    </div>
  );
}
