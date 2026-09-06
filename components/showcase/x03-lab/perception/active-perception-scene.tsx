"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { ALL_PIECES, OBSTACLES } from "../environment";
import { ROUTE_SAMPLES } from "../route";
import { BridgeStatsProbe } from "../bridge/bridge-stats";
import type { PerceptionSceneArgs } from "./perception-shell";
import { applyPerceptionCamera, CAMERA_FOV } from "./perception-camera";
import { createActivePerceptionMaterial, HUMAN_COLOR } from "./active-perception-material";
import { pointAlongPath } from "./point-along-path";

const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);

const MATERIALS = ALL_PIECES.map((piece) =>
  createActivePerceptionMaterial(piece.classification, HUMAN_COLOR[piece.classification], piece.classification === "traversable" ? OBSTACLES : []),
);

// The route path itself IS the attention's travel path — perception and
// plan share one line, "the machine looks where it intends to go" (DECIDE
// as a direct consequence of SENSE, not a separate mechanism bolted on).
const ATTENTION_PATH: Array<[number, number]> = ROUTE_SAMPLES;

const SAMPLE_Y = 0.04;
const ROUTE_LINE_GEOMETRY = new THREE.BufferGeometry().setFromPoints(ROUTE_SAMPLES.map(([x, z]) => new THREE.Vector3(x, SAMPLE_Y, z)));
const ROUTE_LINE_MATERIAL = new THREE.LineBasicMaterial({ color: "#e7e9ea", transparent: true, opacity: 0 });
const ROUTE_LINE = new THREE.Line(ROUTE_LINE_GEOMETRY, ROUTE_LINE_MATERIAL);
const ROUTE_DOT_MATERIALS = ROUTE_SAMPLES.map(() => new THREE.MeshBasicMaterial({ color: "#e7e9ea", transparent: true, opacity: 0 }));

function ActivePerceptionField({ progressRef, pointerRef, mobile }: PerceptionSceneArgs) {
  useFrame((state, delta) => {
    const v = progressRef.current ?? 0;
    const [ax, az] = pointAlongPath(ATTENTION_PATH, v);
    for (const material of MATERIALS) {
      (material.uniforms.uAttentionPos.value as THREE.Vector2).set(ax, az);
    }

    // The route DRAWS ITSELF IN behind the attention's leading edge — each
    // sample lights up once acquisition has already passed it, same sweep
    // discipline as x03-lab/route-path.tsx's routeSweep, but driven by
    // spatial travel instead of a scroll scalar.
    const total = ROUTE_SAMPLES.length;
    ROUTE_DOT_MATERIALS.forEach((material, i) => {
      const front = v * total - i;
      material.opacity = Math.min(1, Math.max(0, front * 2)) * 0.9;
    });
    ROUTE_LINE_MATERIAL.opacity = Math.min(1, Math.max(0, v * total * 1.4)) * 0.45;

    applyPerceptionCamera(state.camera as THREE.PerspectiveCamera, v, pointerRef.current, delta, mobile);
  });

  return (
    <>
      <ambientLight intensity={0.6} color="#c9c2b3" />
      <directionalLight position={[-3, 6, 5]} intensity={1.4} color="#f3e8cf" />
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

export function ActivePerceptionCanvas({ progressRef, pointerRef, mobile }: PerceptionSceneArgs) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ fov: CAMERA_FOV[0], near: 0.1, far: 60, position: [0, 4.4, 20] }}
    >
      <color attach="background" args={["#111213"]} />
      <ActivePerceptionField progressRef={progressRef} pointerRef={pointerRef} mobile={mobile} />
      <BridgeStatsProbe />
    </Canvas>
  );
}
