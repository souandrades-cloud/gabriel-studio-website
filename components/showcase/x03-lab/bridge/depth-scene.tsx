"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

import type { BridgeSceneArgs } from "./bridge-shell";
import { BridgeStatsProbe } from "./bridge-stats";
import { A005_ASPECT, A005_SRC, CAMERA_FOV, CAMERA_Z, PLANE_HEIGHT, POINTER_X_AMPLITUDE, POINTER_Y_AMPLITUDE } from "./constants";
import { createDepthMaskTexture } from "./depth-mask";
import { useColorTexture } from "./use-color-texture";

/**
 * Approach A — depth / displacement. A-005 stays one continuous surface (a
 * single subdivided plane, no cut geometry) and the depth mask pushes each
 * vertex toward the camera in proportion to how near that pixel reads —
 * "the photo gaining controlled spatiality", not a swapped asset. Amplitude
 * ramps in with progress so the flat-photo pose (progress 0) is pixel-
 * identical to the DOM crossfade it hands off from.
 */
const DISPLACEMENT_TIMELINE = [0, 0.5, 1];
// World units at PLANE_HEIGHT=4 — 0.85 is roughly where diagonal stretching
// at the strut bands starts reading as tearing rather than depth (found by
// scrubbing the slider to 1.0 during authoring; see report Approach A findings).
const DISPLACEMENT_AMPLITUDE = [0, 0.55, 0.85];

const VERTEX_SHADER = /* glsl */ `
  uniform sampler2D depthMask;
  uniform float uAmplitude;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    float depth = texture2D(depthMask, uv).r; // 0 near .. 1 far
    float displacement = (1.0 - depth) * uAmplitude;
    vec3 displaced = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D map;
  varying vec2 vUv;

  void main() {
    gl_FragColor = texture2D(map, vUv);
  }
`;

function DepthPlane({ progressRef, pointerRef, mobile }: BridgeSceneArgs) {
  const colorMap = useColorTexture(A005_SRC);
  const depthMask = useMemo(() => createDepthMaskTexture(), []);
  const meshRef = useRef<THREE.Mesh>(null);

  // Dense enough grid for per-vertex displacement to read as a continuous
  // surface instead of faceted planes — cost is evaluated in the report.
  const geometry = useMemo(() => new THREE.PlaneGeometry(PLANE_HEIGHT * A005_ASPECT, PLANE_HEIGHT, 120, 160), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { map: { value: null }, depthMask: { value: depthMask }, uAmplitude: { value: 0 } },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
      }),
    [depthMask],
  );

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const mat = mesh.material as THREE.ShaderMaterial;
    if (mat.uniforms.map.value !== colorMap) mat.uniforms.map.value = colorMap;

    const v = progressRef.current ?? 0;
    mat.uniforms.uAmplitude.value = piecewiseLerp(v, DISPLACEMENT_TIMELINE, DISPLACEMENT_AMPLITUDE);

    const camera = state.camera as THREE.PerspectiveCamera;
    const targetZ = piecewiseLerp(v, [0, 1], CAMERA_Z);
    const targetFov = piecewiseLerp(v, [0, 1], CAMERA_FOV);
    const k = Math.min(1, delta * 6);
    const px = mobile ? 0 : pointerRef.current.x;
    const py = mobile ? 0 : pointerRef.current.y;
    camera.position.z += (targetZ - camera.position.z) * k;
    camera.position.x += (px * POINTER_X_AMPLITUDE - camera.position.x) * k;
    camera.position.y += (-py * POINTER_Y_AMPLITUDE - camera.position.y) * k;
    camera.lookAt(0, 0, 0);
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  });

  if (!colorMap) return null;

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

export function DepthBridgeCanvas({ progressRef, pointerRef, mobile }: BridgeSceneArgs) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      camera={{ fov: CAMERA_FOV[0], near: 0.1, far: 30, position: [0, 0, CAMERA_Z[0]] }}
    >
      <DepthPlane progressRef={progressRef} pointerRef={pointerRef} mobile={mobile} />
      <BridgeStatsProbe />
    </Canvas>
  );
}
