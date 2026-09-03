"use client";

import { FRAME_SRC, TIMING } from "./constants";
import type { TrialRecord } from "./session-memory";
import type { RevealStep } from "./state-machine";

type RevealProps = {
  step: RevealStep;
  session: readonly TrialRecord[];
  reducedMotion: boolean;
};

/**
 * MOVEMENT IV — SAME. A imagem prova identidade primeiro, a copy nomeia a
 * interpretação depois.
 *
 * `grid`     — os B's da sessão reaparecem UM POR VEZ, na ordem em que
 *              ocorreram (stagger simples por índice — CLARITY > cleverness:
 *              um ritmo modulado pelos tempos do visitante já foi tentado e
 *              achado ilegível no QA humano; a ordem em que as coisas
 *              aconteceram já é, por si só, a informação que importa aqui).
 * `converge` — todos os offsets colapsam para o mesmo centro: não é um
 *              encolhimento, é uma SOBREPOSIÇÃO — como todos são
 *              literalmente `frames/B.jpg`, eles sempre couberam exatamente
 *              um sobre o outro. Uma marca de registro (ver
 *              .x03-reveal-registration) sublinha essa precisão sem virar
 *              HUD.
 * `settle`   — hold em silêncio, identidade pixel-a-pixel já visível.
 * `copy`     — duas linhas, em sequência: "SAME FRAME." (identidade, o que
 *              a imagem já provou) e só depois "DIFFERENT CONTEXT."
 *              (interpretação). Nunca ao mesmo tempo.
 *
 * Reduced motion: sem transição (ver .x03-reveal--still em x03-lab.css) —
 * os mesmos quatro estados, mas como saltos discretos, não animação.
 */
export function Reveal({ step, session, reducedMotion }: RevealProps) {
  const n = Math.max(session.length, 1);
  const spread = step === "grid";
  const showRegistration = step === "converge" || step === "settle";

  return (
    <div className={"x03-reveal" + (reducedMotion ? " x03-reveal--still" : "")}>
      <div className="x03-reveal-copies" aria-hidden="true">
        {session.map((record, i) => {
          const slot = i - (n - 1) / 2;
          const style = {
            "--x03-tx": spread ? `${slot * 30}vmin` : "0vmin",
            "--x03-ty": "0vmin",
            "--x03-scale": spread ? "1" : "2.1",
            "--x03-delay": `${i * TIMING.alignStagger}ms`,
            "--x03-opacity": step === "grid" || step === "converge" || step === "settle" || step === "copy" ? 1 : 0,
          } as React.CSSProperties;
          return <img key={record.index} src={FRAME_SRC.B} alt="" draggable={false} className="x03-reveal-copy" style={style} />;
        })}
        <div className={"x03-reveal-registration" + (showRegistration ? " x03-reveal-registration--on" : "")} />
      </div>

      {/* aria-hidden até o step "copy": opacity:0 sozinho não tira o texto da
          árvore de acessibilidade — sem isso, leitor de tela anunciaria
          "B=B" antes da revelação visual acontecer para quem vê. */}
      <p
        className={"x03-reveal-copy-text" + (step === "copy" ? " x03-reveal-copy-text--on" : "")}
        aria-hidden={step !== "copy"}
      >
        <span className="x03-reveal-copy-text-line1">SAME FRAME.</span>
        <span className="x03-reveal-copy-text-line2">DIFFERENT CONTEXT.</span>
      </p>
    </div>
  );
}
