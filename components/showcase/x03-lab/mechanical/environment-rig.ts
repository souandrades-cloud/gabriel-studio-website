/**
 * X03 LAB — PROPRIO. Gate 05B — Mechanical Action Representation Discovery.
 * The ONE constraint every hypothesis crosses: a low industrial step (a
 * raised threshold, not a trench, not a corridor) -- ground, riser, ground,
 * plus a single scale post. Deliberately NOT Gate 05A's field/environment-
 * rig.ts (no FIELD, no substation, no reused corridor geometry) -- this
 * gate stays isolated per the brief's LAB ISOLATION clause and its own
 * "não construir FIELD OPERATION" instruction.
 */
import * as THREE from "three";

export const STEP_HEIGHT = 0.42;

interface Piece {
  id: string;
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  tone: "steel" | "hazard" | "ground";
}

/** Ground before the step (+Z, where PL-1 approaches from), the riser
 *  itself (the constraint), ground after the step (-Z, where PL-1 ends up),
 *  and one steel post purely for scale reference -- no facility, no set.
 *  Sized to the mechanism's own ~1-unit scale, not a wide establishing
 *  shot: every hypothesis here frames tight/macro, and a wide flat ground
 *  plane at that proximity would just fill the frame edge-on. */
export const PIECES: Piece[] = [
  { id: "ground-low", position: [0, -0.1, 1.4], size: [1.4, 0.2, 2], tone: "ground" },
  { id: "step-riser", position: [0, STEP_HEIGHT / 2, 0.1], size: [1.4, STEP_HEIGHT, 0.5], tone: "hazard" },
  { id: "ground-high", position: [0, STEP_HEIGHT - 0.1, -1], size: [1.4, 0.2, 1.6], tone: "ground" },
  { id: "scale-post", position: [0.85, STEP_HEIGHT / 2 + 0.05, 0.1], size: [0.08, STEP_HEIGHT + 0.7, 0.08], tone: "steel" },
];

const TONE_COLOR: Record<Piece["tone"], string> = {
  steel: "#7a7d80",
  // Same amber already carried by PL-1's own chassis decal / Gate 05A's
  // trench rails -- not an invented brand color.
  hazard: "#c99a3f",
  ground: "#302e2b",
};

export const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);

export interface EnvironmentRig {
  pieces: Piece[];
  materials: THREE.MeshBasicMaterial[];
}

export function createEnvironmentRig(): EnvironmentRig {
  return {
    pieces: PIECES,
    materials: PIECES.map((piece) => new THREE.MeshBasicMaterial({ color: TONE_COLOR[piece.tone] })),
  };
}
