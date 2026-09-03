import type { FrameName } from "./constants";

/**
 * SESSION CHOREOGRAPHY — não é analytics. Vive só em memória de runtime,
 * nunca é persistida, nunca sai do dispositivo, não alimenta dashboard nem
 * score. Existe para uma única função: dar à Reveal (ACT 04) um ritmo que
 * pertence a esta sessão específica — cada B reaparece com um atraso
 * derivado de quanto tempo o próprio visitante segurou aquele trial, em vez
 * de um stagger fixo e idêntico para todos.
 */
export type TrialRecord = {
  key: FrameName;
  index: number;
  aEnteredAt: number;
  cutAt: number | null;
  bEnteredAt: number | null;
  advancedAt: number | null;
};

export function createTrialRecord(key: FrameName, index: number, at: number): TrialRecord {
  return { key, index, aEnteredAt: at, cutAt: null, bEnteredAt: null, advancedAt: null };
}

/** Tempo de observação de A, em ms. Usado para derivar o stagger da reveal. */
export function aHoldOf(record: TrialRecord): number {
  if (record.cutAt == null) return 0;
  return record.cutAt - record.aEnteredAt;
}

/** Tempo de observação de B, em ms. */
export function bHoldOf(record: TrialRecord): number {
  if (record.bEnteredAt == null || record.advancedAt == null) return 0;
  return record.advancedAt - record.bEnteredAt;
}

/**
 * Atraso de reaparecimento de cada B na grade da Reveal — normalizado para
 * uma janela curta e legível (0–320ms) para que a variação seja sentida
 * como ritmo, não como espera. Ordem por índice do trial (ordem vivida),
 * não por duração.
 */
export function deriveRevealStagger(records: readonly TrialRecord[], baseStaggerMs: number): number[] {
  const holds = records.map((r) => aHoldOf(r) + bHoldOf(r));
  const max = Math.max(1, ...holds);
  return records.map((_, i) => i * baseStaggerMs + Math.round((holds[i] / max) * baseStaggerMs));
}
