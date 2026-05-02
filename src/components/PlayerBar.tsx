"use client";

import Image from "next/image";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
} from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { usePlayerStore } from "@/store/playerStore";

function formatMs(ms?: number) {
  if (!ms || ms < 0) return "0:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    volume,
    progressMs,
    repeatMode,
    shuffle,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    setProgressMs,
    setRepeatMode,
    toggleShuffle,
  } = usePlayerStore();

  const { canPlay } = useAudioPlayer();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const el = e.target as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.getAttribute("contenteditable") === "true");
      if (typing) return;
      e.preventDefault();
      if (!currentTrack) return;
      if (!canPlay) {
        toast.error("This track has no playable stream (Jamendo match missing).");
        return;
      }
      togglePlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canPlay, currentTrack, togglePlay]);

  const duration = currentTrack?.durationMs ?? 0;


  const cycleRepeat = () => {
    const next =
      repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
    setRepeatMode(next);
    toast.success(
      next === "off" ? "Repeat off" : next === "all" ? "Repeat all" : "Repeat one",
      { duration: 1200 },
    );
  };

  return (
    <div className="sticky bottom-0 z-20 border-t border-white/5 bg-black/60 backdrop-blur">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-3 px-4 py-3 lg:grid-cols-[360px_1fr_360px] lg:px-6">
        {/* Track */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
            {currentTrack?.imageUrl ? (
              <Image
                src={currentTrack.imageUrl}
                alt={currentTrack.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(120px_80px_at_30%_20%,rgba(30,215,96,0.25),transparent_60%)]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">
              {currentTrack?.title ?? "Nothing playing"}
            </div>
            <div className="truncate text-xs text-white/55">
              {currentTrack?.artist ?? "Pick something to play"}
            </div>
          </div>
          {!canPlay && currentTrack ? (
            <span className="ml-2 hidden rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/60 sm:inline">
              No stream
            </span>
          ) : null}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition",
                shuffle && "text-[var(--primary)] ring-1 ring-[var(--ring)]",
              )}
              aria-label="Shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              onClick={prevTrack}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
              aria-label="Previous"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (!currentTrack) return;
                if (!canPlay) {
                  toast.error(
                    "No playable stream for this track (Jamendo match missing).",
                  );
                  return;
                }
                togglePlay();
              }}
              className="grid h-11 w-11 place-items-center rounded-full bg-[var(--primary)] text-black hover:brightness-110 transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 translate-x-[1px]" />
              )}
            </button>
            <button
              onClick={nextTrack}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
              aria-label="Next"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              onClick={cycleRepeat}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition",
                repeatMode !== "off" &&
                  "text-[var(--primary)] ring-1 ring-[var(--ring)]",
              )}
              aria-label="Repeat"
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          {/* Seek */}
          <div className="flex w-full max-w-[560px] items-center gap-2">
            <div className="w-10 text-right text-[11px] tabular-nums text-white/45">
              {formatMs(progressMs)}
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(1, duration)}
              value={Math.min(duration, progressMs)}
              onChange={(e) => setProgressMs(Number(e.target.value))}
              className="h-1 w-full appearance-none rounded-full bg-white/10 accent-[var(--primary)]"
            />
            <div className="w-10 text-[11px] tabular-nums text-white/45">
              {formatMs(duration)}
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden items-center justify-end gap-2 lg:flex">
          <Volume2 className="h-4 w-4 text-white/55" />
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="h-1 w-40 appearance-none rounded-full bg-white/10 accent-[var(--primary)]"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

