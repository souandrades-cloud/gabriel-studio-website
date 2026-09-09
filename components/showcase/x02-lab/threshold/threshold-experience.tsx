"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import dynamic from "next/dynamic";
import { useRef, type PointerEvent } from "react";

import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { useMounted } from "@/hooks/use-mounted";
import { usePointerFine } from "@/hooks/use-pointer-fine";
import { useWebglSupport } from "@/hooks/use-webgl-support";

const ThresholdScene = dynamic(() => import("./threshold-scene").then((m) => m.ThresholdScene), {
  ssr: false,
});

/** Deslocamento máximo de cada painel — precisa limpar o viewport por completo. */
const MAX_OFFSET_VW = 62;
/** Amplitude do microparallax da anomalia — pointer:fine only, deslocamento em px, propositalmente mínimo. */
const ANOMALY_AMPLITUDE_PX = 6;

function StaticFallback() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "rgba(201,208,204,0.45)",
      }}
      aria-hidden="true"
    >
      X02 Lab — WebGL indisponível
    </div>
  );
}

function ThresholdExperience() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const pointerFine = usePointerFine();
  const webglSupported = useWebglSupport();

  const motionActive = mounted && !prefersReducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  // Reduced-motion: fresta já aberta por completo, sem travessia animada —
  // mesmo princípio do protótipo 001 (snap para o estado final, nunca 0).
  // Transforma a MESMA motion value (nunca chama hook condicionalmente).
  const openT = useTransform(scrollYProgress, (v) => (motionActive ? v : 1));

  // Anomalia de pointer: os dois painéis deslocam-se JUNTOS pelo mesmo tanto
  // (um "espiar" pela fresta), independente da abertura por scroll — soma-se
  // ao deslocamento de abertura via calc(), nunca o substitui.
  const pointerRawX = useMotionValue(0);
  const pointerSmoothX = useSpring(pointerRawX, { stiffness: 60, damping: 20, mass: 1 });
  const pointerAnomalyActive = motionActive && pointerFine;

  const leftX = useTransform([openT, pointerSmoothX], (v) => {
    const [o, p] = v as [number, number];
    return `calc(${o * -MAX_OFFSET_VW}vw + ${p}px)`;
  });
  const rightX = useTransform([openT, pointerSmoothX], (v) => {
    const [o, p] = v as [number, number];
    return `calc(${o * MAX_OFFSET_VW}vw + ${p}px)`;
  });
  const seamOpacity = useTransform(openT, [0, 0.15], [1, 0]);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointerAnomalyActive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    pointerRawX.set(nx * ANOMALY_AMPLITUDE_PX);
  }
  function resetPointerAnomaly() {
    pointerRawX.set(0);
  }

  const showScene = mounted && webglSupported;

  return (
    <div
      className="x02-threshold-root"
      onPointerMove={pointerAnomalyActive ? handlePointerMove : undefined}
      onPointerLeave={pointerAnomalyActive ? resetPointerAnomaly : undefined}
    >
      <h1 className="sr-only">
        X02 Lab — Experimento A: Surface → Threshold. Role a página para ver a costura se abrir.
      </h1>

      <div className="x02-threshold-canvas-layer">
        {showScene ? (
          <CanvasErrorBoundary fallback={<StaticFallback />}>
            <ThresholdScene />
          </CanvasErrorBoundary>
        ) : (
          mounted && <StaticFallback />
        )}
      </div>

      {/* Anomalia: fio de luz sempre presente na costura + microparallax de
          pointer nos painéis (amplitude mínima) — a combinação sutil pedida
          no briefing, sem depender do conteúdo do Canvas ser legível numa
          fresta de poucos pixels. */}
      <motion.div
        className="x02-threshold-seam-light"
        style={{ opacity: seamOpacity }}
        aria-hidden="true"
      />

      <motion.div
        className="x02-threshold-panel x02-threshold-panel--left"
        style={{ x: leftX }}
        aria-hidden="true"
      />
      <motion.div
        className="x02-threshold-panel x02-threshold-panel--right"
        style={{ x: rightX }}
        aria-hidden="true"
      />

      <div className="x02-threshold-content">
        <div className="x02-threshold-block">
          <p className="x02-threshold-eyebrow">X02 — Lab 002 / A</p>
          <h2 className="x02-threshold-headline">Surface</h2>
        </div>
        <div className="x02-threshold-block x02-threshold-block--right">
          <p className="x02-threshold-eyebrow">Threshold</p>
          <h2 className="x02-threshold-headline">01</h2>
        </div>
      </div>

      <div ref={trackRef} aria-hidden="true" style={{ height: motionActive ? "260vh" : "100vh" }} />
    </div>
  );
}

export { ThresholdExperience };
