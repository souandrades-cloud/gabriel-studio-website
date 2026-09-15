import type { ProjectMedia } from "@/lib/portfolio/types";

/**
 * Capas aprovadas para X01/X02/X03 — usadas na Home real (Signature) e nos
 * protótipos `/lab/home-portfolio/*` que as compararam (X03 e X01 aprovados
 * no Gate 002/003; X02 é uma nova captura autorizada pelo Gate HOME
 * PORTFOLIO B — FINAL POLISH DISCOVERY 001, Missão 1 — ver o arquivo daquele
 * asset para a ressalva completa). A auditoria/discovery completa de cada
 * escolha está no RETURN de cada gate.
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
   * X02 — "Monolithic Abyss" key art dedicado, Gate HOME PORTFOLIO B — X02
   * KEY ART INTEGRATION 001. Substitui "Chamber (Release)"
   * (x02-lab-chamber-release.png, captura literal do WebGL em tempo real —
   * ver Gate 003) depois que X02 PREMIUM COVER DISCOVERY 001/KEY ART 001
   * concluíram que nenhum recorte do renderer real-time fecha o gap de
   * acabamento contra X01/X03 (sombreamento flat, sem atmosfera/grão/DOF).
   * Esta imagem foi gerada externamente (fora do WebGL) seguindo a direção
   * "A — MONOLITHIC ABYSS" do gate de KEY ART (pale monoliths monumentais,
   * vazio negro absoluto, iluminação cinematográfica de fonte única,
   * névoa/profundidade atmosférica, piso escuro refletivo, acabamento
   * fotográfico) e colocada manualmente no projeto por Gabriel; 1122×1402
   * — já nasce em proporção ≈4:5, o mesmo aspect-ratio do card
   * ShowcaseStripCard, então não depende de crop customizado. Preserva os
   * invariantes de X02 (monólitos, vazio negro, escala, profundidade,
   * austeridade) sem virar cidade/nave/cyberpunk genérico.
   */
  x02: {
    src: "/images/x02/x02-key-art-001-monolithic-abyss.png",
    alt: "X02 — Abyss. Tall pale monolithic structures flanking a dark corridor, cinematic single-source light and atmospheric haze receding into an absolute black void, reflective dark floor.",
    role: "thumbnail",
    width: 1122,
    height: 1402,
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
