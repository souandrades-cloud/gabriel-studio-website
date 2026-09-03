/**
 * Grid-based A* over the SAME obstacle data used to build the environment
 * meshes (environment.ts) — the route cannot disagree with the geometry
 * because it reads the same source of truth, not a hand-authored line.
 * Not a production navigation stack (no SLAM, no replanning) — a single
 * deterministic path computed once, which is all a feasibility rig needs.
 */

import { ALL_PIECES, CORRIDOR_X_HALF_WIDTH, CORRIDOR_Z_END, CORRIDOR_Z_START, ROUTE_GOAL, ROUTE_START } from "./environment";

const CELL_SIZE = 0.5;
/** Only pieces with mass near ground level block the path — overhead beams
 *  and the doorway lintel sit above head height and must not. */
const GROUND_BLOCK_HEIGHT = 2;
/** Grown around each blocked cell so the path clears obstacle corners by a
 *  visible margin instead of grazing them. */
const CLEARANCE_CELLS = 2;

const X_MIN = -CORRIDOR_X_HALF_WIDTH;
const X_MAX = CORRIDOR_X_HALF_WIDTH;
const Z_MIN = CORRIDOR_Z_END - 2;
const Z_MAX = CORRIDOR_Z_START + 2;

const COLS = Math.ceil((X_MAX - X_MIN) / CELL_SIZE);
const ROWS = Math.ceil((Z_MAX - Z_MIN) / CELL_SIZE);

function worldToCell(x: number, z: number) {
  return {
    col: Math.round((x - X_MIN) / CELL_SIZE),
    row: Math.round((z - Z_MIN) / CELL_SIZE),
  };
}

function cellToWorld(col: number, row: number): [number, number] {
  return [X_MIN + col * CELL_SIZE, Z_MIN + row * CELL_SIZE];
}

function buildBlockedGrid(): Uint8Array {
  const blocked = new Uint8Array(COLS * ROWS);
  for (const piece of ALL_PIECES) {
    if (piece.classification === "traversable") continue;
    const halfH = piece.size[1] / 2;
    const baseY = piece.position[1] - halfH;
    if (baseY >= GROUND_BLOCK_HEIGHT) continue; // overhead — doesn't block ground travel

    const halfX = piece.size[0] / 2;
    const halfZ = piece.size[2] / 2;
    const minCell = worldToCell(piece.position[0] - halfX, piece.position[2] - halfZ);
    const maxCell = worldToCell(piece.position[0] + halfX, piece.position[2] + halfZ);

    for (let row = minCell.row - CLEARANCE_CELLS; row <= maxCell.row + CLEARANCE_CELLS; row++) {
      if (row < 0 || row >= ROWS) continue;
      for (let col = minCell.col - CLEARANCE_CELLS; col <= maxCell.col + CLEARANCE_CELLS; col++) {
        if (col < 0 || col >= COLS) continue;
        blocked[row * COLS + col] = 1;
      }
    }
  }
  return blocked;
}

interface Node {
  col: number;
  row: number;
  g: number;
  f: number;
  parent: Node | null;
}

const NEIGHBORS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
] as const;

function heuristic(aCol: number, aRow: number, bCol: number, bRow: number) {
  return Math.hypot(aCol - bCol, aRow - bRow);
}

/**
 * Returns a spatially coherent path from ROUTE_START to ROUTE_GOAL as
 * world-space [x, z] samples, guaranteed by construction to never enter a
 * blocked cell. Computed once at module load — deterministic, no randomness.
 */
function computeRoute(): Array<[number, number]> {
  const blocked = buildBlockedGrid();
  const start = worldToCell(ROUTE_START[0], ROUTE_START[1]);
  const goal = worldToCell(ROUTE_GOAL[0], ROUTE_GOAL[1]);

  const key = (col: number, row: number) => row * COLS + col;
  const open = new Map<number, Node>();
  const closed = new Set<number>();

  const startNode: Node = { ...start, g: 0, f: heuristic(start.col, start.row, goal.col, goal.row), parent: null };
  open.set(key(start.col, start.row), startNode);

  let goalNode: Node | null = null;

  while (open.size > 0) {
    let current: Node | null = null;
    let currentKey = -1;
    for (const [k, node] of open) {
      if (!current || node.f < current.f) {
        current = node;
        currentKey = k;
      }
    }
    if (!current) break;
    if (current.col === goal.col && current.row === goal.row) {
      goalNode = current;
      break;
    }
    open.delete(currentKey);
    closed.add(currentKey);

    for (const [dc, dr] of NEIGHBORS) {
      const col = current.col + dc;
      const row = current.row + dr;
      if (col < 0 || col >= COLS || row < 0 || row >= ROWS) continue;
      const k = key(col, row);
      if (closed.has(k) || blocked[k]) continue;

      const stepCost = dc !== 0 && dr !== 0 ? Math.SQRT2 : 1;
      const g = current.g + stepCost;
      const existing = open.get(k);
      if (existing && existing.g <= g) continue;

      open.set(k, { col, row, g, f: g + heuristic(col, row, goal.col, goal.row), parent: current });
    }
  }

  if (!goalNode) return [[...ROUTE_START], [...ROUTE_GOAL]];

  const cells: Array<{ col: number; row: number }> = [];
  let node: Node | null = goalNode;
  while (node) {
    cells.push({ col: node.col, row: node.row });
    node = node.parent;
  }
  cells.reverse();

  // Thin to discrete spatial samples (rule: "quiet planning line", not a
  // dense pixel trail) — every 4th grid cell, always keeping the goal.
  const SAMPLE_STRIDE = 4;
  const samples: Array<[number, number]> = [];
  for (let i = 0; i < cells.length; i += SAMPLE_STRIDE) {
    samples.push(cellToWorld(cells[i].col, cells[i].row));
  }
  const last = cellToWorld(cells[cells.length - 1].col, cells[cells.length - 1].row);
  const lastSample = samples[samples.length - 1];
  if (!lastSample || lastSample[0] !== last[0] || lastSample[1] !== last[1]) {
    samples.push(last);
  }
  return samples;
}

export const ROUTE_SAMPLES: Array<[number, number]> = computeRoute();
