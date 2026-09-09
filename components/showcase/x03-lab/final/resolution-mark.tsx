"use client";

import { RESOLUTION_COPY, RESOLUTION_TAG } from "./constants";

export interface ResolutionMarkProps {
  /** 0-1 opacity — driven by each hypothesis's own SILENCE window. */
  opacity: number;
}

/**
 * The ONE mark every hypothesis closes on identically — same rationale as
 * `world-entry.tsx` for the opening beat. Mirrors production hybrid-
 * return.tsx's own resolution treatment (a single restrained identity line,
 * never a CTA) verbatim.
 */
export function ResolutionMark({ opacity }: ResolutionMarkProps) {
  return (
    <div className="x03-final-resolution" style={{ opacity }}>
      <span className="x03-final-resolution-badge">{RESOLUTION_TAG}</span>
      <span className="x03-final-resolution-copy">{RESOLUTION_COPY}</span>
    </div>
  );
}
