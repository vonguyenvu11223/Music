"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/search/SearchBar";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import toast from "react-hot-toast";
import { Play, Music2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { usePlayerStore } from "@/store/playerStore";
import { cn } from "@/lib/utils";

type DeezerTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs?: number;
  streamUrl: string;
  imageUrl: string;
};

type SearchResult = {
  items: DeezerTrack[];
  total: number;
  hasMore: boolean;
  nextIndex: number | null;
};

async function searchDeezer(q: string, index: number): Promise<SearchResult> {
  const res = await fetch(
    `/api/deezer/search?q=${encodeURIComponent(q)}&limit=25&index=${index}`,
  );
  const json = (await res.json()) as SearchResult & { error?: string };
  if (!res.ok) throw new Error(json.error ?? "Lỗi tìm kiếm");
  return {
    items: json.items ?? [],
    total: json.total ?? 0,
    hasMore: json.hasMore ?? false,
    nextIndex: json.nextIndex ?? null,
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
  const [index, setIndex] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setIndex(0);
      setDebounced(query.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const enabled = debounced.length >= 2;

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["deezer-search", debounced, index],
    queryFn: () => searchDeezer(debounced, index),
    enabled,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const handlePlay = (track: DeezerTrack, allTracks: DeezerTrack[]) => {
    const queue = allTracks.map((t) => ({
      id: `dz-${t.id}`,
      title: t.title,
      artist: t.artist,
      album: t.album,
      imageUrl: t.imageUrl || undefined,
      durationMs: t.durationMs,
      streamUrl: t.streamUrl,
    }));
    const idx = allTracks.findIndex((t) => t.id === track.id);
    setPlayingId(track.id);
    playTrack(
      {
        id: `dz-${track.id}`,
        title: track.title,
        artist: track.artist,
        album: track.album,
        imageUrl: track.imageUrl || undefined,
        durationMs: track.durationMs,
        streamUrl: track.streamUrl,
      },
      { queue, index: idx },
    );
    toast.success(`▶ ${track.title}`, { duration: 1500, icon: "🎵" });
  };

  const isTrackActive = (id: string) =>
    currentTrack?.id === `dz-${id}` && isPlaying;

  return (
    <div className="space-y-5">
      <SearchBar value={query} onChange={setQuery} />

      {/* Empty state */}
      {!enabled && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
            <Music2 className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-base font-semibold text-white/80">Tìm kiếm bài hát</p>
            <p className="mt-1 text-sm text-white/50">
              Hỗ trợ nhạc Việt Nam, Kpop, Vpop, Quốc tế…
              <br />
              Powered by <span className="font-medium text-white/70">Deezer</span> — 30s preview miễn phí
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-semibold text-red-300">Lỗi tìm kiếm</p>
            <p className="mt-0.5 text-xs text-red-300/70">
              {error instanceof Error ? error.message : "Có lỗi xảy ra. Thử lại sau."}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isFetching && <LoadingSkeleton rows={8} />}

      {/* Results */}
      {!isFetching && data && data.items.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[var(--shadow-soft)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Kết quả cho &quot;{debounced}&quot;
            </p>
            <p className="text-xs text-white/30">
              {index + 1}–{Math.min(index + 25, data.total)} / {data.total.toLocaleString()} bài
            </p>
          </div>

          {/* Track list */}
          <div className="divide-y divide-white/5">
            {data.items.map((track, i) => {
              const active = isTrackActive(track.id);
              return (
                <button
                  key={track.id}
                  onClick={() => handlePlay(track, data.items)}
                  className={cn(
                    "group w-full px-4 py-3 text-left transition",
                    active ? "bg-[var(--primary)]/10" : "hover:bg-white/5",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Index / playing indicator */}
                    <div className="w-5 shrink-0 text-center text-xs tabular-nums text-white/30 group-hover:hidden">
                      {active ? (
                        <span className="text-[var(--primary)]">♫</span>
                      ) : (
                        <span>{index + i + 1}</span>
                      )}
                    </div>
                    <div className="hidden w-5 shrink-0 place-items-center group-hover:grid">
                      <Play className="h-3 w-3 fill-white text-white" />
                    </div>

                    {/* Cover */}
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
                      {track.imageUrl ? (
                        <Image
                          src={track.imageUrl}
                          alt={track.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Music2 className="h-4 w-4 text-white/30" />
                        </div>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                        <Play className="h-4 w-4 fill-white text-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "truncate text-sm font-semibold transition",
                          active ? "text-[var(--primary)]" : "text-white group-hover:text-[var(--primary)]",
                        )}
                      >
                        {track.title}
                      </div>
                      <div className="truncate text-xs text-white/50">
                        {track.artist}
                        {track.album && track.album !== track.title && (
                          <span className="text-white/30"> · {track.album}</span>
                        )}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="w-10 shrink-0 text-right text-xs tabular-nums text-white/35">
                      {formatMs(track.durationMs)}
                    </div>

                    {/* Play btn */}
                    <div
                      className={cn(
                        "ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition",
                        "opacity-0 group-hover:opacity-100",
                        "border-transparent bg-[var(--primary)] text-black",
                      )}
                    >
                      <Play className="h-3.5 w-3.5 translate-x-[1px]" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
            <button
              onClick={() => setIndex(Math.max(0, index - 25))}
              disabled={index === 0}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-30"
            >
              ← Trang trước
            </button>
            <button
              onClick={() => {
                if (data.nextIndex != null) setIndex(data.nextIndex);
              }}
              disabled={!data.hasMore}
              className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-black transition hover:brightness-110 disabled:opacity-30"
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
            Không tìm thấy bài hát nào cho &quot;{debounced}&quot;
          </p>
          <p className="mt-1 text-xs text-white/35">Thử tìm tên bài hoặc tên nghệ sĩ khác</p>
        </div>
      )}
    </div>
  );
}
