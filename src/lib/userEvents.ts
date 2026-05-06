"use client";

import { type Track } from "@/store/playerStore";

export async function recordRecentlyPlayed(track: Track) {
  try {
    await fetch("/api/user/recent", {
      method: "POST",
      headers: { "content-type": "application/json" },
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
  } catch {
    // ignore (unauthenticated or network issues)
  }
}

