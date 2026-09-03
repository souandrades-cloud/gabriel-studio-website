"use client";

import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import * as THREE from "three";

/**
 * One camera, nearly locked, for the entire journey — position/orientation
 * drift by only a few units end to end so every landmark (columns, service
 * block, both obstacles, the doorway) stays aligned in frame throughout.
 * The transformation itself carries the signature moment; the camera's
 * job here is only to prove "this didn't cut away" (rule: no whip pan, no
 * fade-to-black hiding the transition).
 */
const DESKTOP_START = { pos: new THREE.Vector3(0.6, 3.6, 21), look: new THREE.Vector3(0, 2.2, -8), fov: 42 };
const DESKTOP_END = { pos: new THREE.Vector3(0.2, 3.3, 17.5), look: new THREE.Vector3(0, 2.1, -10), fov: 40 };

/** Mobile: pulled back and wider, not the desktop camera in a narrow frame —
 *  the corridor width needs more room to read at 390px. */
const MOBILE_START = { pos: new THREE.Vector3(0.4, 4.4, 27), look: new THREE.Vector3(0, 2.4, -6), fov: 58 };
const MOBILE_END = { pos: new THREE.Vector3(0.1, 4.1, 23.5), look: new THREE.Vector3(0, 2.3, -9), fov: 55 };

function smoothstep(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

function CameraRig({ mobile, scrollRef }: { mobile: boolean; scrollRef: RefObject<number> }) {
  const start = mobile ? MOBILE_START : DESKTOP_START;
  const end = mobile ? MOBILE_END : DESKTOP_END;

  useFrame(({ camera }) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const u = smoothstep(scrollRef.current ?? 0);

    camera.position.lerpVectors(start.pos, end.pos, u);
    const look = new THREE.Vector3().lerpVectors(start.look, end.look, u);
    camera.lookAt(look);

    const fov = THREE.MathUtils.lerp(start.fov, end.fov, u);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export { CameraRig };
