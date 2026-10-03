"use client";

import { MotionConfig, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";

import { EcosystemStage, EcosystemWorld } from "@/components/hero-ecosystem/ecosystem-stage";
import { HeroCopy, HeroLegend } from "@/components/sections/hero-copy";
import { GrainTexture } from "@/components/shared/grain-texture";
import { Section } from "@/components/ui/section";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMounted } from "@/hooks/use-mounted";
import { usePointerFine } from "@/hooks/use-pointer-fine";

/**
 * Copy da V3. Os módulos do ecossistema já nomeiam as capacidades concretas
 * (sites, landing pages, automações, dados, integrações); apoio e legenda
 * sobem um nível para não repetir a mesma lista três vezes:
 *  · apoio — a amplitude (da interface à IA) + o resultado, na mesma frase
 *    que a Home já usava;
 *  · legenda — COMO o Studio entrega, com os termos da seção Diferenciais.
 */
const DESCRIPTION =
  "Da interface à inteligência artificial: tecnologia desenvolvida para tornar sua empresa mais organizada, eficiente e preparada para crescer.";
const LEGEND = ["Código limpo", "Performance", "Escalabilidade"];

/**
 * HERO V3 — Floating Connected Ecosystem. Evolução da H2 Spatial
 * Architecture (`hero-spatial.tsx`, mantida como baseline): um Core
 * tecnológico suspenso e as capacidades do Studio flutuando à volta dele,
 * ligadas por condutos onde a energia verde VIAJA do Core até cada módulo.
 * Ver `@/components/hero-ecosystem/ecosystem-engine` para o sistema.
 *
 * Layout: desktop — texto à esquerda, ecossistema à direita (palco
 * absoluto); abaixo de `lg` — palco no fluxo entre os CTAs e a legenda, com
 * câmera e cards próprios (paridade de qualidade, não de geometria).
 *
 * Sem WebGL: o palco é DOM + Canvas 2D, então não há fallback de contexto
 * perdido nem chunk pesado — o texto (LCP) nunca espera pela cena.
 */
function HeroEcosystem() {
  const prefersReducedMotion = useReducedMotion();
  const mounted = useMounted();
  const pointerFine = usePointerFine();
  const mobile = useIsMobileViewport();
  const tablet = useMediaQuery("(min-width: 640px)");

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

  const motionActive = mounted && !prefersReducedMotion;

  // O palco só monta no primeiro idle após a hidratação: a coluna de texto
  // (LCP) pinta sem disputar o main thread com a cena — a chegada já começa
  // em silêncio, então o adiamento não se percebe.
  const [stageReady, setStageReady] = useState(false);
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setStageReady(true), { timeout: 700 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setStageReady(true), 250);
    return () => window.clearTimeout(id);
  }, []);

  // Cursor em ref (não state): o loop do palco lê sem re-render.
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

  // Clique/toque fora dos controles pede um pulso de energia ao Core.
  // `click`, não `pointerdown`: no toque só dispara em tap, nunca num scroll.
  const pulseRef = useRef(0);
  const worldRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  // Estável entre renders (o palco remonta se a lista mudar).
  const [quietRefs] = useState(() => [copyRef, legendRef]);
  function handleClick(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a, button")) return;
    pulseRef.current += 1;
  }

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
          {/* O mundo do ecossistema — atravessa a seção inteira, atrás da copy. */}
          <EcosystemWorld ref={worldRef} className="z-0" />

          {/* Atmosfera: luz verde baixa só em volta do Core (não tinge o mundo). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_40%_24%_at_50%_72%,rgba(34,181,115,0.08),transparent_70%)] lg:bg-[radial-gradient(ellipse_22%_30%_at_69%_51%,rgba(34,181,115,0.09),transparent_70%)]"
          />

          <div className="relative z-40 mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:flex-1 lg:px-10">
            <div ref={copyRef} className="relative lg:w-[42%] lg:max-w-xl">
              <HeroCopy description={DESCRIPTION} />
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative z-[1] mt-2 min-h-[clamp(260px,64vw,500px)] w-full flex-1 lg:absolute lg:inset-y-0 lg:right-0 lg:left-[36%] lg:mt-0 lg:h-auto lg:w-auto"
          >
            {stageReady && (
              <EcosystemStage
                layoutKey={mobile ? (tablet ? "tablet" : "stacked") : "wide"}
                animate={motionActive}
                paused={!heroVisible}
                pointerRef={pointerRef}
                pulseRef={pulseRef}
                worldRef={worldRef}
                quietRefs={quietRefs}
                className="absolute inset-0 lg:[mask-image:linear-gradient(90deg,transparent,#000_14%)]"
              />
            )}
          </div>

          <GrainTexture className="z-[2]" />
          <div
            aria-hidden="true"
            className="from-background pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-32 bg-gradient-to-t to-transparent"
          />

          <div
            ref={legendRef}
            className="relative z-40 mx-auto mt-6 w-full max-w-[1800px] px-4 sm:px-6 lg:mt-10 lg:px-10"
          >
            <HeroLegend items={LEGEND} />
          </div>
        </Section>
      </div>
    </MotionConfig>
  );
}

export { HeroEcosystem };
