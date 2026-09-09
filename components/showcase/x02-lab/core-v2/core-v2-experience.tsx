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

import type { PerfMetrics } from "./core-v2-scene";

const CoreV2Scene = dynamic(() => import("./core-v2-scene").then((m) => m.CoreV2Scene), {
  ssr: false,
});

/** OFF por padrão (mesmo princípio do Prototype 001) — ligar manualmente
 *  para auditar fps/draw calls/triângulos durante desenvolvimento. */
const SHOW_DEBUG = false;

/** Precisam bater exatamente com SCROLL_BOUNDS em camera-rig.tsx. */
const STATE_BOUNDS = [0, 0.2, 0.42, 0.5, 0.6, 1];
const STATE_LABELS = [
  "Distance",
  "Approach",
  "Pre-Crossing",
  "Crossing",
  "First Interior",
  "Impossible Reveal",
];

/**
 * Troca no PONTO MÉDIO entre dois limiares consecutivos, não no limiar em
 * si — achado do teste visual: comparar direto contra STATE_BOUNDS[i]
 * (mesma convenção do Prototype 001) deixa o último rótulo ("Impossible
 * Reveal") inalcançável, porque o loop nunca chega a checar o último
 * limiar (t=1) isoladamente. Ponto médio garante um rótulo por trecho.
 */
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

function CoreV2Experience() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const webglSupported = useWebglSupport();
  const [contextLost, setContextLost] = useState(false);

  const motionActive = mounted && !prefersReducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  const scrollRef = useRef(0.02);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (motionActive) scrollRef.current = v;
  });

  const [scrollLabel, setScrollLabel] = useState(STATE_LABELS[0]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (motionActive) setScrollLabel(stateLabelAt(v));
  });

  // Reduced-motion (briefing, item 14): sem a travessia de scroll longa,
  // mas ainda precisa provar EXTERIOR → IMPOSSIBLE INTERIOR. Alterna entre
  // duas poses fixas (DISTANCE e IMPOSSIBLE REVEAL) por tempo — um corte
  // discreto, não um scroll simulado; o CameraRig só suaviza a transição em
  // ~300ms (mesmo easing sempre usado, ver camera-rig.tsx), o resto do
  // intervalo a câmera fica parada.
  // Estado inicial já é "Distance" — não precisa de um setState síncrono no
  // corpo do efeito (proibido pelo React Compiler); o próprio intervalo se
  // autocorrige no primeiro tick.
  const [reducedLabel, setReducedLabel] = useState<"Distance" | "Impossible Reveal">("Distance");
  useEffect(() => {
    if (motionActive) return;
    scrollRef.current = 0.02;
    let showingExterior = true;
    const id = window.setInterval(() => {
      showingExterior = !showingExterior;
      scrollRef.current = showingExterior ? 0.02 : 1;
      setReducedLabel(showingExterior ? "Distance" : "Impossible Reveal");
    }, 3600);
    return () => window.clearInterval(id);
  }, [motionActive]);

  const label = motionActive ? scrollLabel : reducedLabel;
  const hintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  const metricsRef = useRef<PerfMetrics>({ fps: 0, calls: 0, triangles: 0 });

  const showScene = mounted && webglSupported && !contextLost;
  const showFallback = mounted && (!webglSupported || contextLost);

  return (
    <div className="x02-corev2-root">
      <h1 className="sr-only">
        X02 Lab — Core V2 Spatial Prototype. Role a página para atravessar o SHELL e revelar o
        interior impossível.
      </h1>

      <div className="x02-corev2-canvas-layer">
        {showScene ? (
          <CanvasErrorBoundary fallback={<StaticFallback />}>
            <CoreV2Scene
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
        <span className="x02-lab-caption-tag">X02 — Lab 003 / Core V2</span>
        <span className="x02-lab-caption-state">{label}</span>
        {motionActive && (
          <motion.span className="x02-lab-caption-hint" style={{ opacity: hintOpacity }}>
            Scroll
          </motion.span>
        )}
      </div>

      {SHOW_DEBUG && <DebugPanel metricsRef={metricsRef} />}

      <div ref={trackRef} aria-hidden="true" style={{ height: motionActive ? "640vh" : "100vh" }} />
    </div>
  );
}

export { CoreV2Experience };
