/**
 * X03 LAB — PROPRIO / 03, Technical Prototype 001 — Perception Rig.
 * PERCEPTUAL ITERATION 001: the director's blind test read V1 as "a
 * material recolor while something approaches", not "the same world
 * decomposed into operational information". Root cause was two-fold —
 * one continuous human→machine blend gave no causal read, and camera
 * drift competed with the transformation for attention.
 *
 * Fix: three separately-timed layers instead of one blend, each rising
 * (and falling, during RETURN, in the OPPOSITE order) in its own window
 * of the same scroll track — SEE → MEASURE → CLASSIFY → PLAN (ROUTE).
 * Camera is locked entirely (see camera-rig.tsx) so only the world's
 * representation changes, never the viewer's position.
 */

/** Scroll-track stage boundaries (0–1). Forward: HUMAN hold → MEASURE
 *  rises → CLASSIFY rises → ROUTE rises → full-machine HOLD → RETURN
 *  (route falls, then classify, then measure — mirrored order) → HUMAN
 *  hold. */
export const STAGES = {
  humanEnd: 0.12,
  measureRiseEnd: 0.3,
  classifyRiseEnd: 0.46,
  routeRiseEnd: 0.62,
  fullHoldEnd: 0.74,
  routeFallEnd: 0.8,
  classifyFallEnd: 0.88,
  measureFallEnd: 0.98,
} as const;

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(t: number) {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** Rises 0→1 over a window, holds at 1, falls 1→0 over another window —
 *  the shape shared by all three perceptual layers below. */
function riseHoldFall(t: number, riseStart: number, riseEnd: number, fallStart: number, fallEnd: number) {
  if (t < riseStart) return 0;
  if (t < riseEnd) return smoothstep((t - riseStart) / (riseEnd - riseStart));
  if (t < fallStart) return 1;
  if (t < fallEnd) return 1 - smoothstep((t - fallStart) / (fallEnd - fallStart));
  return 0;
}

/** STAGE 02+03 — "surface information falls away, spatial structure
 *  becomes legible". Appearance strips first; depth-contour/edge
 *  structure is what it strips INTO (see perception-material.ts) — one
 *  scalar drives both because they are the same visual event. Falls
 *  LAST during return (appearance is the last thing to come back). */
export function measureReveal(t: number): number {
  return riseHoldFall(t, STAGES.humanEnd, STAGES.measureRiseEnd, STAGES.classifyFallEnd, STAGES.measureFallEnd);
}

/** STAGE 04 — semantic function emerges on top of the now-legible
 *  structure. Falls SECOND during return (after route, before measure). */
export function classifyReveal(t: number): number {
  return riseHoldFall(t, STAGES.measureRiseEnd, STAGES.classifyRiseEnd, STAGES.routeFallEnd, STAGES.classifyFallEnd);
}

/** STAGE 05 — overall route opacity: only exists once the space already
 *  reads as measured + classified. Falls FIRST during return — "the
 *  plan is the first thing to go" reinforces the plan-was-a-consequence
 *  reading. */
export function routeOpacity(t: number): number {
  return riseHoldFall(t, STAGES.classifyRiseEnd, STAGES.routeRiseEnd, STAGES.fullHoldEnd, STAGES.routeFallEnd);
}

/** Monotonic 0→1 draw-progress for the route samples — rises once, never
 *  falls (disappearance is handled by `routeOpacity` fading the whole
 *  route uniformly, not by un-drawing it in reverse). */
export function routeSweep(t: number): number {
  const c = clamp01(t);
  if (c < STAGES.classifyRiseEnd) return 0;
  if (c < STAGES.routeRiseEnd) {
    return smoothstep((c - STAGES.classifyRiseEnd) / (STAGES.routeRiseEnd - STAGES.classifyRiseEnd));
  }
  return 1;
}

/** Reduced-motion: discrete stops instead of continuous interpolation,
 *  one per named stage, each landing inside that stage's stable hold —
 *  Human / Measure-settled / Classify-settled / Route-hold / Human. */
export const REDUCED_STOPS = [0, 0.3, 0.46, 0.68, 1.0] as const;

/** Dev-HUD only (gated by `?debug`) — never shown to a visitor, so it's
 *  free to name the mechanism in a way the visible caption must not
 *  (director: don't solve machine-perception legibility with copy). */
export function stageLabel(t: number): string {
  const c = clamp01(t);
  if (c < STAGES.humanEnd) return "Human";
  if (c < STAGES.measureRiseEnd) return "Measure — rising";
  if (c < STAGES.classifyRiseEnd) return "Classify — rising";
  if (c < STAGES.routeRiseEnd) return "Route — rising";
  if (c < STAGES.fullHoldEnd) return "Full machine hold";
  if (c < STAGES.routeFallEnd) return "Return — route falling";
  if (c < STAGES.classifyFallEnd) return "Return — classify falling";
  if (c < STAGES.measureFallEnd) return "Return — measure falling";
  return "Human";
}

export { clamp01 };
