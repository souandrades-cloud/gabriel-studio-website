"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

import type { BridgeSceneArgs } from "./bridge-shell";
import { BridgeStatsProbe } from "./bridge-stats";
import { A005_ASPECT, A005_SRC, CAMERA_FOV, CAMERA_Z, POINTER_X_AMPLITUDE, POINTER_Y_AMPLITUDE } from "./constants";
import { useColorTexture } from "./use-color-texture";

/**
 * Approach B — camera projection. Three simplified depth layers (background,
 * module mass, foreground band — axis-aligned boxes, not the full SensorCavity
 * anchor set) stand in for the sensor cavity; A-005 is painted onto them by
 * true projective texture mapping from a FIXED "projector" camera matching
 * the track's opening pose (CAMERA_Z[0]/CAMERA_FOV[0]).
 *
 * At progress 0 the observation camera equals the projector, so the
 * composite is pixel-identical to the flat photo regardless of how the
 * three boxes are shaped or positioned — that's the technique's appeal
 * (zero per-object UV authoring). Divergence only appears once the
 * observation camera dollies away from the projector: real depth layers
 * hold up, but each layer here is a flat/axis-aligned stand-in, so oblique
 * faces and layer seams stretch or gap as the two cameras disagree — that
 * divergence is exactly what this prototype exists to measure.
 */
const FOV_RAD = (CAMERA_FOV[0] * Math.PI) / 180;

function screenToWorld(u: number, v: number, z: number): [number, number] {
  const distance = CAMERA_Z[0] - z;
  const halfHeight = distance * Math.tan(FOV_RAD / 2);
  const halfWidth = halfHeight * A005_ASPECT;
  return [(u * 2 - 1) * halfWidth, -(v * 2 - 1) * halfHeight];
}

function uvRectToWorld(u0: number, u1: number, v0: number, v1: number, z: number) {
  const [x0, y0] = screenToWorld(u0, v0, z);
  const [x1, y1] = screenToWorld(u1, v1, z);
  return {
    position: [(x0 + x1) / 2, (y0 + y1) / 2, z] as [number, number, number],
    size: [Math.abs(x1 - x0), Math.abs(y1 - y0)] as [number, number],
  };
}

// Loose UV rectangles eyeballed against A-005 (see depth-mask.ts regions) —
// generous overscan margins so small camera pans don't reveal bare edges.
const BACK_WALL = uvRectToWorld(-0.2, 1.2, -0.2, 1.2, -2);
const MODULE_BLOCK = uvRectToWorld(0.16, 1.0, 0.3, 0.78, 0.4);
const STRUT_BAND = uvRectToWorld(-0.05, 0.85, 0.5, 1.15, 1.8);

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D map;
  uniform mat4 projectorView;
  uniform mat4 projectorProjection;
  varying vec3 vWorldPosition;

  void main() {
    vec4 projected = projectorProjection * projectorView * vec4(vWorldPosition, 1.0);
    if (projected.w <= 0.0) discard;
    vec2 uv = (projected.xy / projected.w) * 0.5 + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
    float fade = smoothstep(0.0, 0.03, uv.x) * smoothstep(0.0, 0.03, 1.0 - uv.x)
      * smoothstep(0.0, 0.03, uv.y) * smoothstep(0.0, 0.03, 1.0 - uv.y);
    gl_FragColor = vec4(texture2D(map, uv).rgb, fade);
  }
`;

function ProjectionLayers({ progressRef, pointerRef, mobile }: BridgeSceneArgs) {
  const colorMap = useColorTexture(A005_SRC);

  const projector = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(CAMERA_FOV[0], A005_ASPECT, 0.1, 30);
    cam.position.set(0, 0, CAMERA_Z[0]);
    cam.lookAt(0, 0, 0);
    cam.updateMatrixWorld();
    return cam;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          map: { value: colorMap },
          projectorView: { value: projector.matrixWorldInverse.clone() },
          projectorProjection: { value: projector.projectionMatrix.clone() },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
      }),
    [colorMap, projector],
  );

  const backGeo = useMemo(() => new THREE.PlaneGeometry(BACK_WALL.size[0], BACK_WALL.size[1]), []);
  const moduleGeo = useMemo(() => new THREE.BoxGeometry(MODULE_BLOCK.size[0], MODULE_BLOCK.size[1], 0.4), []);
  const strutGeo = useMemo(() => new THREE.BoxGeometry(STRUT_BAND.size[0], STRUT_BAND.size[1], 0.25), []);

  useFrame((state, delta) => {
    const v = progressRef.current ?? 0;
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

  return (
    <>
      <mesh geometry={backGeo} material={material} position={BACK_WALL.position} />
      <mesh geometry={moduleGeo} material={material} position={MODULE_BLOCK.position} />
      <mesh geometry={strutGeo} material={material} position={STRUT_BAND.position} />
    </>
  );
}

export function ProjectionBridgeCanvas({ progressRef, pointerRef, mobile }: BridgeSceneArgs) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ fov: CAMERA_FOV[0], near: 0.1, far: 30, position: [0, 0, CAMERA_Z[0]] }}
    >
      <color attach="background" args={["#0d0c0a"]} />
      <ProjectionLayers progressRef={progressRef} pointerRef={pointerRef} mobile={mobile} />
      <BridgeStatsProbe />
    </Canvas>
  );
}
