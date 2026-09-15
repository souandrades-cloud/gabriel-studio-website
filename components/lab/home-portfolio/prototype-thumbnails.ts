import type { ProjectMedia } from "@/lib/portfolio/types";

/**
 * Capas alternativas para X01/X02/X03 nos protótipos A/B — Gate HOME
 * PORTFOLIO PROTOTYPE 002, Problema 1. Todas as três são assets JÁ
 * EXISTENTES e já aprovados (nenhuma geração nova); a auditoria completa,
 * incluindo os assets descartados e por quê, está no RETURN do gate.
 */
export const PROTOTYPE_THUMBNAILS: Record<"x01" | "x02" | "x03", ProjectMedia> = {
  /**
   * X01 — "Pendulum" (X01-A05), no lugar do macro-detail atual (X01-A06).
   * Silhueta única e legível (arco + peso suspenso) lê como objeto
   * específico já em miniatura de card — o macro-detail atual é mais
   * abstrato, podia ler como textura genérica de hardware/mobiliário.
   */
  x01: {
    src: "/images/x01/X01-A05.png",
    alt: "Object Study 006 — Pendulum. A suspended mass held in potential, its counterweight resting against a fixed support.",
    role: "thumbnail",
    width: 1122,
    height: 1402,
  },
  /**
   * X02 — "Fracture" (x02-a002), no lugar da silhueta minimalista atual
   * (x02-a001-surface). O X02 só tem 3 assets no total (auditoria
   * completa) — surface e resolution são quase inteiramente vazios/pretos
   * num crop de card pequeno; fracture é o único dos três que preenche o
   * quadro com composição e contraste legíveis a esse tamanho.
   */
  x02: {
    src: "/images/x02/x02-a002-fracture.png",
    alt: "X02 — Abyss, Fracture state. An angular arrangement of fractured geometric block forms in olive and pale grey, seen from within the 3D scene.",
    role: "thumbnail",
    width: 1440,
    height: 900,
  },
  /**
   * X03 — "Final Signature" (x03-a009), no lugar do product shot em
   * estúdio atual (x03-a001-master). Golden hour, chão molhado refletindo
   * o céu, silhueta dramática — e paisagem (1672×941), encaixa melhor no
   * tratamento full-bleed do protagonista do que o master shot em retrato.
   */
  x03: {
    src: "/images/x03/x03-a009-final-signature.png",
    alt: "PL-1 positioned between concrete walls marked 'B3 Substation Zone' at sunset, arm raised, wet ground reflecting the sky.",
    role: "thumbnail",
    width: 1672,
    height: 941,
  },
};
