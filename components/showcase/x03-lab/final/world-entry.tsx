"use client";

import Image from "next/image";

import { A008_SRC, ROUTE_ACCENT, WHERE_COPY, WHERE_TAG, WORLD_OBJECT_POSITION, smoothstep, windowT } from "./constants";

export interface WorldEntryProps {
  /** 0-1 local progress across the shared WORLD_WINDOW. */
  t: number;
}

const CAPTION_RANGE: [number, number] = [0.22, 0.55];
const BREATHE_AMOUNT = 0.02;

/**
 * The ONE beat every hypothesis opens on identically — the discovery
 * brief's "same closing entry point" fairness requirement. Reproduces
 * FieldAction's own resolved exit frame (same crop, same accent line, same
 * near-black ground) exactly as hybrid-return.tsx already does for this
 * boundary, so the handoff this gate's own three hypotheses inherit from
 * carries no spectacle of its own — only a slow breathing scale ("the world
 * exhaling outward after the action," same rationale as production) and the
 * WHERE caption. What differs between hypotheses starts after this.
 */
export function WorldEntry({ t }: WorldEntryProps) {
  const breathe = 1 + smoothstep(t) * BREATHE_AMOUNT;
  const captionT = smoothstep(windowT(t, CAPTION_RANGE));

  return (
    <div className="x03-final-world" aria-hidden="true">
      <div className="x03-final-world-photo-wrap" style={{ transform: `scale(${breathe})` }}>
        <Image src={A008_SRC} alt="" fill sizes="100vw" className="x03-final-photo" style={{ objectPosition: WORLD_OBJECT_POSITION }} />
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="x03-final-world-route">
        <path
          d="M 74 60 C 54 78, 29 84, 6 90"
          fill="none"
          stroke={ROUTE_ACCENT}
          strokeWidth="0.35"
          strokeDasharray="1.4 1.8"
          opacity="0.5"
        />
      </svg>
      <div className="x03-final-scrim" />
      <div className="x03-final-caption" style={{ opacity: captionT }}>
        <p className="x03-final-caption-tag">{WHERE_TAG}</p>
        <p className="x03-final-caption-copy">{WHERE_COPY}</p>
      </div>
    </div>
  );
}
