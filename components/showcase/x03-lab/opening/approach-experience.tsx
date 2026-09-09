"use client";

import Image from "next/image";

import { IdentityKicker, IdentityMark } from "./identity-mark";
import { MaterialEntry } from "./material-entry";
import { OpeningShell } from "./opening-shell";
import { A001_SRC, MATERIAL_WINDOW, REST_OBJECT_POSITION, smoothstep, windowT } from "./constants";

/**
 * Hypothesis B — ONE CONTINUOUS APPROACH. Primary perceptual change:
 * DISTANCE -> INTIMACY, carried by a single monotonic value (a mat/frame
 * growing from a small rect to full-bleed) that never reverses and never
 * cuts. The photograph itself never re-crops or re-frames underneath — only
 * the aperture around it grows — so this reads as attention continuously
 * moving deeper into the same object rather than a slide or a second shot
 * of the same product (the failure mode the brief names explicitly).
 * The frame finishes exactly on Hero's resolved composition, full-bleed,
 * so the handoff into the shared MaterialEntry carries zero position jump.
 */
const APPROACH: [number, number] = [0, 0.5];
const IDENTITY: [number, number] = [0.38, 0.56];

function ApproachStage({ progress: v }: { progress: number }) {
  const approachT = smoothstep(windowT(v, APPROACH));
  const identityT = windowT(v, IDENTITY);
  const materialT = smoothstep(windowT(v, MATERIAL_WINDOW));
  const identityFade = 1 - smoothstep(Math.min(1, materialT / 0.35));

  const frameScale = 0.42 + approachT * 0.58;

  return (
    <div className="x03-opening-dom">
      <IdentityKicker />
      <div className="x03-opening-approach-field" />
      <div
        className="x03-opening-approach-frame"
        style={{ width: `${frameScale * 100}%`, height: `${frameScale * 100}%`, opacity: 1 - materialT }}
      >
        <Image
          src={A001_SRC}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="x03-opening-photo"
          style={{ objectPosition: REST_OBJECT_POSITION }}
        />
        <div className="x03-opening-scrim" style={{ opacity: approachT }} />
      </div>
      <IdentityMark t={identityT} fade={identityFade} />
      <MaterialEntry t={materialT} />
    </div>
  );
}

export function ApproachOpeningExperience() {
  return (
    <OpeningShell
      label="Hypothesis B — One Continuous Approach"
      hypothesisTag="one-continuous-approach"
      note="A single frame — the aperture the photograph sits inside — grows from a small, distant rect to full-bleed across half the whole duration, never reversing, never cutting. The photograph underneath never re-crops; only the window onto it widens, matched exactly to Hero's resolved composition at full-bleed. Attention moves continuously deeper into the same object, not from one shot of PL-1 to another."
      renderDom={(progress) => <ApproachStage progress={progress} />}
    />
  );
}
