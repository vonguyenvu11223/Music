"use client";

export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[var(--shadow-soft)]">
      <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-1/5 animate-pulse rounded bg-white/8" />
            </div>
            <div className="h-3 w-10 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

