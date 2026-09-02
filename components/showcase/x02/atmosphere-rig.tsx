"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { ACTIVE_PALETTE } from "./palette";

/**
 * Art Direction 001 — "Light": iluminação espacialmente motivada por
 * estado, não um setup fixo para a jornada inteira (briefing, "Light").
 * Mesma técnica das outras revelações por scroll (ler/mutar via ref dentro
 * de useFrame, nunca o objeto do useMemo diretamente) — aplicada agora a
 * luzes e fog em vez de material.opacity. Nenhum draw call novo: luzes e
 * fog não custam geometria.
 *
 * Cada estado tem uma função perceptiva de luz (briefing):
 * SURFACE/CHAMBER: raking lateral, tom mineral morno. DESCENT: fog
 * fechando (compressão de profundidade). FRACTURE: feixe mais dirigido,
 * contraste sobe no beat do alinhamento sem denunciar antes. VOID: quase
 * toda informação luminosa retirada — silêncio real. CORE: maior
 * contraste perceptivo da experiência (não neon — ainda branco-âmbar
 * morno). RESOLUTION: descompressão, assenta abaixo do pico do CORE.
 */
type AtmosphereStop = {
  t: number;
  ambient: { i: number; c: string };
  key: { i: number; c: string };
  fill: { i: number; c: string };
  zenith: { i: number; c: string };
  fog: { near: number; far: number };
};

const STOPS: AtmosphereStop[] = [
  {
    // COMPOSITION + COLOR PASS 002: cor vem de palette.ts (ACTIVE_PALETTE) —
    // intensidades continuam as já calibradas na Visibility + Lighting
    // Calibration 001, só a temperatura/família cromática muda.
    t: 0.0,
    ambient: { i: 0.42, c: ACTIVE_PALETTE.atmosphere.entry.ambient },
    key: { i: 2.4, c: ACTIVE_PALETTE.atmosphere.entry.key },
    fill: { i: 0.42, c: ACTIVE_PALETTE.atmosphere.entry.fill },
    zenith: { i: 1.5, c: ACTIVE_PALETTE.atmosphere.entry.zenith },
    fog: { near: 12, far: 150 },
  },
  {
    // RHYTHM + EVENTS: antes idêntico a t=0 — agora marca "a profundidade
    // começa a aparecer" (briefing, Lighting Arc/THRESHOLD): fog fecha um
    // pouco, ambient recua ligeiramente. Cor/família intocadas.
    t: 0.1,
    ambient: { i: 0.38, c: ACTIVE_PALETTE.atmosphere.entry.ambient },
    key: { i: 2.4, c: ACTIVE_PALETTE.atmosphere.entry.key },
    fill: { i: 0.4, c: ACTIVE_PALETTE.atmosphere.entry.fill },
    zenith: { i: 1.45, c: ACTIVE_PALETTE.atmosphere.entry.zenith },
    fog: { near: 12, far: 120 },
  },
  {
    // RHYTHM + EVENTS — COMPRESSION: o pinch de DESCENT antes do reveal de
    // CHAMBER (briefing, "Compression": "mais estreito; mais próximo; mais
    // comprimido... não confundir com blackout — ainda deve existir
    // arquitetura legível"). Fog fecha bem mais que antes (far 95 -> 42) e
    // a cena escurece — FRAME/WALLS de descent-gates.tsx continuam opacas e
    // legíveis neste ponto (DRESSING_REVEAL termina em t=0.18).
    t: 0.22,
    ambient: { i: 0.4, c: ACTIVE_PALETTE.atmosphere.descent.ambient },
    key: { i: 2.0, c: ACTIVE_PALETTE.atmosphere.descent.key },
    fill: { i: 0.42, c: ACTIVE_PALETTE.atmosphere.descent.fill },
    zenith: { i: 1.15, c: ACTIVE_PALETTE.atmosphere.descent.zenith },
    fog: { near: 7, far: 42 },
  },
  {
    // RHYTHM + EVENTS — PAYOFF 01 RELEASE: o estouro de luz exatamente no
    // beat do reveal (mesmo t da nova pose "Chamber release" em
    // camera-rig.tsx) — fog abre bem além do steady-state de CHAMBER logo
    // abaixo (far 115 vs. 88), ambient/key sobem acima do steady-state
    // também. "Caramba, isso é muito maior aqui dentro" (briefing).
    t: 0.26,
    ambient: { i: 0.88, c: ACTIVE_PALETTE.atmosphere.chamber.ambient },
    key: { i: 2.75, c: ACTIVE_PALETTE.atmosphere.chamber.key },
    fill: { i: 0.82, c: ACTIVE_PALETTE.atmosphere.chamber.fill },
    zenith: { i: 1.8, c: ACTIVE_PALETTE.atmosphere.chamber.zenith },
    fog: { near: 11, far: 115 },
  },
  {
    // CHAMBER steady-state (ARRIVAL HOLD/TRAVERSE) — intocado do valor já
    // aprovado antes desta sprint: assenta um pouco abaixo do pico do
    // reveal acima, não regride para o nível de DESCENT.
    t: 0.3,
    ambient: { i: 0.78, c: ACTIVE_PALETTE.atmosphere.chamber.ambient },
    key: { i: 2.5, c: ACTIVE_PALETTE.atmosphere.chamber.key },
    fill: { i: 0.75, c: ACTIVE_PALETTE.atmosphere.chamber.fill },
    zenith: { i: 1.6, c: ACTIVE_PALETTE.atmosphere.chamber.zenith },
    fog: { near: 10, far: 88 },
  },
  {
    // VISUAL CONTINUITY FIX 003: ambient/fill eram #948d80/#38332a
    // (bege/marrom quente, identidade antiga) — trocados por
    // ACTIVE_PALETTE.atmosphere.fracture, intensidades intocadas.
    t: 0.45,
    ambient: { i: 0.46, c: ACTIVE_PALETTE.atmosphere.fracture.ambient },
    key: { i: 2.0, c: ACTIVE_PALETTE.atmosphere.fracture.key },
    fill: { i: 0.48, c: ACTIVE_PALETTE.atmosphere.fracture.fill },
    zenith: { i: 1.35, c: ACTIVE_PALETTE.atmosphere.fracture.zenith },
    fog: { near: 10, far: 78 },
  },
  {
    // FRACTURE aligned — beat de contraste. RHYTHM + EVENTS: swing um pouco
    // mais severo que antes (briefing, "Lighting Arc/FRACTURE": "contraste
    // mais severo") para reforçar o MOMENTO do alinhamento — ambient/fill
    // caem mais, key sobe mais — ainda a mesma família fracture, só a
    // amplitude do bump muda.
    t: 0.5,
    ambient: { i: 0.24, c: ACTIVE_PALETTE.atmosphere.fracture.ambient },
    key: { i: 2.6, c: ACTIVE_PALETTE.atmosphere.fracture.key },
    fill: { i: 0.22, c: ACTIVE_PALETTE.atmosphere.fracture.fill },
    zenith: { i: 0.95, c: ACTIVE_PALETTE.atmosphere.fracture.zenith },
    fog: { near: 9, far: 68 },
  },
  {
    // VOID — intocado de propósito: é o único estado autorizado a chegar
    // perto do "quase nada" (briefing, "Princípio do Void").
    // VISUAL CONTINUITY FIX 003: auditado — #7d827c/#a5ac9f/#23262a/#8c9188
    // já são neutros/frios (não pertencem à família bege/marrom), mantidos
    // sem alteração.
    t: 0.6,
    ambient: { i: 0.2, c: "#7d827c" },
    key: { i: 1.3, c: "#a5ac9f" },
    fill: { i: 0.14, c: "#23262a" },
    zenith: { i: 0.7, c: "#8c9188" },
    fog: { near: 8, far: 58 },
  },
  {
    // CORE EXTERIOR — precisa ser imediatamente legível.
    // VISUAL CONTINUITY FIX 003: cores eram tan/bege-marrom, trocadas por
    // ACTIVE_PALETTE.atmosphere.core (aproximação, ainda antes do CORE de
    // verdade — precisa se sentir "a mesma jornada" chegando lá).
    // CORE V2 PRODUCTION INTEGRATION: t=0.7 -> 0.72, alinhado à nova pose
    // "Approach" da câmera (camera-rig.tsx) — só o t mudou, cor/intensidade
    // intocadas.
    t: 0.72,
    ambient: { i: 0.34, c: ACTIVE_PALETTE.atmosphere.core.ambient },
    key: { i: 1.7, c: ACTIVE_PALETTE.atmosphere.core.key },
    fill: { i: 0.34, c: ACTIVE_PALETTE.atmosphere.core.fill },
    zenith: { i: 0.95, c: ACTIVE_PALETTE.atmosphere.core.zenith },
    fog: { near: 9, far: 92 },
  },
  {
    // CORE crossing/reveal já são o pico de contraste da experiência — só
    // fill sobe um pouco (silhueta das colunas do Interior fica legível sem
    // competir com o pico de key/zenith que faz CORE ser o maior momento).
    // VISUAL CONTINUITY FIX 003 — EXCEÇÃO DELIBERADA: os dois stops a
    // seguir (t=0.81 e t=0.88, o PICO real de CORE) mantêm o branco-âmbar
    // morno original, intocado. É luz (key/zenith bem claros e quentes),
    // não a cor da arquitetura — a arquitetura em si (interior.tsx) já foi
    // recolorida para a família fria; este é o único ponto da jornada
    // autorizado a manter um acento quente, por ser o "maior contraste
    // perceptivo da experiência" desenhado desde a Art Direction 001, não
    // um resíduo da paleta antiga. Auditado e mantido conscientemente.
    // CORE V2 PRODUCTION INTEGRATION: t=0.81 -> 0.82, alinhado à nova pose
    // "Crossing" — cor/intensidade intocadas (mesma exceção deliberada).
    t: 0.82,
    ambient: { i: 0.32, c: "#c2bcac" },
    key: { i: 3.0, c: "#fff6ea" },
    fill: { i: 0.3, c: "#443c2d" },
    zenith: { i: 1.85, c: "#f2ead8" },
    fog: { near: 11, far: 140 },
  },
  {
    // CORE V2 PRODUCTION INTEGRATION: t=0.88 -> 0.90, entre "First Interior"
    // (0.86) e "Impossible Reveal" (0.92) — cor/intensidade intocadas.
    t: 0.9,
    ambient: { i: 0.34, c: "#c7c0b0" },
    key: { i: 3.2, c: "#fff6ea" },
    fill: { i: 0.32, c: "#463f30" },
    zenith: { i: 2.0, c: "#f2ead8" },
    fog: { near: 12, far: 150 },
  },
  {
    // RESOLUTION — descompressão, assenta abaixo do pico de CORE.
    // VISUAL CONTINUITY FIX 003: tan/marrom trocado por
    // ACTIVE_PALETTE.atmosphere.core — mesma família do CORE approach
    // (t=0.7), fechando o ciclo cromático de volta à base fria.
    t: 1.0,
    ambient: { i: 0.3, c: ACTIVE_PALETTE.atmosphere.core.ambient },
    key: { i: 1.8, c: ACTIVE_PALETTE.atmosphere.core.key },
    fill: { i: 0.28, c: ACTIVE_PALETTE.atmosphere.core.fill },
    zenith: { i: 1.2, c: ACTIVE_PALETTE.atmosphere.core.zenith },
    fog: { near: 14, far: 130 },
  },
];

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function lerpChannel(
  a: { i: number; c: THREE.Color },
  b: { i: number; c: THREE.Color },
  local: number,
  outColor: THREE.Color,
) {
  const i = THREE.MathUtils.lerp(a.i, b.i, local);
  outColor.lerpColors(a.c, b.c, local);
  return i;
}

type LightRefs = {
  ambientRef: RefObject<THREE.AmbientLight | null>;
  keyRef: RefObject<THREE.DirectionalLight | null>;
  fillRef: RefObject<THREE.DirectionalLight | null>;
  zenithRef: RefObject<THREE.DirectionalLight | null>;
  fogRef: RefObject<THREE.Fog | null>;
  scrollRef: RefObject<number>;
};

/** Sempre montado (motion e reduced-motion) — ambos leem o mesmo `scrollRef`. */
function AtmosphereRig({ ambientRef, keyRef, fillRef, zenithRef, fogRef, scrollRef }: LightRefs) {
  const stops = useMemo(
    () =>
      STOPS.map((s) => ({
        t: s.t,
        ambient: { i: s.ambient.i, c: new THREE.Color(s.ambient.c) },
        key: { i: s.key.i, c: new THREE.Color(s.key.c) },
        fill: { i: s.fill.i, c: new THREE.Color(s.fill.c) },
        zenith: { i: s.zenith.i, c: new THREE.Color(s.zenith.c) },
        fog: s.fog,
      })),
    [],
  );

  const scratch = useRef({
    ambient: new THREE.Color(),
    key: new THREE.Color(),
    fill: new THREE.Color(),
    zenith: new THREE.Color(),
  });

  useFrame(() => {
    const t = clamp01(scrollRef.current ?? 0);
    let i = stops.length - 2;
    for (let s = 0; s < stops.length - 1; s++) {
      if (t <= stops[s + 1].t) {
        i = s;
        break;
      }
    }
    const a = stops[i];
    const b = stops[i + 1];
    const span = b.t - a.t;
    const local = span > 0 ? clamp01((t - a.t) / span) : 1;

    const c = scratch.current;
    const ambientI = lerpChannel(a.ambient, b.ambient, local, c.ambient);
    const keyI = lerpChannel(a.key, b.key, local, c.key);
    const fillI = lerpChannel(a.fill, b.fill, local, c.fill);
    const zenithI = lerpChannel(a.zenith, b.zenith, local, c.zenith);
    const near = THREE.MathUtils.lerp(a.fog.near, b.fog.near, local);
    const far = THREE.MathUtils.lerp(a.fog.far, b.fog.far, local);

    if (ambientRef.current) {
      ambientRef.current.intensity = ambientI;
      ambientRef.current.color.copy(c.ambient);
    }
    if (keyRef.current) {
      keyRef.current.intensity = keyI;
      keyRef.current.color.copy(c.key);
    }
    if (fillRef.current) {
      fillRef.current.intensity = fillI;
      fillRef.current.color.copy(c.fill);
    }
    if (zenithRef.current) {
      zenithRef.current.intensity = zenithI;
      zenithRef.current.color.copy(c.zenith);
    }
    if (fogRef.current) {
      fogRef.current.near = near;
      fogRef.current.far = far;
    }
  });

  return null;
}

export { AtmosphereRig };
