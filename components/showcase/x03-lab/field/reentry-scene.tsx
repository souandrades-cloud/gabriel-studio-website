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
 * Hypothesis B — BODY REENTRY. Holds THE CHOICE's own final frame
 * (unmodified, no dolly) for the first stretch, then a short structural
 * dissolution — opacity cross-fade plus a brief positional jitter, no
 * camera travel across the distance itself — cuts straight to a NEW
 * position where PL-1 is already committed: legs already mid-step over the
 * constraint, not performing the step live. Deliberately less spatial
 * continuity than Hypothesis A, testing whether a felt transformation can
 * substitute for distance covered.
 */
const CAMERA: CameraKeyframes = {
  t: [0, 0.4, 0.44, 1],
  x: [0, 0, 0.9, 0.9],
  y: [2.0, 2.0, 1.85, 1.85],
  z: [-2, -2, -29.2, -29.2],
  lookY: [1.4, 1.4, 1.25, 1.25],
  lookZ: [-22, -22, -41, -41],
  fov: [32, 32, 34, 34],
};

const DISSOLVE_WINDOW: [number, number] = [0.4, 0.44];
const PL1_APPEAR: [number, number] = [0.42, 0.46];
/** Legs read as already engaged the instant the cut lands -- not a live animation. */
const HELD_LEG_POSE = [0.55, 0.55, 0.28, 0.28];

const rig = createEnvironmentRig();
const pl1 = createPL1Rig();

function ReentryField({ progressRef, pointerRef, mobile }: FieldSceneArgs) {
  const texture = useColorTexture(PL1_SRC);
  const legMeshRefs = useRef<Array<THREE.Mesh | null>>([null, null, null, null]);

  useFrame((state, delta) => {
    const v = progressRef.current ?? 0;

    if (pl1.planeMaterial.map !== texture) {
      pl1.planeMaterial.map = texture ?? null;
      pl1.planeMaterial.needsUpdate = true;
    }

    const dissolveT = windowT(v, DISSOLVE_WINDOW);
    const dissolve = smoothstep(dissolveT);
    rig.oldMaterial.opacity = 1 - dissolve;
    rig.newMaterials.forEach((m) => {
      m.opacity = dissolve;
    });

    const pl1Opacity = smoothstep(windowT(v, PL1_APPEAR));
    pl1.planeMaterial.opacity = pl1Opacity;

    // Idle sway, not live articulation -- the commitment already happened
    // off-screen, during the dissolve; this only keeps the held pose alive.
    const sway = Math.sin(v * 40) * 0.06;
    HELD_LEG_POSE.forEach((basePose, i) => {
      const mesh = legMeshRefs.current[i];
      pl1.legMaterials[i].opacity = pl1Opacity;
      if (!mesh) return;
      const lift = Math.max(0, basePose + sway * (i % 2 === 0 ? 1 : -1));
      mesh.position.y = LEG_BASE_Y + lift * 0.5;
      mesh.rotation.x = (i < 2 ? 1 : -0.5) * lift * 0.8;
    });

    applyFieldCamera(state.camera as THREE.PerspectiveCamera, v, pointerRef.current, delta, mobile, CAMERA, { x: 0.25, y: 0.14 });

    // Deterministic in v (not wall-clock time) so scrubbing the slider to
    // the same value always reproduces the same frame, per the discovery's
    // fair-comparison requirement. Envelope peaks mid-dissolve, zero at edges.
    const jitterEnvelope = dissolveT * (1 - dissolveT) * 4;
    state.camera.position.x += Math.sin(v * 500) * 0.06 * jitterEnvelope;
    state.camera.position.y += Math.sin(v * 733 + 1.3) * 0.04 * jitterEnvelope;
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

export function ReentryFieldCanvas({ progressRef, pointerRef, mobile }: FieldSceneArgs) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ fov: CAMERA.fov[0], near: 0.1, far: 80, position: [CAMERA.x[0], CAMERA.y[0], CAMERA.z[0]] }}
    >
      <color attach="background" args={["#0a0908"]} />
      <ReentryField progressRef={progressRef} pointerRef={pointerRef} mobile={mobile} />
      <BridgeStatsProbe />
    </Canvas>
  );
}
