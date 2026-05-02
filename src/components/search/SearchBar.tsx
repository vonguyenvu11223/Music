"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur",
        "focus-within:ring-2 focus-within:ring-[var(--ring)]",
        className,
      )}
    >
      <Search className="h-4 w-4 text-white/50" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search songs, artists, albums…"
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
      />
    </div>
  );
}

