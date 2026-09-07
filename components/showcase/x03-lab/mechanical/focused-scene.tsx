"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { BridgeStatsProbe } from "../bridge/bridge-stats";
import { applyFieldCamera, type CameraKeyframes } from "../field/field-camera";
import type { MechanicalSceneArgs } from "./mechanical-shell";
import { createEnvironmentRig, UNIT_BOX } from "./environment-rig";
import { AXLE_LOCAL, CHASSIS_OFFSET_Y, HIP_LOCAL_Y, KNEE_LOCAL, createLegRig, type LegRig } from "./leg-rig";
import { smoothstep, windowT } from "./constants";

/**
 * Hypothesis A — FOCUSED MECHANICAL MODEL. Tight macro framing on ONE
 * wheel-leg for the entire sequence; the rest of PL-1 is never modeled or
 * shown (per the brief: "Não modelar PL-1 completo"). Tests whether
 * localized linkage geometry alone -- hip strut, knee link, wheel, one
 * chassis fragment -- reads as real mechanical response to the step,
 * without any photographic identity to lean on.
 */
// The rig itself travels ~1.35 units forward across the sequence (see
// useFrame below); the camera tracks at a roughly constant offset from it
// so the wheel doesn't loom into an unreadable close-up by the end.
const CAMERA: CameraKeyframes = {
  t: [0, 1],
  x: [1.9, 1.6],
  y: [1.35, 1.3],
  z: [2.7, 1.35],
  lookY: [0.95, 0.75],
  lookZ: [0.4, -0.4],
  fov: [38, 34],
};

const APPROACH: [number, number] = [0, 0.2];
const CONTACT: [number, number] = [0.2, 0.35];
const RESPONSE: [number, number] = [0.35, 0.55];
const ADVANCE: [number, number] = [0.55, 0.8];

const env = createEnvironmentRig();
const leg = createLegRig();

export interface LegMechanismRefs {
  rigRef: RefObject<THREE.Group | null>;
  chassisRef: RefObject<THREE.Mesh | null>;
  hipRef: RefObject<THREE.Group | null>;
  kneeRef: RefObject<THREE.Group | null>;
  wheelRef: RefObject<THREE.Mesh | null>;
}

export function renderLegMechanism(leg: LegRig, refs: LegMechanismRefs, initialZ: number) {
  return (
    <group ref={refs.rigRef} position={[0, 0, initialZ]}>
      <mesh ref={refs.chassisRef} geometry={leg.chassisGeo} material={leg.chassisMat} position={[0, HIP_LOCAL_Y + CHASSIS_OFFSET_Y, 0]} />
      <group ref={refs.hipRef} position={[0, HIP_LOCAL_Y, 0]}>
        <mesh geometry={leg.hipJointGeo} material={leg.hipJointMat} rotation={[0, 0, Math.PI / 2]} />
        <mesh geometry={leg.strutGeo} material={leg.strutMat} position={[0, -0.36, 0]} />
        <group ref={refs.kneeRef} position={KNEE_LOCAL}>
          <mesh geometry={leg.kneeJointGeo} material={leg.kneeJointMat} rotation={[0, 0, Math.PI / 2]} />
          <mesh geometry={leg.linkGeo} material={leg.linkMat} position={[0, -0.28, 0]} />
          <group position={AXLE_LOCAL}>
            <mesh geometry={leg.axleGeo} material={leg.axleMat} rotation={[0, 0, Math.PI / 2]} />
            <group rotation={[0, 0, Math.PI / 2]}>
              <mesh ref={refs.wheelRef} geometry={leg.wheelGeo} material={leg.wheelMat} />
              <mesh geometry={leg.hubGeo} material={leg.hubMat} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function FocusedMechanism({ progressRef, pointerRef, mobile }: MechanicalSceneArgs) {
  const rigRef = useRef<THREE.Group>(null);
  const chassisRef = useRef<THREE.Mesh>(null);
  const hipRef = useRef<THREE.Group>(null);
  const kneeRef = useRef<THREE.Group>(null);
  const wheelRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const v = progressRef.current ?? 0;

    const approach = smoothstep(windowT(v, APPROACH));
    const contact = smoothstep(windowT(v, CONTACT));
    const response = smoothstep(windowT(v, RESPONSE));
    const advance = smoothstep(windowT(v, ADVANCE));

    // The whole assembly travels forward across the step and rises onto it.
    if (rigRef.current) {
      rigRef.current.position.z = 1.15 - approach * 0.5 - advance * 0.85;
      rigRef.current.position.y = advance * 0.42;
    }
    // Rolling contact: continuous spin, accelerating as the wheel is loaded
    // through the step and pushed up onto it.
    if (wheelRef.current) {
      wheelRef.current.rotation.y -= delta * (0.6 + approach * 2 + advance * 2.6);
    }
    // Knee compresses hardest right at contact/response, then extends
    // through advance as the leg pushes the body up and over.
    if (kneeRef.current) {
      const bend = contact * 0.55 + response * 0.35 - advance * 0.55;
      kneeRef.current.rotation.x = Math.max(0, bend);
    }
    // Hip swings the leg forward and up through response into advance.
    if (hipRef.current) {
      hipRef.current.rotation.x = -(response * 0.22 + advance * 0.3);
    }
    // Chassis fragment dips at peak load, then recovers as weight transfers
    // onto the now-higher wheel -- the one explicit "weight transfer" cue.
    if (chassisRef.current) {
      const dip = response * 0.09 - advance * 0.09;
      chassisRef.current.position.y = HIP_LOCAL_Y + CHASSIS_OFFSET_Y - dip;
    }

    applyFieldCamera(state.camera as THREE.PerspectiveCamera, v, pointerRef.current, delta, mobile, CAMERA, { x: 0.05, y: 0.03 });
  });

  return (
    <>
      {env.pieces.map((piece, i) => (
        <mesh key={piece.id} geometry={UNIT_BOX} material={env.materials[i]} position={piece.position} scale={piece.size} />
      ))}
      {renderLegMechanism(leg, { rigRef, chassisRef, hipRef, kneeRef, wheelRef }, 1.15)}
    </>
  );
}

export function FocusedMechanicalCanvas({ progressRef, pointerRef, mobile }: MechanicalSceneArgs) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ fov: CAMERA.fov[0], near: 0.05, far: 30, position: [CAMERA.x[0], CAMERA.y[0], CAMERA.z[0]] }}
    >
      <color attach="background" args={["#0a0908"]} />
      <FocusedMechanism progressRef={progressRef} pointerRef={pointerRef} mobile={mobile} />
      <BridgeStatsProbe />
    </Canvas>
  );
}
