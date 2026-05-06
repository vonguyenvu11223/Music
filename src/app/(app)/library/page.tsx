"use client";

import { Heart, Music2 } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { SongRow } from "@/components/SongRow";
import { SectionHeader } from "@/components/SectionHeader";

export default function LibraryPage() {
  const likedSongs = usePlayerStore((s) => s.likedSongs);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-8 shadow-(--shadow-lift)">
        <div className="relative z-10 flex items-center gap-6">
          <div className="grid h-32 w-32 place-items-center rounded-2xl bg-primary shadow-(--shadow-lift)">
            <Heart className="h-14 w-14 fill-black text-black" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/60">
              Playlist
            </div>
            <h1 className="mt-2 text-5xl font-black text-white lg:text-7xl">
              Liked Songs
            </h1>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/80">
              <span className="font-bold text-white">VIBEFLOW User</span>
              <span className="text-white/40">•</span>
              <span>{likedSongs.length} songs</span>
            </div>
          </div>
        </div>
        {/* Background glow */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </div>

      {/* Songs list */}
      <section className="space-y-4">
        {likedSongs.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="divide-y divide-white/5">
              {likedSongs.map((track) => (
                <SongRow
                  key={track.id}
                  spotify={{
                    id: track.id.startsWith("sp-") ? track.id.replace("sp-", "") : track.id,
                    title: track.title,
                    artist: track.artist,
                    album: track.album,
                    imageUrl: track.imageUrl,
                    durationMs: track.durationMs,
                  }}
                  isPrefixed={!track.id.startsWith("sp-")}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
              <Music2 className="h-6 w-6 text-white/20" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white/80">
              No liked songs yet
            </h3>
            <p className="mt-1 text-sm text-white/40">
              Heart songs to see them here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

