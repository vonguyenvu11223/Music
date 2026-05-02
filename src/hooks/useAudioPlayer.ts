"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/store/playerStore";

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

  const canPlay = !!currentTrack?.streamUrl;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!globalAudio) globalAudio = new Audio();
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
  }, [nextTrack, repeatMode, setPlaying, setProgressMs]);

  useEffect(() => {
    if (!globalAudio) return;
    globalAudio.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!globalAudio) return;
    if (!currentTrack?.streamUrl) return;

    const url = currentTrack.streamUrl;
    if (globalAudio.src !== url) {
      globalAudio.src = url;
      globalAudio.currentTime = 0;
    }
    if (isPlaying) globalAudio.play().catch(() => setPlaying(false));
  }, [currentTrack?.streamUrl, isPlaying, setPlaying]);

  useEffect(() => {
    if (!globalAudio) return;
    if (!isPlaying) globalAudio.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (!globalAudio) return;
    const desired = progressMs / 1000;
    if (Math.abs(globalAudio.currentTime - desired) > 0.35) globalAudio.currentTime = desired;
  }, [progressMs]);

  return { canPlay };
}

