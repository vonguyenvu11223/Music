import { Flame, Sparkles } from "lucide-react";
import { TrackCard } from "@/components/TrackCard";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata = {
  title: "Home",
  description: "Your VIBEFLOW home.",
};

export default function AppHomePage() {
  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(30,215,96,0.20),transparent_55%),linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[var(--shadow-lift)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white/90">
              Welcome back
            </div>
            <div className="mt-1 text-xl font-semibold text-white">
              Let’s find your next vibe.
            </div>
            <div className="mt-2 text-sm text-white/60">
              Search with Spotify metadata, stream full songs via YouTube.
            </div>
          </div>
          <div className="flex gap-2">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
              <Sparkles className="mr-1 inline h-4 w-4 text-[var(--primary)]" />
              Premium UI
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
              <Flame className="mr-1 inline h-4 w-4 text-[var(--primary)]" />
              Trending picks
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <SectionHeader title="Recommended songs" subtitle="Handpicked vibes" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <TrackCard
              key={i}
              track={{
                id: `rec-${i}`,
                title: `Neon Drift ${i + 1}`,
                artist: "VIBEFLOW Radio",
                imageUrl: undefined,
                durationMs: 3 * 60_000 + 10_000,
              }}
              hint="Use Search to play real streams"
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title="New releases" subtitle="Fresh drops" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <TrackCard
              key={i}
              track={{
                id: `new-${i}`,
                title: `Afterglow ${i + 1}`,
                artist: "Night Studio",
                imageUrl: undefined,
                durationMs: 2 * 60_000 + 48_000,
              }}
              hint="Sign in to save to library"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

