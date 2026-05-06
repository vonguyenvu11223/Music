"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/playerStore";

// ─── YouTube IFrame API types ─────────────────
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          width?: number;
          height?: number;
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  getCurrentTime(): number;
  getDuration(): number;
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  getPlayerState(): number;
  destroy(): void;
}
// ─────────────────────────────────────────────────────────────────────────────

export function YouTubePlayer() {
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastVideoIdRef = useRef<string | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    progressMs,
    repeatMode,
    setPlaying,
    setProgressMs,
    nextTrack,
  } = usePlayerStore();

  const isYouTubeTrack = !!currentTrack?.youtubeVideoId;

  // ── Load YouTube IFrame API script ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initPlayer = () => {
      if (document.getElementById("yt-iframe-container")) return;

      const container = document.createElement("div");
      container.id = "yt-iframe-container";
      container.style.cssText =
        "position:fixed;bottom:0;right:0;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;";
      document.body.appendChild(container);

      playerRef.current = new window.YT.Player("yt-iframe-container", {
        width: 1,
        height: 1,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            setIsReady(true);
            // Apply current volume
            playerRef.current?.setVolume(
              usePlayerStore.getState().volume * 100,
            );
          },
          onStateChange: (e) => {
            const YTState = window.YT?.PlayerState;
            if (!YTState) return;

            if (e.data === YTState.PLAYING) {
              setPlaying(true);
              // Poll progress every 500ms while playing
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = setInterval(() => {
                const time = playerRef.current?.getCurrentTime() ?? 0;
                setProgressMs(time * 1000);
              }, 500);
            } else if (
              e.data === YTState.PAUSED ||
              e.data === YTState.BUFFERING
            ) {
              setPlaying(e.data === YTState.BUFFERING);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            } else if (e.data === YTState.ENDED) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              if (repeatMode === "one") {
                playerRef.current?.seekTo(0, true);
                playerRef.current?.playVideo();
              } else {
                nextTrack();
              }
            }
          },
          onError: (e) => {
            console.error("[YouTubePlayer] Error:", e.data);
            setPlaying(false);
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        document.head.appendChild(tag);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load new video when track changes ────────────────────────────────────────
  useEffect(() => {
    if (!isYouTubeTrack || !isReady || !currentTrack?.youtubeVideoId) return;

    const videoId = currentTrack.youtubeVideoId;
    if (videoId === lastVideoIdRef.current) return;
    lastVideoIdRef.current = videoId;

    playerRef.current?.loadVideoById(videoId);
    // loadVideoById auto-plays; if not intended to play, pause after
    if (!isPlaying) {
      setTimeout(() => playerRef.current?.pauseVideo(), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.youtubeVideoId, isYouTubeTrack, isReady]);

  // ── Play / Pause ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isYouTubeTrack || !isReady) return;
    if (isPlaying) {
      playerRef.current?.playVideo();
    } else {
      playerRef.current?.pauseVideo();
    }
  }, [isPlaying, isYouTubeTrack, isReady]);

  // ── Volume ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady) return;
    playerRef.current?.setVolume(volume * 100);
  }, [volume, isReady]);

  // ── Seek (from progress bar drag) ───────────────────────────────────────────
  useEffect(() => {
    if (!isYouTubeTrack || !isReady) return;
    const current = playerRef.current?.getCurrentTime() ?? 0;
    const desired = progressMs / 1000;
    if (Math.abs(current - desired) > 1.5) {
      playerRef.current?.seekTo(desired, true);
    }
  }, [progressMs, isYouTubeTrack, isReady]);

  // This component renders nothing visible
  return null;
}
