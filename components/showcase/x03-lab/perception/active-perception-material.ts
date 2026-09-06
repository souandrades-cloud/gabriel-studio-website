import * as THREE from "three";

import type { Classification, EnvPiece } from "../environment";

/**
 * HYPOTHESIS B — ACTIVE PERCEPTION. No scanner mesh, no scan line, no ping,
 * no HUD — the primary risk this hypothesis carries. The only signal is a
 * per-fragment distance falloff from an invisible `uAttentionPos` (the point
 * currently being acquired, walked along the route in the scene file) that
 * drives three properties in sequence as the falloff rises: how LIT a
 * surface is (unknown -> sensed), how much RIM/edge definition it carries
 * (sensed -> structured), and how much its classified affordance value
 * settles in (structured -> understood). Unvisited space stays a near-black
 * silhouette — still legible as geometry (this is a FIELD, not a void), but
 * unmistakably "not yet perceived".
 */
const CLASS_ID: Record<Classification, number> = {
  traversable: 0,
  structure: 1,
  obstacle: 2,
};

const MAX_OBSTACLES = 4;

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
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
  uniform float uClassId;
  uniform vec3 uHumanColor;
  uniform vec3 uLightDir;
  uniform vec2 uAttentionPos;
  uniform float uRadius;
  uniform float uObstacleCount;
  uniform vec2 uObstaclePos[${MAX_OBSTACLES}];
  uniform float uObstacleRadius[${MAX_OBSTACLES}];

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float diffuse = max(dot(normal, uLightDir), 0.0);

    float dist = distance(vWorldPosition.xz, uAttentionPos);
    float wave = 1.0 - smoothstep(uRadius * 0.35, uRadius, dist);

    // SENSE: unknown space is near-black silhouette, not void — a hint of
    // ambient value keeps geometry minimally legible before acquisition.
    float lit = mix(0.06, 0.34 + 0.66 * diffuse, wave);
    vec3 sensedColor = uHumanColor * lit;

    // STRUCTURED: edge/rim definition arrives early in the wave.
    float structure = smoothstep(0.12, 0.5, wave);
    float rim = smoothstep(0.55, 0.95, 1.0 - abs(dot(normal, viewDir)));
    sensedColor += vec3(rim * structure * 0.16);

    // UNDERSTOOD: classified affordance value settles in once the wave core
    // has passed — same operational read as the Perception Rig's classify
    // block, gated by acquisition instead of a global scroll scalar.
    float classify = smoothstep(0.45, 0.92, wave);
    float gray = dot(sensedColor, vec3(0.299, 0.587, 0.114));
    float classifiedGray = gray;
    if (uClassId < 0.5) {
      float exclusion = 0.0;
      for (int i = 0; i < ${MAX_OBSTACLES}; i++) {
        if (float(i) >= uObstacleCount) break;
        float d = distance(vWorldPosition.xz, uObstaclePos[i]);
        float ring = 1.0 - smoothstep(uObstacleRadius[i], uObstacleRadius[i] + 1.8, d);
        exclusion = max(exclusion, ring);
      }
      classifiedGray = clamp(gray * 1.1 - exclusion * 0.4, 0.0, 1.0);
    } else if (uClassId > 1.5) {
      float hatch = step(0.5, fract((vWorldPosition.x + vWorldPosition.z) * 3.4));
      classifiedGray = clamp(gray * 0.6 * (0.75 + 0.25 * hatch), 0.0, 1.0);
    }

    vec3 finalColor = mix(sensedColor, vec3(classifiedGray), classify * 0.7);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function createActivePerceptionMaterial(classification: Classification, humanColor: THREE.Color, obstacles: readonly EnvPiece[] = []) {
  const obstaclePos = Array.from({ length: MAX_OBSTACLES }, (_, i) => new THREE.Vector2(obstacles[i]?.position[0] ?? 1e6, obstacles[i]?.position[2] ?? 1e6));
  const obstacleRadius = Array.from({ length: MAX_OBSTACLES }, (_, i) => (obstacles[i] ? Math.max(obstacles[i].size[0], obstacles[i].size[2]) / 2 : 0));

  return new THREE.ShaderMaterial({
    uniforms: {
      uClassId: { value: CLASS_ID[classification] },
      uHumanColor: { value: humanColor },
      uLightDir: { value: new THREE.Vector3(-0.4, 0.85, 0.35).normalize() },
      uAttentionPos: { value: new THREE.Vector2(0, 1e6) },
      uRadius: { value: 9 },
      uObstacleCount: { value: obstacles.length },
      uObstaclePos: { value: obstaclePos },
      uObstacleRadius: { value: obstacleRadius },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
  });
}

export const HUMAN_COLOR: Record<Classification, THREE.Color> = {
  traversable: new THREE.Color("#8f9497"),
  structure: new THREE.Color("#65696d"),
  obstacle: new THREE.Color("#6d5f52"),
};
