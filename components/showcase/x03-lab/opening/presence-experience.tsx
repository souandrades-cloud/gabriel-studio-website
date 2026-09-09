"use client";

import Image from "next/image";

import { IdentityKicker, IdentityMark } from "./identity-mark";
import { MaterialEntry } from "./material-entry";
import { OpeningShell } from "./opening-shell";
import { A001_SRC, MATERIAL_WINDOW, REST_OBJECT_POSITION, smoothstep, windowT } from "./constants";

/**
 * Hypothesis A — PRESENCE BEFORE REVEAL. Primary perceptual change:
 * UNKNOWN/PARTIAL -> WHOLE, carried entirely by light (exposure, contrast,
 * saturation, a contracting vignette) over ONE static frame — Hero's own
 * resolved composition, held from frame one. Deliberately NOT spatial
 * cropping (the brief names that failure mode explicitly): the silhouette
 * is legible as a WHOLE shape immediately, at true scale, surrounded by
 * environmental negative space (the vignette); what's withheld is surface
 * and material, not geometry or scale. Anticipation comes from watching
 * detail resolve, not from wondering what's off-frame.
 */
const REVEAL: [number, number] = [0, 0.58];
const IDENTITY: [number, number] = [0.44, 0.62];

function PresenceStage({ progress: v }: { progress: number }) {
  const revealT = smoothstep(windowT(v, REVEAL));
  const identityT = windowT(v, IDENTITY);
  const materialT = smoothstep(windowT(v, MATERIAL_WINDOW));
  const identityFade = 1 - smoothstep(Math.min(1, materialT / 0.35));

  const brightness = 0.3 + revealT * 0.7;
  const contrast = 0.8 + revealT * 0.2;
  const saturate = 0.1 + revealT * 0.9;
  const vignette = 1 - revealT;

  return (
    <div className="x03-opening-dom">
      <IdentityKicker />
      <div className="x03-opening-photo-wrap" style={{ opacity: 1 - materialT }}>
        <Image
          src={A001_SRC}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="x03-opening-photo"
          style={{
            objectPosition: REST_OBJECT_POSITION,
            filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`,
          }}
        />
        <div className="x03-opening-vignette" style={{ opacity: vignette }} />
        <div className="x03-opening-scrim" style={{ opacity: 0.4 + revealT * 0.4 }} />
      </div>
      <IdentityMark t={identityT} fade={identityFade} />
      <MaterialEntry t={materialT} />
    </div>
  );
}

export function PresenceOpeningExperience() {
  return (
    <OpeningShell
      label="Hypothesis A — Presence Before Reveal"
      hypothesisTag="presence-before-reveal"
      note="One static frame, Hero's own resolved composition, held from the first moment — PL-1's full silhouette and true scale are legible immediately. What's withheld is light: exposure, contrast, and saturation resolve gradually as a contracting vignette opens, so anticipation comes from watching material become legible, never from wondering what's off-frame. No crop, no camera move — this hypothesis's one variable is light."
      renderDom={(progress) => <PresenceStage progress={progress} />}
    />
  );
}
