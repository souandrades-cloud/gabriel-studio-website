"use client";

import { useReducedMotion, motion } from "framer-motion";
import { useRef } from "react";

import { useMounted } from "@/hooks/use-mounted";
import { lineReveal } from "@/lib/motion";

import { TensionLine, type Segment } from "./tension-line";

const LINE_REVEAL = lineReveal(0.12);

/**
 * O retorno completo da linha — depois do silêncio total de Pressure e do
 * reaparecimento sutil no fim do Index, aqui ela atravessa a seção inteira
 * e termina praticamente reta (§ Closing / Tension Line: "no Closing,
 * tensão controlada... a linha deve terminar reta ou quase reta"). nodeT
 * perto de 1 pousa o node bem perto do ponto final `b`, criando o "ponto
 * final perceptível" pedido — sem explosão, sem fade.
 */
const CLOSING_LINE_KEYFRAMES: Segment[] = [
  { a: { x: 6, y: 32 }, b: { x: 58, y: 27 } },
  { a: { x: 6, y: 47 }, b: { x: 92, y: 46 } },
];

function Closing() {
  const sectionRef = useRef<HTMLElement>(null);
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  /**
   * See index-catalog.tsx for the full rationale: `prefersReducedMotion`
   * resolves synchronously from `matchMedia` on the client's first render,
   * which the server can never match — branching `initial` on it directly
   * caused a real hydration mismatch. Gating behind `mounted` keeps the
   * first paint (server + first client render) identical; the jump to the
   * reduced-motion final state only happens from the next render onward.
   */
  const reducedMotionReady = mounted && prefersReducedMotion;

  return (
    <section
      ref={sectionRef}
      id="closing"
      data-x01-motion
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden py-[10vh]"
      aria-label="Closing"
    >
      <TensionLine sectionRef={sectionRef} keyframes={CLOSING_LINE_KEYFRAMES} nodeT={0.94} />

      <div className="x01-container relative z-10">
        {/* Statement — síntese, não repetição do Hero: alinhado à esquerda,
            comprimido (~55–70vw via o próprio clamp) em vez da expansão
            horizontal do Hero. "The" + "Form." dividem uma linha só a
            partir de `sm:` (3 linhas no desktop); em mobile ficam
            empilhadas (4 linhas), preservando a escala em vez de encolher
            a fonte para forçar a quebra do desktop (§ Closing / Mobile). */}
        <div>
          {(["Tension", "Holds"] as const).map((word, i) => (
            <div key={word} className="overflow-hidden">
              <motion.p
                custom={i}
                initial="hidden"
                animate={reducedMotionReady ? "visible" : undefined}
                whileInView={reducedMotionReady ? undefined : "visible"}
                viewport={{ once: true, margin: "-10% 0px" }}
                variants={LINE_REVEAL}
                transition={reducedMotionReady ? { duration: 0 } : undefined}
                className="x01-display"
                style={{ fontSize: "clamp(64px, 10.5vw, 200px)" }}
              >
                {word}
              </motion.p>
            </div>
          ))}
          {/* `gap` em `em` resolveria contra o font-size do próprio flex
              container (não o clamp() gigante aplicado inline em cada
              palavra-filha) — praticamente zero, "THE"+"FORM." colavam sem
              espaço. Corrigido com um valor em vw, que não depende de
              font-size algum. */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-[clamp(10px,1.9vw,28px)]">
            {(["The", "Form."] as const).map((word, i) => (
              <div key={word} className="overflow-hidden">
                <motion.p
                  custom={i + 2}
                  initial="hidden"
                  animate={reducedMotionReady ? "visible" : undefined}
                  whileInView={reducedMotionReady ? undefined : "visible"}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  variants={LINE_REVEAL}
                  transition={reducedMotionReady ? { duration: 0 } : undefined}
                  className="x01-display"
                  style={{ fontSize: "clamp(64px, 10.5vw, 200px)" }}
                >
                  {word}
                </motion.p>
              </div>
            ))}
          </div>
        </div>

        {/* Micro metadata editorial — nunca um footer institucional, só três
            linhas discretas (§ Micro Metadata). */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="x01-mono mt-[9vh] flex flex-col gap-1 text-[9px] tracking-[0.08em] uppercase sm:mt-[11vh] sm:text-[10px]"
          style={{ color: "var(--x01-ink-faint)" }}
        >
          <p>X01 / Tension</p>
          <p>Object Study / 001—006</p>
          <p>Gabriel Studio / 2026</p>
        </motion.div>
      </div>
    </section>
  );
}

export { Closing };
