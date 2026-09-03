/**
 * X03 LAB — PROPRIO. Temporary geometric environment: an industrial
 * service corridor / test bay. Not the final PROPRIO environment (see
 * CLAUDE.md gate) — just enough unambiguous landmarks (ground, left
 * column system, right service block, overhead beams, two obstacles,
 * a distant doorway) for a visitor to recognize the SAME space before,
 * during and after the perception transform.
 *
 * Single source of truth: this array is read by scene-objects.tsx (to
 * build meshes), route.ts (to build the passability grid), and the
 * classification legend — geometry and pathfinding can never disagree
 * about where an obstacle is, because there is only one obstacle list.
 */

export type Classification = "traversable" | "structure" | "obstacle";

export interface EnvPiece {
  id: string;
  classification: Classification;
  /** Center position [x, y, z]. */
  position: readonly [number, number, number];
  /** Full extents [width, height, depth]. */
  size: readonly [number, number, number];
}

/** Corridor runs along -Z (camera starts at +Z, doorway sits at -Z). */
export const CORRIDOR_X_HALF_WIDTH = 7;
export const CORRIDOR_Z_START = 22;
export const CORRIDOR_Z_END = -28;

export const GROUND: EnvPiece = {
  id: "ground",
  classification: "traversable",
  position: [0, -0.1, (CORRIDOR_Z_START + CORRIDOR_Z_END) / 2],
  size: [CORRIDOR_X_HALF_WIDTH * 2, 0.2, CORRIDOR_Z_START - CORRIDOR_Z_END + 8],
};

/** Left structural wall / column system — a repeating column, not one solid wall,
 *  so the corridor reads as traversable next to it, not boxed in. */
const LEFT_COLUMN_X = -6.2;
const LEFT_COLUMN_ZS = [16, 9, 2, -5, -12, -19];
export const LEFT_COLUMNS: EnvPiece[] = LEFT_COLUMN_ZS.map((z, i) => ({
  id: `left-column-${i}`,
  classification: "structure",
  position: [LEFT_COLUMN_X, 2.75, z],
  size: [1.1, 5.5, 1.4],
}));

/** Right service block — one long low mass, contrasting the left column rhythm. */
export const RIGHT_BLOCK: EnvPiece = {
  id: "right-block",
  classification: "structure",
  position: [6.1, 1.6, 3],
  size: [1.8, 3.2, 26],
};

/** Overhead beam / pipe-like geometry — cross-corridor beams at intervals. */
const BEAM_ZS = [12, 0, -12];
export const OVERHEAD_BEAMS: EnvPiece[] = BEAM_ZS.map((z, i) => ({
  id: `beam-${i}`,
  classification: "structure",
  position: [0, 5.4, z],
  size: [CORRIDOR_X_HALF_WIDTH * 1.7, 0.5, 0.5],
}));

/** One large obstacle, offset left-of-center — forces the route to jog right. */
export const OBSTACLE_LARGE: EnvPiece = {
  id: "obstacle-large",
  classification: "obstacle",
  position: [-1.6, 0.95, -3],
  size: [2.6, 1.9, 2.6],
};

/** One small obstacle, offset right-of-center further down the corridor. */
export const OBSTACLE_SMALL: EnvPiece = {
  id: "obstacle-small",
  classification: "obstacle",
  position: [2.1, 0.5, -14],
  size: [1.1, 1, 1.1],
};

/** Distant terminal / doorway landmark — a simple frame, not a modeled door. */
const DOORWAY_Z = CORRIDOR_Z_END + 2;
export const DOORWAY: EnvPiece[] = [
  { id: "doorway-post-l", classification: "structure", position: [-2.6, 2.5, DOORWAY_Z], size: [0.6, 5, 0.6] },
  { id: "doorway-post-r", classification: "structure", position: [2.6, 2.5, DOORWAY_Z], size: [0.6, 5, 0.6] },
  { id: "doorway-lintel", classification: "structure", position: [0, 5.2, DOORWAY_Z], size: [6, 0.6, 0.6] },
];

export const OBSTACLES: EnvPiece[] = [OBSTACLE_LARGE, OBSTACLE_SMALL];

export const ALL_PIECES: EnvPiece[] = [
  GROUND,
  ...LEFT_COLUMNS,
  RIGHT_BLOCK,
  ...OVERHEAD_BEAMS,
  ...OBSTACLES,
  ...DOORWAY,
];

/** Route start (near the visitor's entry, mid-corridor) and goal (at the doorway). */
export const ROUTE_START: readonly [number, number] = [0, CORRIDOR_Z_START - 4];
export const ROUTE_GOAL: readonly [number, number] = [0, CORRIDOR_Z_END + 3];
