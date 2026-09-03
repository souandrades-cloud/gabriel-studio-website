/**
 * X03 LAB — INTERVAL / 03, Phase B prototype.
 * Configuração central: frames, ordem dos trials e mapa temporal.
 * Nenhum número aqui foi validado com usuário real — são HIPÓTESES de
 * ritmo, ajustáveis nesta única fonte sem tocar em state machine ou UI.
 */

export const FRAME_NAMES = ["B", "A0", "A1", "A2", "A3", "A4", "A5", "A6"] as const;
export type FrameName = (typeof FRAME_NAMES)[number];

export const FRAME_SRC: Record<FrameName, string> = Object.fromEntries(
  FRAME_NAMES.map((n) => [n, `/showcase/x03-lab/frames/${n}.jpg`]),
) as Record<FrameName, string>;

/**
 * Posição de foco por asset (desktop / mobile), usada com object-fit: cover.
 * Os crops de origem (Phase A1) já preservam o sujeito inteiro dentro do
 * 16:9 — estes valores só reposicionam esse conteúdo já preservado quando o
 * viewport deixa de ser 16:9 (retrato). Centralizar tudo por padrão foi
 * descartado deliberadamente: cada valor reflete onde o sujeito real está
 * (rosto, mãos, feixe de luz) para não cortar o que a Phase A1 preservou.
 * Não validado visualmente em dispositivo real — revisar na QA da Phase B.
 */
export const FRAME_FOCUS: Record<FrameName, { desktop: string; mobile: string }> = {
  B: { desktop: "50% 38%", mobile: "50% 30%" },
  A0: { desktop: "50% 45%", mobile: "50% 45%" },
  A1: { desktop: "50% 60%", mobile: "50% 68%" },
  A2: { desktop: "50% 55%", mobile: "50% 45%" },
  A3: { desktop: "50% 50%", mobile: "50% 50%" },
  A4: { desktop: "50% 45%", mobile: "50% 40%" },
  A5: { desktop: "50% 50%", mobile: "50% 50%" },
  A6: { desktop: "50% 58%", mobile: "50% 62%" },
};

/**
 * ACT 02 — ordem dos trials. HYPOTHESIS: alterna valência (cuidado / ausência
 * / ameaça / expectativa / perda / desejo) para evitar a leitura plana
 * "1,2,3,4,5,6". Baseline = 6 (todos os contextos aprovados na Phase A1);
 * reduzir para 4–5 é uma mudança de uma linha aqui, sem tocar B nem o motor.
 */
export const TRIAL_ORDER: readonly FrameName[] = ["A1", "A5", "A2", "A6", "A3", "A4"];

/** ACT 01 — decoy/calibração. Nunca entra na Session Choreography. */
export const CALIBRATION_KEY: FrameName = "A0";

/**
 * TEMPORAL MAP. Todos os valores em ms, todos HYPOTHESIS (não testados com
 * usuário real) — ponto único de ajuste de ritmo.
 */
export const TIMING = {
  /** ACT 01 — exposição mínima ao decoy antes do corte ficar disponível. */
  calibrationAHold: 1100,
  /** ACT 01 — exposição mínima a B (calibração) antes de avançar. */
  calibrationBHold: 1400,
  /** ACT 02 — exposição mínima a A antes da janela de corte abrir. */
  minAHold: 900,
  /** ACT 02 — exposição mínima a B antes de "avançar" ficar disponível. */
  minBHold: 900,
  /** Depois disso sem ação, um affordance mínimo aparece (não instrução). */
  hintDelay: 2600,
  /** Pausa cinza entre o fim de um trial e o início do próximo (auto). */
  interTrial: 520,
  /** ACT 03 — variação de pausa por trial, soma-se a interTrial. Cria
   *  aceleração leve ao longo da sequência (accumulation), sem tocar B. */
  interTrialDrift: [0, -40, -80, -110, -130, -140],
  /** ACT 04 — pausa depois do último trial, antes dos B's reaparecerem. */
  recallDelay: 900,
  /** ACT 04 — atraso entre cada B ao reaparecer na grade da reveal. */
  alignStagger: 90,
  /** ACT 04 — tempo em grade antes de convergir. */
  alignHold: 900,
  /** ACT 04 — duração da convergência (ignorada em reduced motion). */
  convergeDuration: 900,
  /** ACT 04 — pausa depois de convergir, antes da copy nomear. */
  settleHold: 1100,
  /** ACT 04 — tempo mínimo com a copy visível antes de poder avançar. */
  copyHold: 1800,
  /** ACT 05 — silêncio depois do reveal antes da linha final aparecer. */
  aftermathSilence: 1400,
  /** ACT 05 — tempo mínimo com a linha final antes do replay ficar disponível. */
  aftermathLineHold: 1600,
} as const;
