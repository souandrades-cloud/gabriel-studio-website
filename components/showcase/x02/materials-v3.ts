import * as THREE from "three";

import { roughnessNoiseTexture } from "./geometry-v3";
import { ACTIVE_PALETTE } from "./palette";

/**
 * MATERIAL WORLD V3 INTEGRATION 001 — promovido/adaptado de
 * `x02-lab/material-world-v3/materials.ts`. Cor vem exclusivamente de
 * `ACTIVE_PALETTE` (briefing, "Color": "Usar exclusivamente palette.ts
 * para identidade cromática") — inclusive o par metal, que no laboratório
 * era hardcoded (`#2b2d2f`, fora da paleta) e é corrigido aqui para usar
 * `metalDark`/`metalHighlight` (o mesmo par já validado em
 * structure.tsx). Este módulo só decide roughness/metalness/roughnessMap —
 * a resposta física que separa "solid color object" de material de
 * verdade.
 */
function stoneMaterial(color: string | THREE.Color, roughnessBase: number, transparent: boolean) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: roughnessBase,
    metalness: 0.08,
    roughnessMap: roughnessNoiseTexture(),
    transparent,
    opacity: transparent ? 0 : 1,
  });
}

/** FRAME/HERO — landmark normalmente sempre opaco; CORE V2 PRODUCTION
 *  INTEGRATION: o SHELL precisa emergir do VOID (opacity gate), então o
 *  parâmetro passou a existir — default `false` preserva todo chamador
 *  existente (THRESHOLD FRAME, CHAMBER HERO_MASSES) sem mudança. */
export function frameStoneMaterial(transparent = false) {
  return stoneMaterial(ACTIVE_PALETTE.stone, 0.58, transparent);
}

/** DESCENT dressing / recess / backer — midground, opacity animada por scroll. */
export function dressingStoneMaterial(transparent = true) {
  return stoneMaterial(ACTIVE_PALETTE.stoneDark, 0.66, transparent);
}

/** Piso (CHAMBER) — opacity animada por scroll. */
export function floorStoneMaterial(transparent = true) {
  return stoneMaterial(ACTIVE_PALETTE.floor, 0.62, transparent);
}

/**
 * Tom mineral por instância (mesmo hue/columnSat do resto da jornada,
 * lightness variando dentro de uma faixa própria por estado — CHAMBER e
 * CORE usam faixas DIFERENTES de `palette.ts`, "espaços parecidos mas
 * distintos", não idênticos) — material.color por mesh individual (sem
 * instanceColor), transparent para caber no ciclo de reveal de cada estado.
 */
function toneStoneMaterial(
  tone: number,
  lightMin: number,
  lightMax: number,
  roughnessBase: number,
  transparent: boolean,
) {
  const range = lightMax - lightMin;
  const color = new THREE.Color().setHSL(
    ACTIVE_PALETTE.columnHue,
    ACTIVE_PALETTE.columnSat,
    lightMin + tone * range,
  );
  return stoneMaterial(color, roughnessBase, transparent);
}

/** COLUMN ROW de CHAMBER. */
export function columnStoneMaterial(tone: number, transparent: boolean) {
  return toneStoneMaterial(
    tone,
    ACTIVE_PALETTE.chamberLightMin,
    ACTIVE_PALETTE.chamberLightMax,
    0.72,
    transparent,
  );
}

/** CORE V2 PRODUCTION INTEGRATION — COLUMN ROW do interior do CORE, mesma
 *  família formal de `columnStoneMaterial` (mesmo hue/sat), faixa de
 *  lightness própria (`coreLightMin/Max`, já validada em VISUAL CONTINUITY
 *  FIX 003 para o CORE antigo). */
export function coreColumnStoneMaterial(tone: number, transparent: boolean) {
  return toneStoneMaterial(
    tone,
    ACTIVE_PALETTE.coreLightMin,
    ACTIVE_PALETTE.coreLightMax,
    0.72,
    transparent,
  );
}

/** FRACTURE ARCHITECTURAL REDIRECTION — HERO FRAGMENTS (peças individuais,
 *  não instanced, ver fracture-fragments.tsx): mesma família formal de
 *  `columnStoneMaterial`/`coreColumnStoneMaterial` (hue/sat da paleta),
 *  faixa de lightness própria (`fractureLightMin/Max`, já validada desde
 *  VISUAL CONTINUITY FIX 003). Sem vertexColors — cada HERO é seu próprio
 *  mesh, então `color` direto no material basta (os tiers instanced
 *  continuam com vertexColors, construídos localmente em
 *  fracture-fragments.tsx). */
export function fractureStoneMaterial(tone: number, transparent: boolean) {
  return toneStoneMaterial(
    tone,
    ACTIVE_PALETTE.fractureLightMin,
    ACTIVE_PALETTE.fractureLightMax,
    0.7,
    transparent,
  );
}

/**
 * Metal escovado escuro — só em detalhes (sill do FRAME, capitel das
 * HERO_MASSES de CHAMBER). `metalness` alto precisa de `scene.environment`
 * (ver environment-map.ts) para não renderizar quase preto — mesmo achado
 * documentado no laboratório.
 */
export function metalAccentMaterial(transparent = false) {
  return new THREE.MeshStandardMaterial({
    color: ACTIVE_PALETTE.metalDark,
    emissive: ACTIVE_PALETTE.metalHighlight,
    emissiveIntensity: 0.16,
    roughness: 0.32,
    metalness: 0.88,
    transparent,
    opacity: transparent ? 0 : 1,
  });
}
