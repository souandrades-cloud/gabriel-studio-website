"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";
import {
  DESKTOP_MM_BUDGET_VH,
  MATERIAL_ESTABLISHED_FRACTION,
  MOBILE_MM_BUDGET_VH,
} from "@/lib/x03/opening-track";

/**
 * Gate 07B — Director Iteration 001 — Unified Opening Track.
 *
 * This component now owns ONLY what happens after A-002 is established:
 * the diagonal clip-path reveal into A-003 and its settle. Everything up
 * through A-002 established (Hero's own arrival/approach, the A-001->A-002
 * push and crossfade, the material scale-hold) moved into hero.tsx as one
 * continuous sticky track — see that file's and `lib/x03/opening-track.ts`'s
 * comments for why the OLD two-track boundary here was the actual defect
 * Gate 07B's browser-real QA caught, independent of shot values.
 *
 * MASK_RANGE, SETTLE_TIMELINE, and the label crossfade values below are
 * UNCHANGED from before — same numbers, same proportions, same technique
 * (diagonal clip-path anchored upper/center, growing lower/lateral toward
 * the rear-right leg). Only the space they're expressed in shrank: they
 * used to be a sub-range [MATERIAL_ESTABLISHED_FRACTION, 1] of a bigger
 * shared 0-1, now they're this track's own full 0-1, and the wrapper's
 * scroll budget shrank proportionally (from the same fraction of the old
 * combined budget) so the absolute scroll distance — and therefore pacing
 * — for this phase is exactly what it was before, not compressed.
 *
 * A-002 itself is rendered here as a STATIC layer (no scale animation): by
 * MATERIAL_ESTABLISHED_FRACTION its scale-hold had already finished in the
 * old single track, so there is nothing left to animate — it arrives at
 * whatever hero.tsx's own material-hold settled it to (1.18 desktop /
 * 1.15 mobile) and stays there while the mask reveals A-003 on top.
 */

const DESKTOP_REMAINING_FRACTION = 1 - MATERIAL_ESTABLISHED_FRACTION; // 0.39
const DESKTOP_REMAINING_BUDGET_VH = DESKTOP_MM_BUDGET_VH * DESKTOP_REMAINING_FRACTION; // 78
const DESKTOP_TRACK_VH = 100 + DESKTOP_REMAINING_BUDGET_VH; // 178

const MOBILE_REMAINING_BUDGET_VH = MOBILE_MM_BUDGET_VH * DESKTOP_REMAINING_FRACTION; // 72.15
const MOBILE_TRACK_VH = 100 + MOBILE_REMAINING_BUDGET_VH; // 172.15

/** Old MaterialMechanism-local progress (MATERIAL_ESTABLISHED_FRACTION to 1)
 *  -> this track's own local 0-1. */
function toDownstreamLocal(p: number): number {
  return (p - MATERIAL_ESTABLISHED_FRACTION) / DESKTOP_REMAINING_FRACTION;
}

const A002_SRC = "/images/x03/x03-a002-pl1-material-macro.png";
const A003_SRC = "/images/x03/x03-a003-pl1-mechanism-detail.png";

const DESKTOP_A002_SETTLED_SCALE = 1.18;
const MOBILE_A002_SETTLED_SCALE = 1.15;

const MASK_RANGE: [number, number] = [toDownstreamLocal(0.61), toDownstreamLocal(0.84)];
const MASK_RIGHT_RANGE = [-15, 130]; // % — untouched, same diagonal grammar
const MASK_LEFT_OFFSET = 30; // % behind the right edge — sets the diagonal's slant

const SETTLE_TIMELINE = [toDownstreamLocal(0.61), toDownstreamLocal(0.96)];
interface SettleShot {
  scale: number;
  x: number;
  y: number;
}
const DESKTOP_SETTLE: [SettleShot, SettleShot] = [
  { scale: 1.12, x: 4, y: -3 },
  { scale: 1, x: 0, y: 0 },
];
const MOBILE_SETTLE: [SettleShot, SettleShot] = [
  { scale: 1.08, x: 2, y: -2 },
  { scale: 1, x: 0, y: 0 },
];

const MATERIAL_LABEL_OUT: [number, number] = [toDownstreamLocal(0.61), toDownstreamLocal(0.69)];
const MECHANISM_LABEL_IN: [number, number] = [toDownstreamLocal(0.76), toDownstreamLocal(0.84)];

function MaterialMechanism() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const useScrollSequence = mounted && !prefersReducedMotion;

  const settle = isMobile ? MOBILE_SETTLE : DESKTOP_SETTLE;
  const trackVh = isMobile ? MOBILE_TRACK_VH : DESKTOP_TRACK_VH;
  const a002Scale = isMobile ? MOBILE_A002_SETTLED_SCALE : DESKTOP_A002_SETTLED_SCALE;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  // A-003 layer — diagonal clip-path reveal, then settles to rest.
  const maskRight = useTransform(scrollYProgress, (p) => piecewiseLerp(p, MASK_RANGE, MASK_RIGHT_RANGE));
  const clipPath = useTransform(maskRight, (right) => {
    const left = right - MASK_LEFT_OFFSET;
    return `polygon(0% 0%, 100% 0%, 100% ${right}%, 0% ${left}%)`;
  });
  const a003Scale = useTransform(scrollYProgress, (p) =>
    piecewiseLerp(p, SETTLE_TIMELINE, [settle[0].scale, settle[1].scale]),
  );
  const a003X = useTransform(
    scrollYProgress,
    (p) => `${piecewiseLerp(p, SETTLE_TIMELINE, [settle[0].x, settle[1].x])}%`,
  );
  const a003Y = useTransform(
    scrollYProgress,
    (p) => `${piecewiseLerp(p, SETTLE_TIMELINE, [settle[0].y, settle[1].y])}%`,
  );

  // Chapter markers — "Material" (inherited already-visible from hero.tsx)
  // fades out as "Mechanism" fades in.
  const materialLabelOpacity = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, MATERIAL_LABEL_OUT, [1, 0]) : 0,
  );
  const mechanismLabelOpacity = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, MECHANISM_LABEL_IN, [0, 1]) : 0,
  );

  return (
    <div
      ref={trackRef}
      data-x03-material-mechanism-track
      className="relative"
      style={{ height: useScrollSequence ? `${trackVh}vh` : "auto" }}
    >
      {useScrollSequence ? (
        <section className="sticky top-0 isolate h-[100svh] w-full overflow-hidden">
          <div className="absolute inset-0" data-x03-a002-layer>
            <Image
              src={A002_SRC}
              alt=""
              aria-hidden="true"
              fill
              loading="eager"
              sizes="100vw"
              className="object-cover"
              style={{
                objectPosition: isMobile ? "38% 45%" : "center center",
                transform: `scale(${a002Scale})`,
              }}
            />
          </div>

          <motion.div className="absolute inset-0" data-x03-a003-layer style={{ clipPath }}>
            <motion.div className="absolute inset-0" style={{ scale: a003Scale, x: a003X, y: a003Y }}>
              <Image
                src={A003_SRC}
                alt=""
                aria-hidden="true"
                fill
                loading="eager"
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: isMobile ? "55% 30%" : "62% 32%" }}
              />
            </motion.div>
          </motion.div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
            style={{ background: "linear-gradient(to top, rgba(16,14,12,0.65), transparent)" }}
          />

          <motion.p
            className="x03-container x03-mono absolute bottom-0 left-0 z-10 pb-8 text-[11px] tracking-[0.14em] uppercase sm:pb-12 sm:text-[12px]"
            style={{ opacity: materialLabelOpacity, color: "var(--x03-ink-soft)" }}
          >
            Material
          </motion.p>
          <motion.p
            className="x03-container x03-mono absolute bottom-0 left-0 z-10 pb-8 text-[11px] tracking-[0.14em] uppercase sm:pb-12 sm:text-[12px]"
            style={{ opacity: mechanismLabelOpacity, color: "var(--x03-ink-soft)" }}
          >
            Mechanism
          </motion.p>
        </section>
      ) : (
        // Reduced motion: hero.tsx's own fallback shows only the ARRIVAL
        // frame (it no longer owns a settled "Material" moment to hold on
        // now that this file's downstream track starts past that point),
        // so this file restores the "Material" beat here rather than
        // dropping it — same three-beat sequence as before Gate 07B
        // Director Iteration 001 (arrival -> material -> mechanism), just
        // sourced from two components instead of one.
        <div>
          <StaticBeat
            src={A002_SRC}
            objectPosition={isMobile ? "38% 45%" : "center center"}
            label="Material"
          />
          <StaticBeat src={A003_SRC} objectPosition={isMobile ? "55% 30%" : "62% 32%"} label="Mechanism" />
        </div>
      )}
    </div>
  );
}

function StaticBeat({ src, objectPosition, label }: { src: string; objectPosition: string; label: string }) {
  return (
    <section className="relative h-[90svh] w-full overflow-hidden border-t" style={{ borderColor: "var(--x03-hairline)" }}>
      <Image src={src} alt="" aria-hidden="true" fill loading="eager" sizes="100vw" className="object-cover" style={{ objectPosition }} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
        style={{ background: "linear-gradient(to top, rgba(16,14,12,0.65), transparent)" }}
      />
      <p
        className="x03-container x03-mono absolute bottom-0 left-0 z-10 pb-8 text-[11px] tracking-[0.14em] uppercase sm:pb-12 sm:text-[12px]"
        style={{ color: "var(--x03-ink-soft)" }}
      >
        {label}
      </p>
    </section>
  );
}

export { MaterialMechanism };
