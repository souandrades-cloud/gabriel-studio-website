"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

import type { BridgeSceneArgs } from "./bridge-shell";
import { BridgeStatsProbe } from "./bridge-stats";
import { A005_ASPECT, A005_HEIGHT, A005_SRC, A005_WIDTH, CAMERA_FOV, CAMERA_Z, PLANE_HEIGHT, POINTER_X_AMPLITUDE, POINTER_Y_AMPLITUDE } from "./constants";
import { createDepthMaskTexture } from "./depth-mask";
import { useColorTexture } from "./use-color-texture";

/**
 * Approach C — structural dissolution. A-005 stays a flat, undisplaced
 * plane (no proxy geometry at all, no camera-vs-projector mismatch to
 * manage); the fragment shader decides per pixel how "reduced to structure"
 * that pixel is. Dissolution starts at the photo's own focal subject (the
 * twin-lens/sensor module, read off the shared depth mask) and spreads
 * outward to foreground blur and background as progress advances —
 * "the machine locks onto the subject, then generalizes" rather than a
 * flat cross-fade. Replaces photographic color with Sobel-edge line art in
 * the SAME warm ink tone the production proxy's wireframe already uses
 * (#d9c9a6, machine-signal-scene.tsx EDGE_TIMELINE) — deliberately not the
 * Perception Rig lab's cool grayscale banded look, so this reads as a
 * continuation of Gate 03B's vocabulary, not a different lab's aesthetic.
 */
const DISSOLVE_SPREAD = 0.55;

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D map;
  uniform sampler2D depthMask;
  uniform float uProgress;
  uniform vec2 uTexel;
  varying vec2 vUv;

  float luminance(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vec3 color = texture2D(map, vUv).rgb;

    float tl = luminance(texture2D(map, vUv + uTexel * vec2(-1.0, -1.0)).rgb);
    float t  = luminance(texture2D(map, vUv + uTexel * vec2( 0.0, -1.0)).rgb);
    float tr = luminance(texture2D(map, vUv + uTexel * vec2( 1.0, -1.0)).rgb);
    float l  = luminance(texture2D(map, vUv + uTexel * vec2(-1.0,  0.0)).rgb);
    float r  = luminance(texture2D(map, vUv + uTexel * vec2( 1.0,  0.0)).rgb);
    float bl = luminance(texture2D(map, vUv + uTexel * vec2(-1.0,  1.0)).rgb);
    float b  = luminance(texture2D(map, vUv + uTexel * vec2( 0.0,  1.0)).rgb);
    float br = luminance(texture2D(map, vUv + uTexel * vec2( 1.0,  1.0)).rgb);
    float gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br;
    float gy = -tl - 2.0 * t - tr + bl + 2.0 * b + br;
    float edge = clamp(length(vec2(gx, gy)), 0.0, 1.0);

    float depth = texture2D(depthMask, vUv).r;
    float order = smoothstep(0.0, ${DISSOLVE_SPREAD.toFixed(3)}, abs(depth - 0.48));
    float dissolve = clamp(uProgress * 1.3 - order * 0.5, 0.0, 1.0);

    vec3 ink = vec3(0.851, 0.788, 0.651); // #d9c9a6 — Gate 03B's edge color
    vec3 desaturated = mix(color, vec3(luminance(color)), dissolve);
    vec3 structural = mix(desaturated, ink, edge * dissolve);
    vec3 finalColor = mix(structural, vec3(0.02, 0.018, 0.015), dissolve * 0.4);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function DissolutionPlane({ progressRef, pointerRef, mobile }: BridgeSceneArgs) {
  const colorMap = useColorTexture(A005_SRC);
  const depthMask = useMemo(() => createDepthMaskTexture(), []);
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => new THREE.PlaneGeometry(PLANE_HEIGHT * A005_ASPECT, PLANE_HEIGHT), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          map: { value: null },
          depthMask: { value: depthMask },
          uProgress: { value: 0 },
          uTexel: { value: new THREE.Vector2(1 / A005_WIDTH, 1 / A005_HEIGHT) },
        },
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
    mat.uniforms.uProgress.value = v;

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

export function DissolutionBridgeCanvas({ progressRef, pointerRef, mobile }: BridgeSceneArgs) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, powerPreference: "low-power" }}
      camera={{ fov: CAMERA_FOV[0], near: 0.1, far: 30, position: [0, 0, CAMERA_Z[0]] }}
    >
      <DissolutionPlane progressRef={progressRef} pointerRef={pointerRef} mobile={mobile} />
      <BridgeStatsProbe />
    </Canvas>
  );
}
