export const metadata = {
  title: "Profile",
  description: "Your account and settings.",
};

export default function ProfilePage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-soft)]">
        <div className="text-lg font-semibold text-white">Profile</div>
        <div className="mt-2 text-sm text-white/60">
          Next: show your Supabase profile row (avatar, stats, settings).
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[var(--shadow-soft)]">
        <div className="text-sm font-semibold text-white/85">Settings</div>
        <div className="mt-2 text-sm text-white/60">
          Theme is currently dark-luxury by default.
        </div>
        <form action="/api/auth/logout" method="post" className="mt-4">
          <button className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

