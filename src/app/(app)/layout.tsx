import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { PlayerBar } from "@/components/PlayerBar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1400px]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <div className="flex-1">
            <div className="px-4 py-6 lg:px-6">{children}</div>
          </div>
          <PlayerBar />
        </div>
      </div>
    </div>
  );
}

