/**
 * X03 LAB — PROPRIO. Gate 05A — Field Operation Signature Discovery.
 * Generic piecewise camera applier, same smoothing discipline as every
 * other x03/x03-lab camera rig (perception-camera.ts, machine-perception-
 * scene.tsx's applyFieldCamera) — parameterized by keyframes instead of
 * hardcoded, since each hypothesis needs its OWN curve while sharing the
 * exact same easing/pointer-parallax mechanics for a fair comparison.
 */
import * as THREE from "three";

import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

export interface CameraKeyframes {
  t: number[];
  x: number[];
  y: number[];
  z: number[];
  lookY: number[];
  lookZ: number[];
  fov: number[];
}

export function applyFieldCamera(
  camera: THREE.PerspectiveCamera,
  v: number,
  pointer: { x: number; y: number },
  delta: number,
  mobile: boolean,
  keyframes: CameraKeyframes,
  pointerAmplitude: { x: number; y: number } = { x: 0.3, y: 0.16 },
) {
  const k = Math.min(1, delta * 6);
  const px = mobile ? 0 : pointer.x;
  const py = mobile ? 0 : pointer.y;

  const targetX = piecewiseLerp(v, keyframes.t, keyframes.x) + px * pointerAmplitude.x;
  const targetY = piecewiseLerp(v, keyframes.t, keyframes.y) - py * pointerAmplitude.y;
  const targetZ = piecewiseLerp(v, keyframes.t, keyframes.z);
  camera.position.x += (targetX - camera.position.x) * k;
  camera.position.y += (targetY - camera.position.y) * k;
  camera.position.z += (targetZ - camera.position.z) * k;
  camera.lookAt(0, piecewiseLerp(v, keyframes.t, keyframes.lookY), piecewiseLerp(v, keyframes.t, keyframes.lookZ));

  const targetFov = piecewiseLerp(v, keyframes.t, keyframes.fov);
  if (Math.abs(camera.fov - targetFov) > 0.01) {
    camera.fov = targetFov;
    camera.updateProjectionMatrix();
  }
}
