"use client";

import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import * as THREE from "three";

import { classifyReveal, measureReveal } from "./constants";
import { ALL_PIECES, OBSTACLES, type Classification } from "./environment";
import { createPerceptionMaterial } from "./perception-material";

/** Neutral human-view tones — differentiated by VALUE only (no hue signal
 *  the machine side doesn't also have access to via depth/pattern). */
const HUMAN_COLOR: Record<Classification, THREE.Color> = {
  traversable: new THREE.Color("#8f9497"),
  structure: new THREE.Color("#65696d"),
  obstacle: new THREE.Color("#6d5f52"),
};

const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);

/** One material per piece, created once at module scope (same lifetime as
 *  UNIT_BOX) — not a hook result, so `useFrame` below is free to mutate
 *  their uniforms every frame without the compiler treating it as a
 *  render-time mutation. Only ground (traversable) reads the obstacle
 *  list — that's what drives its exclusion-buffer classification. */
const MATERIALS = ALL_PIECES.map((piece) =>
  createPerceptionMaterial(
    piece.classification,
    HUMAN_COLOR[piece.classification],
    piece.classification === "traversable" ? OBSTACLES : [],
  ),
);

/**
 * Renders the temporary environment. One mesh per piece, all sharing the
 * SAME unit box geometry (scaled per piece) and each with its own
 * PerceptionMaterial instance — this is the "same scene graph" proof:
 * there is exactly one set of meshes, read by both the human and the
 * machine eye through the same two continuous uniforms.
 */
function SceneObjects({ scrollRef }: { scrollRef: RefObject<number> }) {
  useFrame(() => {
    const t = scrollRef.current ?? 0;
    const measure = measureReveal(t);
    const classify = classifyReveal(t);
    for (const material of MATERIALS) {
      material.uniforms.uMeasure.value = measure;
      material.uniforms.uClassify.value = classify;
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
