"use client";

import Image from "next/image";
import { useMemo } from "react";

import {
  ROUTE_ACCENT,
  clamp01,
  smoothstep,
  windowT,
  type TimingPreset,
  type TransitionGrammarKey,
} from "./constants";

const A001 = "/images/x03/x03-a001-pl1-master.png";

/**
 * The tight crop this whole animatic is built around: A-001's front-left
 * wheel-leg module (bottom-left quadrant of the master photo). Held STABLE
 * across CONTACT/LOAD/COMMIT per the Gate 05C brief's Camera Principle —
 * only the diagram overlay changes between those three beats, not the
 * photograph, which is the whole point of the CONTACT->LOAD adjacency test.
 */
const TIGHT_POSITION = "16% 80%";
const WIDE_POSITION = "42% 56%";

const REVEAL_WIDTH = 0.05;
const BAND_WIDTH = 0.035;

/** A layer that appears once at `start` and stays visible forever after
 *  (the photo revealing out of HANDOFF; the edge-line/marker once contact
 *  is made). No fall — grammar only shapes how the rise looks. */
function revealFrom(
  v: number,
  start: number,
  grammar: TransitionGrammarKey,
): { opacity: number; clipPercent: number } {
  if (grammar === "hard-cut") return { opacity: v >= start ? 1 : 0, clipPercent: 140 };
  if (grammar === "crossfade-drift")
    return { opacity: smoothstep(clamp01((v - start) / REVEAL_WIDTH)), clipPercent: 140 };
  const clipPercent = v >= start ? smoothstep(clamp01((v - start) / REVEAL_WIDTH)) * 140 : 0;
  return { opacity: v >= start ? 1 : 0, clipPercent };
}

/** A layer that only lives within [start,end) — the LOAD chevrons, the
 *  COMMIT arrow — rising in and falling back out at the band's own edges. */
function bandPresence(
  v: number,
  [start, end]: [number, number],
  grammar: TransitionGrammarKey,
): { opacity: number; clipPercent: number } {
  if (grammar === "hard-cut") return { opacity: v >= start && v < end ? 1 : 0, clipPercent: 140 };
  if (grammar === "crossfade-drift") {
    const rise = smoothstep(clamp01((v - start) / BAND_WIDTH));
    const fall = 1 - smoothstep(clamp01((v - (end - BAND_WIDTH)) / BAND_WIDTH));
    return { opacity: Math.min(rise, fall), clipPercent: 140 };
  }
  const inBand = v >= start && v < end;
  const clipPercent = inBand
    ? smoothstep(clamp01((v - start) / Math.min(end - start, REVEAL_WIDTH))) * 140
    : 0;
  return { opacity: inBand ? 1 : 0, clipPercent };
}

function clipStyle(clipPercent: number): string | undefined {
  return clipPercent >= 140 ? undefined : `circle(${clipPercent}% at 30% 68%)`;
}

export interface SequenceStageProps {
  progress: number;
  ranges: TimingPreset["ranges"];
  grammar: TransitionGrammarKey;
}

export function SequenceStage({ progress: v, ranges, grammar }: SequenceStageProps) {
  const photo = revealFrom(v, ranges.contact[0], grammar);
  const mechanics = revealFrom(v, ranges.contact[0], grammar);
  const loadBand = bandPresence(v, ranges.load, grammar);
  const commitBand = bandPresence(v, ranges.commit, grammar);
  const consequenceT = smoothstep(windowT(v, ranges.consequence));

  // HANDOFF frame: visible until the photo takes over. For hard-cut and
  // masked-reveal it simply sits underneath (masked-reveal's growing clip
  // on the photo layer above physically covers it — no separate fade
  // needed); crossfade-drift is the one grammar that needs an explicit
  // cross-dissolve since there's no mask doing the covering for it.
  const handoffOpacity =
    grammar === "crossfade-drift" ? 1 - photo.opacity : v >= ranges.contact[0] ? 0 : 1;

  // Camera: stable tight crop through CONTACT/LOAD/COMMIT (small drift
  // only), then eases wide to resolve CONSEQUENCE. Independent of grammar —
  // this is pure timing/framing, not cut technique.
  const { scale, objectPosition, grade } = useMemo(() => {
    const driftT = clamp01(windowT(v, [ranges.contact[0], ranges.commit[1]]));
    const tightScale = 1.55 + driftT * 0.08;
    const scale = tightScale + (1 - tightScale) * consequenceT;
    const objectPosition = consequenceT > 0.02 ? WIDE_POSITION : TIGHT_POSITION;
    return { scale, objectPosition, grade: consequenceT };
  }, [v, ranges, consequenceT]);

  // The persistent edge-line/contact-marker dissolve away as the camera
  // widens into CONSEQUENCE, handing off to the wider route-line cue below.
  const mechanicsOpacity = mechanics.opacity * (1 - consequenceT);

  return (
    <div className="x03-field-action-dom">
      {/* HANDOFF — machine-space frame: THE CHOICE's resolved decision,
          held as a dark frame with only the accent route line and its
          decision node visible. Deliberately NOT a rebuild of THE CHOICE's
          three.js scene (out of scope) — a graphic stand-in for its final
          frame, positioned so its route line and node line up with the
          edge/contact marker below for a literal graphic match on cut. */}
      <div
        className="x03-field-action-handoff"
        style={{ opacity: handoffOpacity }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="x03-field-action-svg">
          <line
            x1="2"
            y1="92"
            x2="30"
            y2="66"
            stroke={ROUTE_ACCENT}
            strokeWidth="0.6"
            strokeDasharray="2 2"
            opacity="0.85"
          />
          <circle cx="30" cy="66" r="1.6" fill={ROUTE_ACCENT} opacity="0.95" />
        </svg>
      </div>

      {/* CONTACT / LOAD / COMMIT — one stable photographic crop, camera
          held per the brief's Camera Principle. Mechanical state is carried
          entirely by the diagram overlay, not by re-cropping the photo,
          which is the same-PL-1-one-moment-later constraint the brief asks
          this gate to make easy to judge. */}
      <div
        className="x03-field-action-photo-wrap"
        style={{ opacity: photo.opacity, clipPath: clipStyle(photo.clipPercent) }}
      >
        <Image
          src={A001}
          alt="PL-1 — front wheel-leg module, contact crop"
          fill
          sizes="960px"
          priority
          className="x03-field-action-photo"
          style={{
            objectPosition,
            transform: `scale(${scale})`,
            filter: `saturate(${1 - grade * 0.18}) contrast(${1 + grade * 0.06}) sepia(${grade * 0.05})`,
          }}
        />
      </div>

      {/* Diagram overlay — the one abstraction this gate leans on instead
          of faking mechanical states in the photo itself (brief: "do not
          force A-001 to fake mechanical states it does not actually
          contain if doing so destroys readability"). Edge line, contact
          marker, load and advance cues are schematic, not photographic. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="x03-field-action-svg x03-field-action-diagram"
        aria-hidden="true"
      >
        <line
          x1="2"
          y1="80"
          x2="60"
          y2="62"
          stroke={ROUTE_ACCENT}
          strokeWidth="0.5"
          strokeDasharray="2.4 2"
          style={{ opacity: mechanicsOpacity * 0.8, clipPath: clipStyle(mechanics.clipPercent) }}
        />
        <circle
          cx="30"
          cy="66"
          r={1.2 + loadBand.opacity * 0.9}
          fill={ROUTE_ACCENT}
          style={{ opacity: mechanicsOpacity, clipPath: clipStyle(mechanics.clipPercent) }}
        />
        {/* LOAD — inward chevrons reading as compression at the contact point. */}
        <g style={{ opacity: loadBand.opacity, clipPath: clipStyle(loadBand.clipPercent) }}>
          <path d="M 26 58 L 30 62 L 34 58" fill="none" stroke={ROUTE_ACCENT} strokeWidth="0.5" />
          <path d="M 26 74 L 30 70 L 34 74" fill="none" stroke={ROUTE_ACCENT} strokeWidth="0.5" />
        </g>
        {/* COMMIT — forward advance arrow past the contact point. */}
        <g style={{ opacity: commitBand.opacity, clipPath: clipStyle(commitBand.clipPercent) }}>
          <line x1="30" y1="66" x2="52" y2="60" stroke={ROUTE_ACCENT} strokeWidth="0.6" />
          <path d="M 47 57 L 52 60 L 48 63" fill="none" stroke={ROUTE_ACCENT} strokeWidth="0.6" />
        </g>
        {/* CONSEQUENCE — the chosen route reappearing beneath PL-1, closing
            the loop back to THE CHOICE. */}
        <path
          d="M 30 66 C 45 80, 65 88, 90 92"
          fill="none"
          stroke={ROUTE_ACCENT}
          strokeWidth="0.5"
          strokeDasharray="2 2.4"
          style={{ opacity: consequenceT * 0.4 }}
        />
      </svg>

      {/* CONSEQUENCE environment — placeholder substation context (concrete
          line, cable-channel lines, a distant steel-structure silhouette),
          not a modeled scene. Fades in only once the camera has widened. */}
      <div
        className="x03-field-action-environment"
        style={{ opacity: consequenceT * 0.9 }}
        aria-hidden="true"
      >
        <span className="x03-field-action-env-structure" />
        <span className="x03-field-action-env-channel" />
        <span className="x03-field-action-env-ground" />
      </div>
    </div>
  );
}
