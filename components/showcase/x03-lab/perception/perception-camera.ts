import * as THREE from "three";

import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

/**
 * ONE camera behavior shared by all three Gate 04A microprototypes — same
 * establishing pose, same closing pose, same pointer amplitude — so a
 * director comparing them is judging the perceptual mechanism, never camera
 * choreography. Wide establishing view of the corridor (the world exists,
 * unperceived) dollies down into it as progress advances (perception has
 * happened, the machine is now positioned to act) — same "lock the
 * choreography, vary the representation" discipline as x03-lab/camera-rig.tsx
 * and the Gate 03C bridge cameras.
 */
const POS_START = new THREE.Vector3(0, 4.4, 20);
const POS_END = new THREE.Vector3(0, 2.3, -9);
const LOOK_START = new THREE.Vector3(0, 2, -6);
const LOOK_END = new THREE.Vector3(0, 1.6, -22);
export const CAMERA_FOV: [number, number] = [40, 33];

const POINTER_X_AMPLITUDE = 0.6;
const POINTER_Y_AMPLITUDE = 0.32;

const tmpPos = new THREE.Vector3();
const tmpLook = new THREE.Vector3();

export function applyPerceptionCamera(
  camera: THREE.PerspectiveCamera,
  progress: number,
  pointer: { x: number; y: number },
  delta: number,
  mobile: boolean,
) {
  const k = Math.min(1, delta * 6);
  tmpPos.lerpVectors(POS_START, POS_END, progress);
  tmpLook.lerpVectors(LOOK_START, LOOK_END, progress);

  const px = mobile ? 0 : pointer.x;
  const py = mobile ? 0 : pointer.y;

  camera.position.x += (tmpPos.x + px * POINTER_X_AMPLITUDE - camera.position.x) * k;
  camera.position.y += (tmpPos.y - py * POINTER_Y_AMPLITUDE - camera.position.y) * k;
  camera.position.z += (tmpPos.z - camera.position.z) * k;
  camera.lookAt(tmpLook);

  const targetFov = piecewiseLerp(progress, [0, 1], CAMERA_FOV);
  if (Math.abs(camera.fov - targetFov) > 0.01) {
    camera.fov = targetFov;
    camera.updateProjectionMatrix();
  }
}
