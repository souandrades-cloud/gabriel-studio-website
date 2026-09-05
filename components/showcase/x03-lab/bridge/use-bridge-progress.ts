"use client";

import { useEffect, useRef, useState } from "react";

import { CYCLE_MS } from "./constants";

/**
 * Drives one shared 0-1 progress value for all three bridge microprototypes
 * so A/B/C get identical timing and amplitude — comparison harness, not a
 * scroll track (the discovery brief only requires "mesma duração
 * aproximada, mesma amplitude máxima de movimento", not a live page scroll).
 * Ping-pongs 0->1->0 while playing; scrubbing the slider pauses autoplay.
 * `progressRef` is for the R3F useFrame consumer (mutated every frame, no
 * re-render); `progress` is a throttled copy for the DOM slider/HUD.
 */
export function useBridgeProgress(reducedMotion: boolean) {
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
