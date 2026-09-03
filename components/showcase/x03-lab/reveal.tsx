"use client";

import { useMemo } from "react";

import { FRAME_SRC, TIMING } from "./constants";
import { deriveRevealStagger, type TrialRecord } from "./session-memory";
import type { RevealStep } from "./state-machine";

type RevealProps = {
  step: RevealStep;
  session: readonly TrialRecord[];
  reducedMotion: boolean;
};

/**
 * ACT 04 — B = B. A imagem prova primeiro, a copy nomeia depois.
 *
 * `grid`     — os B's da sessão reaparecem espalhados, cada um no atraso
 *              vindo da Session Choreography (deriveRevealStagger) — não um
 *              stagger genérico, um ritmo que pertence a esta sessão.
 * `converge` — todos os offsets colapsam para o mesmo centro. Como todos são
 *              literalmente `frames/B.jpg` (mesmo arquivo, sem cache
 *              compartilhado forçado), a convergência não é um efeito —
 *              é a prova: eles sempre couberam exatamente um sobre o outro.
 * `settle`   — hold em silêncio, identidade pixel-a-pixel já visível.
 * `copy`     — só agora o texto nomeia o que a imagem já provou.
 *
 * Reduced motion: sem transição (ver .x03-reveal--still em x03-lab.css) —
 * os mesmos quatro estados, mas como saltos discretos, não animação.
 */
export function Reveal({ step, session, reducedMotion }: RevealProps) {
  const n = Math.max(session.length, 1);
  const delays = useMemo(() => deriveRevealStagger(session, TIMING.alignStagger), [session]);

  const spread = step === "grid";

  return (
    <div className={"x03-reveal" + (reducedMotion ? " x03-reveal--still" : "")}>
      <div className="x03-reveal-copies" aria-hidden="true">
        {session.map((record, i) => {
          const slot = i - (n - 1) / 2;
          const style = {
            "--x03-tx": spread ? `${slot * 24}vmin` : "0vmin",
            "--x03-ty": spread ? "0vmin" : "0vmin",
            "--x03-scale": spread ? "1" : "1.9",
            "--x03-delay": `${delays[i] ?? 0}ms`,
            "--x03-opacity": step === "grid" || step === "converge" || step === "settle" || step === "copy" ? 1 : 0,
          } as React.CSSProperties;
          return <img key={record.index} src={FRAME_SRC.B} alt="" draggable={false} className="x03-reveal-copy" style={style} />;
        })}
      </div>

      {/* aria-hidden até o step "copy": opacity:0 sozinho não tira o texto da
          árvore de acessibilidade — sem isso, leitor de tela anunciaria
          "B=B" antes da revelação visual acontecer para quem vê. */}
      <p
        className={"x03-reveal-copy-text" + (step === "copy" ? " x03-reveal-copy-text--on" : "")}
        aria-hidden={step !== "copy"}
      >
        <span>THE IMAGE NEVER CHANGED.</span>
        <span>THE INTERVAL DID.</span>
      </p>
    </div>
  );
}
