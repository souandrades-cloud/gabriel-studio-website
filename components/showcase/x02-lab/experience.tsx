"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { usePointerFine } from "@/hooks/use-pointer-fine";
import { useWebglSupport } from "@/hooks/use-webgl-support";

import type { PerfMetrics } from "./scene";

const X02LabScene = dynamic(() => import("./scene").then((mod) => mod.X02LabScene), { ssr: false });

/**
 * Painel de métricas interno — OFF por padrão (briefing, "Debug": remover
 * antes da entrega). Ligar manualmente durante desenvolvimento para auditar
 * FPS/draw calls/triângulos; nunca `true` no protótipo entregue.
 */
const SHOW_DEBUG = false;

/** Devem bater exatamente com SCROLL_BOUNDS em camera-rig.tsx. */
const STATE_BOUNDS = [0, 0.2, 0.45, 0.55, 0.7, 1];
const STATE_LABELS = ["Distance", "Approach", "Surface", "Crossing", "Interior", "Reveal"];

function stateLabelAt(t: number) {
  for (let i = STATE_BOUNDS.length - 2; i >= 0; i--) {
    if (t >= STATE_BOUNDS[i]) return STATE_LABELS[i];
  }
  return STATE_LABELS[0];
}

/** Fallback estático: sem WebGL, contexto perdido, ou hardware sem suporte. Lab, não asset final — só evita a rota quebrar. */
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

function X02LabExperience() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const pointerFine = usePointerFine();
  const isMobile = useIsMobileViewport();
  const webglSupported = useWebglSupport();
  const [contextLost, setContextLost] = useState(false);

  // Modo motion: montado, sem reduced-motion. Em reduced-motion a câmera vai
  // direto para a pose REVEAL (ver camera-rig.tsx) — sem travessia animada.
  const motionActive = mounted && !prefersReducedMotion;

  // Track de scroll SEMPRE presente (evita corrida de timing no alvo do
  // useScroll do framer-motion); a altura é que muda: só cria distância de
  // rolagem extra quando o modo motion está ativo.
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  const scrollRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = motionActive ? v : 1;
  });

  const [scrollLabel, setScrollLabel] = useState(STATE_LABELS[0]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (motionActive) setScrollLabel(stateLabelAt(v));
  });
  // Reduced-motion vai direto para a pose REVEAL (ver camera-rig.tsx) —
  // deriva da prop em vez de sincronizar via efeito.
  const label = motionActive ? scrollLabel : STATE_LABELS[STATE_LABELS.length - 1];

  const hintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerActive = motionActive && pointerFine;

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

  const metricsRef = useRef<PerfMetrics>({ fps: 0, calls: 0, triangles: 0 });

  const showScene = mounted && webglSupported && !contextLost;
  const showFallback = mounted && (!webglSupported || contextLost);

  return (
    <div
      className="x02-lab-viewport"
      onPointerMove={pointerActive ? handlePointerMove : undefined}
      onPointerLeave={pointerActive ? resetPointer : undefined}
    >
      <h1 className="sr-only">
        X02 Lab — Impossible Structure. Protótipo técnico: role a página para atravessar a
        estrutura.
      </h1>

      <div className="x02-lab-canvas-layer">
        {showScene ? (
          <CanvasErrorBoundary fallback={<StaticFallback />}>
            <X02LabScene
              active={motionActive}
              mobile={isMobile}
              scrollRef={scrollRef}
              pointerRef={pointerRef}
              metricsRef={SHOW_DEBUG ? metricsRef : undefined}
              onContextLost={() => setContextLost(true)}
            />
          </CanvasErrorBoundary>
        ) : (
          showFallback && <StaticFallback />
        )}
      </div>

      <div className="x02-lab-caption">
        <span className="x02-lab-caption-tag">X02 — Lab 001</span>
        <span className="x02-lab-caption-state">{label}</span>
        {motionActive && (
          <motion.span className="x02-lab-caption-hint" style={{ opacity: hintOpacity }}>
            Scroll
          </motion.span>
        )}
      </div>

      {SHOW_DEBUG && <DebugPanel metricsRef={metricsRef} />}

      <div ref={trackRef} aria-hidden="true" style={{ height: motionActive ? "700vh" : "100vh" }} />
    </div>
  );
}

export { X02LabExperience };
