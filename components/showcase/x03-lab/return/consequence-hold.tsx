"use client";

import Image from "next/image";

import { A001_SRC, HANDOFF_CROP_POSITION, ROUTE_ACCENT } from "./constants";

/**
 * The frame this gate picks up from: Gate 05C's own CONSEQUENCE beat,
 * held quietly — same crop, same route-line color, same amber-graded
 * environment silhouette. Deliberately NOT a re-animation of CONTACT/LOAD/
 * COMMIT (that would repeat information Gate 05C already demonstrated,
 * a named failure condition); this is a still anchor, not a performance.
 * `exit` (0-1) is the ONE thing every hypothesis drives differently —
 * how it dissolves away into its own return architecture.
 */
export function ConsequenceHold({ exit }: { exit: number }) {
  return (
    <div
      className="x03-return-hold"
      style={{ opacity: 1 - exit, transform: `scale(${1 + exit * 0.06})` }}
      aria-hidden="true"
    >
      <Image
        src={A001_SRC}
        alt=""
        fill
        sizes="960px"
        className="x03-return-hold-photo"
        style={{ objectPosition: HANDOFF_CROP_POSITION, transform: "scale(1.6)" }}
      />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="x03-return-hold-svg">
        <path
          d="M 30 66 C 45 80, 65 88, 90 92"
          fill="none"
          stroke={ROUTE_ACCENT}
          strokeWidth="0.5"
          strokeDasharray="2 2.4"
          opacity="0.4"
        />
      </svg>
      <span className="x03-return-hold-structure" />
      <span className="x03-return-hold-ground" />
    </div>
  );
}
