import * as THREE from "three";

import type { Classification } from "./environment";

/**
 * The transformation mechanism. ONE material per mesh, continuously
 * blending two readings of the SAME geometry under the SAME light/camera —
 * not two scenes cross-faded. `uProgress` (0 = human, 1 = machine) is the
 * only thing that changes at runtime; everything else is computed live
 * from the mesh's own position/normal each frame, so depth and
 * classification genuinely respond to geometry and camera instead of
 * being painted on.
 *
 * Human side: simple lit neutral material (ambient floor + one directional
 * lambert term) — "normal spatial observation", not photoreal.
 *
 * Machine side: pure grayscale (rule: grayscale-first). Value = view-space
 * distance from the camera, normalized — literal depth, near reads bright,
 * far reads dark. Classification changes the SURFACE TREATMENT of that
 * value (a geometry-locked stripe/hatch pattern in world space, so it
 * moves correctly with the camera instead of reading as a screen overlay):
 * traversable is left nearly flat, structure gets a slow horizontal band,
 * obstacle gets a tighter hatch that reads as "attention" through pattern
 * density alone, never color.
 */

const CLASS_ID: Record<Classification, number> = {
  traversable: 0,
  structure: 1,
  obstacle: 2,
};

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vViewPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = viewMatrix * worldPosition;
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uProgress;
  uniform float uClassId;
  uniform vec3 uHumanColor;
  uniform vec3 uLightDir;
  uniform float uNear;
  uniform float uFar;

  varying vec3 vViewPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vNormal);

    // HUMAN: neutral lit material — ambient floor + one lambert term.
    float diffuse = max(dot(normal, uLightDir), 0.0);
    vec3 humanColor = uHumanColor * (0.4 + 0.6 * diffuse);

    // MACHINE: real view-space depth, near = bright, far = dark.
    float dist = length(vViewPosition);
    float depthT = clamp((dist - uNear) / (uFar - uNear), 0.0, 1.0);
    float depthValue = 1.0 - depthT;

    // Classification as surface treatment, geometry-locked (world space),
    // not screen space — proves the pattern is bound to the object, not
    // painted over the frame.
    float pattern = 1.0;
    if (uClassId > 1.5) {
      // obstacle: tight diagonal hatch — reads as "attention" via density.
      float hatch = fract((vWorldPosition.x + vWorldPosition.z) * 2.2);
      pattern = 0.72 + 0.28 * step(0.5, hatch);
    } else if (uClassId > 0.5) {
      // structure: slow horizontal band.
      float band = fract(vWorldPosition.y * 1.4);
      pattern = 0.82 + 0.18 * step(0.5, band);
    }

    float machineGray = clamp(depthValue * pattern, 0.0, 1.0);
    vec3 machineColor = vec3(machineGray);

    vec3 finalColor = mix(humanColor, machineColor, uProgress);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function createPerceptionMaterial(classification: Classification, humanColor: THREE.Color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uClassId: { value: CLASS_ID[classification] },
      uHumanColor: { value: humanColor },
      uLightDir: { value: new THREE.Vector3(-0.4, 0.85, 0.35).normalize() },
      uNear: { value: 2 },
      uFar: { value: 55 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
  });
}

export type PerceptionMaterial = ReturnType<typeof createPerceptionMaterial>;
