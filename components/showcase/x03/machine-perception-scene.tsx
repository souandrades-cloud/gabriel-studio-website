"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

import { ALL_PIECES } from "./field-environment";
import { pointAlongPath } from "./field-path";
import { CANDIDATE_LEFT, CANDIDATE_RIGHT, CHOSEN_ROUTE } from "./field-routes";
import { createPerceptionFieldMaterial, relevanceOf } from "./perception-field-material";

/**
 * Gate 04B — THE CHOICE. SEE -> REMEMBER -> UNDERSTAND -> CONSIDER -> CHOOSE,
 * one continuous progression over the FIELD corridor validated by x03-lab's
 * Perception Rig and the Gate 04A discovery. See perception-field-material.ts
 * for the fused acquisition/memory/relevance shader; this file only drives
 * its uniforms off scroll progress and renders the three-route possibility
 * space for CONSIDER/CHOOSE.
 */
function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}
function windowT(v: number, [start, end]: [number, number]): number {
  return clamp01((v - start) / (end - start));
}
function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
const MATERIALS = ALL_PIECES.map((piece) => createPerceptionFieldMaterial(piece.classification, relevanceOf(piece.id, piece.classification)));

// SEE: the attention point walks CHOSEN_ROUTE — perception and the eventual
// plan share one line, "the machine looks where it may go". REMEMBER has no
// window of its own: it is what `maxSeeRef` (in PerceptionField below) turns
// the live sweep into — monotonic, so scrolling back up never un-senses a
// region already acquired.
const SEE_WINDOW: [number, number] = [0.04, 0.34];
// UNDERSTAND: relevance reduction rises once most of the FIELD is already
// known — deliberately overlapping SEE's tail, not waiting for a hard cut.
const UNDERSTAND_WINDOW: [number, number] = [0.3, 0.5];

/**
 * Director Iteration 001 — THE CHOICE read as "a route was defined"
 * instead of "the machine considered multiple futures and decided". Root
 * cause: chosen-route strengthening (CHOSEN_STRENGTHEN) shared its window
 * with the FIRST elimination and ran continuously through the second, so
 * the "winning" route was already visibly gaining ground the moment 3
 * became 2 — no beat ever held perceptually still long enough to register
 * as its own state. Fix is pure timing/hierarchy, not new visual language:
 * every beat below now has a genuine flat hold on either side (nothing in
 * this file changes during a HOLD window), and CHOSEN_STRENGTHEN is moved
 * entirely past both eliminations — the chosen route stays visually
 * IDENTICAL to a plain candidate (same neutral color, same opacity as the
 * pre-elimination baseline) all the way through "one route remains"; only
 * in the dedicated ownership window does it move.
 *
 * Beat map (fractions of the whole track, unchanged 0.5 CONSIDER start so
 * UNDERSTAND's hand-off is untouched):
 *   0.50–0.58  CONSIDER_IN         three futures fade in, equal weight
 *   0.58–0.66  (hold)              THREE FUTURES EXIST — nothing changes
 *   0.66–0.72  ELIMINATE_RIGHT     first possibility recedes (3 -> 2)
 *   0.72–0.80  (hold)              TWO REMAIN — nothing changes, chosen
 *                                  route still equal to the survivor
 *   0.80–0.86  ELIMINATE_LEFT      second possibility recedes (2 -> 1)
 *   0.86–0.90  (hold)              ONE ROUTE EXISTS — still no ownership
 *   0.90–0.97  CHOSEN_STRENGTHEN   the survivor alone gains presence
 *   0.97–1.00  (hold)              DECISION MADE — settled, held
 */
const CONSIDER_IN: [number, number] = [0.5, 0.58];
const ELIMINATE_RIGHT: [number, number] = [0.66, 0.72];
const ELIMINATE_LEFT: [number, number] = [0.8, 0.86];
const CHOSEN_STRENGTHEN: [number, number] = [0.9, 0.97];
const CHOSEN_SWEEP: [number, number] = [0.9, 0.97];

const SAMPLE_Y = 0.05;
// Undecided candidates share ONE dimmed-ink tone — no route should read as
// "the correct one" during CONSIDER. Only elimination/strengthening moves
// each line toward its final color.
const NEUTRAL_CANDIDATE = new THREE.Color("#c9bd9c");
const CHOSEN_FINAL = new THREE.Color("#d9c9a6");
const ELIMINATED = new THREE.Color("#33302a");

function buildLine(points: Array<[number, number]>) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x, z]) => new THREE.Vector3(x, SAMPLE_Y, z)));
  const material = new THREE.LineBasicMaterial({ color: NEUTRAL_CANDIDATE.clone(), transparent: true, opacity: 0 });
  return { line: new THREE.Line(geometry, material), material };
}

const chosenLine = buildLine(CHOSEN_ROUTE);
const leftLine = buildLine(CANDIDATE_LEFT);
const rightLine = buildLine(CANDIDATE_RIGHT);
const chosenDotMaterials = CHOSEN_ROUTE.map(() => new THREE.MeshBasicMaterial({ color: CHOSEN_FINAL.clone(), transparent: true, opacity: 0 }));

/**
 * Camera: opens tight and low (continuing Machine Space's intimate framing
 * at the hand-off from machine-signal-scene.tsx), pulls back to establish
 * the FIELD during SEE/UNDERSTAND, then pushes forward through CONSIDER/
 * CHOOSE toward the doorway goal. One set of keyframes, shared by every
 * beat — only the world's representation changes, per x03-lab/camera-rig.tsx's
 * original discipline.
 */
const CAM_T = [0, 0.18, 0.4, 0.68, 1];
const CAM_X = [0, 0.5, 0.4, 0.2, 0];
const CAM_Y = [0.5, 2.1, 3.1, 2.6, 2.0];
const CAM_Z = [5.2, 13.5, 18, 10, -2];
const LOOK_Y = [0.15, 1.5, 2.0, 1.8, 1.4];
const LOOK_Z = [-2, -6, -8, -14, -22];
const CAM_FOV = [30, 36, 40, 36, 32];

const POINTER_X_AMPLITUDE = 0.5;
const POINTER_Y_AMPLITUDE = 0.26;

function applyFieldCamera(camera: THREE.PerspectiveCamera, v: number, pointer: { x: number; y: number }, delta: number, mobile: boolean) {
  const k = Math.min(1, delta * 6);
  const px = mobile ? 0 : pointer.x;
  const py = mobile ? 0 : pointer.y;

  const targetX = piecewiseLerp(v, CAM_T, CAM_X) + px * POINTER_X_AMPLITUDE;
  const targetY = piecewiseLerp(v, CAM_T, CAM_Y) - py * POINTER_Y_AMPLITUDE;
  const targetZ = piecewiseLerp(v, CAM_T, CAM_Z);
  camera.position.x += (targetX - camera.position.x) * k;
  camera.position.y += (targetY - camera.position.y) * k;
  camera.position.z += (targetZ - camera.position.z) * k;
  camera.lookAt(0, piecewiseLerp(v, CAM_T, LOOK_Y), piecewiseLerp(v, CAM_T, LOOK_Z));

  const targetFov = piecewiseLerp(v, CAM_T, CAM_FOV);
  if (Math.abs(camera.fov - targetFov) > 0.01) {
    camera.fov = targetFov;
    camera.updateProjectionMatrix();
  }
}

interface SceneProps {
  mobile: boolean;
  scrollRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
}

function PerceptionField({ mobile, scrollRef, pointerRef }: SceneProps) {
  // Monotonic high-water mark of scroll progress reached — the JS half of
  // the persistent-memory mechanism. Scrolling back up moves the LIVE
  // attention point back with it (liveSeeT below), but never lowers this,
  // so already-acquired waypoints (perception-field-material.ts's
  // uAcquired) can never un-acquire.
  const maxSeeRef = useRef(0);

  useFrame((state, delta) => {
    const v = scrollRef.current ?? 0;
    maxSeeRef.current = Math.max(maxSeeRef.current, v);

    const liveSeeT = windowT(v, SEE_WINDOW);
    const memorySeeT = windowT(maxSeeRef.current, SEE_WINDOW);
    const [ax, az] = pointAlongPath(CHOSEN_ROUTE, liveSeeT);

    const total = CHOSEN_ROUTE.length;
    const understand = smoothstep(windowT(v, UNDERSTAND_WINDOW));

    for (const material of MATERIALS) {
      (material.uniforms.uAttentionPos.value as THREE.Vector2).set(ax, az);
      const acquired = material.uniforms.uAcquired.value as number[];
      for (let i = 0; i < total; i++) {
        const front = memorySeeT * total - i;
        const value = clamp01(front * 2);
        if (value > acquired[i]) acquired[i] = value;
      }
      material.uniforms.uUnderstand.value = understand;
    }

    const considerOpacity = smoothstep(windowT(v, CONSIDER_IN));
    const rightElim = smoothstep(windowT(v, ELIMINATE_RIGHT));
    const leftElim = smoothstep(windowT(v, ELIMINATE_LEFT));
    const chosenStrengthen = smoothstep(windowT(v, CHOSEN_STRENGTHEN));

    rightLine.material.opacity = considerOpacity * (0.55 - 0.47 * rightElim);
    rightLine.material.color.copy(NEUTRAL_CANDIDATE).lerp(ELIMINATED, rightElim);

    leftLine.material.opacity = considerOpacity * (0.55 - 0.47 * leftElim);
    leftLine.material.color.copy(NEUTRAL_CANDIDATE).lerp(ELIMINATED, leftElim);

    chosenLine.material.opacity = considerOpacity * (0.55 + 0.4 * chosenStrengthen);
    chosenLine.material.color.copy(NEUTRAL_CANDIDATE).lerp(CHOSEN_FINAL, chosenStrengthen);

    const sweepT = windowT(v, CHOSEN_SWEEP);
    chosenDotMaterials.forEach((material, i) => {
      const front = sweepT * total - i;
      material.opacity = clamp01(front * 2) * chosenLine.material.opacity;
    });

    applyFieldCamera(state.camera as THREE.PerspectiveCamera, v, pointerRef.current, delta, mobile);
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#8f897a" />
      <directionalLight position={[-3, 6, 5]} intensity={1.1} color="#d9c9a6" />
      {ALL_PIECES.map((piece, i) => (
        <mesh key={piece.id} geometry={UNIT_BOX} material={MATERIALS[i]} position={piece.position} scale={piece.size} />
      ))}
      <primitive object={leftLine.line} />
      <primitive object={rightLine.line} />
      <primitive object={chosenLine.line} />
      {CHOSEN_ROUTE.map(([x, z], i) => (
        <mesh key={i} position={[x, SAMPLE_Y, z]} rotation={[-Math.PI / 2, 0, 0]} material={chosenDotMaterials[i]}>
          <circleGeometry args={[0.18, 12]} />
        </mesh>
      ))}
    </>
  );
}

interface MachinePerceptionSceneProps extends SceneProps {
  active: boolean;
  onContextLost?: () => void;
}

function MachinePerceptionScene({ mobile, scrollRef, pointerRef, active, onContextLost }: MachinePerceptionSceneProps) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ fov: CAM_FOV[0], near: 0.1, far: 80, position: [CAM_X[0], CAM_Y[0], CAM_Z[0]] }}
      frameloop={active ? "always" : "demand"}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("aria-hidden", "true");
        if (!onContextLost) return;
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}
    >
      <color attach="background" args={["#0a0908"]} />
      <PerceptionField mobile={mobile} scrollRef={scrollRef} pointerRef={pointerRef} />
    </Canvas>
  );
}

export { MachinePerceptionScene };
