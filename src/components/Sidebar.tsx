"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Library,
  User,
  Music2,
  ListMusic,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Your Library", icon: Library },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[280px] lg:shrink-0 lg:border-r lg:border-white/5 lg:bg-black/40 lg:backdrop-blur">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="h-9 w-9 rounded-xl bg-[var(--primary)]/15 ring-1 ring-[var(--ring)] grid place-items-center shadow-[var(--shadow-soft)]">
          <Music2 className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide">VIBEFLOW</div>
          <div className="text-[11px] text-white/50">Premium streaming</div>
        </div>
      </div>

      <nav className="px-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                "hover:bg-white/5",
                active
                  ? "bg-white/7 text-white"
                  : "text-white/70 hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  active ? "text-[var(--primary)]" : "text-white/60",
                )}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 px-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <ListMusic className="h-4 w-4 text-[var(--primary)]" />
            Queue & Shortcuts
          </div>
          <div className="mt-2 text-[11px] leading-5 text-white/55">
            Space = play/pause. Use Search to find tracks and instantly start
            playback when a Jamendo match exists.
          </div>
        </div>
      </div>

      <div className="mt-auto px-5 pb-5 text-[11px] text-white/35">
        © {new Date().getFullYear()} VIBEFLOW
      </div>
    </aside>
  );
}

