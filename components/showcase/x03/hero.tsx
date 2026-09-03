"use client";

import { MotionConfig, motion } from "framer-motion";
import Image from "next/image";

import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";

/**
 * Camera move over the single A-001 photograph (PL-1 master reference) —
 * Gate 01 is FROZEN to "camera holds": no 3D model, no movement relative to
 * the product. The four shots (HOLD → REVEAL → PRESENCE → IDENTITY LOCK)
 * are just scale/translate on the image layer, stacked on top of the
 * object-cover crop — object-position stays fixed so all the camera math
 * lives in one place (this array), matching the source photo's own framing
 * (sensor head + dorsal arm upper-right, chassis nameplate center).
 *
 * Reduced motion is handled by `MotionConfig reducedMotion="user"` below,
 * not by hand-rolled branching: it disables transform animations (this
 * camera move) and snaps straight to the last keyframe, while leaving the
 * opacity fades alone — exactly "preserve the composition, skip the move."
 */
const EASE = [0.22, 1, 0.36, 1] as const;

interface Shot {
  scale: number;
  x: string;
  y: string;
}

const DESKTOP_SHOTS: Shot[] = [
  { scale: 2.15, x: "21%", y: "-19%" }, // SHOT 01 — HOLD: gripper/joint macro detail, abstract
  { scale: 1.55, x: "12%", y: "-11%" }, // SHOT 02 — REVEAL: arm + sensor head, still ambiguous
  { scale: 1.1, x: "2%", y: "-2%" }, // SHOT 03 — PRODUCT PRESENCE: full mass, tight to frame
  { scale: 1, x: "0%", y: "0%" }, // SHOT 04 — IDENTITY LOCK: resting composition
];
const DESKTOP_TIMES = [0, 0.32, 0.66, 1];
const DESKTOP_DURATION = 3.2;

const MOBILE_SHOTS: Shot[] = [
  { scale: 1.7, x: "14%", y: "-13%" },
  { scale: 1.24, x: "6%", y: "-6%" },
  { scale: 1, x: "0%", y: "0%" },
];
const MOBILE_TIMES = [0, 0.42, 1];
const MOBILE_DURATION = 2.4;

function Hero() {
  const isMobile = useIsMobileViewport();

  const shots = isMobile ? MOBILE_SHOTS : DESKTOP_SHOTS;
  const times = isMobile ? MOBILE_TIMES : DESKTOP_TIMES;
  const duration = isMobile ? MOBILE_DURATION : DESKTOP_DURATION;
  // Wordmark settles just before the camera reaches its final resting shot,
  // so identity and composition lock into place together.
  const wordmarkDelay = (isMobile ? MOBILE_TIMES[1] * MOBILE_DURATION : DESKTOP_TIMES[2] * DESKTOP_DURATION) - 0.1;

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden lg:block">
        <h1 className="sr-only">
          Proprio — PL-1, autonomous field unit. Physical AI engineered for complex industrial
          environments.
        </h1>

        {/* Image stage — the entire hero IS the photograph; no 3D, no second
            asset. Fixed height on mobile (directed crop, type stacks below);
            full-bleed on desktop (type overlays on top of it). */}
        <div className="relative h-[56svh] w-full overflow-hidden lg:absolute lg:inset-0 lg:h-full">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, ...shots[0] }}
            animate={{
              opacity: 1,
              scale: shots.map((s) => s.scale),
              x: shots.map((s) => s.x),
              y: shots.map((s) => s.y),
            }}
            transition={{ duration, times, ease: EASE, opacity: { duration: 0.6, ease: EASE } }}
          >
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

          {/* Scrims — guarantee legibility for the overlaid type regardless of
              which part of the photo (bone background vs. dark chassis) sits
              underneath at a given shot. Function, not decoration: the photo
              itself is never altered. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[26%]"
            style={{ background: "linear-gradient(to bottom, rgba(16,14,12,0.55), transparent)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
            style={{ background: "linear-gradient(to top, rgba(16,14,12,0.78), transparent)" }}
          />
        </div>

        {/* Kicker — early beat, establishes territory before the product
            resolves into focus. */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
          className="x03-container x03-mono absolute top-0 left-0 z-10 pt-6 text-[10.5px] leading-relaxed tracking-[0.14em] uppercase sm:pt-8 sm:text-[11px]"
          style={{ color: "var(--x03-ink-soft)" }}
        >
          <p>Physical AI</p>
          <p>Field Robotics</p>
        </motion.div>

        {/* Identity lock — wordmark + designation, resolves last. Overlaid on
            desktop; stacked below the image in normal flow on mobile so type
            never competes with or covers the machine's silhouette. */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: wordmarkDelay, ease: EASE }}
          className="x03-container relative z-10 flex flex-col gap-4 py-8 lg:absolute lg:inset-x-0 lg:bottom-0 lg:py-12"
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
    </MotionConfig>
  );
}

export { Hero };
