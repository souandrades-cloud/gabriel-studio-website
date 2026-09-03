"use client";

import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import * as THREE from "three";

import { perceptionProgress, routeReveal } from "./constants";
import { ROUTE_SAMPLES } from "./route";

const SAMPLE_Y = 0.04;
const DOT_RADIUS = 0.16;

/** Materials/geometry created once at module scope (ROUTE_SAMPLES is a
 *  static, deterministic path) — mutated directly in `useFrame` below,
 *  same reasoning as scene-objects.tsx. */
const DOT_MATERIALS = ROUTE_SAMPLES.map(
  () => new THREE.MeshBasicMaterial({ color: "#e7e9ea", transparent: true, opacity: 0 }),
);
const LINE_MATERIAL = new THREE.LineBasicMaterial({ color: "#c7cacb", transparent: true, opacity: 0 });
const LINE_GEOMETRY = new THREE.BufferGeometry().setFromPoints(
  ROUTE_SAMPLES.map(([x, z]) => new THREE.Vector3(x, SAMPLE_Y, z)),
);
/** Built as a plain `THREE.Line` + `<primitive>` rather than the JSX
 *  `<line>` intrinsic — this project's JSX namespace resolves `line` to
 *  the SVG element type, not the R3F one. */
const ROUTE_LINE = new THREE.Line(LINE_GEOMETRY, LINE_MATERIAL);

/**
 * Ground-projected route: discrete spatial samples + a thin connecting
 * line, both quiet and neutral (no laser, no glow) — "planned movement",
 * not a special effect. Only exists on the machine side of the
 * transformation, so its own opacity is driven by the combined
 * reveal × perception signal (fades out for free as the return
 * transition brings perception back toward human).
 */
function RoutePath({ scrollRef }: { scrollRef: RefObject<number> }) {
  useFrame(() => {
    const t = scrollRef.current ?? 0;
    const reveal = routeReveal(t);
    const opacity = reveal * perceptionProgress(t);
    const total = ROUTE_SAMPLES.length;

    DOT_MATERIALS.forEach((material, i) => {
      const front = reveal * total - i;
      const perDot = Math.min(1, Math.max(0, front * 2));
      material.opacity = opacity * perDot;
    });

    LINE_MATERIAL.opacity = opacity * Math.min(1, Math.max(0, reveal * 1.4)) * 0.5;
  });

  return (
    <group>
      <primitive object={ROUTE_LINE} />
      {ROUTE_SAMPLES.map(([x, z], i) => (
        <mesh key={i} position={[x, SAMPLE_Y, z]} rotation={[-Math.PI / 2, 0, 0]} material={DOT_MATERIALS[i]}>
          <circleGeometry args={[DOT_RADIUS, 12]} />
        </mesh>
      ))}
    </group>
  );
}

export { RoutePath };
