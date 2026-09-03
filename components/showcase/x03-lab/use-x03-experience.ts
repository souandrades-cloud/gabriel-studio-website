"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { CALIBRATION_KEY, TIMING, TRIAL_ORDER, type FrameName } from "./constants";
import { autoDelayFor, initialState, minHoldFor, reduce, TRIAL_COUNT, type ExperienceState } from "./state-machine";
import { aHoldOf, bHoldOf, createTrialRecord, type TrialRecord } from "./session-memory";

function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

/** Frame visível no palco fora da Reveal. `null` = neutro (sem imagem). */
export function frameForState(state: ExperienceState): FrameName | null {
  switch (state.phase) {
    case "frame":
      // MOVEMENT I — B sozinha, antes de qualquer contexto A existir.
      return "B";
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

/** Fase em que a ação primária corresponde a um CORTE (vs. um avanço). */
function isCutPhase(state: ExperienceState): boolean {
  return state.phase === "calibrationA" || state.phase === "trialA";
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

/**
 * Texto visível de narrativa (Movimentos I–III) — não é o hint de input,
 * é o beat tipográfico da encenação (ver INTERVAL_LABELS/RECALL_LABEL em
 * constants.ts). `null` quando a fase atual não carrega nenhum.
 */
function overlayForState(state: ExperienceState): string | null {
  if (state.phase === "frame" && state.step === "beat") return "WHAT COMES BEFORE MATTERS.";
  if (state.phase === "interTrial" && state.label) return state.label;
  if (state.phase === "recall" && state.label) return state.label;
  return null;
}

/** Anúncio de aria-live por fase — curto, neutro, sem spoiler de B=B. */
function announceForState(state: ExperienceState): string {
  switch (state.phase) {
    case "arrival":
      return "Início.";
    case "frame":
      return state.step === "look" ? "Retrato." : "WHAT COMES BEFORE MATTERS.";
    case "calibrationA":
      return "Cena de calibração.";
    case "calibrationB":
      return "Corte.";
    case "trialA":
      return `Interval ${state.index + 1} de ${TRIAL_COUNT}.`;
    case "trialB":
      return "Corte.";
    case "recall":
      return state.label ?? "Pausa.";
    case "reveal":
      return state.step === "copy" ? "Revelação." : "Revelando.";
    case "aftermath":
      return state.step === "line" ? "Fim." : "";
    default:
      return "";
  }
}

export type HintState = { on: boolean; text: string | null };

export function useX03Experience(assetsReady: boolean) {
  const [state, dispatch] = useReducer(reduce, undefined, () => initialState(now()));
  const [hint, setHint] = useState<HintState>({ on: false, text: null });
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [isTouch] = useState(
    () => typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0),
  );
  const sessionRef = useRef<TrialRecord[]>([]);
  const [sessionSnapshot, setSessionSnapshot] = useState<TrialRecord[]>([]);
  const cutCountRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const hold = minHoldFor(state);
  const actionable = assetsReady && hold !== null;

  // Session Choreography — abre/fecha registros nos limites de cada interval.
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
      cutCountRef.current = 0;
    }
  }, [state]);

  // Conta oportunidades de CORTE encontradas nesta sessão — usado só para
  // decidir se o hint ainda precisa de texto (ver efeito de hint abaixo).
  // Mutação de ref, não setState: seguro dentro do corpo do effect.
  useEffect(() => {
    if (isCutPhase(state)) cutCountRef.current += 1;
  }, [state]);

  // AUTO transitions — controladas pelo estúdio, não pelo visitante.
  useEffect(() => {
    const delay = autoDelayFor(state);
    if (delay === null) return;
    const t = window.setTimeout(() => dispatch({ type: "AUTO", at: now() }), delay);
    return () => window.clearTimeout(t);
  }, [state]);

  // Hint mínimo — só quando a fase aceita PRIMARY e o visitante hesita.
  // Nas 2 primeiras oportunidades de CORTE, o hint vem com texto
  // ("CLICK TO CUT" / "TAP TO CUT") para ensinar a gramática; depois disso,
  // e para avanços (não-corte), é só o ponto discreto de sempre.
  useEffect(() => {
    if (!actionable) {
      return () => setHint({ on: false, text: null });
    }
    const showText = isCutPhase(state) && cutCountRef.current <= TIMING.hintTextCutBudget;
    const text = showText ? (isTouch ? "TAP TO CUT" : "CLICK TO CUT") : null;
    const t = window.setTimeout(() => setHint({ on: true, text }), TIMING.hintDelay);
    return () => {
      window.clearTimeout(t);
      setHint({ on: false, text: null });
    };
  }, [state, actionable, isTouch]);

  const primary = useCallback(() => {
    if (!actionable) return;
    dispatch({ type: "PRIMARY", at: now() });
  }, [actionable]);

  const reset = useCallback(() => dispatch({ type: "RESET", at: now() }), []);

  const frame = useMemo(() => frameForState(state), [state]);
  const label = useMemo(() => labelForState(state, actionable), [state, actionable]);
  const overlay = useMemo(() => overlayForState(state), [state]);
  const announce = useMemo(() => announceForState(state), [state]);

  return {
    state,
    frame,
    label,
    overlay,
    announce,
    actionable,
    hint,
    reducedMotion,
    session: sessionSnapshot,
    trialOrder: TRIAL_ORDER,
    primary,
    reset,
  };
}

export type { TrialRecord };
export { aHoldOf, bHoldOf };
