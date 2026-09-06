import * as THREE from "three";

import type { Classification } from "./field-environment";
import { CHOSEN_ROUTE } from "./field-routes";

/**
 * Gate 04B — Machine Perception Integration. Fused SEE + REMEMBER +
 * UNDERSTAND material for the FIELD, per the Mentor's architecture verdict
 * (B -> C + selective A): ACQUISITION comes from Hypothesis B's active
 * perception (Gate 04A, active-perception-material.ts) — an invisible
 * attention point drives a per-fragment distance falloff, no scanner mesh,
 * no scan line, no HUD. RELEVANCE REDUCTION is the one thing extracted from
 * Hypothesis A (world-reduction-material.ts) — decorative mass recedes once
 * understood, without ever looking unknown again.
 *
 * Persistent memory (new in Gate 04B, not present in either Gate 04A
 * hypothesis): `uAcquired[i]` is a per-waypoint, monotonically-increasing
 * float — once a point along the route has been sensed, its value only
 * grows, never resets, even after the live attention point moves on. A
 * fragment's total "known-ness" (`presence`) is the max of the LIVE wave
 * (current attention position — the moving sensing front) and the
 * strongest MEMORY wave among all waypoints already acquired. This is the
 * "minimum sufficient visual state" the gate brief calls for: no voxel grid,
 * no texture mask, no semantic world model — one small fixed-size array,
 * cheap to evaluate, impossible to accidentally forget (JS only ever writes
 * larger values into it, see machine-perception-scene.tsx).
 *
 * KNOWN state and VISUAL EMPHASIS are kept conceptually separate per the
 * gate brief: `presence` (known/unknown) never decreases once raised, while
 * `uUnderstand` x `uRelevance` (emphasis) is free to dim low-relevance mass
 * back down — a region can be remembered AND quiet at the same time.
 *
 * Palette continues Gate 03D's Machine Space rather than Gate 04A's neutral
 * comparison grays: near-black unknown, graphite structure, the same warm
 * ink (#d9c9a6) SensorCavity's edges use — the FIELD reads as the same
 * machine's perceptual space, not a new demo.
 */
const CLASS_ID: Record<Classification, number> = {
  traversable: 0,
  structure: 1,
  obstacle: 2,
};

const BASE_COLOR: Record<Classification, THREE.Color> = {
  traversable: new THREE.Color("#565349"),
  structure: new THREE.Color("#4a463d"),
  obstacle: new THREE.Color("#3a3128"),
};

const INK = new THREE.Color("#d9c9a6");

const WAYPOINT_COUNT = CHOSEN_ROUTE.length;

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
  uniform vec3 uBaseColor;
  uniform vec3 uInk;
  uniform vec3 uLightDir;
  uniform float uRadius;
  uniform vec2 uAttentionPos;
  uniform vec2 uWaypointPos[${WAYPOINT_COUNT}];
  uniform float uAcquired[${WAYPOINT_COUNT}];
  uniform float uRelevance;
  uniform float uUnderstand;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;

  float wave(vec2 worldXZ, vec2 center) {
    float dist = distance(worldXZ, center);
    return 1.0 - smoothstep(uRadius * 0.3, uRadius, dist);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float diffuse = max(dot(normal, uLightDir), 0.0);

    // SEE — live acquisition front, centered on the attention point.
    float liveWave = wave(vWorldPosition.xz, uAttentionPos);

    // REMEMBER — strongest surviving trace among every waypoint already
    // acquired. uAcquired only ever grows (see the JS driver), so this can
    // never fall back toward "unknown" once raised.
    float memoryWave = 0.0;
    for (int i = 0; i < ${WAYPOINT_COUNT}; i++) {
      float w = wave(vWorldPosition.xz, uWaypointPos[i]) * uAcquired[i];
      memoryWave = max(memoryWave, w);
    }

    float presence = max(liveWave, memoryWave);

    // Unknown space stays a near-black silhouette (still legible as
    // geometry — this is a FIELD, not a void) until presence rises.
    float lit = mix(0.05, 1.0, presence);
    vec3 sensedColor = uBaseColor * (0.28 + 0.72 * diffuse) * lit;

    // Structural rim/edge definition settles in slightly after raw
    // acquisition — "sensed" becomes "structured".
    float structureRamp = smoothstep(0.14, 0.6, presence);
    float rim = smoothstep(0.55, 0.95, 1.0 - abs(dot(normal, viewDir)));
    sensedColor += uInk * rim * structureRamp * 0.32;

    // UNDERSTAND — relevance reduction. Only meaningful once the world is
    // already known; irrelevant mass thins toward a faint residual trace,
    // it never pops or vanishes outright.
    float relevanceFactor = mix(1.0, mix(0.16, 1.0, uRelevance), uUnderstand);

    vec3 finalColor = sensedColor * relevanceFactor;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function createPerceptionFieldMaterial(classification: Classification, relevance: number) {
  const waypointPos = CHOSEN_ROUTE.map(([x, z]) => new THREE.Vector2(x, z));
  const acquired = new Array<number>(WAYPOINT_COUNT).fill(0);

  return new THREE.ShaderMaterial({
    uniforms: {
      uClassId: { value: CLASS_ID[classification] },
      uBaseColor: { value: BASE_COLOR[classification] },
      uInk: { value: INK },
      uLightDir: { value: new THREE.Vector3(-0.4, 0.85, 0.35).normalize() },
      uRadius: { value: 10 },
      uAttentionPos: { value: new THREE.Vector2(0, 1e6) },
      uWaypointPos: { value: waypointPos },
      uAcquired: { value: acquired },
      uRelevance: { value: relevance },
      uUnderstand: { value: 0 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
  });
}

export type PerceptionFieldMaterial = ReturnType<typeof createPerceptionFieldMaterial>;

/**
 * Per-piece operational relevance (0..1) — high for what the body must
 * track to move safely (ground, obstacles, the doorway goal), low for mass
 * with no consequence for the plan (decorative columns, overhead beams).
 * Ported from the Gate 04A discovery's world-reduction-material.ts.
 */
export function relevanceOf(id: string, classification: Classification): number {
  if (id === "ground") return 1;
  if (classification === "obstacle") return 0.95;
  if (id.startsWith("doorway")) return 0.75;
  if (id === "right-block") return 0.3;
  if (id.startsWith("left-column")) return 0.22;
  if (id.startsWith("beam")) return 0.1;
  return 0.2;
}
