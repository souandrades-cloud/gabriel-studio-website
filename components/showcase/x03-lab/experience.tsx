"use client";

import { useCallback, useState } from "react";

import { Aftermath } from "./aftermath";
import { TRIAL_COUNT } from "./state-machine";
import { FrameStage } from "./frame-stage";
import { Reveal } from "./reveal";
import { useX03Experience } from "./use-x03-experience";

/**
 * X03 — INTERVAL / 03, Phase B. Root da experiência.
 *
 * Input model (GUIDED TEMPORAL FREEDOM): o estúdio controla a sequência
 * macro, os holds mínimos e o reveal (ver state-machine.ts); o visitante
 * controla o momento do corte dentro da janela válida, quanto tempo observa
 * e quando avança — um único gesto (`primary`) reaproveitado em toda a
 * experiência: clique, toque, Espaço ou Enter. Não há scrubber, não há
 * carrossel, não há botões permanentes grandes.
 */
export function X03Experience() {
  const [assetsReady, setAssetsReady] = useState(false);
  const onReady = useCallback(() => setAssetsReady(true), []);

  const { state, frame, label, announce, actionable, showHint, reducedMotion, session, primary, reset } =
    useX03Experience(assetsReady);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        reset();
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        primary();
      }
    },
    [primary, reset],
  );

  const inTrial = state.phase === "trialA" || state.phase === "trialB";
  const trialIndex = inTrial ? state.index : state.phase === "interTrial" ? state.nextIndex - 1 : -1;

  return (
    <div className="x03-root">
      <FrameStage visible={frame} onReady={onReady} />

      {state.phase === "arrival" && (
        <p className="x03-arrival-line">EVERY CUT CHANGES WHAT COMES AFTER.</p>
      )}

      {state.phase === "interTrial" && trialIndex >= 0 && (
        <span className="x03-index" aria-hidden="true">
          {String(trialIndex + 1).padStart(2, "0")} / {String(TRIAL_COUNT).padStart(2, "0")}
        </span>
      )}

      {state.phase === "reveal" && <Reveal step={state.step} session={session} reducedMotion={reducedMotion} />}

      {state.phase === "aftermath" && <Aftermath step={state.step} />}

      <span className={"x03-hint" + (showHint ? " x03-hint--on" : "")} aria-hidden="true" />

      <div
        className="x03-input-layer"
        role="button"
        tabIndex={0}
        aria-label={label || undefined}
        aria-disabled={!actionable}
        onClick={primary}
        onKeyDown={handleKeyDown}
      />

      <span className="x03-sr-only" role="status" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}
