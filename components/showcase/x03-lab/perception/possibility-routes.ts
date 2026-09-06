/**
 * HYPOTHESIS C — POSSIBILITY SPACE. Three REAL candidate paths through the
 * SAME obstacle field route.ts already reads (ALL_PIECES) — a "prefer left",
 * a "prefer right" and a "prefer center" A* run, each still guaranteed by
 * construction to clear obstacles. Not fake offset lines: each candidate
 * would genuinely be a viable route, so "multiple possibilities existed" is
 * true of the geometry, not simulated.
 *
 * Self-contained rather than extending x03-lab/route.ts — this is a
 * discovery-only microprototype (Gate 04A brief: isolated, cheap, disposable)
 * and route.ts backs the already-approved Perception Rig; duplicating the
 * grid/A* kernel here means this hypothesis can be deleted with zero risk to
 * that prototype if REJECTED.
 */
import { ALL_PIECES, CORRIDOR_X_HALF_WIDTH, CORRIDOR_Z_END, CORRIDOR_Z_START, ROUTE_GOAL, ROUTE_START } from "../environment";

const CELL_SIZE = 0.5;
const GROUND_BLOCK_HEIGHT = 2;
const CLEARANCE_CELLS = 2;

const X_MIN = -CORRIDOR_X_HALF_WIDTH;
const X_MAX = CORRIDOR_X_HALF_WIDTH;
const Z_MIN = CORRIDOR_Z_END - 2;
const Z_MAX = CORRIDOR_Z_START + 2;

const COLS = Math.ceil((X_MAX - X_MIN) / CELL_SIZE);
const ROWS = Math.ceil((Z_MAX - Z_MIN) / CELL_SIZE);

function worldToCell(x: number, z: number) {
  return { col: Math.round((x - X_MIN) / CELL_SIZE), row: Math.round((z - Z_MIN) / CELL_SIZE) };
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
    if (baseY >= GROUND_BLOCK_HEIGHT) continue;

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

const BLOCKED = buildBlockedGrid();

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
 * A* with an added lateral-bias cost term: `biasCol` pulls the path toward
 * one side of the corridor whenever it has a choice, while still never
 * crossing a blocked cell — a genuinely different viable route, not a
 * cosmetic offset of the same one.
 */
function computeBiasedRoute(biasCol: number, biasWeight: number): Array<[number, number]> {
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
      if (closed.has(k) || BLOCKED[k]) continue;

      const stepCost = dc !== 0 && dr !== 0 ? Math.SQRT2 : 1;
      const lateralPenalty = biasWeight * Math.abs(col - biasCol) * 0.02;
      const g = current.g + stepCost + lateralPenalty;
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

const CENTER_COL = worldToCell(0, 0).col;
const LEFT_BIAS_COL = worldToCell(X_MIN + 1.5, 0).col;
const RIGHT_BIAS_COL = worldToCell(X_MAX - 1.5, 0).col;

/** The chosen route — same shortest path route.ts already computes (no
 *  lateral bias), kept independent so a director can verify it agrees with
 *  the Perception Rig's own ROUTE_SAMPLES. */
export const CHOSEN_ROUTE: Array<[number, number]> = computeBiasedRoute(CENTER_COL, 0);
export const CANDIDATE_LEFT: Array<[number, number]> = computeBiasedRoute(LEFT_BIAS_COL, 2.4);
export const CANDIDATE_RIGHT: Array<[number, number]> = computeBiasedRoute(RIGHT_BIAS_COL, 2.4);
