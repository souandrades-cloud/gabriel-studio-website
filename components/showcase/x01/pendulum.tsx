"use client";

import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { useMounted } from "@/hooks/use-mounted";

import { TensionLine, type Segment } from "./tension-line";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * A foto não balança (§ Pendulum / Motion, crítico) — o gesto pendular vive
 * inteiramente na Tension Line: o ponto `a` fica fixo (pivô), o ponto `b`
 * descreve um arco controlado esquerda → centro → direita → centro
 * conforme o scroll avança. É a própria linha que "balança", não o objeto.
 */
const PENDULUM_LINE_KEYFRAMES: Segment[] = [
  { a: { x: 48, y: 4 }, b: { x: 34, y: 48 } },
  { a: { x: 48, y: 4 }, b: { x: 48, y: 52 } },
  { a: { x: 48, y: 4 }, b: { x: 62, y: 48 } },
  { a: { x: 48, y: 4 }, b: { x: 48, y: 52 } },
];

function Pendulum() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!mounted || prefersReducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Translação vertical mínima (3–5vh), nunca rotação — a foto não
      // balança. "006" se move um pouco mais rápido que a imagem
      // (§ Pendulum / Motion).
      gsap.to(imageRef.current, {
        y: "-4vh",
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
      gsap.to(numberRef.current, {
        y: "-7vh",
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
    }, section);

    return () => ctx.revert();
  }, [mounted, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="pendulum"
      data-x01-motion
      className="relative isolate min-h-[100vh] overflow-x-hidden py-[6vh] sm:min-h-[98vh] sm:overflow-x-visible sm:py-0"
      aria-label="Object Study 006 — Pendulum"
    >
      <TensionLine sectionRef={sectionRef} keyframes={PENDULUM_LINE_KEYFRAMES} nodeT={0.55} />

      {/* Mobile: bloco de texto empilhado acima da imagem, fluxo normal —
          "006 atrás/acima da imagem quando seguro" (§ Pendulum Mobile);
          empilhar é a variante segura quando a sobreposição desktop não
          cabe. Desktop (`sm:`): absoluto, mesma técnica de overlap já
          aprovada no Hero (TENSION/BALANCE) — "006" fica atrás da metade
          esquerda do campo da imagem. */}
      <div className="x01-container relative z-0 sm:absolute sm:inset-0 sm:z-auto sm:px-0">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.5 }}
          className="x01-mono text-[10px] tracking-[0.1em] uppercase sm:absolute sm:top-[6vh] sm:left-[var(--x01-margin)]"
          style={{ color: "var(--x01-ink-soft)" }}
        >
          Object Study
          <br />/ 006
        </motion.p>

        <div ref={numberRef} className="-ml-1 overflow-hidden sm:absolute sm:top-[11vh] sm:left-[var(--x01-margin)] sm:m-0">
          <motion.p
            initial={{ y: "100%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="x01-display select-none"
            style={{ fontSize: "clamp(120px, 22vw, 340px)" }}
          >
            006
          </motion.p>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="x01-display mt-2 sm:absolute sm:bottom-[10vh] sm:left-[var(--x01-margin)] sm:mt-0"
          style={{ fontSize: "clamp(28px, 3.4vw, 46px)" }}
        >
          Pendulum
        </motion.p>

        <motion.dl
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="x01-mono mt-6 flex flex-col gap-2.5 text-[10px] tracking-[0.06em] uppercase sm:absolute sm:bottom-[3vh] sm:left-[var(--x01-margin)] sm:mt-0 sm:text-[11px]"
        >
          <div className="flex gap-4">
            <dt className="w-20 shrink-0" style={{ color: "var(--x01-ink-faint)" }}>
              Principle
            </dt>
            <dd>Mass / Potential Energy</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-20 shrink-0" style={{ color: "var(--x01-ink-faint)" }}>
              Material
            </dt>
            <dd>Blackened Steel, Waxed Cord</dd>
          </div>
        </motion.dl>

        {/* Imagem — Prototype 002 Correction Pass 001, crítico: object-cover
            estava recortando demais, perdendo a leitura de arco/fio/base —
            trocado por object-contain, mesmo princípio já estabelecido em
            Object 001 ("legibilidade do objeto > preencher todo o
            container"). ~60vw × ~76vh no desktop (dentro do range 54–62vw /
            70–82vh pedido). Posicionada via `left` (não `right`) para
            controlar precisamente onde a borda esquerda cai: 34vw, alguns
            vw dentro do alcance horizontal de "006" — overlap editorial
            controlado, a imagem por último no DOM garante que ela fica na
            frente. Mobile: 90–94vw, sem sobreposição. */}
        <div
          ref={imageRef}
          className="relative mt-16 ml-[3vw] h-[64vh] w-[92vw] sm:absolute sm:top-[16vh] sm:left-[34vw] sm:ml-0 sm:mt-0 sm:h-[76vh] sm:w-[60vw]"
        >
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            whileInView={{ clipPath: "inset(0 0 0% 0)" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-full overflow-hidden"
          >
            <Image
              src="/images/x01/X01-A05.png"
              alt="Object Study 006 — Pendulum. A suspended mass held in potential, its counterweight resting against a fixed support."
              fill
              sizes="(min-width: 1024px) 60vw, 92vw"
              className="object-contain object-center"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { Pendulum };
