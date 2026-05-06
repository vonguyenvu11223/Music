"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LikedSongsFetcher() {
  const setLikedSongs = usePlayerStore((s) => s.setLikedSongs);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const res = await fetch("/api/user/liked");
          if (res.ok) {
            const data = await res.json();
            // Map DB rows to Store Track format
            const tracks = data.items.map((row: any) => ({
              id: row.track_id,
              title: row.title,
              artist: row.artist,
              album: row.album,
              imageUrl: row.image_url,
              durationMs: row.duration_ms,
              spotifyUri: row.spotify_uri,
              youtubeVideoId: row.youtube_video_id,
            }));
            setLikedSongs(tracks);
          }
        } else {
            // Not logged in, clear liked songs (optional, since it's persisted per device)
            // setLikedSongs([]);
        }
      } catch (err) {
        console.error("[LikedSongsFetcher]", err);
      }
    };

    fetchLiked();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchLiked();
      } else if (event === "SIGNED_OUT") {
        setLikedSongs([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setLikedSongs]);

  return null;
}
