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
 * Object 001 termina quase horizontal (ver HERO/OBJECT keyframes). O
 * primeiro segmento aqui herda essa inclinação rasa como eco da transição;
 * o segundo já é quase vertical (x quase constante, y percorre a maior
 * parte da altura) — a linha muda progressivamente de eixo dentro do
 * próprio capítulo, sem deformação lateral (§ Veil / Continuidade).
 */
const VEIL_LINE_KEYFRAMES: Segment[] = [
  { a: { x: 58, y: 6 }, b: { x: 66, y: 18 } },
  { a: { x: 60, y: 34 }, b: { x: 62, y: 92 } },
];

function Veil() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!mounted || prefersReducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Drift vertical mínimo — Veil é pausa, não movimento (§ Veil / Motion:
      // "vertical drift muito pequeno").
      gsap.to(imageRef.current, {
        yPercent: -3,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
    }, section);

    return () => ctx.revert();
  }, [mounted, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="veil"
      data-x01-motion
      className="relative isolate min-h-[110vh] py-[10vh] sm:min-h-[108vh] sm:py-[8vh]"
      aria-label="Object Study — Veil"
    >
      <TensionLine sectionRef={sectionRef} keyframes={VEIL_LINE_KEYFRAMES} nodeT={0.72} />

      <div className="x01-grid x01-container relative">
        {/* Imagem — cols 1–7, 88–96vh no desktop (Prototype 002 Correction
            Pass 001: a versão anterior, `w-full` de 6 tracks + object-cover,
            lia como pequena demais para o papel arquitetônico da seção).
            Largura agora vem da proporção real do asset (aspect-ratio) em
            vez de esticar para preencher a track — a lâmina cresce a partir
            da altura, não é forçada a um retângulo mais largo que o
            original. `max-w` é só uma rede de segurança para viewports
            estreitos/muito altos onde o aspect-ratio computaria uma
            largura maior que a track disponível (mesma classe de bug já
            encontrada e corrigida em Object 001 na Correction Pass 001
            anterior); object-contain (em vez de cover) garante que, mesmo
            nesse caso raro em que `max-w` entra em ação e o box deixa de
            bater exatamente com a proporção do asset, o resultado é
            letterboxing e nunca corte. No range normal de breakpoints o
            aspect-ratio bate exatamente e contain/cover seriam idênticos —
            não há crop nem letterbox perceptível. */}
        <div
          ref={imageRef}
          className="relative col-span-12 h-[62vh] w-[82vw] sm:col-start-1 sm:col-end-8 sm:h-[92vh] sm:w-auto sm:max-w-[50vw] sm:aspect-[1122/1402]"
        >
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            whileInView={{ clipPath: "inset(0 0 0% 0)" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-full overflow-hidden"
          >
            <Image
              src="/images/x01/X01-A04.png"
              alt="Object Study — Veil. A vertical plane of smoked glass and blackened steel, structure visible through its own transparency."
              fill
              sizes="(min-width: 1024px) 46vw, 82vw"
              className="object-contain object-center"
            />
          </motion.div>
        </div>

        {/* Metadata — cols 8–11, ancorada ao terço inferior da imagem em vez
            de centralizada no meio do whitespace (Correction Pass 001:
            "não deve parecer um componente flutuando sozinho"), formando
            um único campo gravitacional com o objeto. */}
        <div className="relative z-10 col-span-12 mt-10 sm:col-start-8 sm:col-end-12 sm:mt-0 sm:self-end sm:mb-[10vh]">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.5 }}
            className="x01-mono text-[10px] tracking-[0.1em] uppercase"
            style={{ color: "var(--x01-ink-soft)" }}
          >
            003
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="x01-display mt-2"
            style={{ fontSize: "clamp(40px, 6vw, 84px)" }}
          >
            Veil
          </motion.p>

          <motion.dl
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="x01-mono mt-8 flex flex-col gap-2.5 text-[10px] tracking-[0.06em] uppercase sm:text-[11px]"
          >
            <div className="flex gap-4">
              <dt className="w-20 shrink-0" style={{ color: "var(--x01-ink-faint)" }}>
                Principle
              </dt>
              <dd>Transparency / Structure</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-20 shrink-0" style={{ color: "var(--x01-ink-faint)" }}>
                Material
              </dt>
              <dd>Smoked Glass, Blackened Steel, Translucent Polymer</dd>
            </div>
          </motion.dl>
        </div>
      </div>
    </section>
  );
}

export { Veil };
