import * as THREE from "three";

import type { Classification } from "../environment";

/**
 * HYPOTHESIS A — WORLD REDUCTION. The world starts fully present (every
 * surface equally "there", a human view). As `uReduction` rises, presence
 * redistributes by operational relevance instead of uniformly fading:
 * high-relevance surfaces (the ground you can cross, the obstacles you must
 * not hit, the goal) stay solid and gain a quiet edge emphasis; low-relevance
 * mass (decorative structure, overhead beams) recedes toward near-transparent
 * — reality thinning down to what the body's plan actually needs. No color
 * category is introduced here (that risks reading as Approach C's affordance
 * language) — this hypothesis is about PRESENCE, not labeling.
 */
const VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uReduction;
  uniform float uRelevance;
  uniform vec3 uHumanColor;
  uniform vec3 uLightDir;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float diffuse = max(dot(normal, uLightDir), 0.0);

    vec3 humanColor = uHumanColor * (0.34 + 0.66 * diffuse);

    // Reduced read: grayscale value scaled by relevance, plus a rim
    // emphasis on the surfaces the body actually needs to track.
    float gray = dot(humanColor, vec3(0.299, 0.587, 0.114));
    float rim = smoothstep(0.5, 0.95, 1.0 - abs(dot(normal, viewDir)));
    vec3 reducedColor = vec3(gray * (0.7 + 0.3 * uRelevance) + rim * uRelevance * 0.3);

    vec3 finalColor = mix(humanColor, reducedColor, uReduction);

    // Presence: irrelevant mass doesn't vanish outright (that would read as
    // pop-out/culling) — it thins toward a faint residual trace.
    float presence = mix(1.0, mix(0.08, 1.0, uRelevance), uReduction);

    gl_FragColor = vec4(finalColor, presence);
  }
`;

export function createReductionMaterial(humanColor: THREE.Color, relevance: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uReduction: { value: 0 },
      uRelevance: { value: relevance },
      uHumanColor: { value: humanColor },
      uLightDir: { value: new THREE.Vector3(-0.4, 0.85, 0.35).normalize() },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
  });
}

/** Same neutral value-only palette as the Perception Rig — no hue signal the
 *  machine side doesn't also have access to via relevance/presence alone. */
export const HUMAN_COLOR: Record<Classification, THREE.Color> = {
  traversable: new THREE.Color("#8f9497"),
  structure: new THREE.Color("#65696d"),
  obstacle: new THREE.Color("#6d5f52"),
};

/**
 * Per-piece operational relevance (0..1) — high for what the body must
 * track to move safely (ground, obstacles, the goal), low for mass that
 * carries no consequence for the plan (decorative columns, overhead beams).
 * Derived by id/classification, same "single source of truth" discipline as
 * environment.ts: no separate hand-tuned list duplicating the geometry.
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
