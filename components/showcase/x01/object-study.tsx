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

/** Quase horizontal, no nível do eixo estrutural de BALANCE — sem deformação dramática (§ Object 001). */
const OBJECT_LINE_KEYFRAMES: Segment[] = [
  { a: { x: 4, y: 63 }, b: { x: 68, y: 58 } },
  { a: { x: 7, y: 67 }, b: { x: 73, y: 63 } },
];

interface MetaRow {
  label: string;
  value: string;
}

const META: MetaRow[] = [
  { label: "Object", value: "/ 001" },
  { label: "Principle", value: "Mass / Support" },
  { label: "Material", value: "Brushed Aluminium, Blackened Steel" },
  { label: "Year", value: "2026" },
  { label: "Status", value: "Concept Study" },
];

function ObjectStudy() {
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
      // Três velocidades perceptíveis: imagem mais lenta que o scroll (~0.82×),
      // "001" ligeiramente mais rápido (~1.05×), metadata praticamente parada
      // (nenhum tween nela) — ver § Object 001 / Scroll do briefing.
      gsap.to(imageRef.current, {
        yPercent: -9,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
      gsap.to(numberRef.current, {
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
    }, section);

    return () => ctx.revert();
  }, [mounted, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="object-001"
      data-x01-motion
      className="relative isolate min-h-[170vh] overflow-x-hidden py-[8vh] sm:min-h-[200vh] sm:overflow-x-visible"
      aria-label="Object Study 001 — Balance"
    >
      <TensionLine sectionRef={sectionRef} keyframes={OBJECT_LINE_KEYFRAMES} nodeT={0.58} />

      <div className="x01-grid x01-container relative">
        {/* Coluna esquerda: intro de arquivo, 001 monumental, BALANCE, metadata, copy.
            col-start/col-end só a partir de `sm:` — em mobile o texto ocupa a
            largura útil inteira em vez do offset "1/6" do desktop, que num
            viewport de 390px espremia a coluna direita (imagem) contra a
            borda e a esquerda contra a imagem (achado no QA responsivo). */}
        <div className="relative z-10 col-span-12 sm:col-start-1 sm:col-end-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.5 }}
            className="x01-mono text-[10px] tracking-[0.1em] uppercase sm:text-[11px]"
            style={{ color: "var(--x01-ink-soft)" }}
          >
            Object Study
            <br />/ 001
          </motion.p>

          <div ref={numberRef} className="-ml-1 overflow-hidden sm:-ml-2">
            <motion.p
              initial={{ y: "100%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="x01-display select-none"
              style={{ fontSize: "clamp(140px, 25vw, 400px)" }}
            >
              001
            </motion.p>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="x01-display mt-2"
            style={{ fontSize: "clamp(48px, 5vw, 72px)" }}
          >
            Balance
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 max-w-[34ch] text-[15px] leading-snug sm:text-base"
            style={{ color: "var(--x01-ink-soft)" }}
          >
            A plane held away from its apparent center. Mass becomes visible through the support
            required to contain it.
          </motion.p>

          <motion.dl
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="x01-mono mt-10 flex flex-col gap-2.5 text-[10px] tracking-[0.06em] uppercase sm:text-[11px]"
          >
            {META.map((row) => (
              <div key={row.label} className="flex gap-4">
                <dt className="w-20 shrink-0" style={{ color: "var(--x01-ink-faint)" }}>
                  {row.label}
                </dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Coluna direita: A03, fotografia completa (não cutout).
            Correction Pass 001 (Prototype 001) já resolveu o corte
            crítico com object-contain — mantido. Prototype 002 Correction
            Pass 001: a caixa era larga demais (9 tracks, ~68vw) para um
            conteúdo que o próprio contain só preenche a ~58% da largura
            (retrato 1122×1402 dentro de uma caixa mais larga que alta) —
            lia como "peça pequena isolada num vão vazio". Estreitada para
            7 tracks (~52vw, dentro do range 48–58vw pedido), começando
            exatamente onde a coluna de texto termina (col-end-6 = line 6 =
            este col-start-6): zero gap morto entre 001 e a fotografia.
            Mineral background residual nas bordas do contain continua
            aceitável (regra já estabelecida). Em mobile, largura 90vw com
            offset de 15vw permanece (overflow visual deliberado),
            independente do "6/13" que só vale a partir de `sm:`. */}
        <div
          ref={imageRef}
          className="relative col-span-12 mt-16 ml-[15vw] w-[90vw] sm:col-start-6 sm:col-end-13 sm:mt-0 sm:ml-0 sm:w-full"
        >
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            whileInView={{ clipPath: "inset(0 0 0% 0)" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[9/11] w-full overflow-hidden sm:h-[clamp(520px,74vh,880px)] sm:w-full"
          >
            <Image
              src="/images/x01/x01-a03-alternate.png"
              alt="Object Study 001 — Balance. A brushed-aluminium plane held upright by a blackened steel base and counterweight, shown in full."
              fill
              sizes="(min-width: 1024px) 52vw, 90vw"
              className="object-contain object-center"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { ObjectStudy };
