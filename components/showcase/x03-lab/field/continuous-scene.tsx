"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { useColorTexture } from "../bridge/use-color-texture";
import { BridgeStatsProbe } from "../bridge/bridge-stats";
import type { FieldSceneArgs } from "./field-shell";
import { applyFieldCamera, type CameraKeyframes } from "./field-camera";
import { createEnvironmentRig, DOT_GEOMETRY, FULL_ROUTE, SAMPLE_Y, UNIT_BOX } from "./environment-rig";
import { createPL1Rig, LEG_BASE_Y, LEG_OFFSETS, PL1_PLANE_HEIGHT, PL1_SRC, PL1_STANCE } from "./pl1-rig";
import { smoothstep, windowT } from "./utils";

/**
 * Hypothesis A — CONTINUOUS COMMITMENT. Picks up at THE CHOICE's own final
 * camera frame (machine-perception-scene.tsx, v=1: pos [0,2,-2], look
 * [0,1.4,-22], fov 32) and never cuts: the camera keeps dollying down the
 * SAME corridor and the SAME already-chosen route line, the box-proxy
 * geometry sweeps from THE CHOICE's neutral ink tone to industrial steel as
 * it passes, and PL-1 fades into view exactly where the route meets the
 * cable-trench constraint. Maximum spatial continuity is the whole bet.
 */
const CAMERA: CameraKeyframes = {
  t: [0, 0.3, 0.6, 0.85, 1],
  x: [0, 0.3, 0.7, 0.9, 0.9],
  y: [2.0, 1.95, 1.9, 1.85, 1.85],
  z: [-2, -13, -24, -29, -29.2],
  lookY: [1.4, 1.35, 1.3, 1.25, 1.25],
  lookZ: [-22, -30, -37, -41, -41],
  fov: [32, 33, 33.5, 34, 34],
};

const NEW_REVEAL: [number, number] = [0.15, 0.55];
const PL1_REVEAL: [number, number] = [0.55, 0.72];
const FRONT_LEGS: [number, number] = [0.72, 0.84];
const BACK_LEGS: [number, number] = [0.82, 0.94];

const rig = createEnvironmentRig();
const pl1 = createPL1Rig();

function ContinuousField({ progressRef, pointerRef, mobile }: FieldSceneArgs) {
  const texture = useColorTexture(PL1_SRC);
  const legMeshRefs = useRef<Array<THREE.Mesh | null>>([null, null, null, null]);

  useFrame((state, delta) => {
    const v = progressRef.current ?? 0;

    if (pl1.planeMaterial.map !== texture) {
      pl1.planeMaterial.map = texture ?? null;
      pl1.planeMaterial.needsUpdate = true;
    }

    // The corridor becomes terrain: industrial pieces sweep in as the
    // camera advances, the old corridor never disappears (still the same space).
    const newOpacity = smoothstep(windowT(v, NEW_REVEAL));
    rig.newMaterials.forEach((m) => {
      m.opacity = newOpacity;
    });

    const pl1Opacity = smoothstep(windowT(v, PL1_REVEAL));
    pl1.planeMaterial.opacity = pl1Opacity;
    pl1.legMaterials.forEach((m) => {
      m.opacity = pl1Opacity;
    });

    const frontLift = smoothstep(windowT(v, FRONT_LEGS));
    const backLift = smoothstep(windowT(v, BACK_LEGS));
    const lifts = [frontLift, frontLift, backLift, backLift];
    lifts.forEach((lift, i) => {
      const mesh = legMeshRefs.current[i];
      if (!mesh) return;
      mesh.position.y = LEG_BASE_Y + lift * 0.5;
      mesh.rotation.x = (i < 2 ? 1 : -0.5) * lift * 0.8;
    });

    applyFieldCamera(state.camera as THREE.PerspectiveCamera, v, pointerRef.current, delta, mobile, CAMERA, { x: 0.3, y: 0.16 });
  });

  return (
    <>
      {rig.oldPieces.map((piece) => (
        <mesh key={piece.id} geometry={UNIT_BOX} material={rig.oldMaterial} position={piece.position} scale={piece.size} />
      ))}
      {rig.newPieces.map((piece, i) => (
        <mesh key={piece.id} geometry={UNIT_BOX} material={rig.newMaterials[i]} position={piece.position} scale={piece.size} />
      ))}
      <primitive object={rig.routeLine} />
      {FULL_ROUTE.map(([x, z], i) => (
        <mesh key={i} geometry={DOT_GEOMETRY} material={rig.routeDotMaterials[i]} position={[x, SAMPLE_Y, z]} rotation={[-Math.PI / 2, 0, 0]} />
      ))}
      <group position={PL1_STANCE}>
        <mesh geometry={pl1.planeGeometry} material={pl1.planeMaterial} position={[0, PL1_PLANE_HEIGHT / 2, 0]} />
        {LEG_OFFSETS.map(([x, z], i) => (
          <mesh
            key={i}
            ref={(el) => {
              legMeshRefs.current[i] = el;
            }}
            geometry={pl1.legGeometry}
            material={pl1.legMaterials[i]}
            position={[x, LEG_BASE_Y, z]}
          />
        ))}
      </group>
    </>
  );
}

export function ContinuousFieldCanvas({ progressRef, pointerRef, mobile }: FieldSceneArgs) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ fov: CAMERA.fov[0], near: 0.1, far: 80, position: [CAMERA.x[0], CAMERA.y[0], CAMERA.z[0]] }}
    >
      <color attach="background" args={["#0a0908"]} />
      <ContinuousField progressRef={progressRef} pointerRef={pointerRef} mobile={mobile} />
      <BridgeStatsProbe />
    </Canvas>
  );
}
