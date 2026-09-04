"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { usePointerFine } from "@/hooks/use-pointer-fine";
import { useWebglSupport } from "@/hooks/use-webgl-support";
import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

/**
 * Gate 03B: a third independent sticky track, same technique as Hero→
 * MaterialMechanism — its opening frame (A-003, fully resolved, no mask)
 * matches MaterialMechanism's closing frame exactly, so the handoff reads as
 * one continuous photograph. From there: A-003 crossfades to A-004 (camera
 * holds — still photography), A-004 crossfades to A-005 (same composition,
 * now carrying the wireframe read), then a matched WebGL proxy fades in
 * under A-005 and takes over — camera does one restrained forward dolly with
 * subtle parallax while the proxy's solid mass fades toward line structure,
 * landing on First Machine Signal.
 */

const MachineSignalScene = dynamic(
  () => import("./machine-signal-scene").then((mod) => mod.MachineSignalScene),
  { ssr: false },
);

// Gate 03B — Cinematic Pacing Correction: the added vh budget is spent
// almost entirely on INTERIOR → SIGNAL → MODEL (localized breathing), not
// proportionally across the whole track. MECHANISM's handoff crossfade
// below is within a vh of its pre-correction width on purpose.
const CROSSFADE_A003_A004: [number, number] = [0, 0.13];
const CROSSFADE_A004_A005: [number, number] = [0.33, 0.51];
// A-004's opacity is flat at 1 for the whole interior hold — a wheel tick
// landing inside that gap moves nothing (QA finding, first Gate 03B pass).
// A slow continuous scale across A-004's full life closes it, same fix
// material-mechanism.tsx already uses for its own material hold.
const INTERIOR_SCALE_TIMELINE: [number, number] = [0, 0.51];
const INTERIOR_SCALE: [number, number] = [1, 1.07];
// Starts before the A-004→A-005 crossfade even finishes — the model begins
// emerging while A-005 is still resolving, so photograph and computational
// structure genuinely coexist rather than handing off in sequence.
const CANVAS_FADE_IN: [number, number] = [0.45, 0.74];
const CANVAS_MOUNT_THRESHOLD = 0.33;
const CANVAS_ACTIVE_START = 0.31;

const INTERIOR_LABEL_IN: [number, number] = [0.02, 0.07];
const INTERIOR_LABEL_OUT: [number, number] = [0.44, 0.51];
const SIGNAL_LABEL_IN: [number, number] = [0.72, 0.8];

const DESKTOP_TRACK_VH = 300;
const MOBILE_TRACK_VH = 275;

function MachineSignal() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const pointerFine = usePointerFine();
  const webglSupported = useWebglSupport();
  const [contextLost, setContextLost] = useState(false);

  const useScrollSequence = mounted && !prefersReducedMotion && webglSupported && !contextLost;
  const trackVh = isMobile ? MOBILE_TRACK_VH : DESKTOP_TRACK_VH;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  const scrollRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = v;
  });

  const [canvasMounted, setCanvasMounted] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > CANVAS_MOUNT_THRESHOLD) setCanvasMounted(true);
  });

  const [canvasActive, setCanvasActive] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setCanvasActive(v > CANVAS_ACTIVE_START && v < 0.999);
  });

  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerActive = useScrollSequence && pointerFine && !isMobile;
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointerActive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
    };
  }
  function resetPointer() {
    pointerRef.current = { x: 0, y: 0 };
  }
  useEffect(() => {
    window.addEventListener("blur", resetPointer);
    return () => window.removeEventListener("blur", resetPointer);
  }, []);

  const a003Opacity = useTransform(scrollYProgress, (p) => piecewiseLerp(p, CROSSFADE_A003_A004, [1, 0]));
  const a004Opacity = useTransform(scrollYProgress, (p) => {
    const inOpacity = piecewiseLerp(p, CROSSFADE_A003_A004, [0, 1]);
    const outOpacity = piecewiseLerp(p, CROSSFADE_A004_A005, [1, 0]);
    return Math.min(inOpacity, outOpacity);
  });
  const a005Opacity = useTransform(scrollYProgress, (p) => {
    const inOpacity = piecewiseLerp(p, CROSSFADE_A004_A005, [0, 1]);
    const outOpacity = piecewiseLerp(p, CANVAS_FADE_IN, [1, 0]);
    return Math.min(inOpacity, outOpacity);
  });
  const canvasOpacity = useTransform(scrollYProgress, (p) => piecewiseLerp(p, CANVAS_FADE_IN, [0, 1]));
  const a004Scale = useTransform(scrollYProgress, (p) => piecewiseLerp(p, INTERIOR_SCALE_TIMELINE, INTERIOR_SCALE));

  const interiorLabelOpacity = useTransform(scrollYProgress, (p) => {
    const in_ = piecewiseLerp(p, INTERIOR_LABEL_IN, [0, 1]);
    const out = piecewiseLerp(p, INTERIOR_LABEL_OUT, [1, 0]);
    return Math.min(in_, out);
  });
  const signalLabelOpacity = useTransform(scrollYProgress, (p) => piecewiseLerp(p, SIGNAL_LABEL_IN, [0, 1]));

  return (
    <div
      ref={trackRef}
      data-x03-machine-signal-track
      className="relative"
      style={{ height: useScrollSequence ? `${trackVh}vh` : "auto" }}
    >
      {useScrollSequence ? (
        <section
          className="sticky top-0 isolate h-[100svh] w-full overflow-hidden"
          onPointerMove={pointerActive ? handlePointerMove : undefined}
          onPointerLeave={pointerActive ? resetPointer : undefined}
        >
          <motion.div className="absolute inset-0" data-x03-a003-handoff-layer style={{ opacity: a003Opacity }}>
            <Image
              src="/images/x03/x03-a003-pl1-mechanism-detail.png"
              alt=""
              aria-hidden="true"
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: isMobile ? "55% 30%" : "62% 32%" }}
            />
          </motion.div>

          <motion.div className="absolute inset-0" data-x03-a004-layer style={{ opacity: a004Opacity }}>
            <motion.div className="absolute inset-0" style={{ scale: a004Scale }}>
              <Image
                src="/images/x03/A-004.png"
                alt=""
                aria-hidden="true"
                fill
                loading="eager"
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: "center center" }}
              />
            </motion.div>
          </motion.div>

          <motion.div className="absolute inset-0" data-x03-a005-layer style={{ opacity: a005Opacity }}>
            <Image
              src="/images/x03/A-005.png"
              alt=""
              aria-hidden="true"
              fill
              loading="eager"
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "center center" }}
            />
          </motion.div>

          {canvasMounted && (
            <motion.div className="absolute inset-0" data-x03-signal-canvas-layer style={{ opacity: canvasOpacity }}>
              <CanvasErrorBoundary fallback={null}>
                <MachineSignalScene
                  mobile={isMobile}
                  scrollRef={scrollRef}
                  pointerRef={pointerRef}
                  active={canvasActive}
                  onContextLost={() => setContextLost(true)}
                />
              </CanvasErrorBoundary>
            </motion.div>
          )}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%]"
            style={{ background: "linear-gradient(to top, rgba(16,14,12,0.65), transparent)" }}
          />

          <motion.p
            className="x03-container x03-mono absolute bottom-0 left-0 z-10 pb-8 text-[11px] tracking-[0.14em] uppercase sm:pb-12 sm:text-[12px]"
            style={{ opacity: interiorLabelOpacity, color: "var(--x03-ink-soft)" }}
          >
            Interior
          </motion.p>
          <motion.p
            className="x03-container x03-mono absolute bottom-0 left-0 z-10 pb-8 text-[11px] tracking-[0.14em] uppercase sm:pb-12 sm:text-[12px]"
            style={{ opacity: signalLabelOpacity, color: "var(--x03-ink-soft)" }}
          >
            Signal
          </motion.p>
        </section>
      ) : (
        <div>
          <StaticBeat src="/images/x03/A-004.png" objectPosition="center center" label="Interior" />
          <StaticBeat src="/images/x03/A-005.png" objectPosition="center center" label="Signal" />
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

export { MachineSignal };
