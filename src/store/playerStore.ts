"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { recordRecentlyPlayed } from "@/lib/userEvents";

export type RepeatMode = "off" | "one" | "all";

export type Track = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  durationMs?: number;
  streamUrl?: string; // Jamendo URL (playable)
  spotifyUri?: string;
};

type PlayerState = {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number; // 0..1
  progressMs: number;
  repeatMode: RepeatMode;
  shuffle: boolean;

  playTrack: (track: Track, opts?: { queue?: Track[]; index?: number }) => void;
  togglePlay: () => void;
  setPlaying: (value: boolean) => void;
  setVolume: (value: number) => void;
  setProgressMs: (value: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setQueue: (queue: Track[], index?: number) => void;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      queueIndex: 0,
      isPlaying: false,
      volume: 0.85,
      progressMs: 0,
      repeatMode: "off",
      shuffle: false,

      playTrack: (track, opts) => {
        const nextQueue = opts?.queue ?? get().queue;
        const nextIndex =
          typeof opts?.index === "number"
            ? opts.index
            : Math.max(0, nextQueue.findIndex((t) => t.id === track.id));

        set({
          currentTrack: track,
          queue: nextQueue.length ? nextQueue : [track],
          queueIndex: nextIndex >= 0 ? nextIndex : 0,
          isPlaying: true,
          progressMs: 0,
        });

        // Fire-and-forget: persist event when logged in
        void recordRecentlyPlayed(track);
      },

      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
      setPlaying: (value) => set({ isPlaying: value }),
      setVolume: (value) => set({ volume: Math.min(1, Math.max(0, value)) }),
      setProgressMs: (value) => set({ progressMs: Math.max(0, value) }),
      setRepeatMode: (mode) => set({ repeatMode: mode }),
      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

      setQueue: (queue, index) =>
        set({
          queue,
          queueIndex:
            typeof index === "number"
              ? Math.max(0, Math.min(queue.length - 1, index))
              : 0,
          currentTrack: queue.length ? queue[index ?? 0] ?? queue[0] : null,
        }),

      nextTrack: () => {
        const { queue, queueIndex, repeatMode, shuffle } = get();
        if (!queue.length) return;

        let nextIndex = queueIndex + 1;
        if (shuffle && queue.length > 1) {
          nextIndex = Math.floor(Math.random() * queue.length);
          if (nextIndex === queueIndex) nextIndex = (nextIndex + 1) % queue.length;
        }

        if (nextIndex >= queue.length) {
          if (repeatMode === "all") nextIndex = 0;
          else {
            set({ isPlaying: false });
            return;
          }
        }

        set({
          queueIndex: nextIndex,
          currentTrack: queue[nextIndex] ?? null,
          progressMs: 0,
          isPlaying: true,
        });
      },

      prevTrack: () => {
        const { queue, queueIndex, repeatMode } = get();
        if (!queue.length) return;

        let prevIndex = queueIndex - 1;
        if (prevIndex < 0) prevIndex = repeatMode === "all" ? queue.length - 1 : 0;

        set({
          queueIndex: prevIndex,
          currentTrack: queue[prevIndex] ?? null,
          progressMs: 0,
          isPlaying: true,
        });
      },
    }),
    {
      name: "vibeflow-player",
      partialize: (s) => ({
        currentTrack: s.currentTrack,
        queue: s.queue,
        queueIndex: s.queueIndex,
        volume: s.volume,
        repeatMode: s.repeatMode,
        shuffle: s.shuffle,
      }),
    },
  ),
);

