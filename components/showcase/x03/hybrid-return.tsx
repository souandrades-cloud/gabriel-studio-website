"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

/**
 * Gate 06B — Hybrid Return Production Integration.
 * Director Iteration 001 — Reveal Through Absence restoration. The prior cut
 * answered WHERE/WHY correctly but closed with a conventional crossfade
 * (A-008 and A-009 both partially visible through one long dissolve window)
 * — the winning Gate 08A architecture is not a dissolve, it's a firewall:
 * WORLD -> MEANING -> WITHHOLD (A-008 leaves, alone) -> ABSENCE (neither
 * photograph exists on screen, held) -> REVEAL (A-009 arrives once, alone)
 * -> STILLNESS. A-008 and A-009 never share the screen at any progress value
 * — ABSENCE_RANGE is the gap that makes the arrival read as an event rather
 * than a handover.
 *
 * WORLD/MEANING are unchanged in character from the prior iteration — Human
 * Director confirmed the machine->world return already reads correctly, so
 * this pass only touches what happens after MEANING. WORLD deliberately does
 * NOT re-crop or pan A-008: FieldAction's existing frame already shows the
 * substation environment (that's why it was chosen), so answering WHERE is a
 * caption + tonal change over the same photograph, not a second camera move.
 *
 * Opening state (progress 0) still reproduces FieldAction's resolved closing
 * frame pixel-for-pixel (same crop, same route-line opacity, same caption
 * fully visible, same #0a0908 ground) — same handoff discipline as every
 * prior section boundary in this page (see material-mechanism.tsx).
 *
 * A-009 — FINAL SIGNATURE FRAME (Human Pass Forte, approved, frozen; do not
 * re-crop, re-grade, or substitute) shows the same PL-1 body A-001 opened on
 * (hero.tsx), now mid-task in the same B3 substation A-008 already
 * established. On desktop it now renders full-bleed (`object-cover`, no
 * frame/margin) per Gate 08A's explicit correction: "the viewport becomes
 * A-009," not "A-009 displayed inside the viewport." Mobile keeps the prior
 * letterboxed `object-contain` presentation instead — A-009 is native 16:9
 * (1672x941), and cover-cropping that to a portrait phone viewport keeps
 * only the center ~25% of the frame's width, which is the destructive crop
 * the brief prohibits, not the letterboxing it tolerates.
 */

const A008 = "/images/x03/x03-a008-field-commit.png";
const A009 = "/images/x03/x03-a009-final-signature.png";

// FieldAction's own exit state — reproduced exactly so the boundary between
// the two sections reads as one held frame, not a cut.
const ROUTE_ACCENT = "#d9c9a6";
const FIELD_GROUND = "#0a0908";
const OBJECT_POSITION = { desktop: "58% 40%", mobile: "68% 42%" };

// Director Iteration 001 (Reveal Through Absence): ABSENCE needs its own
// real scroll distance, not room borrowed from WORLD or STILLNESS — both of
// which Human Director already confirmed are correct. +50vh over the prior
// cut, spent entirely on WITHHOLD + ABSENCE + REVEAL below.
const DESKTOP_TRACK_VH = 360;
const MOBILE_TRACK_VH = 300;

// WORLD — unchanged in character from the prior (approved) iteration; only
// renumbered onto the longer track below.
const CARRY_EXIT_RANGE: [number, number] = [0, 0.05];
const ROUTE_EXIT_RANGE: [number, number] = [0, 0.08];
const BREATH_RANGE: [number, number] = [0, 0.32];
const CONTEXT_RISE: [number, number] = [0.08, 0.14];
const CONTEXT_FALL: [number, number] = [0.25, 0.32];

// MEANING — WHY. Rises and holds while A-008 is still fully present; WITHHOLD
// (below) hasn't started yet, so this caption answers "why" over a world
// that hasn't begun leaving — same "sibling of the beat, not locked to a
// photograph" principle as the prior iteration, just no longer a sibling of
// a dissolve.
const MEANING_RISE: [number, number] = [0.38, 0.44];
const MEANING_FALL: [number, number] = [0.5, 0.55];

// WITHHOLD — the world leaves. A-008 fades directly to the already-dark
// field ground; nothing arrives while it goes, which is the entire point.
const WITHHOLD_RANGE: [number, number] = [0.53, 0.63];

// ABSENCE / TENSION — the non-negotiable beat. Neither A-008 nor A-009 has
// any opacity anywhere in this range: 14% of the track, ~50vh desktop,
// deliberately the same order of magnitude as STILLNESS's own hold below —
// a real hold, not a transition apologizing for itself.
const ABSENCE_RANGE: [number, number] = [0.63, 0.77];

// FINAL REVEAL — A-009 arrives once, alone, onto the field ground ABSENCE
// just held.
const REVEAL_RANGE: [number, number] = [0.77, 0.85];

// STILLNESS / RESOLUTION — caption rises once, then absolutely nothing moves
// through the remaining ~10% of the track.
const RESOLUTION_RISE: [number, number] = [0.86, 0.9];

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** 0 before `riseStart`, eases to 1 by `riseEnd`, holds, eases back to 0
 *  across `fallStart`..`fallEnd`. Shared shape for both CONTEXT and MEANING. */
function riseHoldFall(
  p: number,
  riseStart: number,
  riseEnd: number,
  fallStart: number,
  fallEnd: number,
): number {
  if (p < riseStart) return 0;
  if (p < riseEnd) return smoothstep((p - riseStart) / (riseEnd - riseStart));
  if (p < fallStart) return 1;
  if (p < fallEnd) return 1 - smoothstep((p - fallStart) / (fallEnd - fallStart));
  return 0;
}

function HybridReturn() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();

  const useScrollSequence = mounted && !prefersReducedMotion;
  const trackVh = isMobile ? MOBILE_TRACK_VH : DESKTOP_TRACK_VH;
  const objectPosition = isMobile ? OBJECT_POSITION.mobile : OBJECT_POSITION.desktop;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  const carryLabelOpacity = useTransform(scrollYProgress, (p) =>
    piecewiseLerp(p, CARRY_EXIT_RANGE, [1, 0]),
  );
  const routeLineOpacity = useTransform(scrollYProgress, (p) =>
    piecewiseLerp(p, ROUTE_EXIT_RANGE, [0.5, 0]),
  );
  const fieldBreathScale = useTransform(
    scrollYProgress,
    (p) => 1 + piecewiseLerp(p, BREATH_RANGE, [0, 0.015]),
  );
  const contextCaptionOpacity = useTransform(scrollYProgress, (p) =>
    riseHoldFall(p, CONTEXT_RISE[0], CONTEXT_RISE[1], CONTEXT_FALL[0], CONTEXT_FALL[1]),
  );
  const meaningCaptionOpacity = useTransform(scrollYProgress, (p) =>
    riseHoldFall(p, MEANING_RISE[0], MEANING_RISE[1], MEANING_FALL[0], MEANING_FALL[1]),
  );

  // WITHHOLD — A-008 fades out alone, revealing the already-dark field
  // ground beneath it. No scrim, no ground color shift: #0a0908 already
  // reads as "near-darkness," so removing the image is the entire effect.
  const fieldOpacity = useTransform(
    scrollYProgress,
    (p) => 1 - smoothstep(piecewiseLerp(p, WITHHOLD_RANGE, [0, 1])),
  );

  // FINAL REVEAL — A-009 arrives alone, on the field ground ABSENCE just
  // held. Plain smoothstep, not the old crossfade's fast/asymmetric curve:
  // fieldOpacity is already 0 for the entirety of ABSENCE_RANGE before this
  // starts, so there is no competing layer left to win against — a decisive,
  // restrained fade is the correct shape, not a rushed one.
  const productOpacity = useTransform(scrollYProgress, (p) =>
    smoothstep(piecewiseLerp(p, REVEAL_RANGE, [0, 1])),
  );

  const resolutionOpacity = useTransform(scrollYProgress, (p) =>
    piecewiseLerp(p, RESOLUTION_RISE, [0, 1]),
  );

  return (
    <div
      ref={trackRef}
      data-x03-hybrid-return-track
      className="relative"
      style={{ height: useScrollSequence ? `${trackVh}vh` : "auto" }}
    >
      {useScrollSequence ? (
        <section className="sticky top-0 isolate h-[100svh] w-full overflow-hidden">
          {/* Ground — the same near-black FieldAction ends on, held constant
              for the whole section. WITHHOLD reveals it by removing A-008;
              ABSENCE is this color and nothing else. */}
          <div
            className="absolute inset-0 z-0"
            style={{ background: FIELD_GROUND }}
            aria-hidden="true"
          />

          {/* CONSEQUENCE/CONTEXT — the exact frame FieldAction ends on, held.
              No pan, no re-crop: the substation is already in this photograph. */}
          <motion.div
            className="absolute inset-0 z-10"
            style={{ opacity: fieldOpacity, scale: fieldBreathScale }}
            aria-hidden="true"
          >
            <Image
              src={A008}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition }}
            />
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <motion.path
                d="M 74 60 C 54 78, 29 84, 6 90"
                fill="none"
                stroke={ROUTE_ACCENT}
                strokeWidth="0.35"
                strokeDasharray="1.4 1.8"
                style={{ opacity: routeLineOpacity }}
              />
            </svg>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%]"
              style={{ background: "linear-gradient(to top, rgba(10,9,8,0.72), transparent)" }}
            />
          </motion.div>

          {/* Carry — FieldAction's own closing caption, receding first. */}
          <motion.div
            className="x03-container x03-mono absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 py-8 lg:py-12"
            style={{ opacity: carryLabelOpacity }}
          >
            <p
              className="text-[11px] tracking-[0.14em] uppercase"
              style={{ color: "var(--x03-accent)" }}
            >
              Adaptive Mobility
            </p>
            <p
              className="max-w-[42ch] text-[13px] sm:text-[15px]"
              style={{ color: "var(--x03-ink-soft)" }}
            >
              Contact becomes commitment. The chosen route carries into the body.
            </p>
          </motion.div>

          {/* CONTEXT — WHERE, over the same held frame. */}
          <motion.div
            className="x03-container x03-mono absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 py-8 lg:py-12"
            style={{ opacity: contextCaptionOpacity }}
          >
            <p
              className="text-[11px] tracking-[0.14em] uppercase"
              style={{ color: "var(--x03-accent)" }}
            >
              Where
            </p>
            <p
              className="max-w-[42ch] text-[13px] sm:text-[15px]"
              style={{ color: "var(--x03-ink-soft)" }}
            >
              Live infrastructure — where access and adaptation matter as much as perception.
            </p>
          </motion.div>

          {/* MEANING — WHY, held over A-008 while it is still fully present
              (WITHHOLD hasn't started yet). A uniform scrim rides with the
              caption's own opacity purely for legibility against the
              photograph underneath. */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-20"
            style={{ opacity: meaningCaptionOpacity, background: "rgba(10,9,8,0.55)" }}
            aria-hidden="true"
          />
          <motion.div
            className="x03-container x03-mono pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 text-center"
            style={{ opacity: meaningCaptionOpacity }}
          >
            <p
              className="text-[11px] tracking-[0.14em] uppercase"
              style={{ color: "var(--x03-accent)" }}
            >
              Why
            </p>
            <p
              className="max-w-[36ch] text-[13px] sm:text-[15px]"
              style={{ color: "var(--x03-ink-soft)" }}
            >
              Understanding becomes motion. The work continues through what it finds.
            </p>
          </motion.div>

          {/* FINAL REVEAL — A-009, full-bleed on desktop: Gate 08A's explicit
              correction is that the viewport becomes A-009 rather than A-009
              being displayed inside it, and `object-cover` at this asset's
              native 16:9 is what that requires — on any desktop-class
              viewport (>=1024px, this file's own `isMobile` cutoff) the crop
              that costs is a modest slice off the left/right, never the
              top/bottom band PL-1 occupies. Mobile keeps `object-contain` in
              a small safe inset instead: the same cover crop on a portrait
              viewport would keep only the center ~25% of the frame's width,
              destroying the B3 signage and very likely the raised arm — the
              destructive crop the brief prohibits, not the letterboxing it
              tolerates. No scale/pan on this layer at all — see
              productOpacity above for why. */}
          <motion.div
            className={`absolute inset-0 z-20${isMobile ? "px-[4%] py-[10%]" : ""}`}
            style={{ opacity: productOpacity }}
          >
            <div className="relative h-full w-full">
              <Image
                src={A009}
                alt="PL-1 — Proprio, on site at the substation."
                fill
                sizes="100vw"
                className={isMobile ? "object-contain" : "object-cover"}
                style={{ objectPosition: "center" }}
              />
            </div>
          </motion.div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[22%]"
            style={{ background: "linear-gradient(to top, rgba(10,9,8,0.6), transparent)" }}
          />

          {/* Camera has been fully still since REVEAL_RANGE ended (0.85) —
              this caption is the only thing still changing through the
              track's final ~14%, and it holds flat for the last ~10%. */}
          <motion.div
            className="x03-mono pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col items-center gap-2 py-10 text-center lg:py-14"
            style={{ opacity: resolutionOpacity }}
          >
            <span
              className="rounded-[3px] border px-2 py-1 text-[11px] tracking-[0.1em] uppercase"
              style={{ borderColor: "var(--x03-accent)", color: "var(--x03-ink)" }}
            >
              Proprio — PL-1
            </span>
            <span className="text-[13px] sm:text-[14px]" style={{ color: "var(--x03-ink-soft)" }}>
              Perception, decided into motion.
            </span>
            {/* Saída da experiência (Browser-Real QA / MAJOR 2): mínima,
                no mesmo beat de STILLNESS/RESOLUTION — nunca toca A-009
                (frozen) nem os timings acima, só herda o fade já existente
                deste bloco. `pointer-events-auto` porque o container pai é
                `pointer-events-none`. */}
            <Link
              href="/work/x03"
              className="pointer-events-auto text-[11px] tracking-[0.1em] uppercase underline-offset-4 hover:underline"
              style={{ color: "var(--x03-accent)" }}
            >
              ← Voltar ao projeto
            </Link>
          </motion.div>

          {process.env.NODE_ENV !== "production" && (
            <HybridReturnDebugHud scrollYProgress={scrollYProgress} />
          )}
        </section>
      ) : (
        <HybridReturnFallback />
      )}
    </div>
  );
}

/** Reduced-motion: the four beats held as discrete, non-animated sections —
 *  no pan, no dissolve, matching FieldAction's own reduced-motion discipline.
 *  ABSENCE gets its own empty section rather than being dropped: a static
 *  dark beat between MEANING and the reveal still reads as a pause even with
 *  zero motion. */
function HybridReturnFallback() {
  return (
    <div>
      <section
        className="relative h-[90svh] w-full overflow-hidden border-t"
        style={{ borderColor: "var(--x03-hairline)" }}
      >
        <Image
          src={A008}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: OBJECT_POSITION.mobile }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%]"
          style={{ background: "linear-gradient(to top, rgba(10,9,8,0.72), transparent)" }}
        />
        <div className="x03-container x03-mono absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 py-8">
          <p
            className="text-[11px] tracking-[0.14em] uppercase"
            style={{ color: "var(--x03-accent)" }}
          >
            Where
          </p>
          <p className="max-w-[42ch] text-[13px]" style={{ color: "var(--x03-ink-soft)" }}>
            Live infrastructure — where access and adaptation matter as much as perception.
          </p>
        </div>
      </section>

      <section
        className="relative flex h-[50svh] w-full items-center justify-center border-t px-6 text-center"
        style={{ borderColor: "var(--x03-hairline)", background: FIELD_GROUND }}
      >
        <p className="x03-mono max-w-[36ch] text-[13px]" style={{ color: "var(--x03-ink-soft)" }}>
          Understanding becomes motion. The work continues through what it finds.
        </p>
      </section>

      <section
        aria-hidden="true"
        className="relative h-[35svh] w-full border-t"
        style={{ borderColor: "var(--x03-hairline)", background: FIELD_GROUND }}
      />

      <section
        className="relative flex h-[90svh] w-full flex-col items-center justify-center gap-6 border-t px-6"
        style={{ borderColor: "var(--x03-hairline)", background: FIELD_GROUND }}
      >
        <div className="relative h-[70%] w-full">
          <Image
            src={A009}
            alt="PL-1 — Proprio, on site at the substation."
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
        <div className="x03-mono flex flex-col items-center gap-2 text-center">
          <span
            className="rounded-[3px] border px-2 py-1 text-[11px] tracking-[0.1em] uppercase"
            style={{ borderColor: "var(--x03-accent)", color: "var(--x03-ink)" }}
          >
            Proprio — PL-1
          </span>
          <span className="text-[13px]" style={{ color: "var(--x03-ink-soft)" }}>
            Perception, decided into motion.
          </span>
          <Link
            href="/work/x03"
            className="text-[11px] tracking-[0.1em] uppercase underline-offset-4 hover:underline"
            style={{ color: "var(--x03-accent)" }}
          >
            ← Voltar ao projeto
          </Link>
        </div>
      </section>
    </div>
  );
}

function HybridReturnDebugHud({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", setProgress);

  const phase =
    progress < MEANING_RISE[0]
      ? "1. World — Where"
      : progress < WITHHOLD_RANGE[0]
        ? "2. Meaning — Why"
        : progress < ABSENCE_RANGE[0]
          ? "3. Withhold"
          : progress < REVEAL_RANGE[0]
            ? "4. Absence / Tension"
            : progress < RESOLUTION_RISE[0]
              ? "5. Reveal — A-009"
              : "6. Stillness / Resolution";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-2 bottom-2 z-50 font-mono text-[10px] tracking-wide text-[#d9c9a6]"
      style={{ background: "rgba(10,9,8,0.82)", padding: "4px 8px", borderRadius: 3 }}
    >
      {progress.toFixed(3)} — {phase}
    </div>
  );
}

export { HybridReturn };
