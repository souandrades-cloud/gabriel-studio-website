/**
 * X03 LAB — PROPRIO. Gate 05A — Field Operation Signature Discovery.
 * Extends the SAME corridor (environment.ts/route.ts, already validated by
 * the Perception Rig and ported into Gate 04B production as field-
 * environment.ts/field-routes.ts) past its own doorway into one small,
 * recognizable substation fragment: a cable-trench threshold (the physical
 * constraint PL-1 negotiates) and a transformer silhouette (the "this is a
 * real facility, not a sci-fi corridor" landmark). Per the gate brief: ONE
 * environment, proxy geometry only, no new asset pipeline.
 *
 * The corridor itself (`oldPieces`) never changes color or geometry across
 * hypotheses — it is literally THE CHOICE's frozen final state. Only the
 * new industrial pieces and the route line move between hidden/shown; the
 * three hypotheses differ in WHEN each becomes visible, not in what exists.
 */
import * as THREE from "three";

import { ALL_PIECES, type EnvPiece } from "../environment";
import { ROUTE_SAMPLES } from "../route";
import { PL1_STANCE } from "./pl1-rig";

/** Shared with PL1_STANCE so the constraint geometry and the body that
 *  negotiates it can never drift out of registration. */
const GAP_Z = PL1_STANCE[2];

/** Hand-authored, discovery-only continuation of the validated A* route
 *  (ROUTE_SAMPLES) — not re-run through the pathfinder, since this stretch
 *  exists only to test the CHOICE -> ACTION beat, not new navigation. */
export const ROUTE_EXTENSION: Array<[number, number]> = [
  [0, -29],
  [0, GAP_Z],
  [0, -36],
];
export const FULL_ROUTE: Array<[number, number]> = [...ROUTE_SAMPLES, ...ROUTE_EXTENSION];
export const SAMPLE_Y = 0.05;

interface IndustrialPiece {
  id: string;
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  tone: "steel" | "hazard" | "ground";
}

export const NEW_PIECES: IndustrialPiece[] = [
  { id: "ground-ext", position: [0, -0.1, -39], size: [16, 0.2, 18], tone: "ground" },
  // Trench rails flank a 0.4-unit gap PL-1's legs must clear individually --
  // a genuine physical reason for wheel-leg articulation, not a decorative obstacle.
  { id: "rail-l", position: [-1.1, 0.15, GAP_Z], size: [1.8, 0.3, 0.7], tone: "hazard" },
  { id: "rail-r", position: [1.1, 0.15, GAP_Z], size: [1.8, 0.3, 0.7], tone: "hazard" },
  { id: "transformer-body", position: [4.6, 1.5, -40], size: [2.4, 3, 2.4], tone: "steel" },
  { id: "bushing-l", position: [4.0, 3.3, -40], size: [0.22, 1.1, 0.22], tone: "steel" },
  { id: "bushing-r", position: [5.2, 3.3, -40], size: [0.22, 1.1, 0.22], tone: "steel" },
];

const TONE_COLOR: Record<IndustrialPiece["tone"], string> = {
  steel: "#7a7d80",
  hazard: "#c99a3f", // the same amber already carried by PL-1's own chassis decal (x03.css --x03-accent) -- not an invented brand color
  ground: "#302e2b",
};

/** THE CHOICE's neutral, already-decided tone (machine-perception-scene.tsx
 *  NEUTRAL_CANDIDATE) -- the corridor's frozen appearance, unchanged here. */
const OLD_COLOR = "#c9bd9c";
/** THE CHOICE's chosen-route ink (machine-perception-scene.tsx CHOSEN_FINAL). */
const ROUTE_COLOR = "#d9c9a6";

export const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
export const DOT_GEOMETRY = new THREE.CircleGeometry(0.18, 12);

export interface EnvironmentRig {
  oldPieces: EnvPiece[];
  oldMaterial: THREE.MeshBasicMaterial;
  newPieces: IndustrialPiece[];
  newMaterials: THREE.MeshBasicMaterial[];
  routeLine: THREE.Line;
  routeMaterial: THREE.LineBasicMaterial;
  routeDotMaterials: THREE.MeshBasicMaterial[];
}

export function createEnvironmentRig(): EnvironmentRig {
  const oldMaterial = new THREE.MeshBasicMaterial({ color: OLD_COLOR, transparent: true, opacity: 1 });
  const newMaterials = NEW_PIECES.map(
    (piece) => new THREE.MeshBasicMaterial({ color: TONE_COLOR[piece.tone], transparent: true, opacity: 0 }),
  );

  const routeGeometry = new THREE.BufferGeometry().setFromPoints(FULL_ROUTE.map(([x, z]) => new THREE.Vector3(x, SAMPLE_Y, z)));
  const routeMaterial = new THREE.LineBasicMaterial({ color: ROUTE_COLOR, transparent: true, opacity: 1 });
  const routeLine = new THREE.Line(routeGeometry, routeMaterial);
  const routeDotMaterials = FULL_ROUTE.map(() => new THREE.MeshBasicMaterial({ color: ROUTE_COLOR, transparent: true, opacity: 1 }));

  return {
    oldPieces: ALL_PIECES,
    oldMaterial,
    newPieces: NEW_PIECES,
    newMaterials,
    routeLine,
    routeMaterial,
    routeDotMaterials,
  };
}
