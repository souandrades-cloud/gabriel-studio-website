import type { ProjectMedia } from "@/lib/portfolio/types";

/**
 * Capas alternativas para X01/X02/X03 nos protótipos A/B (X03 e X01
 * aprovados no Gate 002/003; X02 é uma nova captura autorizada pelo Gate
 * HOME PORTFOLIO B — FINAL POLISH DISCOVERY 001, Missão 1 — ver o arquivo
 * daquele asset para a ressalva completa). A auditoria/discovery completa
 * de cada escolha está no RETURN de cada gate.
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
   * X02 — "Chamber (Release)", t≈0.26 da própria trajetória de câmera de
   * x02/experience.tsx (camera-rig.tsx) — substitui "Fracture" (x02-a002),
   * que por sua vez tinha substituído "Surface" no Gate 002. Captura NOVA
   * (não pré-existente em public/), autorizada pelo Gate FINAL POLISH
   * DISCOVERY 001, Missão 1: browser real + WebGL real (ANGLE/AMD Radeon,
   * confirmado via WEBGL_debug_renderer_info), canvas isolado (overlay de
   * caption DOM ocultado só nesta captura, nunca no código-fonte). Vence
   * Fracture/Surface/Resolution nos critérios do gate — profundidade em
   * camadas (colunas próximas/médias/distantes), silhueta legível como
   * arquitetura, contraste consistente sem quase-vazio. Ressalva honesta
   * preservada do Gate 002: ainda é sombreamento flat de WebGL em tempo
   * real, sem o polish fotográfico de X01/X03 — combina melhor com elas em
   * IMPACTO/leitura do que as opções anteriores, mas o gap de acabamento
   * entre "render em tempo real" e "still fotográfico" continua.
   */
  x02: {
    src: "/images/x02/x02-lab-chamber-release.png",
    alt: "X02 — Abyss, Chamber state. A field of tall pale monoliths receding in layered depth across a textured floor, seen from within the 3D scene.",
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
