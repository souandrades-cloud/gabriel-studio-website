"use client";

import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";
import {
  DESKTOP_HERO_BUDGET_VH,
  DESKTOP_MM_BUDGET_VH,
  MATERIAL_ESTABLISHED_FRACTION,
  MOBILE_HERO_BUDGET_VH,
  MOBILE_MM_BUDGET_VH,
} from "@/lib/x03/opening-track";

/**
 * Gate 07B — Director Iteration 001 — Unified Opening Track.
 *
 * ONE sticky track now owns the entire span the gate brief scopes: initial
 * arrival frame -> A-001 approach -> A-001/A-002 crossfade -> A-002
 * established. There is no internal release/re-engage boundary anywhere in
 * this component — see `lib/x03/opening-track.ts` for why that boundary
 * (previously between this file and material-mechanism.tsx) was the actual
 * defect Gate 07B's browser-real QA caught, independent of shot values.
 *
 * The camera move itself is unchanged in kind from Gate 07B's own fix
 * (still ONE monotonic vector, x = -31.25*(scale-1), y = -17.5*(scale-1)
 * desktop) — what moved is WHERE MaterialMechanism's own push+crossfade+
 * material-hold phase renders: absorbed here as a direct continuation of
 * the same TIMELINE/scale/x/y piecewise curve, rather than a second DOM
 * Image element in a second sticky track picking up where this one left
 * off. Checkpoints below are old Hero's 5 ARRIVAL..RECOGNITION shots plus
 * old MaterialMechanism's own push end shot (material crop reached) —
 * six points, one continuous piecewiseLerp, because it is now literally
 * one continuous camera move in one continuous DOM element.
 *
 * All progress constants below (crossfade, material scale, material label)
 * are old MaterialMechanism-local values remapped into this track's own
 * unified 0-1 via `mmLocalToUnified` — same numbers, same proportions,
 * different denominator. `HERO_SHARE`/`MM_SHARE` split this track's total
 * scroll budget between what used to be two separate budgets, preserving
 * each phase's own absolute scroll distance (and therefore pacing) rather
 * than compressing everything into a faster combined track.
 */
const EASE = [0.22, 1, 0.36, 1] as const;

interface Shot {
  scale: number;
  x: number; // percent
  y: number; // percent
}

// --- Unified track budget/share math (see lib/x03/opening-track.ts) -------
const DESKTOP_MM_ABSORBED_BUDGET_VH = DESKTOP_MM_BUDGET_VH * MATERIAL_ESTABLISHED_FRACTION; // 122
const DESKTOP_UNIFIED_BUDGET_VH = DESKTOP_HERO_BUDGET_VH + DESKTOP_MM_ABSORBED_BUDGET_VH; // 182
const DESKTOP_TRACK_VH = 100 + DESKTOP_UNIFIED_BUDGET_VH; // 282
const DESKTOP_HERO_SHARE = DESKTOP_HERO_BUDGET_VH / DESKTOP_UNIFIED_BUDGET_VH;
const DESKTOP_MM_SHARE = DESKTOP_MM_ABSORBED_BUDGET_VH / DESKTOP_UNIFIED_BUDGET_VH;

const MOBILE_MM_ABSORBED_BUDGET_VH = MOBILE_MM_BUDGET_VH * MATERIAL_ESTABLISHED_FRACTION; // 112.85
const MOBILE_UNIFIED_BUDGET_VH = MOBILE_HERO_BUDGET_VH + MOBILE_MM_ABSORBED_BUDGET_VH; // 142.85
const MOBILE_TRACK_VH = 100 + MOBILE_UNIFIED_BUDGET_VH; // 242.85
const MOBILE_HERO_SHARE = MOBILE_HERO_BUDGET_VH / MOBILE_UNIFIED_BUDGET_VH;
const MOBILE_MM_SHARE = MOBILE_MM_ABSORBED_BUDGET_VH / MOBILE_UNIFIED_BUDGET_VH;

/** Old Hero-local progress (0-1, its own former track) -> unified progress. */
function heroLocalToUnified(p: number, heroShare: number): number {
  return p * heroShare;
}
/** Old MaterialMechanism-local progress (0 to MATERIAL_ESTABLISHED_FRACTION
 *  only — this track absorbs no further than that) -> unified progress. */
function mmLocalToUnified(p: number, heroShare: number, mmShare: number): number {
  return heroShare + (p / MATERIAL_ESTABLISHED_FRACTION) * mmShare;
}

// --- Camera: 5 old-Hero shots + old-MaterialMechanism's push end shot -----
// (old Hero's own last shot and old push's own first shot were already the
// same value by Gate 07B design, so this is 6 unique points, not 7.)
const DESKTOP_HERO_SHOTS: Shot[] = [
  { scale: 1, x: 0, y: 0 }, // ARRIVAL: Gate 01's approved composition, full body, full context
  { scale: 1.02, x: -0.6, y: -0.35 }, // ACQUISITION: quiet, but the first tick already moves
  { scale: 1.08, x: -2.5, y: -1.4 }, // APPROACH: clearly under way
  { scale: 1.14, x: -4.4, y: -2.45 }, // DECELERATION: presence increasing, movement settling
  { scale: 1.18, x: -5.6, y: -3.15 }, // RECOGNITION: wordmark completes; push continues from here
];
const DESKTOP_PUSH_END: Shot = { scale: 2.6, x: -50, y: -28 }; // material crop reached — untouched, solved math
const DESKTOP_PUSH_END_MM_LOCAL = 0.17; // old MaterialMechanism's own PUSH_TIMELINE end

const MOBILE_HERO_SHOTS: Shot[] = [
  { scale: 1, x: 0, y: 0 },
  { scale: 1.015, x: -0.3, y: 0.01 },
  { scale: 1.05, x: -0.9, y: 0.03 },
  { scale: 1.09, x: -1.5, y: 0.05 },
  { scale: 1.11, x: -1.9, y: 0.06 },
];
const MOBILE_PUSH_END: Shot = { scale: 2, x: -17, y: 0.5 }; // untouched, solved math

const HERO_TIMELINE_LOCAL = [0, 0.25, 0.5, 0.75, 1];

function buildUnifiedCamera(heroShots: Shot[], pushEnd: Shot, heroShare: number, mmShare: number) {
  const timeline = [
    ...HERO_TIMELINE_LOCAL.map((p) => heroLocalToUnified(p, heroShare)),
    mmLocalToUnified(DESKTOP_PUSH_END_MM_LOCAL, heroShare, mmShare),
  ];
  const scaleOut = [...heroShots.map((s) => s.scale), pushEnd.scale];
  const xOut = [...heroShots.map((s) => s.x), pushEnd.x];
  const yOut = [...heroShots.map((s) => s.y), pushEnd.y];
  return { timeline, scaleOut, xOut, yOut };
}

const DESKTOP_CAMERA = buildUnifiedCamera(DESKTOP_HERO_SHOTS, DESKTOP_PUSH_END, DESKTOP_HERO_SHARE, DESKTOP_MM_SHARE);
const MOBILE_CAMERA = buildUnifiedCamera(MOBILE_HERO_SHOTS, MOBILE_PUSH_END, MOBILE_HERO_SHARE, MOBILE_MM_SHARE);

// --- Old MaterialMechanism-local ranges, remapped into unified progress ---
// Values themselves (0.13/0.28/0.61/0.18/0.26) are untouched from before
// Gate 07B — only the space they're expressed in changed.
function buildMaterialRanges(heroShare: number, mmShare: number) {
  const m = (p: number) => mmLocalToUnified(p, heroShare, mmShare);
  return {
    crossfade: [m(0.13), m(0.28)] as [number, number],
    materialScale: [m(0.13), m(MATERIAL_ESTABLISHED_FRACTION)] as [number, number],
    materialLabelIn: [m(0.18), m(0.26)] as [number, number],
  };
}
const DESKTOP_MATERIAL = buildMaterialRanges(DESKTOP_HERO_SHARE, DESKTOP_MM_SHARE);
const MOBILE_MATERIAL = buildMaterialRanges(MOBILE_HERO_SHARE, MOBILE_MM_SHARE);

const DESKTOP_MATERIAL_SCALE = [1.05, 1.18];
const MOBILE_MATERIAL_SCALE = [1.05, 1.15];

const WORDMARK_RANGE_LOCAL: [number, number] = [0.7, 0.95]; // old Hero-local
const SCRIM_RANGE_LOCAL: [number, number] = [0.55, 0.85]; // old Hero-local

// Identity chrome (kicker + wordmark) fades back out once the push into
// material begins — it had no equivalent before because old Hero's DOM
// simply scrolled out of view at that point; now it's one visible surface
// the whole way, so the fade must be explicit. A quick, deliberate fade
// (not a hold), narrow enough it reads as "acknowledged and moving on."
function buildIdentityOutRange(heroShare: number): [number, number] {
  return [heroShare, heroShare + 0.07];
}

function Hero() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const useScrollSequence = mounted && !prefersReducedMotion;

  const heroShots = isMobile ? MOBILE_HERO_SHOTS : DESKTOP_HERO_SHOTS;
  const camera = isMobile ? MOBILE_CAMERA : DESKTOP_CAMERA;
  const material = isMobile ? MOBILE_MATERIAL : DESKTOP_MATERIAL;
  const materialScale = isMobile ? MOBILE_MATERIAL_SCALE : DESKTOP_MATERIAL_SCALE;
  const heroShare = isMobile ? MOBILE_HERO_SHARE : DESKTOP_HERO_SHARE;
  const trackVh = isMobile ? MOBILE_TRACK_VH : DESKTOP_TRACK_VH;
  const resting = heroShots[0]; // reduced motion shows the ARRIVAL composition — Gate 01 approved

  const wordmarkRange: [number, number] = [
    heroLocalToUnified(WORDMARK_RANGE_LOCAL[0], heroShare),
    heroLocalToUnified(WORDMARK_RANGE_LOCAL[1], heroShare),
  ];
  const scrimRange: [number, number] = [
    heroLocalToUnified(SCRIM_RANGE_LOCAL[0], heroShare),
    heroLocalToUnified(SCRIM_RANGE_LOCAL[1], heroShare),
  ];
  const identityOutRange = buildIdentityOutRange(heroShare);

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  const scale = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, camera.timeline, camera.scaleOut) : resting.scale,
  );
  const x = useTransform(scrollYProgress, (p) =>
    `${useScrollSequence ? piecewiseLerp(p, camera.timeline, camera.xOut) : resting.x}%`,
  );
  const imgY = useTransform(scrollYProgress, (p) =>
    `${useScrollSequence ? piecewiseLerp(p, camera.timeline, camera.yOut) : resting.y}%`,
  );
  // Combines reveal-in (wordmarkRange) and fade-out (identityOutRange) in
  // ONE transformer rather than multiplying two separately-branching motion
  // values together — see this file's own note above about why a single
  // MotionValue per property, branching internally, is the safe pattern
  // here (two motion values combined via .get() silently mismatched their
  // non-scroll-sequence fallbacks: the fade-out's fallback needs to be 1
  // — "no fade applied" — not 0, or reduced motion would hide the wordmark
  // entirely instead of showing it steadily, same bug class Director
  // Iteration 002 already found and fixed once for this file).
  const wordmarkOpacity = useTransform(scrollYProgress, (p) => {
    if (!useScrollSequence) return 1;
    const reveal = piecewiseLerp(p, wordmarkRange, [0, 1]);
    const fadeOut = piecewiseLerp(p, identityOutRange, [1, 0]);
    return reveal * fadeOut;
  });
  const wordmarkY = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, wordmarkRange, [16, 0]) : 0,
  );
  const scrimOpacity = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, scrimRange, [0.6, 1]) : 1,
  );
  const identityFadeOut = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, identityOutRange, [1, 0]) : 1,
  );

  const a001Opacity = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, material.crossfade, [1, 0]) : 1,
  );
  const a002Opacity = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, material.crossfade, [0, 1]) : 0,
  );
  const a002Scale = useTransform(scrollYProgress, (p) =>
    piecewiseLerp(p, material.materialScale, materialScale),
  );
  const materialLabelOpacity = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, material.materialLabelIn, [0, 1]) : 0,
  );

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={trackRef}
        data-x03-track
        className="relative"
        style={{ height: useScrollSequence ? `${trackVh}vh` : "100svh" }}
      >
        <section className="sticky top-0 isolate h-[100svh] w-full overflow-hidden">
          <h1 className="sr-only">
            Proprio — PL-1, autonomous field unit. Physical AI engineered for complex industrial
            environments.
          </h1>

          {/* Micro-arrival — mount-triggered, not scroll-linked. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-hidden"
          >
            {/* A-001 — the one continuous camera move, ARRIVAL through material
                crop. Fades out only during the crossfade into A-002. */}
            <motion.div className="absolute inset-0" style={{ opacity: a001Opacity }}>
              <motion.div data-x03-camera-layer className="absolute inset-0" style={{ scale, x, y: imgY }}>
                <Image
                  src="/images/x03/x03-a001-pl1-master.png"
                  alt=""
                  aria-hidden="true"
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: "center 40%" }}
                />
              </motion.div>
            </motion.div>

            {/* A-002 — crossfades in over the same window A-001 fades out,
                continues its own slow scale through the material hold. */}
            <motion.div className="absolute inset-0" style={{ opacity: a002Opacity }}>
              <motion.div className="absolute inset-0" style={{ scale: a002Scale }}>
                <Image
                  src="/images/x03/x03-a002-pl1-material-macro.png"
                  alt=""
                  aria-hidden="true"
                  fill
                  loading="eager"
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: isMobile ? "38% 45%" : "center center" }}
                />
              </motion.div>
            </motion.div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[26%]"
              style={{ background: "linear-gradient(to bottom, rgba(16,14,12,0.55), transparent)" }}
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
              style={{
                background: "linear-gradient(to top, rgba(16,14,12,0.78), transparent)",
                opacity: scrimOpacity,
              }}
            />
          </motion.div>

          {/* Scroll-driven fade-out (outer) and mount-triggered fade-in
              (inner) are split across two elements rather than both
              targeting `opacity` on one — mixing framer's `animate` prop
              with a `style`-driven MotionValue on the same property is the
              exact class of silent conflict this file's own header comment
              already warns about for a different pair of properties. */}
          <motion.div
            className="x03-container x03-mono absolute top-0 left-0 z-10 pt-6 text-[10.5px] leading-relaxed tracking-[0.14em] uppercase sm:pt-8 sm:text-[11px]"
            style={{ opacity: identityFadeOut }}
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
              style={{ color: "var(--x03-ink-soft)" }}
            >
              <p>Physical AI</p>
              <p>Field Robotics</p>
            </motion.div>
          </motion.div>

          <motion.div
            className="x03-container absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 py-8 lg:py-12"
            style={{ opacity: wordmarkOpacity, y: wordmarkY }}
          >
            <div className="flex flex-wrap items-end gap-4 sm:gap-6">
              <p className="x03-display text-[15vw] sm:text-[96px] lg:text-[clamp(64px,9vw,168px)]">Proprio</p>
              <div className="x03-mono mb-2 flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase sm:mb-3 sm:text-[12px]">
                <span className="rounded-[3px] border px-2 py-1" style={{ borderColor: "var(--x03-accent)" }}>
                  PL-1
                </span>
                <span style={{ color: "var(--x03-ink-soft)" }}>Autonomous Field Unit</span>
              </div>
            </div>
            <p className="x03-mono max-w-[34ch] text-[13px] sm:text-[14px]" style={{ color: "var(--x03-ink-soft)" }}>
              A body that knows where it is.
            </p>
          </motion.div>

          <motion.p
            className="x03-container x03-mono absolute bottom-0 left-0 z-10 pb-8 text-[11px] tracking-[0.14em] uppercase sm:pb-12 sm:text-[12px]"
            style={{ opacity: materialLabelOpacity, color: "var(--x03-ink-soft)" }}
          >
            Material
          </motion.p>
        </section>
      </div>
    </MotionConfig>
  );
}

export { Hero };
