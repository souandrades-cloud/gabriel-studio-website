"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import { CameraRig } from "./camera-rig";
import { DebugReporter } from "./debug-hud";
import { RoutePath } from "./route-path";
import { SceneObjects } from "./scene-objects";

/**
 * ONE Canvas, one scene graph, one camera — SceneObjects and RoutePath
 * both read the same `scrollRef` every frame; there is no second scene to
 * cross-fade into. Background is a dim neutral industrial tone, not a
 * void/abyss (that register belongs to X02 — this environment needs to
 * read as a functional, comprehensible test bay).
 */
function X03Scene({
  mobile,
  scrollRef,
  debug,
  contextLost,
  onContextLost,
}: {
  mobile: boolean;
  scrollRef: RefObject<number>;
  debug: boolean;
  contextLost: boolean;
  onContextLost?: () => void;
}) {
  return (
    <Canvas
      dpr={[1, mobile ? 1 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ near: 0.1, far: 120 }}
      frameloop="always"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("aria-hidden", "true");
        if (!onContextLost) return;
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}
    >
      <color attach="background" args={["#232527"]} />

      <CameraRig mobile={mobile} scrollRef={scrollRef} />
      <SceneObjects scrollRef={scrollRef} />
      <RoutePath scrollRef={scrollRef} />
      {debug && <DebugReporter scrollRef={scrollRef} contextLost={contextLost} />}
    </Canvas>
  );
}

export { X03Scene };
