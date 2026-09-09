"use client";

import Image from "next/image";

import { ResolutionMark } from "./resolution-mark";
import { WorldEntry } from "./world-entry";
import { FinalShell } from "./final-shell";
import { A001_SRC, ROUTE_ACCENT, smoothstep, windowT } from "./constants";

/**
 * Hypothesis B — REVEAL THROUGH ABSENCE. Tests ANTICIPATION + CONTRAST +
 * RELEASE: WORLD is deliberately shorter than the other two hypotheses'
 * shared window (it only needs to establish WHERE before being withheld),
 * then the frame empties into near-total darkness — even the one surviving
 * accent trace (the route line WORLD opened on) fades to nothing before the
 * reveal, so the withhold beat ends on pure negative space, not a lingering
 * image. PL-1 then arrives once, fast and decisive (a much narrower reveal
 * window than the other two hypotheses use), with a single soft bloom of
 * light riding the reveal rather than a slow crossfade. STILLNESS afterward
 * is held deliberately longer before the resolution mark appears — the
 * silence itself is the point, not a pause on the way to the caption.
 */
const WORLD_WINDOW_B: [number, number] = [0, 0.28];
const WITHHOLD_RANGE: [number, number] = [WORLD_WINDOW_B[1], 0.6];
const TRACE_FADE_RANGE: [number, number] = [WORLD_WINDOW_B[1], 0.46];
const REVEAL_RANGE: [number, number] = [0.6, 0.66];
const BLOOM_RANGE: [number, number] = [0.6, 0.7];
const RESOLUTION_RANGE: [number, number] = [0.84, 0.92];

function AbsenceStage({ progress: v }: { progress: number }) {
  const worldT = windowT(v, WORLD_WINDOW_B);
  const worldOpacity = 1 - smoothstep(windowT(v, WITHHOLD_RANGE));
  const darkGround = smoothstep(windowT(v, WITHHOLD_RANGE));
  const traceOpacity = 1 - smoothstep(windowT(v, TRACE_FADE_RANGE));

  const revealT = smoothstep(windowT(v, REVEAL_RANGE));
  const productOpacity = revealT;

  const bloomT = windowT(v, BLOOM_RANGE);
  const bloomOpacity = bloomT < 0.4 ? smoothstep(bloomT / 0.4) : 1 - smoothstep((bloomT - 0.4) / 0.6);

  const resolutionOpacity = smoothstep(windowT(v, RESOLUTION_RANGE));

  return (
    <div className="x03-final-dom">
      <div className="x03-final-ground" style={{ opacity: darkGround }} />
      <div style={{ opacity: worldOpacity }}>
        <WorldEntry t={worldT} />
      </div>

      {/* The one accent trace that outlives the WORLD photograph itself,
          before it too fades — the machine's presence receding to nothing
          ahead of the reveal, not cutting away from it. */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="x03-final-world-route" style={{ opacity: traceOpacity }} aria-hidden="true">
        <circle cx="74" cy="60" r="1" fill={ROUTE_ACCENT} opacity="0.85" />
      </svg>

      <div className="x03-final-absence-bloom" style={{ opacity: bloomOpacity }} aria-hidden="true" />

      <div className="x03-final-monument-frame" style={{ opacity: productOpacity }}>
        <Image
          src={A001_SRC}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="x03-final-photo x03-final-photo-contain"
        />
      </div>

      <ResolutionMark opacity={resolutionOpacity} />
    </div>
  );
}

export function AbsenceFinalExperience() {
  return (
    <FinalShell
      label="Hypothesis B — Reveal Through Absence"
      hypothesisTag="reveal-through-absence"
      note="WORLD is withheld first: the frame empties to near-total darkness, and even the last surviving accent trace fades before PL-1 appears — pure negative space at the point of deepest tension. The reveal itself is fast and decisive, not a slow crossfade, riding a single soft bloom of light. Stillness afterward is held deliberately long before the resolution mark appears: the silence itself is the point."
      renderDom={(progress) => <AbsenceStage progress={progress} />}
    />
  );
}
