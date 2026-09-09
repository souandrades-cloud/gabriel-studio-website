/**
 * X03 LAB — PROPRIO. Gate 05C — Field Action Sequence Design.
 * Shared math reused from Gate 05A/05B (clamp01/smoothstep/windowT) rather
 * than redefined. This gate's own additions: the five-beat grammar
 * (HANDOFF, the frozen hand-off out of THE CHOICE, plus the four frozen
 * mechanical states CONTACT/LOAD/COMMIT/CONSEQUENCE from the Gate 05C
 * brief), three timing presets so rhythm can be A/B'd without touching
 * code, and three transition-grammar techniques so the cut itself can be
 * A/B'd independently of timing.
 */
import { clamp01, smoothstep, windowT } from "../field/utils";

export { clamp01, smoothstep, windowT };

export type FieldActionPhaseKey = "handoff" | "contact" | "load" | "commit" | "consequence";

export interface FieldActionPhase {
  key: FieldActionPhaseKey;
  label: string;
  copy: string;
}

/** Order matters — index into this array doubles as beat sequence order. */
export const FIELD_ACTION_PHASES: FieldActionPhase[] = [
  { key: "handoff", label: "Handoff", copy: "The route was already chosen." },
  { key: "contact", label: "Contact", copy: "Wheel-leg reaches the edge." },
  { key: "load", label: "Load", copy: "Articulation responds. Weight shifts." },
  { key: "commit", label: "Commit", copy: "Weight transfers. Chassis advances." },
  { key: "consequence", label: "Consequence", copy: "Constraint crossed." },
];

export interface TimingPreset {
  key: string;
  label: string;
  note: string;
  ranges: Record<FieldActionPhaseKey, [number, number]>;
}

export const TIMING_PRESETS: TimingPreset[] = [
  {
    key: "recommended",
    label: "A — Recommended",
    note: "Brief recognition on contact, longest hold on mechanical tension, quick release into a held resolve.",
    ranges: {
      handoff: [0, 0.1],
      contact: [0.1, 0.3],
      load: [0.3, 0.55],
      commit: [0.55, 0.78],
      consequence: [0.78, 1],
    },
  },
  {
    key: "extended-recognition",
    label: "B — Extended Recognition",
    note: "CONTACT holds much longer than the other beats — tests whether more recognition time helps or stalls the read.",
    ranges: {
      handoff: [0, 0.08],
      contact: [0.08, 0.38],
      load: [0.38, 0.58],
      commit: [0.58, 0.8],
      consequence: [0.8, 1],
    },
  },
  {
    key: "tight",
    label: "C — Tight / Fast",
    note: "Compressed middle beats, long CONSEQUENCE hold — deliberately probes the slideshow-cutting failure mode.",
    ranges: {
      handoff: [0, 0.06],
      contact: [0.06, 0.2],
      load: [0.2, 0.36],
      commit: [0.36, 0.52],
      consequence: [0.52, 1],
    },
  },
];

export type TransitionGrammarKey = "hard-cut" | "crossfade-drift" | "masked-reveal";

export interface TransitionGrammar {
  key: TransitionGrammarKey;
  label: string;
  note: string;
}

export const TRANSITION_GRAMMARS: TransitionGrammar[] = [
  {
    key: "hard-cut",
    label: "1 — Hard Cut / Graphic Match",
    note: "Snap cut at each beat boundary. Continuity is carried entirely by the persistent edge-line / route-line graphic match, never by a fade.",
  },
  {
    key: "crossfade-drift",
    label: "2 — Crossfade + Drift",
    note: "Short crossfade plus a small continuous scale/position drift concentrated on the contact point.",
  },
  {
    key: "masked-reveal",
    label: "3 — Masked Reveal",
    note: "Each beat wipes in from the contact point outward instead of fading, keeping the eye anchored on the mechanism.",
  },
];

/** Route/decision accent — the exact chosen-route color the production
 *  Perception Rig already uses (perception/possibility-space-scene.tsx
 *  CHOSEN_ROUTE, #d9c9a6), reused verbatim as the one visual thread that
 *  survives THE CHOICE into the physical handoff. Not a new color. */
export const ROUTE_ACCENT = "#d9c9a6";

export function findPhase(key: FieldActionPhaseKey): FieldActionPhase {
  return FIELD_ACTION_PHASES.find((phase) => phase.key === key) ?? FIELD_ACTION_PHASES[0];
}

/** Which phase is active at progress `v` under a given timing preset, plus
 *  how far through that phase's own [0,1] window `v` sits. */
export function activePhaseAt(
  v: number,
  ranges: TimingPreset["ranges"],
): { key: FieldActionPhaseKey; localT: number } {
  for (let i = FIELD_ACTION_PHASES.length - 1; i >= 0; i--) {
    const key = FIELD_ACTION_PHASES[i].key;
    const [start] = ranges[key];
    if (v >= start || i === 0) {
      return { key, localT: smoothstep(windowT(v, ranges[key])) };
    }
  }
  return { key: "handoff", localT: 0 };
}
