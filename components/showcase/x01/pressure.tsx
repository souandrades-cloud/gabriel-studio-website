"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * Sem <TensionLine> aqui — de propósito, não um esquecimento. § Pressure /
 * Tension Line: "a tension line desaparece... não deixar vestígio apenas
 * por consistência visual. Aqui a tensão está no material." A ausência é o
 * ponto de virada depois de Object 001 → Veil → Pendulum, todos com linha.
 *
 * Também sem GSAP: Pressure não tem coreografia scroll-linked — é uma
 * interrupção de escala (imagem full-bleed + microtipografia), não mais um
 * capítulo com drift/parallax (§ Pressure / Função).
 */
function Pressure() {
  return (
    <section
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
        <Image
          src="/images/x01/X01-A06.png"
          alt="Material macro study for Pressure — close, cropped detail of the archive's material surface under compression."
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center"
        />
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
