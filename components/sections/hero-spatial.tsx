"use client";

import { MotionConfig, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";

import { HeroCopy, HeroLegend } from "@/components/sections/hero-copy";
import { GrainTexture } from "@/components/shared/grain-texture";
import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { Section } from "@/components/ui/section";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { usePointerFine } from "@/hooks/use-pointer-fine";
import { useWebglSupport } from "@/hooks/use-webgl-support";
import { cn } from "@/lib/utils";

/**
 * HERO OFICIAL — Spatial Architecture. Substituiu a Digital Core 3D
 * (`hero-digital-core-3d.tsx`, preservada como CONTROL em `/proto-3d`) no
 * Gate "Hero Cinematic — H2 Production Integration 001", a partir da H2 do
 * Hero Cinematic Discovery 001 (lab em `/lab/hero-cinematic/h2-spatial`).
 *
 * A cena é FULL-BLEED atrás da tipografia em todas as larguras (não um objeto
 * num bloco ao lado) — ver `@/components/three/spatial-architecture-scene`.
 *
 * Carregamento em camadas (progressive enhancement):
 *  1. SSR: texto + `SpatialPoster` (luz no ponto de fuga, só CSS). É o que o
 *     primeiro paint mostra — nunca um bloco preto vazio, e o LCP (h1) não
 *     depende de nada do WebGL.
 *  2. Chunk WebGL carregado → canvas monta INVISÍVEL; só é revelado (fade)
 *     no primeiro frame realmente desenhado, e o relógio da cena começa ali.
 *  3. Sem WebGL, contexto perdido ou erro no Canvas → o pôster fica como
 *     composição final.
 */

const SpatialArchitectureScene = dynamic(
  () =>
    import("@/components/three/spatial-architecture-scene").then(
      (mod) => mod.SpatialArchitectureScene,
    ),
  { ssr: false },
);

/**
 * Estado inicial da cena em CSS puro: só a luz do Core no fim da galeria —
 * nenhuma geometria, para não haver dupla imagem durante o fade para o
 * canvas. A posição acompanha o ponto de fuga da cena 3D (direita do centro
 * no desktop, abaixo dos CTAs no mobile). Também é a composição final quando
 * não há WebGL.
 */
function SpatialPoster() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 [--vp-x:50%] [--vp-y:65%] lg:[--vp-x:62%] lg:[--vp-y:50%]"
    >
      <div
        className="absolute size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-2xl lg:size-[680px]"
        style={{
          left: "var(--vp-x)",
          top: "var(--vp-y)",
          background: "radial-gradient(circle, #dcefe4 0%, transparent 60%)",
        }}
      />
      {/* Brasa do Core no tamanho da abertura 3D, mais fraca que ela: no
          crossfade a luz da cena "acende" sobre a brasa, sem salto. */}
      <div
        className="absolute h-[58px] w-[92px] -translate-x-1/2 -translate-y-1/2 rounded-[2px] opacity-40 blur-[6px] lg:h-[78px] lg:w-[124px]"
        style={{
          left: "var(--vp-x)",
          top: "var(--vp-y)",
          background: "radial-gradient(ellipse, #f2fbf6 20%, #22b573 120%)",
        }}
      />
    </div>
  );
}

function HeroSpatial() {
  const prefersReducedMotion = useReducedMotion();
  const mounted = useMounted();
  const pointerFine = usePointerFine();
  const mobile = useIsMobileViewport();
  const webglSupported = useWebglSupport();
  const [contextLost, setContextLost] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const handleContextLost = useCallback(() => setContextLost(true), []);
  const handleReady = useCallback(() => setSceneReady(true), []);

  // Ref num wrapper: `Section` não expõe `ref` na tipagem.
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
      threshold: 0.02,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Onde a coluna de texto termina e a legenda começa (frações da altura da
  // Hero). No mobile a cena enquadra o Core entre os dois e corta a carga
  // verde dos pórticos acima do texto — em qualquer altura de tela (inclusive
  // com as barras do navegador visíveis).
  const textRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const textBoundsRef = useRef({ bottom: 0, legend: 0 });
  useEffect(() => {
    const hero = heroRef.current;
    const text = textRef.current;
    const legend = legendRef.current;
    if (!hero || !text || !legend || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const h = hero.getBoundingClientRect();
      if (h.height <= 0) return;
      textBoundsRef.current = {
        bottom: (text.getBoundingClientRect().bottom - h.top) / h.height,
        legend: (legend.getBoundingClientRect().top - h.top) / h.height,
      };
    });
    observer.observe(hero);
    observer.observe(text);
    return () => observer.disconnect();
  }, []);

  const motionActive = mounted && !prefersReducedMotion;

  // Scroll e cursor em refs simples (não state): o loop do R3F lê sem re-render.
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const scrollRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = motionActive ? v : 0;
  });

  const pointerRef = useRef({ x: 0, y: 0 });
  const cursorActive = pointerFine && !prefersReducedMotion;
  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const r = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: (event.clientX - r.left) / r.width - 0.5,
      y: (event.clientY - r.top) / r.height - 0.5,
    };
  }
  function handlePointerLeave() {
    pointerRef.current = { x: 0, y: 0 };
  }

  // Clique/toque fora dos controles pede um pulso de energia à cena (a cena
  // ignora pedidos durante a chegada e em rajada). `click`, não
  // `pointerdown`: no toque, só dispara em tap — nunca ao iniciar um scroll.
  const pulseRef = useRef(0);
  function handleClick(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a, button")) return;
    pulseRef.current += 1;
  }

  const showScene = mounted && webglSupported && !contextLost;

  return (
    <MotionConfig reducedMotion="user">
      <div ref={heroRef}>
        <Section
          id="hero"
          background="default"
          container={false}
          onPointerMove={cursorActive ? handlePointerMove : undefined}
          onPointerLeave={cursorActive ? handlePointerLeave : undefined}
          onClick={motionActive ? handleClick : undefined}
          className="dark relative z-0 flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24 pb-14 sm:pt-28 lg:pt-24"
        >
          <div aria-hidden="true" className="absolute inset-0 z-0">
            <SpatialPoster />
            {showScene && (
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
                  sceneReady ? "opacity-100" : "opacity-0",
                )}
              >
                <CanvasErrorBoundary fallback={null}>
                  <SpatialArchitectureScene
                    active={motionActive}
                    mobile={mobile}
                    paused={!heroVisible}
                    scrollRef={scrollRef}
                    pointerRef={pointerRef}
                    pulseRef={pulseRef}
                    textBoundsRef={textBoundsRef}
                    onContextLost={handleContextLost}
                    onReady={handleReady}
                  />
                </CanvasErrorBoundary>
              </div>
            )}
          </div>

          {/* Scrim tipográfico leve: a legibilidade é resolvida primeiro pela
              própria cena (a luz vive no fundo, os pórticos próximos são
              escuros); isto só assenta a coluna de texto. Horizontal no
              desktop, vertical no mobile (cena inteira atrás do texto) —
              no mobile ele termina ANTES do Core (~62% da altura), senão
              apaga a fonte de luz. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(10,10,10,0.72)_0%,rgba(10,10,10,0.5)_48%,transparent_60%)] lg:bg-[linear-gradient(90deg,rgba(10,10,10,0.7)_0%,rgba(10,10,10,0.4)_30%,transparent_52%)]"
          />
          <GrainTexture className="z-[2]" />
          <div
            aria-hidden="true"
            className="from-background pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40 bg-gradient-to-t to-transparent"
          />

          <div className="relative z-40 mx-auto w-full max-w-[1800px] flex-1 px-4 sm:px-6 lg:px-10">
            <div ref={textRef} className="relative lg:w-[42%] lg:max-w-xl">
              <HeroCopy />
            </div>
          </div>

          <div
            ref={legendRef}
            className="relative z-40 mx-auto mt-14 w-full max-w-[1800px] px-4 sm:px-6 lg:mt-10 lg:px-10"
          >
            <HeroLegend />
          </div>
        </Section>
      </div>
    </MotionConfig>
  );
}

export { HeroSpatial };
