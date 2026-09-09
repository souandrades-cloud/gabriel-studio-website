"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { A001_SRC, A002_SRC, MATERIAL_LABEL, REST_OBJECT_POSITION, smoothstep } from "./constants";

export interface MaterialEntryProps {
  /** 0-1 local progress across the shared MATERIAL_WINDOW. */
  t: number;
}

/**
 * The ONE beat every hypothesis ends on identically — the discovery brief's
 * "same endpoint" fairness requirement. Mirrors production
 * MaterialMechanism's own grammar for this exact handoff (continued push on
 * A-001, then a crossfade into A-002/"Material"), compressed into this
 * gate's shorter local window but using the same technique so the frozen
 * downstream section it hands off to (in production) is a true continuation,
 * not a redraw. What differs between hypotheses is only the resting frame
 * of A-001 this fades from — every hypothesis converges on scale 1, x 0,
 * y 0, REST_OBJECT_POSITION (Hero's own resolved composition) by the time
 * this component takes over.
 */
export function MaterialEntry({ t }: MaterialEntryProps) {
  // `t` is exactly 0 for the entire pre-material timeline (windowT clamps
  // below the window start) — but a plain `1 - cross` opacity on the base
  // A-001 layer below is 1 at t=0 too, which would sit fully opaque over
  // every hypothesis's own reveal grammar for nearly the whole duration.
  // `active` gates the whole component to a quick fade-in right at the
  // window's start, so nothing here is visible until it's actually taking
  // over from a hypothesis's already-converged resting frame.
  const active = smoothstep(Math.min(1, t / 0.08));

  // Crossfade starts once push is nearly finished (production's own
  // CROSSFADE_RANGE only starts at ~76% through its PUSH_TIMELINE) and stays
  // narrow — two differently-cropped photos blended at low opacity for long
  // reads as a double-exposure ghost, not a focus pull, the exact QA failure
  // production's own code comments name and solve for with matched crop
  // math. A short, late crossfade keeps that ambiguous window brief instead.
  const push = smoothstep(Math.min(1, t / 0.55)); // [0, 0.55] local — continues the push
  const cross = smoothstep((Math.min(1, Math.max(0, t - 0.5)) / 0.16)); // [0.5, 0.66] local
  const label = smoothstep((Math.min(1, Math.max(0, t - 0.56)) / 0.2)); // [0.56, 0.76] local

  const a001Scale = 1 + push * 1.6;
  const a001X = `${push * -50}%`;
  const a001Y = `${push * -28}%`;

  return (
    <div className="x03-opening-material" style={{ opacity: active }} aria-hidden="true">
      <div className="x03-opening-material-layer" style={{ opacity: 1 - cross }}>
        <motion.div className="absolute inset-0" style={{ scale: a001Scale, x: a001X, y: a001Y }}>
          <Image
            src={A001_SRC}
            alt=""
            fill
            sizes="100vw"
            className="x03-opening-material-photo"
            style={{ objectPosition: REST_OBJECT_POSITION }}
          />
        </motion.div>
      </div>
      <div className="x03-opening-material-layer" style={{ opacity: cross }}>
        <motion.div className="absolute inset-0" style={{ scale: 1.04 + cross * 0.08 }}>
          <Image src={A002_SRC} alt="" fill sizes="100vw" className="x03-opening-material-photo" />
        </motion.div>
      </div>
      <p className="x03-opening-material-label" style={{ opacity: label }}>
        {MATERIAL_LABEL}
      </p>
    </div>
  );
}
