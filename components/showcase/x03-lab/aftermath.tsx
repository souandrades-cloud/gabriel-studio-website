import type { AftermathStep } from "./state-machine";

type AftermathProps = {
  step: AftermathStep;
};

/**
 * ACT 05 — AFTERMATH. Reveal → silêncio → uma linha → replay.
 * Termina como cinema (uma linha, sem parágrafo explicativo), não como artigo.
 * Copy NÃO congelada — mesmo território do Reveal, variação final.
 */
export function Aftermath({ step }: AftermathProps) {
  return (
    <div className="x03-aftermath">
      <p
        className={"x03-aftermath-line" + (step === "line" ? " x03-aftermath-line--on" : "")}
        aria-hidden={step !== "line"}
      >
        SAME FRAME. DIFFERENT INTERVAL.
      </p>
      <span className={"x03-aftermath-replay" + (step === "line" ? " x03-aftermath-replay--on" : "")} aria-hidden="true">
        REPLAY
      </span>
    </div>
  );
}
