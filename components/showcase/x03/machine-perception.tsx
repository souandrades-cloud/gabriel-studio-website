"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { usePointerFine } from "@/hooks/use-pointer-fine";
import { useWebglSupport } from "@/hooks/use-webgl-support";
import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

/**
 * Gate 04B — THE CHOICE. Fourth sticky track, picking up immediately where
 * machine-signal.tsx's MACHINE SPACE holds (SensorCavity fully resolved):
 * one continuous progression — SEE, REMEMBER, UNDERSTAND, CONSIDER, CHOOSE —
 * over the FIELD corridor (machine-perception-scene.tsx). Stops the instant
 * a decision is registered; no next chapter starts here.
 */
const MachinePerceptionScene = dynamic(
  () => import("./machine-perception-scene").then((mod) => mod.MachinePerceptionScene),
  { ssr: false },
);

const DESKTOP_TRACK_VH = 340;
const MOBILE_TRACK_VH = 300;

// Mirrors machine-perception-scene.tsx's own windows (kept independent, same
// discipline as machine-signal.tsx/machine-signal-scene.tsx's separately-
// declared timelines) — these only drive the DOM text overlays, not the
// WebGL mechanism itself.
const UNDERSTAND_COPY: [number, number] = [0.32, 0.48];
const AUTONOMY_COPY: [number, number] = [0.82, 0.97];

function MachinePerception() {
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

  const understandCopyOpacity = useTransform(scrollYProgress, (p) => {
    const in_ = piecewiseLerp(p, [UNDERSTAND_COPY[0], UNDERSTAND_COPY[0] + 0.05], [0, 1]);
    const out = piecewiseLerp(p, [UNDERSTAND_COPY[1] - 0.05, UNDERSTAND_COPY[1]], [1, 0]);
    return Math.min(in_, out);
  });
  const autonomyCopyOpacity = useTransform(scrollYProgress, (p) => {
    const in_ = piecewiseLerp(p, [AUTONOMY_COPY[0], AUTONOMY_COPY[0] + 0.04], [0, 1]);
    const out = piecewiseLerp(p, [AUTONOMY_COPY[1] - 0.03, AUTONOMY_COPY[1]], [1, 0]);
    return Math.min(in_, out);
  });

  return (
    <div
      ref={trackRef}
      data-x03-machine-perception-track
      className="relative"
      style={{ height: useScrollSequence ? `${trackVh}vh` : "auto" }}
    >
      {useScrollSequence ? (
        <section
          className="sticky top-0 isolate h-[100svh] w-full overflow-hidden"
          style={{ background: "#0a0908" }}
          onPointerMove={pointerActive ? handlePointerMove : undefined}
          onPointerLeave={pointerActive ? resetPointer : undefined}
        >
          <CanvasErrorBoundary fallback={null}>
            <MachinePerceptionScene
              mobile={isMobile}
              scrollRef={scrollRef}
              pointerRef={pointerRef}
              active
              onContextLost={() => setContextLost(true)}
            />
          </CanvasErrorBoundary>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%]"
            style={{ background: "linear-gradient(to top, rgba(10,9,8,0.72), transparent)" }}
          />

          <motion.div
            className="x03-container absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 py-8 lg:py-12"
            style={{ opacity: understandCopyOpacity }}
          >
            <p className="x03-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--x03-accent)" }}>
              Machine Perception
            </p>
            <p className="x03-mono max-w-[42ch] text-[13px] sm:text-[15px]" style={{ color: "var(--x03-ink-soft)" }}>
              PL-1 does not only map geometry. It understands the world in relation to its own body.
            </p>
          </motion.div>

          <motion.div
            className="x03-container absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 py-8 lg:py-12"
            style={{ opacity: autonomyCopyOpacity }}
          >
            <p className="x03-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--x03-accent)" }}>
              Autonomy
            </p>
            <p className="x03-mono max-w-[42ch] text-[13px] sm:text-[15px]" style={{ color: "var(--x03-ink-soft)" }}>
              Perception becomes action when the system can evaluate more than one valid future.
            </p>
          </motion.div>

          {process.env.NODE_ENV !== "production" && <PerceptionPhaseDebugHud scrollYProgress={scrollYProgress} />}
        </section>
      ) : (
        <div>
          <FieldStaticBeat label="See" />
          <FieldStaticBeat label="Consider" />
          <FieldStaticBeat label="Choose" />
        </div>
      )}
    </div>
  );
}

/**
 * Gate 04B — dev-only observability, same discipline as machine-signal.tsx's
 * BridgePhaseDebugHud: a coarse readout of which beat the current scroll
 * position falls into, statically eliminated from the production bundle.
 */
function PerceptionPhaseDebugHud({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const [progress, setProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", setProgress);

  const phase =
    progress < 0.04
      ? "0. Machine Space hold"
      : progress < 0.34
        ? "1. See (+ Remember accruing)"
        : progress < 0.5
          ? "2. Understand"
          : progress < 0.6
            ? "3. Consider — possibilities appear"
            : progress < 0.68
              ? "4. Consider — indecision hold"
              : progress < 0.76
                ? "5. Choose — eliminate (3→2)"
                : progress < 0.8
                  ? "6. Choose — hold at 2"
                  : progress < 0.9
                    ? "7. Choose — eliminate (2→1)"
                    : "8. Choose — decision held";

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

/**
 * No-WebGL / reduced-motion / context-lost fallback. Unlike machine-signal's
 * fallback (a filtered still of an existing photograph), the FIELD has no
 * photographic asset to fall back to — three discrete, CSS-only dark beats
 * carrying only the chapter label keep the same "structural, not broken"
 * degradation principle without simulating the live shader mechanism.
 */
function FieldStaticBeat({ label }: { label: string }) {
  return (
    <section className="relative h-[90svh] w-full overflow-hidden border-t" style={{ borderColor: "var(--x03-hairline)", background: "#0a0908" }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 30%, rgba(217,201,166,0.06), transparent 70%)" }}
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

export { MachinePerception };
