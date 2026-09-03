"use client";

import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";

import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { useDebugMode } from "@/hooks/use-debug-mode";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { useWebglSupport } from "@/hooks/use-webgl-support";

import { REDUCED_STOPS, stageLabel } from "./constants";
import { DebugOverlay } from "./debug-hud";

const X03Scene = dynamic(() => import("./scene").then((m) => m.X03Scene), { ssr: false });

/** Real runway for the scroll-driven journey — long enough for a
 *  deliberate transformation, short enough to stay a focused test, not a
 *  full showcase. Reduced-motion keeps real scroll space to move between
 *  the 5 discrete stops (never zero — a locked reduced-motion track would
 *  strand the visitor on HUMAN forever). */
const TRACK_VH = 460;
const REDUCED_TRACK_VH = 260;

function StaticFallback() {
  return (
    <div className="x03-fallback" aria-hidden="true">
      X03 — WebGL indisponível neste dispositivo
    </div>
  );
}

function X03Experience() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const webglSupported = useWebglSupport();
  const debug = useDebugMode();
  const [contextLost, setContextLost] = useState(false);
  const [label, setLabel] = useState("Human view");

  const motionActive = mounted && !prefersReducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  // Single scroll signal feeds camera, perception and route together (see
  // constants.ts) — reduced motion changes only which values `scrollRef`
  // can land on (hard cuts between REDUCED_STOPS), never what the value
  // means downstream.
  const scrollRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (motionActive) {
      scrollRef.current = v;
      setLabel(stageLabel(v));
      return;
    }
    const band = Math.min(REDUCED_STOPS.length - 1, Math.floor(Math.max(0, Math.min(1, v)) * REDUCED_STOPS.length));
    scrollRef.current = REDUCED_STOPS[band];
    setLabel(stageLabel(scrollRef.current));
  });

  const resetScroll = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== "Escape") return;
    window.scrollTo({ top: 0, behavior: motionActive ? "smooth" : "auto" });
  }, [motionActive]);

  const showScene = mounted && webglSupported && !contextLost;
  const showFallback = mounted && (!webglSupported || contextLost);

  return (
    <div className="x03-viewport" onKeyDown={resetScroll} tabIndex={-1}>
      <h1 className="sr-only">
        X03 Lab — Proprio. Perception Rig prototype. Role a página para ver o mesmo espaço mudar da
        visão humana para a interpretação da máquina.
      </h1>

      <div className="x03-canvas-layer">
        {showScene ? (
          <CanvasErrorBoundary fallback={<StaticFallback />}>
            <X03Scene
              mobile={isMobile}
              scrollRef={scrollRef}
              debug={debug}
              contextLost={contextLost}
              onContextLost={() => setContextLost(true)}
            />
          </CanvasErrorBoundary>
        ) : (
          showFallback && <StaticFallback />
        )}
      </div>

      <div className="x03-caption" aria-hidden="true">
        <span className="x03-caption-tag">X03 — Proprio / Perception Rig</span>
        <span className="x03-caption-state">{label}</span>
        {motionActive && <span className="x03-caption-hint">Scroll to perceive</span>}
      </div>

      {debug && <DebugOverlay />}

      <div
        ref={trackRef}
        aria-hidden="true"
        style={{ height: motionActive ? `${TRACK_VH}vh` : `${REDUCED_TRACK_VH}vh` }}
      />
    </div>
  );
}

export { X03Experience };
