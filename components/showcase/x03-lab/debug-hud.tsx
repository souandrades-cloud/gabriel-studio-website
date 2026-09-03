"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState, type RefObject } from "react";

import { stageLabel } from "./constants";

/**
 * Dev-only instrumentation (`?debug`), explicitly NOT part of the visual
 * direction — plain monospace numbers, no styling attempt. Lives outside
 * React state on the hot path: `DebugReporter` (inside the Canvas) writes
 * into this module-level object every frame for free; `DebugOverlay`
 * (outside the Canvas, plain DOM) polls it on a slow interval so the debug
 * text doesn't force a React re-render at 60fps.
 */
const stats = {
  t: 0,
  cameraX: 0,
  cameraY: 0,
  cameraZ: 0,
  drawCalls: 0,
  triangles: 0,
  textures: 0,
  geometries: 0,
  dpr: 0,
  contextLost: false,
};

/** Mount inside the Canvas. Reads real renderer counters via `gl.info`. */
function DebugReporter({ scrollRef, contextLost }: { scrollRef: RefObject<number>; contextLost: boolean }) {
  const gl = useThree((state) => state.gl);

  useFrame(({ camera }) => {
    stats.t = scrollRef.current ?? 0;
    stats.cameraX = camera.position.x;
    stats.cameraY = camera.position.y;
    stats.cameraZ = camera.position.z;
    stats.drawCalls = gl.info.render.calls;
    stats.triangles = gl.info.render.triangles;
    stats.textures = gl.info.memory.textures;
    stats.geometries = gl.info.memory.geometries;
    stats.dpr = gl.getPixelRatio();
    stats.contextLost = contextLost;
  });

  return null;
}

/** Mount outside the Canvas, as a plain DOM overlay. */
function DebugOverlay() {
  const [snapshot, setSnapshot] = useState(() => ({ ...stats }));

  useEffect(() => {
    const id = window.setInterval(() => setSnapshot({ ...stats }), 250);
    return () => window.clearInterval(id);
  }, []);

  return (
    <pre className="x03-debug" aria-hidden="true">
      {`mode        ${stageLabel(snapshot.t)}
progress    ${snapshot.t.toFixed(3)}
camera      ${snapshot.cameraX.toFixed(1)}, ${snapshot.cameraY.toFixed(1)}, ${snapshot.cameraZ.toFixed(1)}
draw calls  ${snapshot.drawCalls}
triangles   ${snapshot.triangles}
textures    ${snapshot.textures}
geometries  ${snapshot.geometries}
dpr         ${snapshot.dpr.toFixed(2)}
ctx lost    ${snapshot.contextLost}`}
    </pre>
  );
}

export { DebugOverlay, DebugReporter };
