"use client";

import { motion } from "framer-motion";
import { useRef, type CSSProperties } from "react";

import { lineReveal } from "@/lib/motion";

import { TensionLine, type Segment } from "./tension-line";

const LINE_REVEAL = lineReveal(0.1);

/**
 * Uma única trajetória, inclinação crescente ao longo dos 3 fields (Field01
 * quase horizontal → transição → Field02 diagonal evidente → Field03 tensão
 * máxima). Correction Pass 001: os keyframes anteriores saltavam de posição
 * entre amostras de scroll e liam como "linha 01/02/03" reiniciando — aqui
 * cada ponto herda o x/y aproximado do anterior, então a mesma instância de
 * TensionLine (uma só, para o Manifesto inteiro) lê como um traço contínuo.
 */
const MANIFESTO_LINE_KEYFRAMES: Segment[] = [
  { a: { x: 10, y: 8 }, b: { x: 50, y: 10 } },
  { a: { x: 16, y: 24 }, b: { x: 62, y: 32 } },
  { a: { x: 24, y: 48 }, b: { x: 74, y: 60 } },
  { a: { x: 18, y: 78 }, b: { x: 88, y: 95 } },
];

interface FieldLine {
  text: string;
  /**
   * Multiplicador de escala relativo ao clamp base do field — permite a
   * hierarquia BALANCE > IS NOT > REST / CONDITION > TENSION > IS THE
   * pedida na Correction Pass 001, em vez de um binário emphasis/normal.
   */
  scale?: number;
}

/**
 * Colunas de grid Tailwind nativas (`col-start-*`/`col-end-*`, 1–13 no
 * default theme) para o posicionamento desktop; em mobile o campo ocupa a
 * largura útil inteira e só alterna o alinhamento (§ Manifesto Mobile do
 * briefing: "não simplesmente empilhar desktop" — os offsets de coluna do
 * desktop, aplicados literalmente num viewport de 390px, empurrariam
 * BALANCE para fora da tela; achado e corrigido no QA responsivo).
 */
const DESKTOP_COLS: Record<number, string> = {
  2: "sm:col-start-2",
  3: "sm:col-start-3",
  6: "sm:col-start-6",
};
const DESKTOP_COL_ENDS: Record<number, string> = {
  9: "sm:col-end-9",
  12: "sm:col-end-12",
  13: "sm:col-end-13",
};

function Field({
  lines,
  colStart,
  colEnd,
  align = "start",
  mobileAlign,
}: {
  lines: FieldLine[];
  colStart: number;
  colEnd: number;
  align?: "start" | "end";
  /** LEFT / RIGHT / LEFT — alternância pedida para mobile, independente do desktop. */
  mobileAlign: "start" | "end";
}) {
  return (
    <div className="x01-grid x01-container">
      <div
        className={[
          "col-span-12",
          DESKTOP_COLS[colStart],
          DESKTOP_COL_ENDS[colEnd],
          mobileAlign === "end" ? "text-right" : "text-left",
          align === "end" ? "sm:text-right" : "sm:text-left",
        ].join(" ")}
      >
        {lines.map((line, i) => (
          <div key={line.text} className="overflow-y-hidden">
            <motion.p
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-15% 0px" }}
              variants={LINE_REVEAL}
              className="x01-display x01-field-line"
              style={{ "--fs": line.scale ?? 1 } as CSSProperties}
            >
              {line.text}
            </motion.p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      data-x01-motion
      className="relative isolate flex min-h-[220vh] flex-col justify-around gap-[6vh] overflow-x-hidden py-[10vh] sm:min-h-[250vh]"
      aria-label="Manifesto"
    >
      <TensionLine
        sectionRef={sectionRef}
        keyframes={MANIFESTO_LINE_KEYFRAMES}
        nodeT={0.4}
        start="top bottom"
        end="bottom bottom"
      />

      {/* Field 01 — ponto de partida, permanece próximo da escala base
          (Correction Pass 001: "pode permanecer próximo da escala atual"). */}
      <Field
        colStart={2}
        colEnd={9}
        mobileAlign="start"
        lines={[
          { text: "Order", scale: 1 },
          { text: "Is Not", scale: 1 },
          { text: "Stillness.", scale: 1.18 },
        ]}
      />
      {/* Field 02 — hierarquia explícita BALANCE > IS NOT > REST. */}
      <Field
        colStart={6}
        colEnd={13}
        align="end"
        mobileAlign="end"
        lines={[
          { text: "Balance", scale: 1.3 },
          { text: "Is Not", scale: 0.62 },
          { text: "Rest.", scale: 0.5 },
        ]}
      />
      {/* Field 03 — CONDITION é o clímax tipográfico do Manifesto:
          maior que o "Balance" do Field 02 e maior que "Tension" aqui. */}
      <Field
        colStart={3}
        colEnd={12}
        mobileAlign="start"
        lines={[
          { text: "Tension", scale: 1 },
          { text: "Is The", scale: 0.55 },
          { text: "Condition.", scale: 1.55 },
        ]}
      />
    </section>
  );
}

export { Manifesto };
