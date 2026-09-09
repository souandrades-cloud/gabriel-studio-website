"use client";

import Image from "next/image";

import { ResolutionMark } from "./resolution-mark";
import { WorldEntry } from "./world-entry";
import { FinalShell } from "./final-shell";
import { A001_SRC, WORLD_WINDOW, smoothstep, windowT } from "./constants";

/**
 * Hypothesis A — MONUMENTAL RETURN. Tests SCALE + PRESENCE + SILENCE: after
 * WORLD, the frame goes briefly dark (RELEASE — no product yet, no
 * spectacle, just the absence of the machine's environment) and PL-1 then
 * rises once, full-bleed, cropped tight enough that its body fills the
 * frame edge to edge rather than sitting centered with headroom — the
 * opposite crop discipline from production's current whole-body
 * object-contain resolution. No push, no pan, no camera move once it
 * arrives: a single settle from a barely-perceptible overshoot (1.05) to
 * rest (1.0), then LONG stillness. Impact is meant to come from authority
 * of scale and the confidence of not moving, not from a reveal mechanic.
 */
const RELEASE_RANGE: [number, number] = [WORLD_WINDOW[1], 0.46];
const REVEAL_RANGE: [number, number] = [0.46, 0.68];
const RESOLUTION_RANGE: [number, number] = [0.76, 0.86];

function MonumentalStage({ progress: v }: { progress: number }) {
  const worldT = windowT(v, WORLD_WINDOW);
  const worldOpacity = 1 - smoothstep(windowT(v, RELEASE_RANGE));
  const releaseGround = smoothstep(windowT(v, RELEASE_RANGE));

  const revealT = smoothstep(windowT(v, REVEAL_RANGE));
  const productOpacity = revealT;
  const productScale = 1.05 - revealT * 0.05;

  const resolutionOpacity = smoothstep(windowT(v, RESOLUTION_RANGE));

  return (
    <div className="x03-final-dom">
      <div className="x03-final-ground" style={{ opacity: releaseGround }} />
      <div style={{ opacity: worldOpacity }}>
        <WorldEntry t={worldT} />
      </div>

      <div className="x03-final-monument-frame" style={{ opacity: productOpacity }}>
        <div className="x03-final-monument-photo-wrap" style={{ transform: `scale(${productScale})` }}>
          <Image
            src={A001_SRC}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="x03-final-photo"
            style={{ objectPosition: "center 32%" }}
          />
        </div>
        <div className="x03-final-scrim x03-final-scrim-light" />
      </div>

      <ResolutionMark opacity={resolutionOpacity} />
    </div>
  );
}

export function MonumentalFinalExperience() {
  return (
    <FinalShell
      label="Hypothesis A — Monumental Return"
      hypothesisTag="monumental-return"
      note="WORLD holds, then recedes to nothing. PL-1 rises once — full-bleed, cropped so its body fills the frame edge to edge rather than sitting centered with headroom, settling from a barely-perceptible overshoot to total stillness. No push, no pan, no second camera move: impact comes from scale and the confidence of not moving, not from a reveal mechanic."
      renderDom={(progress) => <MonumentalStage progress={progress} />}
    />
  );
}
