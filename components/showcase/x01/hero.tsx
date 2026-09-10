"use client";

import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { useMounted } from "@/hooks/use-mounted";

import { TensionLine, type Segment } from "./tension-line";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Quase horizontal, saindo da área tipográfica e atravessando o campo
 * central até se aproximar do eixo estrutural de BALANCE — o endpoint `b`
 * mira perto do centro do objeto (agora ~70%/56%, ver Correction Pass 001
 * §Hero) em vez de parar antes dele.
 */
const HERO_LINE_KEYFRAMES: Segment[] = [
  { a: { x: 13, y: 64 }, b: { x: 66, y: 60 } },
  { a: { x: 8, y: 50 }, b: { x: 70, y: 52 } },
];

function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const tensionRef = useRef<HTMLHeadingElement>(null);
  const balanceRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  /**
   * See index-catalog.tsx / closing.tsx for the full rationale: gating
   * behind `mounted` keeps server + first client paint identical, so the
   * jump to the reduced-motion instant state only happens from the next
   * render onward (no hydration mismatch).
   */
  const reducedMotionReady = mounted && prefersReducedMotion;

  useEffect(() => {
    if (!mounted || prefersReducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.6 },
        defaults: { ease: "none" },
      });
      // 0–15%: estático. 15–65%: TENSION sobe mais que BALANCE. 65–100%: TENSION sai pelo topo.
      tl.to(tensionRef.current, { y: "-12vh", duration: 0.5 }, 0.15)
        .to(balanceRef.current, { y: "-5vh", duration: 0.5 }, 0.15)
        .to(tensionRef.current, { autoAlpha: 0, duration: 0.35 }, 0.65);
    }, section);

    return () => ctx.revert();
  }, [mounted, prefersReducedMotion]);

  /**
   * § Microinteração: reação de poucos pixels ao mouse, só desktop
   * (`pointer: fine`, nunca em touch) e só fora de reduced-motion. `x` fica
   * livre para isso porque o scroll-linked tween acima só escreve `y` — GSAP
   * combina os dois numa única transform sem conflito. Sem cursor
   * customizado, glow, trail ou magnetismo (proibido no briefing).
   */
  useEffect(() => {
    if (!mounted || prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const moveBalance = gsap.quickTo(balanceRef.current, "x", {
      duration: 0.7,
      ease: "power3.out",
    });
    const moveTension = gsap.quickTo(tensionRef.current, "x", {
      duration: 0.9,
      ease: "power3.out",
    });

    const handleMove = (event: MouseEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      moveBalance(nx * 10);
      moveTension(nx * -5);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mounted, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-x01-motion
      className="relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden"
    >
      <div aria-hidden="true" className="x01-grain pointer-events-none absolute inset-0" />

      {/* Nav + metadata agrupados num único item flex — precisam ficar
          juntos no topo. Sem o wrapper, `justify-between` no <section>
          trataria nav e metadata como dois itens separados e distribuiria a
          metadata para o meio vertical da viewport em vez de logo abaixo
          do nav (bug encontrado e corrigido durante o QA visual). */}
      <div>
        {/* Nav — só os dois itens pedidos, sem menu convencional. */}
        <div className="x01-container x01-mono relative z-30 flex items-center justify-between pt-6 text-[11px] tracking-[0.08em] uppercase sm:pt-8">
          <Link href="/work/x01/experience" className="x01-focus rounded-sm">
            Tension / 01
          </Link>
          <Link
            href="#index"
            className="x01-focus rounded-sm"
            style={{ color: "var(--x01-ink-soft)" }}
          >
            Index
          </Link>
        </div>

        {/* Metadata editorial — abaixo do nav, mesmas duas colunas. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotionReady ? { duration: 0 } : { duration: 0.5, delay: 0.9 }}
          className="x01-container x01-mono relative z-30 mt-3 flex items-start justify-between text-[10.5px] leading-relaxed tracking-[0.06em] uppercase sm:mt-4 sm:text-[12px]"
        >
          <div style={{ color: "var(--x01-ink-soft)" }}>
            <p>Archive of</p>
            <p>Unstable Objects</p>
            <p className="mt-1" style={{ color: "var(--x01-ink-faint)" }}>
              2026
            </p>
          </div>
          <p style={{ color: "var(--x01-ink-soft)" }}>001—008 / Object Studies</p>
        </motion.div>
      </div>

      {/* TENSION — protagonista tipográfica, clipada nas duas pontas. Reveal
          curto via clip-path (entrance), depois GSAP assume o deslocamento
          de scroll no mesmo nó — a animação de entrada já terminou e não
          volta a escrever nesse elemento, então não há disputa entre as
          duas libs (ver comentário na seção SCROLL do briefing). Delay 0.55:
          revela DEPOIS de BALANCE se assentar, seguindo a sequência
          cinematográfica pedida (node → linha → BALANCE → TENSION →
          estabilização, § Hero / Initial Load). */}
      <motion.div
        ref={tensionRef}
        aria-hidden="true"
        data-x01-motion
        initial={{ clipPath: "inset(0 0 0 100%)" }}
        animate={{ clipPath: "inset(0 0 0 0%)" }}
        transition={
          reducedMotionReady
            ? { duration: 0 }
            : { duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }
        }
        className="x01-display pointer-events-none absolute top-[30vh] left-[-1vw] z-10 whitespace-nowrap select-none sm:top-[33vh]"
        style={{ fontSize: "clamp(96px, 20vw, 328px)" }}
      >
        Tension
      </motion.div>
      {/* H1 real e acessível — a versão gigante acima é puramente decorativa/clipada. */}
      <h1 className="sr-only">Tension / 01 — Archive of Unstable Objects</h1>

      <TensionLine sectionRef={sectionRef} keyframes={HERO_LINE_KEYFRAMES} nodeT={0.86} entrance />

      {/* BALANCE — aumentado e movido para dentro da composição (Correction
          Pass 001 §Hero): altura 66–74vh, centro X ~68–72vw, para que a
          placa invada o território de TENSION em vez de ficar isolada na
          borda. Largura vem de `aspect-[1122/1402]` (proporção real do
          asset) em vez de um valor fixo — nunca deixa espaço vazio dentro
          da própria caixa nem distorce o objeto. */}
      <motion.div
        ref={balanceRef}
        data-x01-motion
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotionReady
            ? { duration: 0 }
            : { duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }
        }
        className="pointer-events-none absolute right-[6vw] bottom-[5vh] z-20 aspect-[1122/1402] h-[66vh] sm:right-[23.5vw] sm:h-[74vh]"
      >
        <Image
          src="/images/x01/x01-a02-isolated.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 60vw"
          className="object-contain object-bottom"
        />
      </motion.div>

      <div className="x01-container x01-mono relative z-30 pb-6 text-[10.5px] tracking-[0.08em] uppercase sm:pb-8 sm:text-[12px]">
        <p style={{ color: "var(--x01-ink-soft)" }}>Scroll / 01</p>
      </div>
    </section>
  );
}

export { Hero };
