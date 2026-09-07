"use client";

import Image from "next/image";

import { MechanicalShell } from "./mechanical-shell";
import { smoothstep, windowT } from "./constants";

/**
 * Hypothesis B — CONTROLLED RENDERED SEQUENCE. No WebGL, no live geometry
 * at all: three of the already-approved PL-1 stills (A-001 wide, A-003
 * mechanism detail, A-002 material macro) cross-fade under the SAME
 * progress scrubber the other two hypotheses use, testing whether
 * compositing existing imagery reads as articulation better than modeled
 * geometry does.
 *
 * ASSET_DEPENDENCY_DETECTED: no true sequential photography of PL-1's
 * wheel-leg crossing a step exists (A-001/A-002/A-003 are three unrelated
 * static poses, not action keyframes), so this hypothesis cannot show real
 * contact/compression/load-transfer -- only a directed pan across existing
 * stills. What a fair B would need: 3-5 frames of PL-1 actually crossing a
 * raised step, same angle, same lighting, shot or rendered as true
 * keyframes. Registered per the brief rather than produced here (no new
 * asset pipeline authorized this gate).
 */
const A001 = "/images/x03/x03-a001-pl1-master.png";
const A002 = "/images/x03/x03-a002-pl1-material-macro.png";
const A003 = "/images/x03/x03-a003-pl1-mechanism-detail.png";

const STOPS = [
  { src: A001, t: 0, alt: "PL-1 — wide, approach" },
  { src: A003, t: 0.34, alt: "PL-1 — mechanism detail, contact / load" },
  { src: A002, t: 0.67, alt: "PL-1 — material macro, articulation" },
  { src: A001, t: 1, alt: "PL-1 — wide, advance" },
];

function stopOpacity(progress: number, prevT: number | null, selfT: number, nextT: number | null): number {
  const rise = prevT === null ? 1 : smoothstep(windowT(progress, [prevT, selfT]));
  const fall = nextT === null ? 1 : 1 - smoothstep(windowT(progress, [selfT, nextT]));
  return Math.min(rise, fall);
}

function SequenceStage({ progress }: { progress: number }) {
  const scale = 1 + progress * 0.06;

  return (
    <div className="x03-mechanical-dom">
      <div className="x03-mechanical-zoom" style={{ transform: `scale(${scale})` }}>
        {STOPS.map((stop, i) => {
          const prevT = i > 0 ? STOPS[i - 1].t : null;
          const nextT = i < STOPS.length - 1 ? STOPS[i + 1].t : null;
          const opacity = stopOpacity(progress, prevT, stop.t, nextT);
          return (
            <Image
              key={`${stop.src}-${i}`}
              src={stop.src}
              alt={stop.alt}
              fill
              sizes="720px"
              className="x03-mechanical-layer"
              style={{ opacity }}
              priority={i === 0}
            />
          );
        })}
      </div>
      <div className="x03-mechanical-ground" aria-hidden="true">
        <span />
        <span />
      </div>
    </div>
  );
}

export function SequenceMechanicalExperience() {
  return (
    <MechanicalShell
      label="Hypothesis B — Controlled Rendered Sequence"
      approachTag="controlled-rendered-sequence"
      note="No live geometry: the three approved PL-1 stills cross-fade under the same progress scrubber as the other two hypotheses, testing whether directed compositing of existing imagery communicates articulation and weight transfer better than modeled geometry does."
      variant="dom"
      debugExtra="asset dependency  ASSET_DEPENDENCY_DETECTED (no true action keyframes of PL-1 crossing a step exist -- see file header)"
      renderDom={(progress) => <SequenceStage progress={progress} />}
    />
  );
}
