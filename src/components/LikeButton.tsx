"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { type Track, usePlayerStore } from "@/store/playerStore";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LikeButton({
  track,
  size = "md",
  className,
}: {
  track: Track;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { likedSongs, toggleLike } = usePlayerStore();
  const isLiked = likedSongs.some((t) => t.id === track.id);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Vui lòng đăng nhập để thêm bài hát yêu thích", {
          icon: "🔒",
        });
        return;
      }

      if (isLiked) {
        const res = await fetch(`/api/user/liked?trackId=${encodeURIComponent(track.id)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toggleLike(track);
          toast.success("Đã xóa khỏi danh sách yêu thích");
        } else {
          toast.error("Lỗi khi xóa bài hát");
        }
      } else {
        const res = await fetch("/api/user/liked", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trackId: track.id,
            title: track.title,
            artist: track.artist,
            album: track.album,
            imageUrl: track.imageUrl,
            durationMs: track.durationMs,
            spotifyUri: track.spotifyUri,
            youtubeVideoId: track.youtubeVideoId,
          }),
        });
        if (res.ok) {
          toggleLike(track);
          toast.success("Đã thêm vào danh sách yêu thích");
        } else {
          toast.error("Lỗi khi lưu bài hát");
        }
      }
    } catch (err) {
      console.error("[LikeButton]", err);
      toast.error("Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center rounded-full transition-all",
        "hover:scale-110 active:scale-95",
        isLiked ? "text-primary" : "text-white/40 hover:text-white/70",
        isLoading && "opacity-50 cursor-wait",
        className,
      )}
      aria-label={isLiked ? "Remove from liked" : "Add to liked"}
    >
      <Heart
        className={cn(iconSizes[size], isLiked && "fill-current")}
      />
    </button>
  );
}
