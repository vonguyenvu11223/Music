export const metadata = {
  title: "Library",
  description: "Your liked songs and playlists.",
};

export default function LibraryPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-soft)]">
        <div className="text-lg font-semibold text-white">Your Library</div>
        <div className="mt-2 text-sm text-white/60">
          This will show liked songs, playlists, and saved albums once Supabase
          auth + database tables are connected.
        </div>
      </div>
    </div>
  );
}

