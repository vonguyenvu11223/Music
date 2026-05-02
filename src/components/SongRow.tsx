"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/playerStore";

type SpotifyCompact = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  durationMs?: number;
};

async function matchToJamendo(input: { title: string; artist: string }) {
  const res = await fetch("/api/music/match", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return null;
  return (await res.json()) as
    | { streamUrl: string; imageUrl?: string; jamendoId: string }
    | null;
}

function formatMs(ms?: number) {
  if (!ms) return "";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function SongRow({
  spotify,
  onJamendoMissing,
}: {
  spotify: SpotifyCompact;
  onJamendoMissing?: () => void;
}) {
  const playTrack = usePlayerStore((s) => s.playTrack);

  const match = useMutation({
    mutationFn: () => matchToJamendo({ title: spotify.title, artist: spotify.artist }),
  });

  return (
    <button
      onClick={async () => {
        const res = await match.mutateAsync();
        if (!res?.streamUrl) {
          onJamendoMissing?.();
          playTrack({
            id: `sp-${spotify.id}`,
            title: spotify.title,
            artist: spotify.artist,
            album: spotify.album,
            imageUrl: spotify.imageUrl,
            durationMs: spotify.durationMs,
          });
          return;
        }
        playTrack({
          id: `sp-${spotify.id}`,
          title: spotify.title,
          artist: spotify.artist,
          album: spotify.album,
          imageUrl: res.imageUrl ?? spotify.imageUrl,
          durationMs: spotify.durationMs,
          streamUrl: res.streamUrl,
        });
      }}
      className={cn(
        "w-full text-left px-4 py-3 transition hover:bg-white/5",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
          {spotify.imageUrl ? (
            <Image
              src={spotify.imageUrl}
              alt={spotify.title}
              fill
              className="object-cover"
              sizes="40px"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">
            {spotify.title}
          </div>
          <div className="truncate text-xs text-white/55">{spotify.artist}</div>
        </div>
        <div className="hidden text-xs text-white/45 md:block">
          {spotify.album ?? ""}
        </div>
        <div className="w-12 text-right text-xs tabular-nums text-white/45">
          {formatMs(spotify.durationMs)}
        </div>
        <div className="ml-2 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition">
          <Play className="h-4 w-4 translate-x-[1px]" />
        </div>
      </div>
    </button>
  );
}

