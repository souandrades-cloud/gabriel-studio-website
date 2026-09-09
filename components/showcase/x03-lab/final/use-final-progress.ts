"use client";

import { useEffect, useRef, useState } from "react";

import { CYCLE_MS } from "./constants";

/**
 * Same ping-pong autoplay driver as `../opening/use-opening-progress`
 * (itself copied from `../bridge/use-bridge-progress`), copied rather than
 * imported so this gate's own CYCLE_MS doesn't change timing on every other
 * gate that shares the underlying shape.
 */
export function useFinalProgress(reducedMotion: boolean) {
  const progressRef = useRef(0);
  const [progress, setProgressState] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    let uiAccumulator = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (playingRef.current) {
        const phase = (now % (CYCLE_MS * 2)) / (CYCLE_MS * 2);
        progressRef.current = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      }

      uiAccumulator += delta;
      if (uiAccumulator > 66) {
        uiAccumulator = 0;
        setProgressState(progressRef.current);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  function setProgress(value: number) {
    setPlaying(false);
    progressRef.current = value;
    setProgressState(value);
  }

  return { progressRef, progress, playing, setPlaying, setProgress };
}
