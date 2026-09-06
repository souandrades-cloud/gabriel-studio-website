/**
 * X03 LAB — PROPRIO. Gate 04A — Machine Perception Narrative Discovery.
 * Shared numbers/curves so Hypothesis A/B/C get an identical viewport, FIELD,
 * camera amplitude, duration and information timing — the only variable
 * between the three microprototypes is the perceptual mechanism itself
 * (world reduction vs. active acquisition vs. possibility space), per the
 * gate brief's "fair comparison" requirement (same discipline Gate 03C's
 * bridge/constants.ts already applies to Approach A/B/C).
 */

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** Autoplay cycle: 0 -> 1 -> 0, framerate-independent, ms per single leg.
 *  Slightly longer than Gate 03C's bridge (5200ms) — a full FIELD reads as
 *  a bigger perceptual event than one photograph, and needs more room. */
export const CYCLE_MS = 6400;

/**
 * Shared information-integration windows (SENSE / UNDERSTAND / DECIDE),
 * identical across all three hypotheses — the gate brief's information test
 * asks whether text can coexist with cinema, not whether one hypothesis gets
 * more reading time than another. Each hypothesis expresses the SAME three
 * beats through a different perceptual mechanism.
 */
export const INFO_STAGES = [
  {
    key: "sense",
    tag: "Sense",
    copy: "Spatial awareness — the environment enters the machine's field of reference.",
    range: [0, 0.12] as [number, number],
  },
  {
    key: "understand",
    tag: "Understand",
    copy: "Terrain, structure, obstacles — geometry acquires operational meaning.",
    range: [0.12, 0.78] as [number, number],
  },
  {
    key: "decide",
    tag: "Decide",
    copy: "One path chosen from many possible — perception becomes a plan.",
    range: [0.78, 1] as [number, number],
  },
];
