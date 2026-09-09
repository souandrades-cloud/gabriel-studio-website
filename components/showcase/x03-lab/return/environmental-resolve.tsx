"use client";

import Image from "next/image";

import { A008_SRC, clamp01, smoothstep } from "./constants";

export interface EnvironmentalResolveProps {
  /** 0-1 local progress: entry crossfade/pull-back, holds at 1. */
  t: number;
  /** WHERE/WHY caption window, expressed in the SAME local `t` space so
   *  callers can place it early (Hybrid, brief) or late (Environmental,
   *  held) without a second progress value to keep in sync. */
  captionWindow: [number, number];
  tag: string;
  line: string;
}

/**
 * The WHERE beat: A-008 (PL-1 past the constraint, full substation
 * context — transformer, live conductors, the built environment) pulling
 * back from a tighter frame into the whole photograph. Shared by
 * Hypothesis B (where it's the destination) and Hypothesis C (where it's
 * a waypoint) rather than forked, since the visual grammar is identical —
 * only how long each hypothesis lingers on it differs upstream.
 */
export function EnvironmentalResolve({ t, captionWindow, tag, line }: EnvironmentalResolveProps) {
  const reveal = smoothstep(t);
  const scale = 1.12 - reveal * 0.12;
  const [capStart, capEnd] = captionWindow;
  const capRise = smoothstep(clamp01((t - capStart) / 0.08));
  const capFall = 1 - smoothstep(clamp01((t - (capEnd - 0.08)) / 0.08));
  // Deliberately NOT multiplied by `reveal` — the scrim/caption are
  // siblings of the (fading-in) photo, not nested inside it, so they can
  // reach true full contrast at their own peak instead of compounding two
  // partial opacities into a washed-out, hard-to-read blend.
  const capOpacity = Math.min(capRise, capFall);

  return (
    <div className="x03-return-environmental" aria-hidden="true">
      <Image
        src={A008_SRC}
        alt="PL-1 past the constraint, full substation context"
        fill
        sizes="960px"
        className="x03-return-environmental-photo"
        style={{ opacity: reveal, objectPosition: "38% 55%", transform: `scale(${scale})` }}
      />
      <div className="x03-return-scrim" style={{ opacity: capOpacity }} />
      <div className="x03-return-caption" style={{ opacity: capOpacity }}>
        <span className="x03-return-caption-tag">{tag}</span>
        <span className="x03-return-caption-line">{line}</span>
      </div>
    </div>
  );
}
