/**
 * X03 LAB — PROPRIO / 03, Technical Prototype 001 — Perception Rig.
 * Single source of truth for the scroll timeline: one linear progress
 * value (0–1) drives every stage below. No stage is a separate scene —
 * they are all readings of the same `t`.
 */

/** Scroll-track stage boundaries (0–1). Order: HUMAN hold → TRANSFORM →
 *  MACHINE hold (depth + classification are simultaneous, not sequential —
 *  both are properties of the same perception material) → ROUTE reveal →
 *  hold → RETURN → HUMAN hold. */
export const STAGES = {
  humanHoldEnd: 0.12,
  transitionEnd: 0.34,
  machineHoldEnd: 0.5,
  routeRevealEnd: 0.74,
  routeHoldEnd: 0.82,
  returnEnd: 0.96,
} as const;

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(t: number) {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/**
 * 0 = pure human view, 1 = pure machine view. Rises across TRANSITION,
 * holds through MACHINE + ROUTE, falls back across RETURN. This single
 * scalar is fed to every mesh's perception material uniform — it is the
 * mechanism, not a label for a mode switch.
 */
export function perceptionProgress(t: number): number {
  const c = clamp01(t);
  if (c < STAGES.humanHoldEnd) return 0;
  if (c < STAGES.transitionEnd) {
    return smoothstep((c - STAGES.humanHoldEnd) / (STAGES.transitionEnd - STAGES.humanHoldEnd));
  }
  if (c < STAGES.returnEnd) return 1;
  return 1 - smoothstep((c - STAGES.returnEnd) / (1 - STAGES.returnEnd));
}

/** 0→1 reveal of the route samples. Only meaningful while machine
 *  perception is active — combined with `perceptionProgress` by the
 *  caller so the route fades out with the return transition for free. */
export function routeReveal(t: number): number {
  const c = clamp01(t);
  if (c < STAGES.machineHoldEnd) return 0;
  if (c < STAGES.routeRevealEnd) {
    return smoothstep((c - STAGES.machineHoldEnd) / (STAGES.routeRevealEnd - STAGES.machineHoldEnd));
  }
  return 1;
}

/** Reduced-motion: discrete stops instead of continuous interpolation.
 *  Same `t` domain, same formulas above — reduced motion only changes
 *  which `t` values are reachable (hard cuts between them), never the
 *  meaning of `t` itself. */
export const REDUCED_STOPS = [0, 0.23, 0.6, 0.78, 1.0] as const;

/** Quiet on-screen label for the current stage — used by both the caption
 *  overlay and the debug HUD, so the two never disagree. */
export function stageLabel(t: number): string {
  const c = clamp01(t);
  if (c < STAGES.humanHoldEnd) return "Human view";
  if (c < STAGES.transitionEnd) return "Transforming";
  if (c < STAGES.machineHoldEnd) return "Machine perception";
  if (c < STAGES.routeHoldEnd) return "Route";
  if (c < STAGES.returnEnd) return "Returning";
  return "Human view";
}

export { clamp01 };
