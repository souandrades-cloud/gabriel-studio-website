/**
 * X03 LAB — PROPRIO. Gate 05B — Mechanical Action Representation Discovery.
 * Shared math reused directly from Gate 05A's field/utils.ts (clamp01 /
 * smoothstep / windowT) rather than reimplemented. The one addition this
 * gate needs is a debug-only phase lookup for Hypothesis A's `.x03-debug`
 * readout -- NOT an on-screen info card. The brief puts information
 * architecture out of scope for this gate ("Não adicionar specifications.
 * Não criar cards."), so phase names only ever reach the dev-only
 * instrumentation block, never a visible overlay.
 */
import { clamp01, smoothstep, windowT } from "../field/utils";

export { clamp01, smoothstep, windowT };

export interface MechanicalPhase {
  key: string;
  label: string;
  range: [number, number];
}

export const MECHANICAL_PHASES: MechanicalPhase[] = [
  { key: "approach", label: "approach", range: [0, 0.2] },
  { key: "contact", label: "contact", range: [0.2, 0.35] },
  { key: "response", label: "mechanism response", range: [0.35, 0.55] },
  { key: "transfer", label: "weight transfer / advance", range: [0.55, 0.8] },
  { key: "crossed", label: "constraint crossed", range: [0.8, 1] },
];

export function phaseAt(v: number): MechanicalPhase {
  return MECHANICAL_PHASES.find((phase) => v >= phase.range[0] && v < phase.range[1]) ?? MECHANICAL_PHASES[MECHANICAL_PHASES.length - 1];
}
