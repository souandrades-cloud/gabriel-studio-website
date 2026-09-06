"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { ALL_PIECES } from "../environment";
import { ROUTE_SAMPLES } from "../route";
import { BridgeStatsProbe } from "../bridge/bridge-stats";
import type { PerceptionSceneArgs } from "./perception-shell";
import { applyPerceptionCamera, CAMERA_FOV } from "./perception-camera";
import { smoothstep } from "./constants";
import { createReductionMaterial, HUMAN_COLOR, relevanceOf } from "./world-reduction-material";

const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);

/** One material per FIELD piece, module scope — same reasoning as
 *  x03-lab/scene-objects.tsx: mutated directly in useFrame, not re-created
 *  per render. */
const MATERIALS = ALL_PIECES.map((piece) => createReductionMaterial(HUMAN_COLOR[piece.classification], relevanceOf(piece.id, piece.classification)));

// DECIDE beat: the route only exists once the world has already reduced to
// its operationally-relevant residue — a consequence, not a coincidence.
const ROUTE_REVEAL: [number, number] = [0.76, 1];
const SAMPLE_Y = 0.04;
const ROUTE_LINE_GEOMETRY = new THREE.BufferGeometry().setFromPoints(ROUTE_SAMPLES.map(([x, z]) => new THREE.Vector3(x, SAMPLE_Y, z)));
const ROUTE_LINE_MATERIAL = new THREE.LineBasicMaterial({ color: "#e7e9ea", transparent: true, opacity: 0 });
const ROUTE_LINE = new THREE.Line(ROUTE_LINE_GEOMETRY, ROUTE_LINE_MATERIAL);
const ROUTE_DOT_MATERIALS = ROUTE_SAMPLES.map(() => new THREE.MeshBasicMaterial({ color: "#e7e9ea", transparent: true, opacity: 0 }));

function WorldReductionField({ progressRef, pointerRef, mobile }: PerceptionSceneArgs) {
  useFrame((state, delta) => {
    const v = progressRef.current ?? 0;
    const reduction = smoothstep(v);
    for (const material of MATERIALS) {
      material.uniforms.uReduction.value = reduction;
    }

    const routeT = Math.min(1, Math.max(0, (v - ROUTE_REVEAL[0]) / (ROUTE_REVEAL[1] - ROUTE_REVEAL[0])));
    const routeOpacity = smoothstep(routeT);
    ROUTE_LINE_MATERIAL.opacity = routeOpacity * 0.55;
    ROUTE_DOT_MATERIALS.forEach((material, i) => {
      const front = routeOpacity * ROUTE_SAMPLES.length - i;
      material.opacity = Math.min(1, Math.max(0, front * 2));
    });

    applyPerceptionCamera(state.camera as THREE.PerspectiveCamera, v, pointerRef.current, delta, mobile);
  });

  return (
    <>
      <ambientLight intensity={1.8} color="#c9c2b3" />
      <directionalLight position={[-3, 6, 5]} intensity={2.6} color="#f3e8cf" />
      {ALL_PIECES.map((piece, i) => (
        <mesh key={piece.id} geometry={UNIT_BOX} material={MATERIALS[i]} position={piece.position} scale={piece.size} />
      ))}
      <primitive object={ROUTE_LINE} />
      {ROUTE_SAMPLES.map(([x, z], i) => (
        <mesh key={i} position={[x, SAMPLE_Y, z]} rotation={[-Math.PI / 2, 0, 0]} material={ROUTE_DOT_MATERIALS[i]}>
          <circleGeometry args={[0.16, 12]} />
        </mesh>
      ))}
    </>
  );
}

export function WorldReductionCanvas({ progressRef, pointerRef, mobile }: PerceptionSceneArgs) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ fov: CAMERA_FOV[0], near: 0.1, far: 60, position: [0, 4.4, 20] }}
    >
      <color attach="background" args={["#1b1c1d"]} />
      <WorldReductionField progressRef={progressRef} pointerRef={pointerRef} mobile={mobile} />
      <BridgeStatsProbe />
    </Canvas>
  );
}
