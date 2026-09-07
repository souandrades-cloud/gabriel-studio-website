"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";

import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

/**
 * Gate 05D — Field Action Production Integration.
 * Director Iteration 001 — localized continuity correction: MASKED REVEAL
 * stays valid only for the MACHINE SPACE -> PHYSICAL WORLD representation
 * change (HANDOFF -> CONTACT). CONTACT -> LOAD -> COMMIT are all physical
 * states of the same body in the same world, so they no longer cut via an
 * iris mask; they now cross-dissolve with a barely-perceptible arrival
 * settle on scale, so the three approved stills read as sampled frames of
 * one continuous shot rather than slide changes. Everything else — assets,
 * camera lock (confirmed via pixel diff during ingestion, no correction
 * applied), Preset A's timing envelope, THE CHOICE -> HANDOFF -> CONTACT
 * handoff, CONSEQUENCE hypothesis — is frozen from the prior iteration, not
 * rederived here.
 */

const A006 = "/images/x03/x03-a006-field-contact.png";
const A007 = "/images/x03/x03-a007-field-load.png";
const A008 = "/images/x03/x03-a008-field-commit.png";

// Preset A — frozen scroll-progress envelope, unchanged from the previous
// iteration (field-action/constants.ts TIMING_PRESETS[0].ranges).
const HANDOFF_RANGE: [number, number] = [0, 0.1];
const CONTACT_RANGE: [number, number] = [0.1, 0.3];
const LOAD_RANGE: [number, number] = [0.3, 0.55];
const COMMIT_RANGE: [number, number] = [0.55, 0.78];
const CONSEQUENCE_RANGE: [number, number] = [0.78, 1];

// HANDOFF -> CONTACT only: the one representation change (machine space ->
// physical world) MASKED REVEAL is still authorized for. Untouched.
const REVEAL_WIDTH = 0.06;

// CONTACT -> LOAD and LOAD -> COMMIT: short cross-dissolve window — long
// enough to remove the hard cut, short enough that it reads as missing
// frames between keyframes rather than a dissolve between photographs.
const CROSSFADE_WIDTH = 0.045;

// Contact-point origin (percent of frame) HANDOFF's decision node and
// CONTACT's mask both share. Unchanged.
const ORIGIN = { desktop: { x: 74, y: 60 }, mobile: { x: 70, y: 56 } };

// Route/decision accent — THE CHOICE's resolved color (machine-perception-
// scene.tsx CHOSEN_FINAL, #d9c9a6). Unchanged.
const ROUTE_ACCENT = "#d9c9a6";

const DESKTOP_TRACK_VH = 300;
const MOBILE_TRACK_VH = 260;

const CONSEQUENCE_LABEL: [number, number] = [0.88, 0.96];

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** Ease used for every crossfade/settle curve below — Director Iteration
 *  001 explicitly asks for eased interpolation, not linear ramps. */
function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** 0 before `start`, eases to 1 across `width`, holds at 1 after. */
function crossfadeIn(p: number, start: number, width: number): number {
  if (p <= start) return 0;
  return smoothstep((p - start) / width);
}

function subscribeNever() {
  return () => {};
}
function getLegacyTransitionServerSnapshot() {
  return false;
}
/**
 * Director Iteration 001 comparison — dev-only, query-param gated, and a
 * no-op in production: `process.env.NODE_ENV === "production"` is
 * statically replaced at build time, so this whole branch (and the
 * window.location read it guards) is dead-code-eliminated from the
 * production bundle, same discipline as the debug HUDs below. Reads
 * location.search via useSyncExternalStore (same pattern as useMounted /
 * useIsMobileViewport) rather than effect + setState, so no cascading
 * render and no hydration mismatch.
 */
function useLegacyTransitionFlag(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => {
      if (process.env.NODE_ENV === "production") return false;
      return new URLSearchParams(window.location.search).get("fieldAction") === "masked-legacy";
    },
    getLegacyTransitionServerSnapshot,
  );
}

function FieldAction() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const legacyTransition = useLegacyTransitionFlag();

  const useScrollSequence = mounted && !prefersReducedMotion;
  const trackVh = isMobile ? MOBILE_TRACK_VH : DESKTOP_TRACK_VH;
  const origin = isMobile ? ORIGIN.mobile : ORIGIN.desktop;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  // --- HANDOFF -> CONTACT: masked reveal, frozen -----------------------
  const contactClip = useTransform(scrollYProgress, [CONTACT_RANGE[0], CONTACT_RANGE[0] + REVEAL_WIDTH], [0, 140]);
  const contactClipPath = useMotionTemplate`circle(${contactClip}% at ${origin.x}% ${origin.y}%)`;
  const handoffOpacity = useTransform(scrollYProgress, [CONTACT_RANGE[0], CONTACT_RANGE[0] + REVEAL_WIDTH * 0.4], [1, 0]);

  // --- Legacy (Gate 05D prior iteration) CONTACT->LOAD->COMMIT: masked
  //     reveal from the same origin. Kept only for the dev A/B toggle. ---
  const loadClipLegacy = useTransform(scrollYProgress, [LOAD_RANGE[0], LOAD_RANGE[0] + REVEAL_WIDTH], [0, 140]);
  const commitClipLegacy = useTransform(scrollYProgress, [COMMIT_RANGE[0], COMMIT_RANGE[0] + REVEAL_WIDTH], [0, 140]);
  const loadClipPathLegacy = useMotionTemplate`circle(${loadClipLegacy}% at ${origin.x}% ${origin.y}%)`;
  const commitClipPathLegacy = useMotionTemplate`circle(${commitClipLegacy}% at ${origin.x}% ${origin.y}%)`;
  const commitScaleLegacy = useTransform(
    scrollYProgress,
    [COMMIT_RANGE[0], COMMIT_RANGE[1], CONSEQUENCE_RANGE[1]],
    [1.012, 1.02, 1],
  );

  // --- Director Iteration 001: short cross-dissolve + micro settle -----
  // LOAD arrives with a small overshoot (1.010) that eases down to rest
  // (1.0) across the crossfade — "missing frames" of weight settling in,
  // not a zoom. No further scale change through LOAD's hold.
  const loadOpacity = useTransform(scrollYProgress, (p) => crossfadeIn(p, LOAD_RANGE[0], CROSSFADE_WIDTH));
  const loadScale = useTransform(scrollYProgress, (p) => {
    const t = smoothstep(clamp01((p - LOAD_RANGE[0]) / CROSSFADE_WIDTH));
    return 1.01 - t * 0.01;
  });

  // COMMIT arrives with a slightly larger overshoot (1.016, more mass in
  // motion than LOAD's) easing down to a resting tension baseline (1.01),
  // which then creeps slowly through the COMMIT hold (weight fully
  // transferring) and releases back to rest across CONSEQUENCE. Same
  // tension/release principle as the prior iteration, now continuous with
  // the arrival itself instead of starting cold.
  const commitOpacity = useTransform(scrollYProgress, (p) => crossfadeIn(p, COMMIT_RANGE[0], CROSSFADE_WIDTH));
  const commitScale = useTransform(scrollYProgress, (p) => {
    const arriveT = smoothstep(clamp01((p - COMMIT_RANGE[0]) / CROSSFADE_WIDTH));
    const arrive = 1.016 - arriveT * (1.016 - 1.01);
    if (p <= COMMIT_RANGE[0] + CROSSFADE_WIDTH) return p <= COMMIT_RANGE[0] ? 1.016 : arrive;
    const holdT = clamp01((p - (COMMIT_RANGE[0] + CROSSFADE_WIDTH)) / (COMMIT_RANGE[1] - (COMMIT_RANGE[0] + CROSSFADE_WIDTH)));
    const hold = 1.01 + holdT * (1.02 - 1.01);
    const releaseT = smoothstep(clamp01((p - COMMIT_RANGE[1]) / (CONSEQUENCE_RANGE[1] - COMMIT_RANGE[1])));
    return hold - releaseT * (hold - 1);
  });

  const consequenceT = useTransform(scrollYProgress, (p) => piecewiseLerp(p, CONSEQUENCE_RANGE, [0, 1]));
  const routeReturnOpacity = useTransform(consequenceT, [0.15, 0.65], [0, 0.5]);
  const labelOpacity = useTransform(scrollYProgress, (p) => piecewiseLerp(p, CONSEQUENCE_LABEL, [0, 1]));

  const objectPosition = isMobile ? "68% 42%" : "58% 40%";

  return (
    <div
      ref={trackRef}
      data-x03-field-action-track
      className="relative"
      style={{ height: useScrollSequence ? `${trackVh}vh` : "auto" }}
    >
      {useScrollSequence ? (
        <section className="sticky top-0 isolate h-[100svh] w-full overflow-hidden" style={{ background: "#0a0908" }}>
          {/* HANDOFF — the resolved decision, held as a dark frame with only
              the chosen-route line and its terminal node visible. Frozen. */}
          <motion.div className="absolute inset-0 z-0" style={{ opacity: handoffOpacity }} aria-hidden="true">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <line
                x1="4"
                y1="88"
                x2={origin.x}
                y2={origin.y}
                stroke={ROUTE_ACCENT}
                strokeWidth="0.35"
                strokeDasharray="1.6 1.6"
                opacity="0.85"
              />
              <circle cx={origin.x} cy={origin.y} r="1" fill={ROUTE_ACCENT} opacity="0.95" />
            </svg>
          </motion.div>

          {/* CONTACT — masked reveal out of HANDOFF. Frozen. */}
          <motion.div className="absolute inset-0 z-10" style={{ clipPath: contactClipPath }} aria-hidden="true">
            <Image src={A006} alt="" fill priority sizes="100vw" className="object-cover" style={{ objectPosition }} />
          </motion.div>

          {/* LOAD — Director Iteration 001: cross-dissolve + micro settle
              in the default treatment; the pre-iteration masked reveal is
              still selectable in dev via ?fieldAction=masked-legacy for
              direct comparison. */}
          <motion.div
            className="absolute inset-0 z-20"
            style={
              legacyTransition
                ? { clipPath: loadClipPathLegacy }
                : { opacity: loadOpacity, scale: loadScale }
            }
            aria-hidden="true"
          >
            <Image src={A007} alt="" fill loading="eager" sizes="100vw" className="object-cover" style={{ objectPosition }} />
          </motion.div>

          {/* COMMIT — same treatment as LOAD; carries the settle->tension->
              release scale curve through CONSEQUENCE either way. */}
          <motion.div
            className="absolute inset-0 z-30"
            style={
              legacyTransition
                ? { clipPath: commitClipPathLegacy, scale: commitScaleLegacy }
                : { opacity: commitOpacity, scale: commitScale }
            }
            aria-hidden="true"
          >
            <Image src={A008} alt="" aria-hidden="true" fill loading="eager" sizes="100vw" className="object-cover" style={{ objectPosition }} />
          </motion.div>

          {/* CONSEQUENCE — the chosen route reappearing beneath PL-1,
              closing the loop back to THE CHOICE, without a new image.
              Frozen pending re-review once continuity itself passes. */}
          <motion.svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-40 h-full w-full"
            style={{ opacity: routeReturnOpacity }}
            aria-hidden="true"
          >
            <path
              d={`M ${origin.x} ${origin.y} C ${origin.x - 20} ${origin.y + 18}, ${origin.x - 45} ${origin.y + 24}, 6 ${origin.y + 30}`}
              fill="none"
              stroke={ROUTE_ACCENT}
              strokeWidth="0.35"
              strokeDasharray="1.4 1.8"
            />
          </motion.svg>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[32%]"
            style={{ background: "linear-gradient(to top, rgba(10,9,8,0.72), transparent)" }}
          />

          <motion.div
            className="x03-container x03-mono absolute inset-x-0 bottom-0 z-40 flex flex-col gap-2 py-8 lg:py-12"
            style={{ opacity: labelOpacity }}
          >
            <p className="text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--x03-accent)" }}>
              Adaptive Mobility
            </p>
            <p className="max-w-[42ch] text-[13px] sm:text-[15px]" style={{ color: "var(--x03-ink-soft)" }}>
              Contact becomes commitment. The chosen route carries into the body.
            </p>
          </motion.div>

          {process.env.NODE_ENV !== "production" && (
            <FieldActionDebugHud scrollYProgress={scrollYProgress} legacyTransition={legacyTransition} />
          )}
        </section>
      ) : (
        <FieldActionFallback />
      )}
    </div>
  );
}

/**
 * Reduced-motion fallback: the sequence's structural beats held as discrete,
 * non-animated sections. Unchanged — Director Iteration 001 is a scroll-
 * linked motion/transition correction, and this fallback carries no motion
 * to correct.
 */
function FieldActionFallback() {
  return (
    <div>
      <FieldActionStaticBeat src={A006} label="Contact" />
      <FieldActionStaticBeat src={A007} label="Load" />
      <FieldActionStaticBeat src={A008} label="Commit" />
    </div>
  );
}

function FieldActionStaticBeat({ src, label }: { src: string; label: string }) {
  return (
    <section className="relative h-[90svh] w-full overflow-hidden border-t" style={{ borderColor: "var(--x03-hairline)" }}>
      <Image src={src} alt="" aria-hidden="true" fill loading="eager" sizes="100vw" className="object-cover" style={{ objectPosition: "58% 40%" }} />
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

/** Dev-only observability — statically eliminated from the production
 *  bundle. Now also surfaces which CONTACT->LOAD->COMMIT treatment is
 *  active, and the query param that switches it, for the Director A/B. */
function FieldActionDebugHud({
  scrollYProgress,
  legacyTransition,
}: {
  scrollYProgress: MotionValue<number>;
  legacyTransition: boolean;
}) {
  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", setProgress);

  const phase =
    progress < HANDOFF_RANGE[1]
      ? "0. Handoff"
      : progress < CONTACT_RANGE[1]
        ? "1. Contact"
        : progress < LOAD_RANGE[1]
          ? "2. Load"
          : progress < COMMIT_RANGE[1]
            ? "3. Commit"
            : "4. Consequence";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-2 bottom-2 z-50 font-mono text-[10px] tracking-wide text-[#d9c9a6]"
      style={{ background: "rgba(10,9,8,0.82)", padding: "4px 8px", borderRadius: 3 }}
    >
      {progress.toFixed(3)} — {phase}
      <br />
      transition: {legacyTransition ? "LEGACY (masked reveal)" : "Director Iteration 001 (cross-dissolve)"}
      <br />
      ?fieldAction=masked-legacy to compare
    </div>
  );
}

export { FieldAction };
