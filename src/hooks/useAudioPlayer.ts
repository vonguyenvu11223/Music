"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/store/playerStore";

// Global audio instance for mp3 streams (legacy, unused after YouTube migration)
let globalAudio: HTMLAudioElement | null = null;

export function useAudioPlayer() {
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

  // Only use HTML Audio when track has a streamUrl (NOT a YouTube track)
  const isYouTubeTrack = !!currentTrack?.youtubeVideoId;
  const canPlay = isYouTubeTrack
    ? true // YouTube playback is handled by YouTubePlayer component
    : !!currentTrack?.streamUrl;

  // Initialize audio element for mp3 streams
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!globalAudio) globalAudio = new Audio();
  }, []);

  // Event listeners for mp3 audio
  useEffect(() => {
    if (isYouTubeTrack) return; // YouTube handles its own events
    if (!globalAudio) return;
    const audio = globalAudio;

    const onTime = () => setProgressMs(audio.currentTime * 1000);
    const onEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      nextTrack();
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [isYouTubeTrack, nextTrack, repeatMode, setPlaying, setProgressMs]);

  // Pause mp3 audio when switching to a YouTube track
  useEffect(() => {
    if (isYouTubeTrack && globalAudio) {
      globalAudio.pause();
      globalAudio.src = "";
    }
  }, [isYouTubeTrack]);

  // Volume sync for mp3
  useEffect(() => {
    if (isYouTubeTrack || !globalAudio) return;
    globalAudio.volume = volume;
  }, [volume, isYouTubeTrack]);

  // Load + play mp3 stream
  useEffect(() => {
    if (isYouTubeTrack || !globalAudio) return;
    if (!currentTrack?.streamUrl) return;
    const url = currentTrack.streamUrl;
    if (globalAudio.src !== url) {
      globalAudio.src = url;
      globalAudio.currentTime = 0;
    }
    if (isPlaying) globalAudio.play().catch(() => setPlaying(false));
  }, [currentTrack?.streamUrl, isPlaying, isYouTubeTrack, setPlaying]);

  // Pause mp3 when not playing
  useEffect(() => {
    if (isYouTubeTrack || !globalAudio) return;
    if (!isPlaying) globalAudio.pause();
  }, [isPlaying, isYouTubeTrack]);

  // Seek mp3
  useEffect(() => {
    if (isYouTubeTrack || !globalAudio) return;
    const desired = progressMs / 1000;
    if (Math.abs(globalAudio.currentTime - desired) > 0.35) {
      globalAudio.currentTime = desired;
    }
  }, [progressMs, isYouTubeTrack]);

  return { canPlay, isYouTubeTrack };
}
