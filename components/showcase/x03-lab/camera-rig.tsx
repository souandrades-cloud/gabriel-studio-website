"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * PERCEPTUAL ITERATION 001 — the director's blind test read V1's small
 * end-to-end dolly as "something is approaching", competing with the
 * transformation itself for attention. Fix, per the director's own
 * recommended experiment: lock the camera completely. One static pose
 * per breakpoint, applied every frame regardless of scroll — "change the
 * world's representation, not the viewer's position." If a future
 * iteration wants motion back after the machine state is established,
 * that's a deliberate re-add, not a default.
 */
const DESKTOP_POSE = { pos: new THREE.Vector3(0.6, 3.6, 21), look: new THREE.Vector3(0, 2.2, -8), fov: 42 };

/** Mobile: pulled back and wider, not the desktop camera in a narrow frame —
 *  the corridor width needs more room to read at 390px. */
const MOBILE_POSE = { pos: new THREE.Vector3(0.4, 4.4, 27), look: new THREE.Vector3(0, 2.4, -6), fov: 58 };

function CameraRig({ mobile }: { mobile: boolean }) {
  const pose = mobile ? MOBILE_POSE : DESKTOP_POSE;

  useFrame(({ camera }) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.position.copy(pose.pos);
    camera.lookAt(pose.look);
    if (camera.fov !== pose.fov) {
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export { CameraRig };
