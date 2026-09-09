"use client";

import Image from "next/image";

import { ResolutionMark } from "./resolution-mark";
import { WorldEntry } from "./world-entry";
import { FinalShell } from "./final-shell";
import { A001_SRC, ROUTE_ACCENT, WORLD_WINDOW, smoothstep, windowT } from "./constants";

/**
 * Hypothesis C — TRANSFORMED RETURN. Tests MEANINGFUL TRANSFORMATION +
 * RETURN TO REALITY: the one visual thread that has survived every gate
 * since THE CHOICE (the route-accent line/decision node, #d9c9a6) lifts off
 * the held WORLD frame and travels inward, converging on the point PL-1
 * will occupy — a restrained trace of the journey, not a HUD or a replay of
 * Machine Perception, drawn with the exact same stroke/accent already
 * established rather than a new graphic language. As the line completes its
 * convergence, PL-1 crossfades in exactly at that point — the journey
 * literally collapsing back into the physical product, rather than sitting
 * beside it. Once the line is fully gone the product does not move again.
 */
const TRACE_RANGE: [number, number] = [WORLD_WINDOW[1], 0.56];
const CONVERGE_RANGE: [number, number] = [0.56, 0.72];
const RESOLUTION_RANGE: [number, number] = [0.8, 0.88];

function TransformedStage({ progress: v }: { progress: number }) {
  const worldT = windowT(v, WORLD_WINDOW);
  const worldOpacity = 1 - smoothstep(windowT(v, TRACE_RANGE)) * 0.55 - smoothstep(windowT(v, CONVERGE_RANGE)) * 0.45;
  const groundWarm = smoothstep(windowT(v, CONVERGE_RANGE));

  // Line-drawing effect: the trace grows from the WORLD frame's own node
  // (74,60 — the same coordinate WorldEntry's route line ends on) inward to
  // center, via an animated stroke-dasharray "reveal length."
  const traceT = smoothstep(windowT(v, TRACE_RANGE));
  const traceLength = traceT * 76; // path's approximate total length in viewBox units
  const convergeT = smoothstep(windowT(v, CONVERGE_RANGE));
  const traceExit = 1 - convergeT;
  const traceOpacity = traceT > 0 ? traceExit : 0;

  const productOpacity = convergeT;
  const productScale = 1.03 - convergeT * 0.03;

  const resolutionOpacity = smoothstep(windowT(v, RESOLUTION_RANGE));

  return (
    <div className="x03-final-dom">
      <div className="x03-final-ground x03-final-ground-warm" style={{ opacity: groundWarm }} />
      <div style={{ opacity: worldOpacity }}>
        <WorldEntry t={worldT} />
      </div>

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="x03-final-transform-trace" aria-hidden="true">
        <path
          d="M 74 60 C 60 48, 55 42, 50 38 C 46 34, 48 30, 50 26"
          fill="none"
          stroke={ROUTE_ACCENT}
          strokeWidth="0.4"
          strokeLinecap="round"
          strokeDasharray={`${traceLength} 100`}
          style={{ opacity: traceOpacity }}
        />
        <circle cx="50" cy="26" r={0.8 + convergeT * 0.6} fill={ROUTE_ACCENT} style={{ opacity: traceT * traceExit }} />
      </svg>

      <div className="x03-final-monument-frame" style={{ opacity: productOpacity }}>
        <div className="x03-final-monument-photo-wrap" style={{ transform: `scale(${productScale})` }}>
          <Image
            src={A001_SRC}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="x03-final-photo"
            style={{ objectPosition: "center 38%" }}
          />
        </div>
        <div className="x03-final-scrim x03-final-scrim-light" />
      </div>

      <ResolutionMark opacity={resolutionOpacity} />
    </div>
  );
}

export function TransformedFinalExperience() {
  return (
    <FinalShell
      label="Hypothesis C — Transformed Return"
      hypothesisTag="transformed-return"
      note="The one accent thread that has survived every gate since THE CHOICE — the route line and its decision node — lifts off the held WORLD frame and travels inward, converging exactly where PL-1 will appear. No HUD, no replay of Machine Perception: the same established stroke, resolving into the physical product rather than sitting beside it. Once the line is gone, PL-1 does not move again."
      renderDom={(progress) => <TransformedStage progress={progress} />}
    />
  );
}
