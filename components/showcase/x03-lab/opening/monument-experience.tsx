"use client";

import Image from "next/image";

import { IdentityKicker, IdentityMark } from "./identity-mark";
import { MaterialEntry } from "./material-entry";
import { OpeningShell } from "./opening-shell";
import { A001_SRC, MATERIAL_WINDOW, REST_OBJECT_POSITION, smoothstep, windowT } from "./constants";

/**
 * Hypothesis C — PRODUCT AS MONUMENT. Primary perceptual change: nothing
 * withheld — full clarity, true scale, Hero's own resolved composition,
 * from the very first frame. Impact is carried by restraint: a fixed
 * negative-space mat (gallery framing, present and unmoving throughout,
 * distinguishing this from Hypothesis B's own growing frame) and a scale
 * creep so slow (1.0 -> ~1.03 across the entire hold) it registers only in
 * aggregate, never as a discrete beat. Typography arrives once, early, and
 * then holds still — no second animation beat competes with the stillness.
 */
const IDENTITY: [number, number] = [0.05, 0.2];
const CREEP: [number, number] = [0, 0.8];

function MonumentStage({ progress: v }: { progress: number }) {
  const identityT = windowT(v, IDENTITY);
  const creepT = smoothstep(windowT(v, CREEP));
  const materialT = smoothstep(windowT(v, MATERIAL_WINDOW));
  const identityFade = 1 - smoothstep(Math.min(1, materialT / 0.35));

  const scale = 1 + creepT * 0.03;

  return (
    <div className="x03-opening-dom">
      <IdentityKicker />
      <div className="x03-opening-monument-mat" style={{ opacity: 1 - materialT }}>
        <div className="x03-opening-monument-frame">
          <Image
            src={A001_SRC}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="x03-opening-photo"
            style={{ objectPosition: REST_OBJECT_POSITION, transform: `scale(${scale})` }}
          />
          <div className="x03-opening-scrim" style={{ opacity: 0.55 }} />
        </div>
      </div>
      <IdentityMark t={identityT} fade={identityFade} />
      <MaterialEntry t={materialT} />
    </div>
  );
}

export function MonumentOpeningExperience() {
  return (
    <OpeningShell
      label="Hypothesis C — Product as Monument"
      hypothesisTag="product-as-monument"
      note="Nothing withheld — PL-1 is fully clear, at true scale, in Hero's own resolved composition, from the first frame. A fixed gallery mat holds generous negative space around it for the entire hold, unmoving. The only motion is a scale creep so slow (roughly 3% across the whole duration) it registers as weight and time rather than a beat. Typography arrives once, early, and stays — nothing competes with the stillness."
      renderDom={(progress) => <MonumentStage progress={progress} />}
    />
  );
}
