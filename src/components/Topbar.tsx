"use client";

import { Search as SearchIcon, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Topbar() {
  const pathname = usePathname();
  const inSearch = pathname?.startsWith("/search");

  return (
    <div className="sticky top-0 z-10 border-b border-white/5 bg-black/35 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 lg:px-6">
        <div className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60",
              "focus-within:ring-2 focus-within:ring-[var(--ring)]",
              inSearch && "bg-white/8",
            )}
          >
            <SearchIcon className="h-4 w-4 text-white/45" />
            <Link href="/search" className="text-white/70 hover:text-white">
              Search tracks, artists, albums…
            </Link>
          </div>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          <div className="h-6 w-6 rounded-full bg-[var(--primary)]/15 ring-1 ring-[var(--ring)]" />
          <span className="hidden sm:inline font-medium">Account</span>
        </Link>
      </div>
    </div>
  );
}

