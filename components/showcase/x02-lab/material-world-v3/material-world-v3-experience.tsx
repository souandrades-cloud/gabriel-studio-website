"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { useWebglSupport } from "@/hooks/use-webgl-support";

import type { FormVariant } from "./frame-v3";
import type { PerfMetrics } from "./material-world-v3-scene";

const MaterialWorldV3Scene = dynamic(
  () => import("./material-world-v3-scene").then((m) => m.MaterialWorldV3Scene),
  { ssr: false },
);

/** Ligar manualmente durante QA para auditar fps/draw calls/triângulos (briefing, "Performance Budget"). */
const SHOW_DEBUG = false;

const STATE_BOUNDS = [0, 0.5, 1];
const STATE_LABELS = ["Frame Close/Mid", "Architectural Space", "Monumental View"];

function stateLabelAt(t: number) {
  for (let i = STATE_BOUNDS.length - 1; i >= 1; i--) {
    const mid = (STATE_BOUNDS[i - 1] + STATE_BOUNDS[i]) / 2;
    if (t >= mid) return STATE_LABELS[i];
  }
  return STATE_LABELS[0];
}

function StaticFallback() {
  return (
    <div className="x02-lab-fallback" aria-hidden="true">
      X02 Lab — WebGL indisponível neste dispositivo
    </div>
  );
}

function DebugPanel({ metricsRef }: { metricsRef: React.RefObject<PerfMetrics> }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const id = window.setInterval(() => {
      const m = metricsRef.current;
      setText(`fps ${m.fps}\ncalls ${m.calls}\ntris ${m.triangles}`);
    }, 250);
    return () => window.clearInterval(id);
  }, [metricsRef]);
  return (
    <div className="x02-lab-debug" aria-hidden="true">
      {text}
    </div>
  );
}

function MaterialWorldV3Experience() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const webglSupported = useWebglSupport();
  const [contextLost, setContextLost] = useState(false);
  const [variant, setVariant] = useState<FormVariant>("A");

  const motionActive = mounted && !prefersReducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  const scrollRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (motionActive) scrollRef.current = v;
  });

  const [scrollLabel, setScrollLabel] = useState(STATE_LABELS[0]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (motionActive) setScrollLabel(stateLabelAt(v));
  });

  // Reduced-motion: alterna entre as 3 poses por tempo, mesmo princípio do
  // CORE V2 lab (corte discreto, não scroll simulado).
  const [reducedIndex, setReducedIndex] = useState(0);
  useEffect(() => {
    if (motionActive) return;
    scrollRef.current = 0;
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % 3;
      scrollRef.current = STATE_BOUNDS[i];
      setReducedIndex(i);
    }, 3600);
    return () => window.clearInterval(id);
  }, [motionActive]);

  const label = motionActive ? scrollLabel : STATE_LABELS[reducedIndex];
  const hintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  const metricsRef = useRef<PerfMetrics>({ fps: 0, calls: 0, triangles: 0 });

  const showScene = mounted && webglSupported && !contextLost;
  const showFallback = mounted && (!webglSupported || contextLost);

  return (
    <div className="x02-materialv3-root">
      <h1 className="sr-only">
        X02 Lab — Material World V3. Estudo de linguagem formal e material para a arquitetura
        impossível do ABYSS.
      </h1>

      <div className="x02-materialv3-canvas-layer">
        {showScene ? (
          <CanvasErrorBoundary fallback={<StaticFallback />}>
            <MaterialWorldV3Scene
              variant={variant}
              mobile={isMobile}
              scrollRef={scrollRef}
              metricsRef={SHOW_DEBUG ? metricsRef : undefined}
              onContextLost={() => setContextLost(true)}
            />
          </CanvasErrorBoundary>
        ) : (
          showFallback && <StaticFallback />
        )}
      </div>

      <div className="x02-lab-caption">
        <span className="x02-lab-caption-tag">X02 — Lab 004 / Material World V3</span>
        <span className="x02-lab-caption-state">
          {label} · Variant {variant}
        </span>
        {motionActive && (
          <motion.span className="x02-lab-caption-hint" style={{ opacity: hintOpacity }}>
            Scroll
          </motion.span>
        )}
      </div>

      <div className="x02-materialv3-variant-toggle">
        <button
          type="button"
          className={variant === "A" ? "is-active" : undefined}
          onClick={() => setVariant("A")}
        >
          A — Chamfered Monolithic
        </button>
        <button
          type="button"
          className={variant === "B" ? "is-active" : undefined}
          onClick={() => setVariant("B")}
        >
          B — Monolithic + Curve
        </button>
      </div>

      {SHOW_DEBUG && <DebugPanel metricsRef={metricsRef} />}

      <div ref={trackRef} aria-hidden="true" style={{ height: motionActive ? "360vh" : "100vh" }} />
    </div>
  );
}

export { MaterialWorldV3Experience };
