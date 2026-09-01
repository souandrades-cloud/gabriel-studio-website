"use client";

import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { useMounted } from "@/hooks/use-mounted";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Sem <TensionLine> aqui — de propósito, não um esquecimento. § Pressure /
 * Tension Line: "a tension line desaparece... não deixar vestígio apenas
 * por consistência visual. Aqui a tensão está no material." A ausência é o
 * ponto de virada depois de Object 001 → Veil → Pendulum, todos com linha.
 *
 * A imagem ganha um scale de compressão extremamente contido, ligado ao
 * scroll (§ Pressure / Movimento: "clímax físico... sensação de
 * compressão") — aplicado num wrapper interno, nunca no mesmo nó que o
 * framer-motion anima (o fade de entrada abaixo), para as duas libs não
 * disputarem a mesma `transform`. `overflow-hidden` no pai contém o scale
 * sem gerar overflow horizontal.
 */
function Pressure() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!mounted || prefersReducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // 1.05 → 1: a imagem se "comprime" levemente contra a moldura ao
      // longo da seção — nunca bloqueia o scroll, só altera a leitura de
      // peso/velocidade da passagem.
      gsap.fromTo(
        imageRef.current,
        { scale: 1.05 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
        },
      );
    }, section);

    return () => ctx.revert();
  }, [mounted, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="pressure"
      data-x01-motion
      className="relative isolate"
      aria-label="Material Study — Pressure"
    >
      {/* Full-bleed deliberado: fora de .x01-container, para que a imagem
          ocupe ~100vw sem as margens editoriais das outras seções — a
          "interrupção de escala" pedida (§ Pressure / Desktop). */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-5% 0px" }}
        transition={{ duration: 0.7 }}
        className="relative h-[65svh] w-full overflow-hidden sm:h-[92vh]"
      >
        <div ref={imageRef} className="relative h-full w-full">
          <Image
            src="/images/x01/X01-A06.png"
            alt="Material macro study for Pressure — close, cropped detail of the archive's material surface under compression."
            fill
            priority={false}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </motion.div>

      {/* Tipografia invertida: microescala, fora da imagem (contraste
          garantido em fundo Bone) em vez de sobreposta — sem headline
          monumental (§ Pressure / Typography). */}
      <div className="x01-container x01-mono flex flex-wrap items-baseline gap-x-8 gap-y-1 py-4 text-[9px] tracking-[0.08em] uppercase sm:text-[10px]">
        <span style={{ color: "var(--x01-ink-faint)" }}>004</span>
        <span>Pressure</span>
        <span style={{ color: "var(--x01-ink-soft)" }}>Principle — Compression / Resistance</span>
        <span style={{ color: "var(--x01-ink-soft)" }}>Material Study</span>
      </div>
    </section>
  );
}

export { Pressure };
