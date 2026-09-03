import { CALIBRATION_KEY, INTERVAL_LABELS, RECALL_LABEL, TIMING, TRIAL_ORDER, type FrameName } from "./constants";

/**
 * STATE MACHINE — X03 INTERVAL, Phase B, Creative Direction Iteration 01.
 *
 * Cinco movimentos, não seis atos de página:
 *   I   THE FRAME       — `frame`            (B sozinha, sem contexto)
 *   II  BEFORE           — `calibrationA/B`   (A0 → corte → B, ensina a gramática)
 *   III INTERVALS        — `interTrial` + `trialA/B` × N (o corpo da experiência)
 *   IV  SAME              — `reveal`          (a prova: os B convergem em um)
 *   V   AFTERIMAGE        — `aftermath`        (silêncio, a linha final, replay)
 *
 * Um único reducer tipado, sem booleans soltos. Cada fase sabe exatamente
 * que frame mostrar (`frameForState` em use-x03-experience) e se aceita a
 * ação PRIMARY imediatamente ou só depois de um hold mínimo.
 *
 * Tabela de transições relevantes (STATE → EVENT → NEXT · SIDE EFFECT):
 *
 *   arrival           → PRIMARY              → frame(look)     · cutTo(neutral)
 *   frame(look)       → AUTO (timer)         → frame(beat)     · cutTo(B) — B já está visível desde look
 *   frame(beat)       → AUTO (timer)         → calibrationA    · cutTo(A0)
 *   calibrationA      → PRIMARY (≥hold)      → calibrationB    · cutTo(B)
 *   calibrationB      → PRIMARY (≥hold)      → interTrial(0, label:"BEFORE.")
 *   interTrial(i)     → AUTO (timer)         → trialA(i)       · cutTo(TRIAL_ORDER[i]) · session: open record
 *   trialA(i)         → PRIMARY (≥hold)      → trialB(i)       · cutTo(B) · session: cutAt
 *   trialB(i)         → PRIMARY (≥hold)      → interTrial(i+1, label?) se i+1<N, senão recall(label:"ONCE MORE.")
 *   recall            → AUTO (timer)         → reveal(grid)    · cutTo(neutral)
 *   reveal(grid)      → AUTO (timer)         → reveal(converge)
 *   reveal(converge)  → AUTO (timer)         → reveal(settle)
 *   reveal(settle)    → AUTO (timer)         → reveal(copy)
 *   reveal(copy)      → PRIMARY (≥hold)      → aftermath(silence)
 *   aftermath(silence) → AUTO (timer)        → aftermath(line)
 *   aftermath(line)    → PRIMARY (≥hold)     → arrival          · session: reset
 *   qualquer fase      → RESET (Escape)      → arrival          · session: reset
 *
 * "AUTO" = transição controlada pelo estúdio (timer), não pelo visitante.
 * "PRIMARY (≥hold)" = controlada pelo visitante, mas só dentro da janela
 * válida (hold mínimo já cumprido) — fora dela o evento é ignorado.
 *
 * `label` em `interTrial`/`recall` é só um beat tipográfico opcional
 * mostrado durante a pausa — não cria fase nova, não muda quem controla a
 * transição (ainda AUTO), só o que é exibido nela.
 */

export type RevealStep = "grid" | "converge" | "settle" | "copy";
export type AftermathStep = "silence" | "line";
export type FrameStep = "look" | "beat";

export type ExperienceState =
  | { phase: "arrival"; enteredAt: number }
  | { phase: "frame"; step: FrameStep; enteredAt: number }
  | { phase: "calibrationA"; enteredAt: number }
  | { phase: "calibrationB"; enteredAt: number }
  | { phase: "interTrial"; nextIndex: number; label: string | null; enteredAt: number }
  | { phase: "trialA"; index: number; key: FrameName; enteredAt: number }
  | { phase: "trialB"; index: number; key: FrameName; enteredAt: number }
  | { phase: "recall"; label: string | null; enteredAt: number }
  | { phase: "reveal"; step: RevealStep; enteredAt: number }
  | { phase: "aftermath"; step: AftermathStep; enteredAt: number };

export type ExperienceAction = { type: "PRIMARY"; at: number } | { type: "AUTO"; at: number } | { type: "RESET"; at: number };

export const TRIAL_COUNT = TRIAL_ORDER.length;

export function initialState(at: number): ExperienceState {
  return { phase: "arrival", enteredAt: at };
}

/** Hold mínimo exigido antes de PRIMARY ter efeito nesta fase. `null` = fase não aceita PRIMARY (só AUTO). */
export function minHoldFor(state: ExperienceState): number | null {
  switch (state.phase) {
    case "arrival":
      return 0;
    case "calibrationA":
      return TIMING.calibrationAHold;
    case "calibrationB":
      return TIMING.calibrationBHold;
    case "trialA":
      return TIMING.minAHold;
    case "trialB":
      return TIMING.minBHold;
    case "reveal":
      return state.step === "copy" ? TIMING.copyHold : null;
    case "aftermath":
      return state.step === "line" ? TIMING.aftermathLineHold : null;
    default:
      return null;
  }
}

/** Atraso da próxima transição AUTO, ou `null` se esta fase não avança sozinha. */
export function autoDelayFor(state: ExperienceState): number | null {
  switch (state.phase) {
    case "frame":
      return state.step === "look" ? TIMING.frameLookHold : TIMING.frameBeatHold;
    case "interTrial": {
      const drift = TIMING.interTrialDrift[state.nextIndex] ?? 0;
      const labelExtra = state.label ? TIMING.interTrialLabelExtra : 0;
      return Math.max(160, TIMING.interTrial + drift + labelExtra);
    }
    case "recall":
      return TIMING.recallDelay;
    case "reveal":
      if (state.step === "grid") return TRIAL_COUNT * TIMING.alignStagger + TIMING.alignHold;
      if (state.step === "converge") return TIMING.convergeDuration;
      if (state.step === "settle") return TIMING.settleHold;
      return null;
    case "aftermath":
      return state.step === "silence" ? TIMING.aftermathSilence : null;
    default:
      return null;
  }
}

export function reduce(state: ExperienceState, action: ExperienceAction): ExperienceState {
  if (action.type === "RESET") return initialState(action.at);

  const hold = minHoldFor(state);
  const auto = autoDelayFor(state);

  if (action.type === "PRIMARY") {
    if (hold === null) return state;
    if (action.at - state.enteredAt < hold) return state;
    return advance(state, action.at);
  }

  // AUTO only fires transitions that this phase actually owns.
  if (auto === null) return state;
  if (action.at - state.enteredAt < auto) return state;
  return advance(state, action.at);
}

function advance(state: ExperienceState, at: number): ExperienceState {
  switch (state.phase) {
    case "arrival":
      return { phase: "frame", step: "look", enteredAt: at };
    case "frame":
      if (state.step === "look") return { phase: "frame", step: "beat", enteredAt: at };
      return { phase: "calibrationA", enteredAt: at };
    case "calibrationA":
      return { phase: "calibrationB", enteredAt: at };
    case "calibrationB":
      return { phase: "interTrial", nextIndex: 0, label: INTERVAL_LABELS[0] ?? null, enteredAt: at };
    case "interTrial":
      return {
        phase: "trialA",
        index: state.nextIndex,
        key: TRIAL_ORDER[state.nextIndex] ?? CALIBRATION_KEY,
        enteredAt: at,
      };
    case "trialA":
      return { phase: "trialB", index: state.index, key: state.key, enteredAt: at };
    case "trialB": {
      const next = state.index + 1;
      if (next < TRIAL_COUNT) return { phase: "interTrial", nextIndex: next, label: INTERVAL_LABELS[next] ?? null, enteredAt: at };
      return { phase: "recall", label: RECALL_LABEL, enteredAt: at };
    }
    case "recall":
      return { phase: "reveal", step: "grid", enteredAt: at };
    case "reveal": {
      const order: RevealStep[] = ["grid", "converge", "settle", "copy"];
      const i = order.indexOf(state.step);
      if (i < order.length - 1) return { phase: "reveal", step: order[i + 1], enteredAt: at };
      return { phase: "aftermath", step: "silence", enteredAt: at };
    }
    case "aftermath": {
      if (state.step === "silence") return { phase: "aftermath", step: "line", enteredAt: at };
      return { phase: "arrival", enteredAt: at };
    }
    default:
      return state;
  }
}
