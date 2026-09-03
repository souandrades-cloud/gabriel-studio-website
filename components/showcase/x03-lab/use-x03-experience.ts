"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { CALIBRATION_KEY, TRIAL_ORDER, type FrameName } from "./constants";
import { autoDelayFor, initialState, minHoldFor, reduce, TRIAL_COUNT, type ExperienceState } from "./state-machine";
import { aHoldOf, bHoldOf, createTrialRecord, type TrialRecord } from "./session-memory";

function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

/** Frame visível no palco durante fases fora da Reveal. `null` = neutro (sem imagem). */
export function frameForState(state: ExperienceState): FrameName | null {
  switch (state.phase) {
    case "calibrationA":
      return CALIBRATION_KEY;
    case "calibrationB":
    case "trialB":
      return "B";
    case "trialA":
      return state.key;
    default:
      return null;
  }
}

/** Rótulo acessível da ação primária corrente. Neutro — nunca nomeia B=B. */
function labelForState(state: ExperienceState, actionable: boolean): string {
  if (!actionable) return "";
  switch (state.phase) {
    case "arrival":
      return "Começar";
    case "calibrationA":
    case "trialA":
      return "Cortar";
    case "calibrationB":
    case "trialB":
      return "Avançar";
    case "reveal":
      return "Continuar";
    case "aftermath":
      return state.step === "line" ? "Repetir" : "";
    default:
      return "";
  }
}

/** Anúncio de aria-live por fase — curto, neutro, sem spoiler. */
function announceForState(state: ExperienceState): string {
  switch (state.phase) {
    case "arrival":
      return "Início.";
    case "calibrationA":
      return "Cena de calibração.";
    case "calibrationB":
      return "Corte.";
    case "trialA":
      return `Cena ${state.index + 1} de ${TRIAL_COUNT}.`;
    case "trialB":
      return "Corte.";
    case "recall":
      return "Pausa.";
    case "reveal":
      return state.step === "copy" ? "Revelação." : "Revelando.";
    case "aftermath":
      return state.step === "line" ? "Fim." : "";
    default:
      return "";
  }
}

export function useX03Experience(assetsReady: boolean) {
  const [state, dispatch] = useReducer(reduce, undefined, () => initialState(now()));
  const [showHint, setShowHint] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const sessionRef = useRef<TrialRecord[]>([]);
  const [sessionSnapshot, setSessionSnapshot] = useState<TrialRecord[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const hold = minHoldFor(state);
  const actionable = assetsReady && hold !== null;

  // Session Choreography — abre/fecha registros nos limites de cada trial.
  // Ver session-memory.ts: nunca sai do dispositivo, nunca vira analytics.
  useEffect(() => {
    if (state.phase === "trialA") {
      sessionRef.current = [...sessionRef.current, createTrialRecord(state.key, state.index, state.enteredAt)];
      setSessionSnapshot(sessionRef.current);
    }
    if (state.phase === "trialB") {
      sessionRef.current = sessionRef.current.map((r) => (r.index === state.index ? { ...r, cutAt: state.enteredAt, bEnteredAt: state.enteredAt } : r));
      setSessionSnapshot(sessionRef.current);
    }
    if (state.phase === "interTrial" || state.phase === "recall") {
      const last = sessionRef.current[sessionRef.current.length - 1];
      if (last && last.advancedAt == null) {
        sessionRef.current = sessionRef.current.map((r) => (r === last ? { ...r, advancedAt: state.enteredAt } : r));
        setSessionSnapshot(sessionRef.current);
      }
    }
    if (state.phase === "arrival") {
      sessionRef.current = [];
      setSessionSnapshot([]);
    }
  }, [state]);

  // AUTO transitions — controladas pelo estúdio, não pelo visitante.
  useEffect(() => {
    const delay = autoDelayFor(state);
    if (delay === null) return;
    const t = window.setTimeout(() => dispatch({ type: "AUTO", at: now() }), delay);
    return () => window.clearTimeout(t);
  }, [state]);

  // Hint mínimo — só quando a fase aceita PRIMARY e o visitante hesita.
  useEffect(() => {
    const t = actionable ? window.setTimeout(() => setShowHint(true), 2600) : null;
    return () => {
      if (t !== null) window.clearTimeout(t);
      setShowHint(false);
    };
  }, [state, actionable]);

  const primary = useCallback(() => {
    if (!actionable) return;
    dispatch({ type: "PRIMARY", at: now() });
  }, [actionable]);

  const reset = useCallback(() => dispatch({ type: "RESET", at: now() }), []);

  const frame = useMemo(() => frameForState(state), [state]);
  const label = useMemo(() => labelForState(state, actionable), [state, actionable]);
  const announce = useMemo(() => announceForState(state), [state]);

  return {
    state,
    frame,
    label,
    announce,
    actionable,
    showHint,
    reducedMotion,
    session: sessionSnapshot,
    trialOrder: TRIAL_ORDER,
    primary,
    reset,
  };
}

export type { TrialRecord };
export { aHoldOf, bHoldOf };
