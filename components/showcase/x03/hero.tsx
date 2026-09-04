"use client";

import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

/**
 * Director Iteration 002: Iteration 001 verified correct end-to-end (the
 * computed transform on the camera layer matched the interpolation math at
 * every checkpoint — not a binding bug) but was perceptually flat. Measured
 * cause: one normal wheel tick (deltaY 100) from the top produced a scale
 * delta of exactly 0 — the first 18% and last 12% of the track were flat
 * holds (0.6, ~30% of the whole track, moved nothing), so the very first
 * thing every visitor did — scroll down from the top — gave zero feedback.
 * TIMELINE is now 5 points with no repeated/held values: every quarter of
 * the track moves. Amplitude and TRACK_VH both came down/up together — a
 * shorter track spreads the same (now larger) range over less scroll
 * distance, so a normal wheel tick reads as a visible change throughout,
 * not just mid-track. See `piecewiseLerp` for how a value between points
 * is resolved — linear per segment, no easing (a scroll-scrubbed value
 * should track scroll position 1:1; easing belongs on time-based motion).
 *
 * Every scroll-linked value below is ONE `useTransform` call whose function
 * branches on `useScrollSequence` internally (piecewiseLerp / a fallback
 * constant), never two separate MotionValues ternary-swapped at the style
 * prop. That swap was tried first and silently stuck several properties at
 * their first-render value — `x`/`y` (transform shorthand props) picked up
 * a later-swapped MotionValue correctly, `opacity` did not, so the wordmark
 * rendered fully visible at scroll position 0. Keeping one stable
 * MotionValue per property and branching inside its transformer sidesteps
 * that instead of relying on it.
 *
 * Reduced motion (and the instant before `mounted` resolves) renders the
 * exact same JSX with those transformers evaluating to the resting shot —
 * see `useScrollSequence`. This keeps one DOM shape (avoids the useScroll
 * target-ref invariant that fires if the tracked element is sometimes
 * absent) and keeps SSR/first paint identical for everyone (avoids a
 * hydration mismatch — `useReducedMotion` resolves synchronously on the
 * client's first render, unlike `useMounted`, so gating on `mounted` too is
 * what keeps server and client agreeing).
 */
const EASE = [0.22, 1, 0.36, 1] as const;

interface Shot {
  scale: number;
  x: number; // percent
  y: number; // percent
}

// 5 shots, one per checkpoint (0/25/50/75/100%) — no held/repeated values,
// so every quarter of the track visibly moves the frame.
const DESKTOP_SHOTS: Shot[] = [
  { scale: 2.4, x: 24, y: -21 }, // 0% MACRO: joint/gripper detail, deliberately unclear
  { scale: 1.85, x: 16, y: -15 }, // 25% OPENING: frame visibly widening
  { scale: 1.35, x: 7, y: -7 }, // 50% BIG CHANGE: most anatomy legible
  { scale: 1.05, x: 1.5, y: -1.5 }, // 75% NEAR COMPLETE: arm may still exit frame
  { scale: 1, x: 0, y: 0 }, // 100% RESOLVED: Gate 01's approved composition
];
const MOBILE_SHOTS: Shot[] = [
  { scale: 1.65, x: 17, y: -15 },
  { scale: 1.42, x: 11, y: -10 },
  { scale: 1.2, x: 5, y: -5 },
  { scale: 1.04, x: 1, y: -1 },
  { scale: 1, x: 0, y: 0 },
];

const DESKTOP_TRACK_VH = 160;
const MOBILE_TRACK_VH = 130;

const TIMELINE = [0, 0.25, 0.5, 0.75, 1];
const WORDMARK_RANGE: [number, number] = [0.7, 0.95];
const SCRIM_RANGE: [number, number] = [0.55, 0.85];

function Hero() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const useScrollSequence = mounted && !prefersReducedMotion;

  const shots = isMobile ? MOBILE_SHOTS : DESKTOP_SHOTS;
  const trackVh = isMobile ? MOBILE_TRACK_VH : DESKTOP_TRACK_VH;
  const resting = shots[shots.length - 1];

  const scaleOut = shots.map((s) => s.scale);
  const xOut = shots.map((s) => s.x);
  const yOut = shots.map((s) => s.y);

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  const scale = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, TIMELINE, scaleOut) : resting.scale,
  );
  const x = useTransform(scrollYProgress, (p) =>
    `${useScrollSequence ? piecewiseLerp(p, TIMELINE, xOut) : resting.x}%`,
  );
  const imgY = useTransform(scrollYProgress, (p) =>
    `${useScrollSequence ? piecewiseLerp(p, TIMELINE, yOut) : resting.y}%`,
  );
  const wordmarkOpacity = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, WORDMARK_RANGE, [0, 1]) : 1,
  );
  const wordmarkY = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, WORDMARK_RANGE, [16, 0]) : 0,
  );
  const scrimOpacity = useTransform(scrollYProgress, (p) =>
    useScrollSequence ? piecewiseLerp(p, SCRIM_RANGE, [0.6, 1]) : 1,
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

          {/* Image stage — the entire hero IS the photograph; no 3D, no
              second asset. A short opacity fade is the only autoplay left
              (a "micro-arrival" so the page doesn't just pop in) — the
              camera move itself is scroll-only from here. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-hidden"
          >
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

            {/* Scrims — guarantee legibility for the overlaid type
                regardless of which part of the photo sits underneath at a
                given scroll position. Function, not decoration: the photo
                itself is never altered. Bottom scrim builds as IDENTITY
                LOCK approaches, when it needs to carry the most contrast. */}
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

          {/* Kicker — quiet, persistent corner mark. Part of the micro-
              arrival (mount-triggered), not the scroll narrative: it
              identifies the territory throughout, it isn't a beat the
              visitor scrolls to produce. */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
            className="x03-container x03-mono absolute top-0 left-0 z-10 pt-6 text-[10.5px] leading-relaxed tracking-[0.14em] uppercase sm:pt-8 sm:text-[11px]"
            style={{ color: "var(--x03-ink-soft)" }}
          >
            <p>Physical AI</p>
            <p>Field Robotics</p>
          </motion.div>

          {/* Identity lock — wordmark + designation, resolves as the
              visitor scrolls into IDENTITY LOCK, landing with the image. */}
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
        </section>
      </div>
    </MotionConfig>
  );
}

export { Hero };
