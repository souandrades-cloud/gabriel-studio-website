import * as THREE from "three";

import { ACTIVE_PALETTE } from "@/components/showcase/x02/palette";

import { roughnessNoiseTexture } from "./geometry";

/**
 * MATERIAL WORLD V3 — cor vem de `ACTIVE_PALETTE` (a MESMA fonte de
 * verdade do X02 principal, `components/showcase/x02/palette.ts`), não
 * duplicada aqui (briefing, "palette.ts deve controlar progressivamente a
 * experiência"). Este arquivo só decide ROUGHNESS/METALNESS/roughnessMap —
 * a parte que faz a diferença entre "solid color object" e material físico
 * (briefing, "Material World").
 *
 * Achado do audit desta sprint (ver relatório, "Color System V3"): as
 * únicas cores fora de `palette.ts` que ainda carregam a identidade
 * preto+marrom antiga estão em `fracture-fragments.tsx:106`
 * (`setHSL(0.07, 0.14, …)`) e `interior.tsx:97` (`setHSL(0.09, 0.1, …)`) —
 * hue 0,07–0,09 é literalmente laranja/marrom. Não alterados nesta sprint
 * (fora de escopo — "não redesenhar esses estados posteriores"), mas é a
 * causa técnica exata do "depois do trecho escuro reaparecem tons
 * marrons" reportado por Gabriel.
 */
export function stoneMaterial(colorHex: string, roughnessBase: number) {
  return new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: roughnessBase,
    metalness: 0.08,
    roughnessMap: roughnessNoiseTexture(),
  });
}

export function frameStoneMaterial() {
  return stoneMaterial(ACTIVE_PALETTE.stone, 0.58);
}

export function dressingStoneMaterial() {
  return stoneMaterial(ACTIVE_PALETTE.stoneDark, 0.66);
}

export function floorStoneMaterial() {
  return stoneMaterial(ACTIVE_PALETTE.floor, 0.62);
}

/** Metal escovado escuro — só em detalhes (briefing, "Material": "apenas em detalhes"). */
export function metalAccentMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#2b2d2f",
    roughness: 0.32,
    metalness: 0.88,
  });
}
