"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import dynamic from "next/dynamic";
import { useRef, useState, type PointerEvent } from "react";

import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { usePointerFine } from "@/hooks/use-pointer-fine";
import { useWebglSupport } from "@/hooks/use-webgl-support";

import { KEYFRAMES, REDUCED_STOPS } from "./camera-rig";

const X02Scene = dynamic(() => import("./scene").then((m) => m.X02Scene), { ssr: false });

/** Curtain de SURFACE/THRESHOLD ocupa os primeiros 10% do scroll global — mesma proporção validada no Prototype 002. */
const THRESHOLD_END = 0.1;
const MAX_PANEL_OFFSET_VW = 62;
const ANOMALY_AMPLITUDE_PX = 6;
/** RESOLUTION: o DOM retorna nos últimos 6% da jornada. */
const RESOLUTION_START = 0.94;

/**
 * Comprimento total da trilha de scroll. Art Direction 001: reduzido de
 * 1600 para 1400 (briefing, "Scroll Length") — inspeção visual do
 * Prototype 001 achou DESCENT/CHAMBER com sensação de arrasto em rolagem
 * real. Corte uniforme (não mexe nas frações por estado, ver KEYFRAMES)
 * preserva a proporção de CORE (~25%) automaticamente. Ainda um ponto de
 * partida — não validado com usuários reais.
 */
const TRACK_VH = 1400;
/** Reduced-motion: trilha bem mais curta, mas NÃO zero — precisa de espaço real para navegar entre as 4 poses via scroll. */
const REDUCED_TRACK_VH = 420;

function stateLabelAt(t: number) {
  const kf = KEYFRAMES.desktop;
  for (let i = kf.length - 1; i >= 0; i--) {
    if (t >= kf[i].t) return kf[i].label;
  }
  return kf[0].label;
}

function StaticFallback() {
  return (
    <div className="x02-fallback" aria-hidden="true">
      X02 — WebGL indisponível neste dispositivo
    </div>
  );
}

function X02Experience() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const pointerFine = usePointerFine();
  const isMobile = useIsMobileViewport();
  const webglSupported = useWebglSupport();
  const [contextLost, setContextLost] = useState(false);

  const motionActive = mounted && !prefersReducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  // Reduced-motion também acompanha o scroll de verdade — o que muda é a
  // trilha (bem mais curta) e a câmera (corte duro entre 4 poses em vez de
  // curva suave, ver ReducedCameraRig). Achado desta integração: travar em
  // 0 aqui, como nos protótipos anteriores, prendia reduced-motion para
  // sempre em SURFACE, sem meio de o usuário alcançar FRACTURE/CORE/RESOLUTION.
  //
  // Em reduced-motion, `scrollRef` é pré-encaixado num dos 4 stops (não o
  // progresso bruto da trilha curta): Interior/Chamber leem o MESMO
  // `scrollRef` para decidir o que revelar, calibrados contra a linha do
  // tempo da jornada completa (ex.: interior revela perto de 0.8) — sem o
  // encaixe, a câmera pularia para CORE-reveal com a sala ainda invisível.
  const scrollRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (motionActive) {
      scrollRef.current = v;
      return;
    }
    // CORE V2 PRODUCTION INTEGRATION: REDUCED_STOPS cresceu de 4 para 5
    // (ver camera-rig.tsx) — banda recalculada para 5 fatias.
    const band = Math.min(
      REDUCED_STOPS.length - 1,
      Math.floor(Math.max(0, Math.min(1, v)) * REDUCED_STOPS.length),
    );
    scrollRef.current = REDUCED_STOPS[band];
  });

  const [label, setLabel] = useState(KEYFRAMES.desktop[0].label);
  useMotionValueEvent(scrollYProgress, "change", () => {
    // Lê o scrollRef já resolvido acima (bruto em modo motion, encaixado
    // num dos 4 stops em reduced-motion) — mesma fonte que a câmera usa,
    // então a legenda nunca fica presa em "Surface" durante reduced-motion.
    setLabel(stateLabelAt(scrollRef.current));
  });

  // Cortina SURFACE→THRESHOLD: progresso local dos primeiros 10% do scroll global.
  const openT = useTransform(scrollYProgress, (v) =>
    motionActive ? Math.min(1, v / THRESHOLD_END) : 1,
  );
  const pointerRawX = useMotionValue(0);
  const pointerSmoothX = useSpring(pointerRawX, { stiffness: 60, damping: 20, mass: 1 });
  const pointerAnomalyActive = motionActive && pointerFine;

  // RHYTHM + EVENTS (Pass 2) — SURFACE ANOMALY, "parallax impossível"
  // (briefing, lista de exemplos): as duas metades reagiam ao pointer com o
  // MESMO ganho — parallax de uma superfície física única e plana. Ganho
  // assimétrico (painel direito 1.6x o esquerdo) faz as duas metades lerem
  // como se não estivessem no mesmo plano — um erro de profundidade
  // pequeno, mas perceptível, antes de qualquer scroll. Curtain/scroll
  // (o * ±MAX_PANEL_OFFSET_VW) continua idêntico dos dois lados.
  const RIGHT_PARALLAX_GAIN = 1.6;
  const leftX = useTransform([openT, pointerSmoothX], (v) => {
    const [o, p] = v as [number, number];
    return `calc(${o * -MAX_PANEL_OFFSET_VW}vw + ${p}px)`;
  });
  const rightX = useTransform([openT, pointerSmoothX], (v) => {
    const [o, p] = v as [number, number];
    return `calc(${o * MAX_PANEL_OFFSET_VW}vw + ${p * RIGHT_PARALLAX_GAIN}px)`;
  });
  // Forma de função em vez de array em todos os transforms abaixo: o
  // achado desta integração é que a variante `useTransform(mv, [in], [out])`
  // NÃO recorta fora do intervalo neste projeto — o valor volta a crescer
  // depois do fim do range (bug real encontrado com contentOpacity, ver
  // acima). Clamp manual explícito evita qualquer ambiguidade.
  const seamOpacity = useTransform(openT, (o) => 1 - Math.min(1, Math.max(0, o / 0.3)));
  const hintOpacity = useTransform(scrollYProgress, (v) => 1 - Math.min(1, Math.max(0, v / 0.02)));
  const resolutionOpacity = useTransform(scrollYProgress, (v) =>
    Math.min(1, Math.max(0, (v - RESOLUTION_START) / (1 - RESOLUTION_START))),
  );
  // DOM×WebGL strategy (Architecture V1): SURFACE é DOM dominante, mas a
  // partir de DESCENT o WebGL assume — o headline precisa recuar, não ficar
  // preso na tela pelo resto da jornada (achado desta integração).
  const contentOpacity = useTransform(scrollYProgress, (v) => {
    const t = Math.min(1, Math.max(0, (v - THRESHOLD_END) / 0.06));
    return 1 - t;
  });

  // Pointer bruto para a câmera 3D (câmera-rig aplica seu próprio ganho e
  // decide, por estado, se usa ou ignora — ver pointerActiveAt).
  const cameraPointerRef = useRef({ x: 0, y: 0 });

  // Câmera 3D usa pointer separadamente (ver camera-rig.tsx, ganho maior);
  // este aqui só move a cortina — amplitude mínima, mesmo princípio do Prototype 002.
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointerAnomalyActive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    pointerRawX.set(nx * ANOMALY_AMPLITUDE_PX);
    cameraPointerRef.current = { x: nx, y: ny };
  }
  function resetPointer() {
    pointerRawX.set(0);
    cameraPointerRef.current = { x: 0, y: 0 };
  }

  const showScene = mounted && webglSupported && !contextLost;
  const showFallback = mounted && (!webglSupported || contextLost);

  return (
    <div
      className="x02-viewport"
      onPointerMove={pointerAnomalyActive ? handlePointerMove : undefined}
      onPointerLeave={pointerAnomalyActive ? resetPointer : undefined}
    >
      <h1 className="sr-only">
        X02 — Abyss. The Impossible Structure. Role a página para atravessar a estrutura.
      </h1>

      <div className="x02-canvas-layer">
        {showScene ? (
          <CanvasErrorBoundary fallback={<StaticFallback />}>
            <X02Scene
              active={motionActive}
              mobile={isMobile}
              scrollRef={scrollRef}
              pointerRef={cameraPointerRef}
              onContextLost={() => setContextLost(true)}
            />
          </CanvasErrorBoundary>
        ) : (
          showFallback && <StaticFallback />
        )}
      </div>

      <motion.div className="x02-seam-light" style={{ opacity: seamOpacity }} aria-hidden="true" />
      <motion.div className="x02-panel x02-panel--left" style={{ x: leftX }} aria-hidden="true" />
      <motion.div className="x02-panel x02-panel--right" style={{ x: rightX }} aria-hidden="true" />

      <motion.div className="x02-content" style={{ opacity: contentOpacity }}>
        <div className="x02-block">
          <p className="x02-eyebrow">X02 — Abyss / 02</p>
          <h2 className="x02-headline">Surface</h2>
        </div>
        <div className="x02-block x02-block--right">
          <p className="x02-eyebrow">The Impossible Structure</p>
          <h2 className="x02-headline">01</h2>
        </div>
        <p className="x02-tagline">Depth reveals what the surface cannot contain.</p>
      </motion.div>

      <motion.div
        className="x02-resolution"
        style={{ opacity: resolutionOpacity }}
        aria-hidden="true"
      >
        <div className="x02-block">
          <p className="x02-eyebrow">X02 — Abyss / 02</p>
          <h2 className="x02-headline">Surface</h2>
        </div>
        <div className="x02-block x02-block--right">
          <p className="x02-eyebrow">The Impossible Structure</p>
          <h2 className="x02-headline">01</h2>
        </div>
      </motion.div>

      <div className="x02-caption" aria-hidden="true">
        <span className="x02-caption-tag">X02 — Abyss</span>
        <span className="x02-caption-state">{label}</span>
        {motionActive && (
          <motion.span className="x02-caption-hint" style={{ opacity: hintOpacity }}>
            Scroll
          </motion.span>
        )}
      </div>

      <div
        ref={trackRef}
        aria-hidden="true"
        style={{ height: motionActive ? `${TRACK_VH}vh` : `${REDUCED_TRACK_VH}vh` }}
      />
    </div>
  );
}

export { X02Experience };
