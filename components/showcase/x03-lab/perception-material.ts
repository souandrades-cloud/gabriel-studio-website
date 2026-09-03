import * as THREE from "three";

import type { Classification, EnvPiece } from "./environment";

/**
 * PERCEPTUAL ITERATION 001. The director's blind test read V1 as
 * "material recolor", not "sensing → structure → meaning → plan". Root
 * cause: one blend (`uProgress`) changed color and pattern
 * simultaneously — nothing in the image explained WHY it was changing.
 *
 * Fix: two separately-timed layers, both computed live from the SAME
 * geometry/camera (still one material, one mesh, no second scene):
 *
 * `uMeasure` (0–1) — appearance strips away INTO a measured reading:
 * depth-contour bands (not a smooth gradient — a stepped, surveyed
 * read) plus a silhouette/crease edge emphasis from the real view-space
 * normal. This is "the world becoming legible as geometry".
 *
 * `uClassify` (0–1), layered on top once `uMeasure` has already
 * settled — each class gets an OPERATIONAL identity, not a texture:
 * traversable opens up (brighter, calmer) except within a measured
 * buffer around real obstacle geometry, where it visibly interrupts
 * ("the machine won't cross here"); structure gets crisper bounded
 * edges; obstacle gets denser, heavier banding. No color is used for
 * any of it — grayscale throughout.
 */

const CLASS_ID: Record<Classification, number> = {
  traversable: 0,
  structure: 1,
  obstacle: 2,
};

/** Ground-plane exclusion buffer reads obstacle geometry directly (same
 *  EnvPiece list route.ts and scene-objects.tsx use) — never a separate
 *  hand-placed marker. Fixed-size array (GLSL ES 1.00 wants a constant
 *  loop bound); unused slots get an unreachable radius. */
const MAX_OBSTACLES = 4;

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
  uniform float uMeasure;
  uniform float uClassify;
  uniform float uClassId;
  uniform vec3 uHumanColor;
  uniform vec3 uLightDir;
  uniform float uNear;
  uniform float uFar;
  uniform float uObstacleCount;
  uniform vec2 uObstaclePos[${MAX_OBSTACLES}];
  uniform float uObstacleRadius[${MAX_OBSTACLES}];

  varying vec3 vViewPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // HUMAN: neutral lit material — ambient floor + one lambert term.
    float diffuse = max(dot(normal, uLightDir), 0.0);
    vec3 humanColor = uHumanColor * (0.32 + 0.68 * diffuse);

    // MEASURE — real view-space depth, quantized into contour bands
    // (a surveyed/stepped read, not a smooth "fog" gradient) with a
    // thin darkened line at each band edge.
    float dist = length(vViewPosition);
    float depthT = clamp((dist - uNear) / (uFar - uNear), 0.0, 1.0);
    float nearBright = 1.0 - depthT;

    const float BAND_COUNT = 9.0;
    float banded = floor(nearBright * BAND_COUNT) / BAND_COUNT;
    float bandFrac = fract(nearBright * BAND_COUNT);
    float edgeDist = min(bandFrac, 1.0 - bandFrac);
    float contourLine = 1.0 - smoothstep(0.0, 0.05, edgeDist);
    float measuredValue = banded * (1.0 - contourLine * 0.35);

    // Silhouette/crease edges from the real surface normal — geometry
    // asserting its own boundaries, not a screen-space outline.
    float facing = abs(dot(normal, viewDir));
    float rim = smoothstep(0.55, 0.95, 1.0 - facing);
    measuredValue = clamp(measuredValue + rim * 0.14, 0.0, 1.0);

    // CLASSIFY — operational identity per class, layered on the
    // already-measured value. No color anywhere in this block.
    float classifiedValue = measuredValue;
    if (uClassId < 0.5) {
      // traversable: opens up (quiet, continuous) EXCEPT inside a
      // measured buffer around real obstacle geometry, where the field
      // visibly interrupts — the exclusion is derived from the same
      // obstacle list the route solver uses, never a separate marker.
      float exclusion = 0.0;
      for (int i = 0; i < ${MAX_OBSTACLES}; i++) {
        if (float(i) >= uObstacleCount) break;
        float d = distance(vWorldPosition.xz, uObstaclePos[i]);
        float ring = 1.0 - smoothstep(uObstacleRadius[i], uObstacleRadius[i] + 1.8, d);
        exclusion = max(exclusion, ring);
      }
      float open = clamp(measuredValue * 1.1 - exclusion * 0.4, 0.0, 1.0);
      classifiedValue = open;
    } else if (uClassId < 1.5) {
      // structure: stable, bounded — crisper edges, contour softened.
      float architectural = clamp(measuredValue * 0.9 + rim * 0.24, 0.0, 1.0);
      classifiedValue = architectural;
    } else {
      // obstacle: interrupted, denser — heavier banding, pulled down.
      float hatch = step(0.5, fract((vWorldPosition.x + vWorldPosition.z) * 3.4));
      float dense = clamp(measuredValue * 0.58 * (0.75 + 0.25 * hatch), 0.0, 1.0);
      classifiedValue = dense;
    }

    float machineGray = mix(measuredValue, classifiedValue, uClassify);
    vec3 machineColor = vec3(machineGray);

    vec3 finalColor = mix(humanColor, machineColor, uMeasure);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function createPerceptionMaterial(
  classification: Classification,
  humanColor: THREE.Color,
  obstacles: readonly EnvPiece[] = [],
) {
  const obstaclePos = Array.from(
    { length: MAX_OBSTACLES },
    (_, i) => new THREE.Vector2(obstacles[i]?.position[0] ?? 1e6, obstacles[i]?.position[2] ?? 1e6),
  );
  const obstacleRadius = Array.from(
    { length: MAX_OBSTACLES },
    (_, i) => (obstacles[i] ? Math.max(obstacles[i].size[0], obstacles[i].size[2]) / 2 : 0),
  );

  return new THREE.ShaderMaterial({
    uniforms: {
      uMeasure: { value: 0 },
      uClassify: { value: 0 },
      uClassId: { value: CLASS_ID[classification] },
      uHumanColor: { value: humanColor },
      uLightDir: { value: new THREE.Vector3(-0.4, 0.85, 0.35).normalize() },
      uNear: { value: 2 },
      uFar: { value: 55 },
      uObstacleCount: { value: obstacles.length },
      uObstaclePos: { value: obstaclePos },
      uObstacleRadius: { value: obstacleRadius },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
  });
}

export type PerceptionMaterial = ReturnType<typeof createPerceptionMaterial>;
