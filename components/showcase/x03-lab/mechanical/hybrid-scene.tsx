"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { useColorTexture } from "../bridge/use-color-texture";
import { BridgeStatsProbe } from "../bridge/bridge-stats";
import { applyFieldCamera, type CameraKeyframes } from "../field/field-camera";
import { PL1_SRC } from "../field/pl1-rig";
import type { MechanicalSceneArgs } from "./mechanical-shell";
import { createEnvironmentRig, STEP_HEIGHT, UNIT_BOX } from "./environment-rig";
import { CHASSIS_OFFSET_Y, HIP_LOCAL_Y, createLegRig } from "./leg-rig";
import { renderLegMechanism } from "./focused-scene";
import { smoothstep, windowT } from "./constants";

/**
 * Hypothesis C — HYBRID MECHANICAL INSERT. "Where the camera moves, we
 * model. Where the camera holds, we photograph." Opens on the same product
 * hold as the field discovery (A-001 photo plane, whole PL-1 legible,
 * approaching the step) then HARD CUTS -- not a dissolve, an actual
 * instantaneous swap of both camera framing and representation -- into the
 * Hypothesis A mechanism for the articulation itself, then hard cuts back
 * to the photo plane once PL-1 is past the constraint. The insert window
 * is a real cut, never a cross-fade, so WebGL never pretends to still be
 * a photograph.
 */
const CUT_IN = 0.22;
const CUT_OUT = 0.75;
// A tiny window rather than an instant jump so applyFieldCamera's lerp
// resolves within 1-2 frames -- visually a cut, not a dolly.
const CUT_EPS = 0.004;

// The PRE and POST product shots must keep the camera on the same side as
// the photo plane's front face (+Z of the plane's own Z) -- otherwise the
// single-sided plane's back face gets culled and the "return to product"
// cut renders empty.
const CAMERA: CameraKeyframes = {
  t: [0, CUT_IN - CUT_EPS, CUT_IN, CUT_OUT, CUT_OUT + CUT_EPS, 1],
  x: [0.6, 0.6, 1.9, 1.6, 0.5, 0.5],
  y: [1.2, 1.2, 1.35, 1.3, 1.15, 1.15],
  z: [3.8, 3.8, 2.7, 1.35, 1.2, 1.2],
  lookY: [0.9, 0.9, 0.95, 0.75, 1.2, 1.2],
  lookZ: [0.4, 0.4, 0.4, -0.4, -1, -1],
  fov: [36, 36, 38, 34, 32, 32],
};

// PL-1's photographic stance before and after the crossing -- a hard swap,
// not an animated traverse, since the traverse itself is what the macro
// insert exists to show.
const PRE_STANCE: [number, number, number] = [0, 0, 1.6];
const POST_STANCE: [number, number, number] = [0, STEP_HEIGHT, -1];
const PLANE_HEIGHT = 1.9;
const PLANE_ASPECT = 1086 / 1448;

const env = createEnvironmentRig();
const leg = createLegRig();

function HybridInsert({ progressRef, pointerRef, mobile }: MechanicalSceneArgs) {
  const texture = useColorTexture(PL1_SRC);
  const photoGroupRef = useRef<THREE.Group>(null);
  const photoMeshRef = useRef<THREE.Mesh>(null);
  const legGroupRef = useRef<THREE.Group>(null);
  const rigRef = useRef<THREE.Group>(null);
  const chassisRef = useRef<THREE.Mesh>(null);
  const hipRef = useRef<THREE.Group>(null);
  const kneeRef = useRef<THREE.Group>(null);
  const wheelRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const v = progressRef.current ?? 0;

    if (photoMeshRef.current) {
      const mat = photoMeshRef.current.material as THREE.MeshBasicMaterial;
      if (mat.map !== texture) {
        mat.map = texture ?? null;
        mat.needsUpdate = true;
      }
    }

    const inMacro = v >= CUT_IN && v <= CUT_OUT;
    if (legGroupRef.current) legGroupRef.current.visible = inMacro;
    if (photoGroupRef.current) {
      photoGroupRef.current.visible = !inMacro;
      const stance = v < CUT_IN ? PRE_STANCE : POST_STANCE;
      photoGroupRef.current.position.set(stance[0], stance[1], stance[2]);
    }

    if (inMacro) {
      // Remap the cut window to its own 0-1 local progress so the SAME
      // relative phase timing used by Hypothesis A plays out here too.
      const lv = windowT(v, [CUT_IN, CUT_OUT]);
      const approach = smoothstep(windowT(lv, [0, 0.2]));
      const contact = smoothstep(windowT(lv, [0.2, 0.35]));
      const response = smoothstep(windowT(lv, [0.35, 0.55]));
      const advance = smoothstep(windowT(lv, [0.55, 0.8]));

      if (rigRef.current) {
        rigRef.current.position.z = 1.15 - approach * 0.5 - advance * 0.85;
        rigRef.current.position.y = advance * 0.42;
      }
      if (wheelRef.current) {
        wheelRef.current.rotation.y -= delta * (0.6 + approach * 2 + advance * 2.6);
      }
      if (kneeRef.current) {
        const bend = contact * 0.55 + response * 0.35 - advance * 0.55;
        kneeRef.current.rotation.x = Math.max(0, bend);
      }
      if (hipRef.current) {
        hipRef.current.rotation.x = -(response * 0.22 + advance * 0.3);
      }
      if (chassisRef.current) {
        const dip = response * 0.09 - advance * 0.09;
        chassisRef.current.position.y = HIP_LOCAL_Y + CHASSIS_OFFSET_Y - dip;
      }
    }

    applyFieldCamera(state.camera as THREE.PerspectiveCamera, v, pointerRef.current, delta, mobile, CAMERA, { x: 0.05, y: 0.03 });
  });

  return (
    <>
      {env.pieces.map((piece, i) => (
        <mesh key={piece.id} geometry={UNIT_BOX} material={env.materials[i]} position={piece.position} scale={piece.size} />
      ))}

      <group ref={photoGroupRef} position={PRE_STANCE}>
        <mesh ref={photoMeshRef} position={[0, PLANE_HEIGHT / 2, 0]}>
          <planeGeometry args={[PLANE_HEIGHT * PLANE_ASPECT, PLANE_HEIGHT]} />
          <meshBasicMaterial transparent depthWrite={false} />
        </mesh>
      </group>

      <group ref={legGroupRef}>{renderLegMechanism(leg, { rigRef, chassisRef, hipRef, kneeRef, wheelRef }, 1.15)}</group>
    </>
  );
}

export function HybridMechanicalCanvas({ progressRef, pointerRef, mobile }: MechanicalSceneArgs) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ fov: CAMERA.fov[0], near: 0.05, far: 30, position: [CAMERA.x[0], CAMERA.y[0], CAMERA.z[0]] }}
    >
      <color attach="background" args={["#0a0908"]} />
      <HybridInsert progressRef={progressRef} pointerRef={pointerRef} mobile={mobile} />
      <BridgeStatsProbe />
    </Canvas>
  );
}
