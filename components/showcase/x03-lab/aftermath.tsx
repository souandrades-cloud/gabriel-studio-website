import type { AftermathStep } from "./state-machine";

type AftermathProps = {
  step: AftermathStep;
};

/**
 * MOVEMENT V — AFTERIMAGE. Reveal → silêncio → quatro beats em sequência →
 * replay. Termina como cinema (uma linha por vez, sem parágrafo
 * explicativo), não como artigo.
 *
 * As quatro linhas nunca competem por atenção — cada uma aparece só depois
 * que a anterior já assentou (delays em .x03-lab.css, espelhando
 * TIMING.aftermathLineDelays em constants.ts — mudar um sem o outro
 * desalinha o ritmo):
 *   1. "SAME FRAME."                        — eco da Reveal, não repetição vazia
 *   2. "WHAT CHANGED WAS WHAT CAME BEFORE."  — a operação nomeada, sem jargão
 *   3. "INTERVAL / 03"                       — assinatura do showcase
 *   4. "REPLAY"                              — o único afforadance visível
 *
 * Copy NÃO congelada — território explorável, não hipótese final.
 */
export function Aftermath({ step }: AftermathProps) {
  const on = step === "line";
  return (
    <div className={"x03-aftermath" + (on ? " x03-aftermath--on" : "")} aria-hidden={!on}>
      <p className="x03-aftermath-line x03-aftermath-line-1">SAME FRAME.</p>
      <p className="x03-aftermath-line x03-aftermath-line-2">WHAT CHANGED WAS WHAT CAME BEFORE.</p>
      <p className="x03-aftermath-line x03-aftermath-line-3">INTERVAL / 03</p>
      <span className="x03-aftermath-replay">REPLAY</span>
    </div>
  );
}
