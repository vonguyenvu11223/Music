"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { type Track, usePlayerStore } from "@/store/playerStore";

export function TrackCard({
  track,
  hint,
  className,
}: {
  track: Track;
  hint?: string;
  className?: string;
}) {
  const playTrack = usePlayerStore((s) => s.playTrack);

  return (
    <button
      onClick={() => {
        if (!track.streamUrl) {
          toast(hint ?? "No playable stream yet. Search on YouTube to play.");
        }
        playTrack(track, { queue: [track], index: 0 });
      }}
      className={cn(
        "group text-left rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[var(--shadow-soft)] backdrop-blur transition",
        "hover:-translate-y-0.5 hover:bg-white/7",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-black/30 ring-1 ring-white/10">
        {track.imageUrl ? (
          <Image
            src={track.imageUrl}
            alt={track.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 20vw"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(140px_100px_at_30%_20%,rgba(30,215,96,0.25),transparent_60%)]" />
        )}
        <div className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full bg-[var(--primary)] text-black opacity-0 shadow-[var(--shadow-lift)] transition group-hover:opacity-100">
          <Play className="h-5 w-5 translate-x-[1px]" />
        </div>
      </div>
      <div className="mt-3 truncate text-sm font-semibold text-white">
        {track.title}
      </div>
      <div className="truncate text-xs text-white/55">{track.artist}</div>
    </button>
  );
}

