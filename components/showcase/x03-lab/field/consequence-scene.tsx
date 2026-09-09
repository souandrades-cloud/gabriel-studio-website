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
 * Hypothesis C — CONSEQUENCE FIRST. Opens already tight and low on the
 * wheel-leg mechanism stepping over the cable trench — no corridor, no
 * THE CHOICE frame, no context at all. The front-right leg clears the gap,
 * then the front-left follows, before the camera pulls back and widens to
 * reveal PL-1 and the substation. Only once that reveal is under way does
 * the chosen route line fade back in beneath PL-1, retroactively closing
 * the loop to THE CHOICE. The bet: action read first, decision explained
 * after, rather than the other way round.
 */
const CAMERA: CameraKeyframes = {
  t: [0, 0.32, 0.75, 1],
  x: [0.05, 0.05, 0.9, 0.9],
  y: [0.32, 0.32, 1.85, 1.85],
  z: [-32.2, -32.2, -29.2, -29.2],
  lookY: [0.28, 0.28, 1.25, 1.25],
  lookZ: [-33.4, -33.4, -41, -41],
  fov: [20, 20, 34, 34],
};

const OPEN_STEP: [number, number] = [0.02, 0.16];
const SECOND_STEP: [number, number] = [0.16, 0.3];
const CALLBACK: [number, number] = [0.75, 0.9];

const rig = createEnvironmentRig();
const pl1 = createPL1Rig();

function ConsequenceField({ progressRef, pointerRef, mobile }: FieldSceneArgs) {
  const texture = useColorTexture(PL1_SRC);
  const legMeshRefs = useRef<Array<THREE.Mesh | null>>([null, null, null, null]);

  useFrame((state, delta) => {
    const v = progressRef.current ?? 0;

    if (pl1.planeMaterial.map !== texture) {
      pl1.planeMaterial.map = texture ?? null;
      pl1.planeMaterial.needsUpdate = true;
    }

    // The industrial world and PL-1 both exist from v=0 -- there is no
    // corridor/THE CHOICE representation here at all. Only the CAMERA
    // withholds context, via framing, not opacity.
    rig.oldMaterial.opacity = 0;
    rig.newMaterials.forEach((m) => {
      m.opacity = 1;
    });
    pl1.planeMaterial.opacity = 1;
    pl1.legMaterials.forEach((m) => {
      m.opacity = 1;
    });

    const frontRight = smoothstep(windowT(v, OPEN_STEP));
    const frontLeft = smoothstep(windowT(v, SECOND_STEP));
    // LEG_OFFSETS order: front-left, front-right, back-left, back-right.
    const lifts = [frontLeft, frontRight, 0, 0];
    lifts.forEach((lift, i) => {
      const mesh = legMeshRefs.current[i];
      if (!mesh) return;
      mesh.position.y = LEG_BASE_Y + lift * 0.55;
      mesh.rotation.x = (i < 2 ? 1 : -0.5) * lift * 0.9;
    });

    // The callback: the chosen route reappears once the reveal is under
    // way, proving retroactively that this action IS that decision.
    const callbackOpacity = smoothstep(windowT(v, CALLBACK));
    rig.routeMaterial.opacity = callbackOpacity;
    rig.routeDotMaterials.forEach((m) => {
      m.opacity = callbackOpacity;
    });

    applyFieldCamera(state.camera as THREE.PerspectiveCamera, v, pointerRef.current, delta, mobile, CAMERA, { x: 0.08, y: 0.04 });
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

export function ConsequenceFieldCanvas({ progressRef, pointerRef, mobile }: FieldSceneArgs) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ fov: CAMERA.fov[0], near: 0.1, far: 80, position: [CAMERA.x[0], CAMERA.y[0], CAMERA.z[0]] }}
    >
      <color attach="background" args={["#0a0908"]} />
      <ConsequenceField progressRef={progressRef} pointerRef={pointerRef} mobile={mobile} />
      <BridgeStatsProbe />
    </Canvas>
  );
}
