"use client";

import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import * as THREE from "three";

import { perceptionProgress } from "./constants";
import { ALL_PIECES, type Classification } from "./environment";
import { createPerceptionMaterial } from "./perception-material";

/** Neutral human-view tones — differentiated by VALUE only (no hue signal
 *  the machine side doesn't also have access to via depth/pattern). */
const HUMAN_COLOR: Record<Classification, THREE.Color> = {
  traversable: new THREE.Color("#8a8f92"),
  structure: new THREE.Color("#6a6e72"),
  obstacle: new THREE.Color("#736558"),
};

const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);

/** One material per piece, created once at module scope (same lifetime as
 *  UNIT_BOX) — not a hook result, so `useFrame` below is free to mutate
 *  their uniforms every frame without the compiler treating it as a
 *  render-time mutation. */
const MATERIALS = ALL_PIECES.map((piece) =>
  createPerceptionMaterial(piece.classification, HUMAN_COLOR[piece.classification]),
);

/**
 * Renders the temporary environment. One mesh per piece, all sharing the
 * SAME unit box geometry (scaled per piece) and each with its own
 * PerceptionMaterial instance — this is the "same scene graph" proof:
 * there is exactly one set of meshes, read by both the human and the
 * machine eye through one continuous uProgress uniform.
 */
function SceneObjects({ scrollRef }: { scrollRef: RefObject<number> }) {
  useFrame(() => {
    const progress = perceptionProgress(scrollRef.current ?? 0);
    for (const material of MATERIALS) {
      material.uniforms.uProgress.value = progress;
    }
  });

  return (
    <group>
      {ALL_PIECES.map((piece, i) => (
        <mesh key={piece.id} geometry={UNIT_BOX} material={MATERIALS[i]} position={piece.position} scale={piece.size} />
      ))}
    </group>
  );
}

export { SceneObjects };
