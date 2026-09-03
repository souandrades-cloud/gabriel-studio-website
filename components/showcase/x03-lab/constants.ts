/**
 * X03 LAB — INTERVAL / 03, Phase B prototype.
 * Configuração central: frames, ordem dos intervals e mapa temporal.
 * Nenhum número aqui foi validado com usuário real — são HIPÓTESES de
 * ritmo, ajustáveis nesta única fonte sem tocar em state machine ou UI.
 *
 * CREATIVE DIRECTION ITERATION 01 — cinco movimentos (ver state-machine.ts):
 * THE FRAME · BEFORE · INTERVALS · SAME · AFTERIMAGE.
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
 *
 * B usa sempre a mesma entrada aqui, em toda aparição (Movimento I, II, III
 * e na Reveal) — é isso que faz de B um MOTIF e não uma foto qualquer:
 * mesmo arquivo, mesmo crop, mesmo tamanho, mesma posição, sempre.
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
 * MOVEMENT III — ordem dos intervals. HYPOTHESIS: reduzida de 6 para 4 após
 * o QA humano da Iteration 01 ("mais repetição não significa mais
 * clareza") e desenhada como arco semântico deliberado, não um banco
 * aleatório de fotos:
 *   A1 CARE (intimidade)  → A5 ABSENCE (distância)
 *   → A2 THREAT (tensão)  → A6 ANTICIPATION (em aberto, prepara o reveal)
 * A3 (LOSS) e A4 (DESIRE) ficam de banco — nenhum asset foi deletado,
 * trocar para 5–6 de volta é só editar este array.
 */
export const TRIAL_ORDER: readonly FrameName[] = ["A1", "A5", "A2", "A6"];

/** MOVEMENT II — decoy/calibração ("BEFORE"). Nunca entra na Session Choreography. */
export const CALIBRATION_KEY: FrameName = "A0";

/**
 * Beats tipográficos das pausas entre intervals (MOVEMENT III), indexados
 * por `nextIndex` do `interTrial` que os precede — ou seja, o texto aparece
 * na pausa ANTES do interval daquele índice. `0` é a pausa que sai de
 * BEFORE direto para o primeiro interval; por isso carrega o rótulo do
 * movimento ("BEFORE."), não um rótulo de reconhecimento.
 *
 * `2` é a única pausa "RECOGNITION BEFORE PROOF": depois do 2º interval
 * (ABSENCE), antes do 3º (THREAT), é o primeiro instante em que B repetiu
 * three vezes desde o Movimento I — o suficiente para o padrão começar a
 * ser notado, sem ainda provar nada.
 */
export const INTERVAL_LABELS: Record<number, string> = {
  0: "BEFORE.",
  2: "AGAIN.",
};

/** MOVEMENT III → IV — pausa final antes da Reveal, sempre rotulada. */
export const RECALL_LABEL = "ONCE MORE.";

/**
 * TEMPORAL MAP. Todos os valores em ms, todos HYPOTHESIS (não testados com
 * usuário real) — ponto único de ajuste de ritmo.
 */
export const TIMING = {
  /** MOVEMENT I — B sozinha, em silêncio, antes de qualquer texto. */
  frameLookHold: 2200,
  /** MOVEMENT I — "WHAT COMES BEFORE MATTERS." visível antes de avançar. */
  frameBeatHold: 2200,
  /** MOVEMENT II — exposição mínima ao decoy antes do corte ficar disponível. */
  calibrationAHold: 1100,
  /** MOVEMENT II — exposição mínima a B antes de avançar. */
  calibrationBHold: 1400,
  /** MOVEMENT III — exposição mínima a A antes da janela de corte abrir. */
  minAHold: 900,
  /** MOVEMENT III — exposição mínima a B antes de "avançar" ficar disponível. */
  minBHold: 900,
  /** Depois disso sem ação, o hint mínimo aparece (não instrução). */
  hintDelay: 2600,
  /** Quantos dos primeiros CORTES (não avanços) mostram o hint com texto
   *  ("CLICK TO CUT" / "TAP TO CUT") em vez de só o ponto — ensinar a
   *  gramática nas 2 primeiras vezes, depois sair do caminho. */
  hintTextCutBudget: 2,
  /** Pausa cinza entre o fim de um interval e o início do próximo (auto). */
  interTrial: 520,
  /** Variação de pausa por interval, soma-se a interTrial — leve aceleração
   *  ao longo da sequência (accumulation), sem tocar B. 4 entradas = 4 intervals. */
  interTrialDrift: [0, -30, -60, -90],
  /** Tempo extra na pausa quando ela carrega um beat tipográfico (ver
   *  INTERVAL_LABELS) — tempo para ler, não só para respirar. */
  interTrialLabelExtra: 900,
  /** MOVEMENT III → IV — pausa depois do último interval, antes da Reveal. */
  recallDelay: 900 + 900, // base + tempo de leitura do RECALL_LABEL
  /** MOVEMENT IV — atraso entre cada B ao reaparecer, em ordem de ocorrência
   *  (não modulado pela sessão — CLARITY > cleverness: um stagger simples e
   *  legível bate um ritmo "inteligente" que ninguém consegue ler). */
  alignStagger: 260,
  /** MOVEMENT IV — tempo em grade, lado a lado, antes de convergir. */
  alignHold: 1100,
  /** MOVEMENT IV — duração da convergência/sobreposição (ignorada em reduced motion). */
  convergeDuration: 1000,
  /** MOVEMENT IV — pausa depois de convergir, antes da copy nomear. */
  settleHold: 1200,
  /** MOVEMENT IV — atraso da 2ª linha da copy ("DIFFERENT CONTEXT.") em
   *  relação à 1ª ("SAME FRAME.") — identidade primeiro, interpretação depois. */
  copyLine2Delay: 1000,
  /** MOVEMENT IV — tempo mínimo com a copy visível (as 2 linhas) antes de
   *  poder avançar. */
  copyHold: 2600,
  /** MOVEMENT V — silêncio depois do reveal antes das linhas finais. */
  aftermathSilence: 1200,
  /** MOVEMENT V — atraso de cada linha subsequente do aftermath
   *  (SAME FRAME. → o que mudou → assinatura → replay), em relação à
   *  entrada no step "line". */
  aftermathLineDelays: [0, 1100, 2400, 3100],
  /** MOVEMENT V — tempo mínimo com todas as linhas visíveis antes do
   *  replay ficar disponível — último delay (3100) + fade (700) + folga. */
  aftermathLineHold: 4200,
} as const;
