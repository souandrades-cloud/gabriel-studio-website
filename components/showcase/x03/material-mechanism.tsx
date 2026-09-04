"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

/**
 * Gate 02B: extends the Hero's sequence with a second, independent sticky
 * track — not a remap of Hero's own scrollYProgress. Hero stays pixel-exact
 * (its approved 160vh/130vh track and shot table are untouched), and this
 * track's opening frame (A-001 at scale 1, x 0, y 0, objectPosition
 * "center 40%") exactly matches Hero's closing frame, so the handoff across
 * the two sticky sections reads as one continuous photograph rather than a
 * section boundary. From there: push in further on A-001 toward the panel
 * region, crossfade to A-002 (matched framing, not a slide), hold on
 * A-002 with a slow continued scale (keeps the "hold" from becoming a dead
 * zone), then a diagonal clip-path reveal — anchored upper/center, growing
 * lower/lateral toward the right, following where the rear-right leg
 * actually sits relative to the chassis panel in A-001 — brings in A-003,
 * which settles to rest as the track completes.
 */

interface Shot {
  scale: number;
  x: number; // percent
  y: number; // percent
}

const PUSH_TIMELINE = [0, 0.3];
// End shot is not a guess — it's solved from the object-cover math (base
// cover scale/offset for objectPosition "center 40%") so that the framed
// region matches A-002's actual source crop (x:545,y:590,w:420,h:260 in the
// 1086x1448 master) closely enough that the crossfade doesn't ghost. Without
// this the push-in and A-002 show different content at different scale
// during the blend, which reads as a destructive double-exposure, not a
// focus pull — that was the actual QA failure this replaced.
const DESKTOP_PUSH: Shot[] = [
  { scale: 1, x: 0, y: 0 }, // matches Hero's resolved frame exactly
  { scale: 2.6, x: -50, y: -28 }, // framed to match A-002's crop region
];
// Mobile's narrow viewport crops A-001 horizontally at the base cover render
// (object-position "center 40%" on a portrait image in a much-narrower-than-
// tall container) — unlike desktop, where the full source width survives the
// base crop. Zooming toward A-002's own crop center (x:755 in source space)
// pushes past what's actually rendered and exposes empty background at the
// edge. This target (x:600) sits inside the panel nameplate but safely
// within the base-cover-visible window.
const MOBILE_PUSH: Shot[] = [
  { scale: 1, x: 0, y: 0 },
  { scale: 2, x: -17, y: 0.5 },
];

const CROSSFADE_RANGE: [number, number] = [0.24, 0.42];

const MATERIAL_SCALE_TIMELINE = [0.24, 0.62];
const DESKTOP_MATERIAL_SCALE = [1.05, 1.18];
const MOBILE_MATERIAL_SCALE = [1.05, 1.15];

const MASK_RANGE: [number, number] = [0.55, 0.85];
const MASK_RIGHT_RANGE = [-15, 130]; // % — always ahead of left, revealing toward lower/lateral-right
const MASK_LEFT_OFFSET = 30; // % behind the right edge — sets the diagonal's slant

const SETTLE_TIMELINE = [0.55, 1];
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

const MATERIAL_LABEL_IN: [number, number] = [0.3, 0.4];
const MATERIAL_LABEL_OUT: [number, number] = [0.55, 0.65];
const MECHANISM_LABEL_IN: [number, number] = [0.75, 0.85];

const DESKTOP_TRACK_VH = 170;
const MOBILE_TRACK_VH = 150;

function MaterialMechanism() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const useScrollSequence = mounted && !prefersReducedMotion;

  const push = isMobile ? MOBILE_PUSH : DESKTOP_PUSH;
  const materialScale = isMobile ? MOBILE_MATERIAL_SCALE : DESKTOP_MATERIAL_SCALE;
  const settle = isMobile ? MOBILE_SETTLE : DESKTOP_SETTLE;
  const trackVh = isMobile ? MOBILE_TRACK_VH : DESKTOP_TRACK_VH;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  // A-001 layer — continues the push-in from Hero's exact resolved frame.
  const a001Scale = useTransform(scrollYProgress, (p) =>
    piecewiseLerp(p, PUSH_TIMELINE, push.map((s) => s.scale)),
  );
  const a001X = useTransform(scrollYProgress, (p) => `${piecewiseLerp(p, PUSH_TIMELINE, push.map((s) => s.x))}%`);
  const a001Y = useTransform(scrollYProgress, (p) => `${piecewiseLerp(p, PUSH_TIMELINE, push.map((s) => s.y))}%`);
  const a001Opacity = useTransform(scrollYProgress, (p) => piecewiseLerp(p, CROSSFADE_RANGE, [1, 0]));

  // A-002 layer — crossfades in, then a slow continued scale through its hold.
  const a002Opacity = useTransform(scrollYProgress, (p) => piecewiseLerp(p, CROSSFADE_RANGE, [0, 1]));
  const a002Scale = useTransform(scrollYProgress, (p) => piecewiseLerp(p, MATERIAL_SCALE_TIMELINE, materialScale));

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

  // Chapter markers.
  const materialLabelOpacity = useTransform(scrollYProgress, (p) => {
    const in_ = piecewiseLerp(p, MATERIAL_LABEL_IN, [0, 1]);
    const out = piecewiseLerp(p, MATERIAL_LABEL_OUT, [1, 0]);
    return Math.min(in_, out);
  });
  const mechanismLabelOpacity = useTransform(scrollYProgress, (p) =>
    piecewiseLerp(p, MECHANISM_LABEL_IN, [0, 1]),
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
          <div className="absolute inset-0" data-x03-a001-layer>
            <motion.div className="absolute inset-0" style={{ scale: a001Scale, x: a001X, y: a001Y, opacity: a001Opacity }}>
              <Image
                src="/images/x03/x03-a001-pl1-master.png"
                alt=""
                aria-hidden="true"
                fill
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: "center 40%" }}
              />
            </motion.div>
          </div>

          <div className="absolute inset-0" data-x03-a002-layer>
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
          </div>

          <motion.div className="absolute inset-0" data-x03-a003-layer style={{ clipPath }}>
            <motion.div className="absolute inset-0" style={{ scale: a003Scale, x: a003X, y: a003Y }}>
              <Image
                src="/images/x03/x03-a003-pl1-mechanism-detail.png"
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
        <div>
          <StaticBeat
            src="/images/x03/x03-a002-pl1-material-macro.png"
            objectPosition={isMobile ? "38% 45%" : "center center"}
            label="Material"
          />
          <StaticBeat
            src="/images/x03/x03-a003-pl1-mechanism-detail.png"
            objectPosition={isMobile ? "55% 30%" : "62% 32%"}
            label="Mechanism"
          />
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
