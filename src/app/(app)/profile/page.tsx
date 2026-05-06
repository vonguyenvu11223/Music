"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { usePlayerStore } from "@/store/playerStore";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const setLikedSongs = usePlayerStore((s) => s.setLikedSongs);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local state
      setLikedSongs([]);
      
      toast.success("Đã đăng xuất");
      
      // Redirect to landing page
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[Logout]", err);
      toast.error("Lỗi khi đăng xuất");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-(--shadow-soft)">
        <div className="text-lg font-semibold text-white">Profile</div>
        <div className="mt-2 text-sm text-white/60">
          Manage your account and preferences.
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-(--shadow-soft)">
        <div className="text-sm font-semibold text-white/85">Settings</div>
        <div className="mt-2 text-sm text-white/60">
          Theme is currently dark-luxury by default.
        </div>
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
