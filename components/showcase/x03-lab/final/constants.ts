/**
 * X03 LAB — PROPRIO. Gate 08A — Final Signature Re-Discovery.
 * Shared numbers so Hypothesis A/B/C get an identical closing entry point,
 * source photography, duration, and final purpose — the brief requires
 * comparing HOW X03 SHOULD END, not craft on any one beat, so every
 * hypothesis opens on the exact same held WORLD frame (see `world-entry.tsx`
 * and `WORLD_WINDOW` below — A-008, FieldAction's own resolved closing crop,
 * reused verbatim, same discipline hybrid-return.tsx already established for
 * this exact boundary) and closes on the exact same resolution mark (see
 * `resolution-mark.tsx`). What differs between hypotheses is only the
 * MEANING -> FINAL REVEAL architecture in between.
 *
 * clamp01/smoothstep/windowT reused as-is from Gate 05A's field/utils.ts,
 * ROUTE_ACCENT reused as-is from Gate 05C's field-action/constants.ts — same
 * discipline as every later gate, not redefined here.
 */
import { ROUTE_ACCENT } from "../field-action/constants";
import { clamp01, smoothstep, windowT } from "../field/utils";

export { clamp01, smoothstep, windowT, ROUTE_ACCENT };

/** FieldAction's own resolved closing frame — the approved WORLD photograph
 *  every hypothesis returns to first, no new asset. */
export const A008_SRC = "/images/x03/x03-a008-field-commit.png";
/** PRODUCT VISUAL LOCK V1 — the one asset every hypothesis's FINAL REVEAL
 *  must resolve to. Exactly one presentation of this per hypothesis. */
export const A001_SRC = "/images/x03/x03-a001-pl1-master.png";

/** Deliberately long, unhurried — same discipline as Gate 07A's opening
 *  discovery: this brief explicitly asks the ending to breathe, not to
 *  optimize for a fast loop. */
export const CYCLE_MS = 9500;

export const WORLD_OBJECT_POSITION = "60% 42%";

export const WHERE_TAG = "Where";
export const WHERE_COPY = "Live infrastructure — where access and adaptation matter as much as perception.";

/** Shared resolution mark copy — identical across all three hypotheses so
 *  copy cannot determine the winner (same discipline as Gate 07A's shared
 *  IdentityMark copy). */
export const RESOLUTION_TAG = "Proprio — PL-1";
export const RESOLUTION_COPY = "Perception, decided into motion.";

/** Shared closing entry point (local 0-1 progress) — identical across all
 *  three hypotheses per the brief's fair-comparison requirement. FieldAction's
 *  own held frame, breathing, WHERE caption. */
export const WORLD_WINDOW: [number, number] = [0, 0.32];
