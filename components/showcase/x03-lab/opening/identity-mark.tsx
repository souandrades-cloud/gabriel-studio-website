"use client";

import { DESIGNATION, KICKER_LINES, SUBTITLE, TAGLINE, WORDMARK, smoothstep } from "./constants";

/**
 * Quiet corner mark — mount-triggered (CSS-only fade, not progress-linked),
 * identical for all three hypotheses, matching production Hero's own kicker
 * (which is also mount-triggered rather than scroll-linked). Rendered once
 * per hypothesis so it's always present, removing it as a variable in the
 * comparison entirely.
 */
export function IdentityKicker() {
  return (
    <div className="x03-opening-kicker" aria-hidden="true">
      {KICKER_LINES.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

export interface IdentityMarkProps {
  /** 0-1 local arrival progress — WHEN the mark appears, controlled per
   *  hypothesis. WHAT it says never changes (shared copy budget). */
  t: number;
  /** Multiplies final opacity — hypotheses fade this back out as the
   *  shared MaterialEntry beat takes over. */
  fade?: number;
}

export function IdentityMark({ t, fade = 1 }: IdentityMarkProps) {
  const reveal = smoothstep(t) * fade;
  return (
    <div
      className="x03-opening-identity"
      style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 14}px)` }}
    >
      <div className="x03-opening-identity-row">
        <p className="x03-opening-wordmark">{WORDMARK}</p>
        <div className="x03-opening-designation">
          <span className="x03-opening-badge">{DESIGNATION}</span>
          <span>{SUBTITLE}</span>
        </div>
      </div>
      <p className="x03-opening-tagline">{TAGLINE}</p>
    </div>
  );
}
