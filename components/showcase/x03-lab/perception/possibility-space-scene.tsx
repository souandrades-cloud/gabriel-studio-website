"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { ALL_PIECES, OBSTACLES } from "../environment";
import { createPerceptionMaterial } from "../perception-material";
import { BridgeStatsProbe } from "../bridge/bridge-stats";
import type { PerceptionSceneArgs } from "./perception-shell";
import { applyPerceptionCamera, CAMERA_FOV } from "./perception-camera";
import { clamp01, smoothstep } from "./constants";
import { CANDIDATE_LEFT, CANDIDATE_RIGHT, CHOSEN_ROUTE } from "./possibility-routes";

/**
 * HYPOTHESIS C — POSSIBILITY SPACE. UNDERSTAND is the Perception Rig's own
 * affordance material (traversable opens up, obstacle interrupts, structure
 * reads as bounded — components/showcase/x03-lab/perception-material.ts,
 * reused verbatim), settled early so most of the timeline is free for
 * DECIDE: three real candidate routes (possibility-routes.ts) fade in
 * together as equal possibilities, then two recede while the chosen one
 * brightens and sweeps in — "multiple possibilities existed, one became
 * dominant", not a line simply drawing itself.
 */
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);

const HUMAN_COLOR = {
  traversable: new THREE.Color("#8f9497"),
  structure: new THREE.Color("#65696d"),
  obstacle: new THREE.Color("#6d5f52"),
} as const;

const MATERIALS = ALL_PIECES.map((piece) => {
  const material = createPerceptionMaterial(piece.classification, HUMAN_COLOR[piece.classification], piece.classification === "traversable" ? OBSTACLES : []);
  // This hypothesis's shared camera (perception-camera.ts) sits much lower
  // and closer to the ground than the Perception Rig's original static
  // establishing shot the near/far bands were tuned for — unadjusted, the
  // near-field floor saturates to pure white and hides both the possibility
  // lines and the info readout above it. Widened here (this scene only, not
  // the shared material) so the bands distribute across the visible range.
  material.uniforms.uNear.value = 3.5;
  material.uniforms.uFar.value = 34;
  return material;
});

// UNDERSTAND settles early — this hypothesis spends its timeline on DECIDE.
const MEASURE_WINDOW: [number, number] = [0, 0.22];
const CLASSIFY_WINDOW: [number, number] = [0.1, 0.32];

// DECIDE: possibilities co-exist, then converge.
const POSSIBILITIES_IN: [number, number] = [0.34, 0.5];
const CONVERGE: [number, number] = [0.55, 0.82];
const CHOSEN_SWEEP: [number, number] = [0.55, 0.95];

const SAMPLE_Y = 0.06;

function buildLine(points: Array<[number, number]>, color: string) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x, z]) => new THREE.Vector3(x, SAMPLE_Y, z)));
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 });
  return { line: new THREE.Line(geometry, material), material };
}

// Dark strokes, not light ones — the affordance material renders the
// ground light gray to near-white once "open" (traversable) settles in, so
// a light line has no contrast to read against. Chosen route uses the same
// warm ink tone Gate 03B/03D already established for "the machine's own
// structure" (#d9c9a6) — legible against light ground AND continuing the
// production's visual vocabulary rather than inventing a new accent color.
const chosenLine = buildLine(CHOSEN_ROUTE, "#d9c9a6");
const leftLine = buildLine(CANDIDATE_LEFT, "#3a3d3f");
const rightLine = buildLine(CANDIDATE_RIGHT, "#3a3d3f");
const chosenDotMaterials = CHOSEN_ROUTE.map(() => new THREE.MeshBasicMaterial({ color: "#d9c9a6", transparent: true, opacity: 0 }));

function windowT(v: number, [start, end]: [number, number]) {
  return clamp01((v - start) / (end - start));
}

function PossibilitySpaceField({ progressRef, pointerRef, mobile }: PerceptionSceneArgs) {
  useFrame((state, delta) => {
    const v = progressRef.current ?? 0;
    const measure = smoothstep(windowT(v, MEASURE_WINDOW));
    const classify = smoothstep(windowT(v, CLASSIFY_WINDOW));
    for (const material of MATERIALS) {
      material.uniforms.uMeasure.value = measure;
      material.uniforms.uClassify.value = classify;
    }

    const possibilitiesOpacity = smoothstep(windowT(v, POSSIBILITIES_IN));
    const convergeT = smoothstep(windowT(v, CONVERGE));
    // Alternates fade in together with the chosen route, then recede as
    // convergence advances — all three read as equally real possibilities
    // before one wins.
    leftLine.material.opacity = possibilitiesOpacity * (1 - convergeT) * 0.6;
    rightLine.material.opacity = possibilitiesOpacity * (1 - convergeT) * 0.6;

    const chosenOpacity = possibilitiesOpacity * (0.45 + 0.55 * convergeT);
    chosenLine.material.opacity = chosenOpacity * 0.85;

    const sweepT = windowT(v, CHOSEN_SWEEP);
    const total = CHOSEN_ROUTE.length;
    chosenDotMaterials.forEach((material, i) => {
      const front = sweepT * total - i;
      material.opacity = Math.min(1, Math.max(0, front * 2)) * chosenOpacity;
    });

    applyPerceptionCamera(state.camera as THREE.PerspectiveCamera, v, pointerRef.current, delta, mobile);
  });

  return (
    <>
      <ambientLight intensity={2.2} color="#c9c2b3" />
      <directionalLight position={[-3, 4, 5]} intensity={6.5} color="#f3e8cf" />
      <directionalLight position={[4, -2, -3]} intensity={1.2} color="#5a6560" />
      {ALL_PIECES.map((piece, i) => (
        <mesh key={piece.id} geometry={UNIT_BOX} material={MATERIALS[i]} position={piece.position} scale={piece.size} />
      ))}
      <primitive object={leftLine.line} />
      <primitive object={rightLine.line} />
      <primitive object={chosenLine.line} />
      {CHOSEN_ROUTE.map(([x, z], i) => (
        <mesh key={i} position={[x, SAMPLE_Y, z]} rotation={[-Math.PI / 2, 0, 0]} material={chosenDotMaterials[i]}>
          <circleGeometry args={[0.16, 12]} />
        </mesh>
      ))}
    </>
  );
}

export function PossibilitySpaceCanvas({ progressRef, pointerRef, mobile }: PerceptionSceneArgs) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ fov: CAMERA_FOV[0], near: 0.1, far: 60, position: [0, 4.4, 20] }}
    >
      <color attach="background" args={["#232527"]} />
      <PossibilitySpaceField progressRef={progressRef} pointerRef={pointerRef} mobile={mobile} />
      <BridgeStatsProbe />
    </Canvas>
  );
}
