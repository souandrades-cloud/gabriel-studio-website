"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";

/**
 * Minimal observability for the Gate 03C comparison (fps/draw calls/
 * triangles/dpr) — deliberately plain, same module-level-object + slow-poll
 * pattern as x03-lab/debug-hud.tsx, trimmed to the numbers this discovery's
 * COMPARISON MATRIX actually needs (custo técnico, performance).
 */
const stats = { fps: 0, drawCalls: 0, triangles: 0, dpr: 0 };
let frameCount = 0;
let lastSampleTime = 0;

/** Mount inside the Canvas. */
export function BridgeStatsProbe() {
  const gl = useThree((state) => state.gl);

  useFrame(() => {
    frameCount += 1;
    const now = performance.now();
    if (lastSampleTime === 0) lastSampleTime = now;
    const elapsed = now - lastSampleTime;
    if (elapsed >= 500) {
      stats.fps = Math.round((frameCount * 1000) / elapsed);
      stats.drawCalls = gl.info.render.calls;
      stats.triangles = gl.info.render.triangles;
      stats.dpr = gl.getPixelRatio();
      frameCount = 0;
      lastSampleTime = now;
    }
  });

  return null;
}

/** Mount outside the Canvas, as a plain DOM readout. */
export function useBridgeStatsReadout() {
  const [snapshot, setSnapshot] = useState({ ...stats });

  useEffect(() => {
    const id = window.setInterval(() => setSnapshot({ ...stats }), 300);
    return () => window.clearInterval(id);
  }, []);

  return snapshot;
}
