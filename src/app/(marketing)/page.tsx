import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MotionDiv } from "@/components/motion";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Home",
  description: "VIBEFLOW — premium streaming experience.",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
      <Sparkles className="h-3.5 w-3.5 text-primary" />
      <span>{children}</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(1000px_600px_at_20%_20%,rgba(30,215,96,0.14),transparent_60%),radial-gradient(900px_500px_at_80%_30%,rgba(255,255,255,0.08),transparent_55%)]">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-(--primary)/15 ring-1 ring-(--ring) shadow-(--shadow-soft) grid place-items-center">
              <div className="h-4 w-4 rounded-sm bg-primary" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">
                VIBEFLOW
              </div>
              <div className="text-[11px] text-white/50">Stream in style</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              Log in
            </Link>
            <Link
              href="/app/home"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black hover:brightness-110 transition"
            >
              Open app
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 pb-20 pt-14 lg:grid-cols-[1.2fr_0.8fr] lg:pt-20">
        <div className="flex flex-col gap-6">
          <Pill>YouTube playback + Spotify metadata search</Pill>
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              A luxurious music streaming experience, built for focus.
            </h1>
            <p className="max-w-xl text-pretty text-base leading-7 text-white/65">
              VIBEFLOW combines premium UI, smooth motion, and real full-length
              music (YouTube) with powerful metadata search (Spotify) to deliver
              a startup-grade listening experience.
            </p>
          </MotionDiv>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Get started
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
            >
              Explore search
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { k: "Glass UI", v: "Cards + panels" },
              { k: "Smooth", v: "Framer Motion" },
              { k: "Fast", v: "Server-first Next.js" },
            ].map((x) => (
              <div
                key={x.k}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur shadow-(--shadow-soft)"
              >
                <div className="text-sm font-semibold text-white">{x.k}</div>
                <div className="text-xs text-white/55">{x.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-4xl bg-[radial-gradient(700px_500px_at_30%_20%,rgba(30,215,96,0.18),transparent_60%)] blur-2xl" />
          <div
            className={cn(
              "relative rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur shadow-(--shadow-lift)",
              "overflow-hidden",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white/90">
                Featured playlists
              </div>
              <div className="text-xs text-white/50">Curated for you</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {["Night Drive", "Focus Mode", "Neon Pop", "Deep House"].map(
                (name) => (
                  <div
                    key={name}
                    className="group rounded-2xl border border-white/10 bg-black/30 p-4 shadow-(--shadow-soft) transition hover:-translate-y-0.5 hover:bg-black/40"
                  >
                    <div className="h-12 w-12 rounded-xl bg-(--primary)/15 ring-1 ring-(--ring)" />
                    <div className="mt-3 text-sm font-semibold text-white">
                      {name}
                    </div>
                    <div className="text-xs text-white/50">Mixed vibes</div>
                  </div>
                ),
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs font-medium text-white/55">
                Trending now
              </div>
              <div className="mt-2 space-y-2">
                {["Midnight City", "Electric Bloom", "Aurora Waves"].map(
                  (t) => (
                    <div
                      key={t}
                      className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-white/5 transition"
                    >
                      <div className="text-sm text-white/85">{t}</div>
                      <div className="text-xs text-white/45">3:21</div>
                    </div>
                  ),
                )}
              </div>
              <div className="mt-3 text-[11px] text-white/45">
                Sign in to start playing.
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 bg-black/40">
        <div className="mx-auto max-w-6xl px-5 py-6 text-xs text-white/45">
          © {new Date().getFullYear()} VIBEFLOW. Built with Next.js, Supabase,
          Spotify API, and YouTube.
        </div>
      </footer>
    </div>
  );
}
