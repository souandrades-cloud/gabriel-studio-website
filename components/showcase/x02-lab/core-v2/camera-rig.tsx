"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * CORE V2 SPATIAL PROTOTYPE 001 — mesmo princípio do CameraRig do
 * Prototype 001 (components/showcase/x02-lab/camera-rig.tsx): curva
 * autorada por estado + easing por trecho + FOV como parte da encenação.
 * Aqui com posCurve/lookCurve DUPLAS (técnica de
 * components/showcase/x02-lab/fracture/fracture-scene.tsx) em vez de
 * lookahead-na-mesma-curva: IMPOSSIBLE REVEAL precisa de um alvo de olhar
 * dirigido (para cima/adiante) que diverge de "para onde a câmera está
 * indo" — o gesto que vende a verticalidade impossível do interior.
 *
 * Sem parallax de pointer (briefing, item 12: opcional, não necessário
 * para compreender o efeito) — omitido deliberadamente para manter o
 * protótipo focado só na tese em teste.
 */
type Keyframe = {
  pos: readonly [number, number, number];
  look: readonly [number, number, number];
  fov: number;
};

const KEYFRAMES: Record<"desktop" | "mobile", Keyframe[]> = {
  desktop: [
    // DISTANCE — o SHELL inteiro precisa caber no quadro com folga (lição
    // do Prototype 001: "objeto pequeno e silencioso", nunca preencher a tela).
    { pos: [9, 1.5, 46], look: [0, -1, 10], fov: 30 },
    // APPROACH — endireitando para o eixo central, abertura crescendo.
    { pos: [4, 0.5, 26], look: [0, -1.5, 6], fov: 30 },
    // PRE-CROSSING — perto da fachada, ainda do lado de fora (Z > 7). Olhar
    // mirado NA parede (Z=6.2, perto do plano frontal), não através dela —
    // achado do teste visual: com o alvo apontando para dentro do vão
    // (Z negativo), a abertura já preenchia o quadro inteiro e a leitura de
    // "parede com um vão" desaparecia cedo demais, antes do CROSSING.
    { pos: [0.6, -1.8, 17], look: [0, -1.8, 6.2], fov: 30 },
    // CROSSING — dentro da espessura real da parede (jambas: Z 5.8-7.0).
    // FOV aperta — a "compressão espacial" pedida no briefing.
    { pos: [0, -2.5, 6], look: [0, -2.5, -5], fov: 26 },
    // FIRST INTERIOR — logo depois do vão. FOV abre de repente: é esse
    // alargamento súbito, não decoração, que vende o espaço "abrindo"
    // (mesma lição documentada no Prototype 001).
    { pos: [0, -2.5, -2], look: [0, -2, -20], fov: 40 },
    // IMPOSSIBLE REVEAL — avança e sobe o olhar bem mais que o resto da
    // curva (upBias forte, não incremental): teste visual mostrou que um
    // viés de olhar moderado deixava esta pose parecida demais com FIRST
    // INTERIOR — é o gesto de "olhar para cima e não achar o teto" que
    // vende a verticalidade impossível, não só avançar mais alguns metros.
    { pos: [0, 2, -22], look: [0, 12, -55], fov: 52 },
  ],
  // Mobile: aspecto estreito reduz o FOV horizontal efetivo — câmera um
  // pouco mais recuada nos trechos próximos, FOV base maior (mesmo
  // princípio do Prototype 001).
  mobile: [
    { pos: [8, 1.8, 52], look: [0, -1, 10], fov: 36 },
    { pos: [3.6, 0.8, 30], look: [0, -1.5, 6], fov: 36 },
    { pos: [0.6, -1.6, 19], look: [0, -1.6, 6.4], fov: 36 },
    { pos: [0, -2.4, 6.4], look: [0, -2.4, -5], fov: 32 },
    { pos: [0, -2.4, -1.6], look: [0, -2, -18], fov: 46 },
    { pos: [0, 2.2, -18], look: [0, 12, -46], fov: 58 },
  ],
};

/** Precisam bater exatamente com STATE_BOUNDS em core-v2-experience.tsx. */
const SCROLL_BOUNDS = [0, 0.2, 0.42, 0.5, 0.6, 1];
const CURVE_BOUNDS = [0, 0.2, 0.4, 0.6, 0.8, 1];

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** DISTANCE→APPROACH / →PRE-CROSSING: aproximação. →CROSSING: decisão mais
 *  firme. →FIRST INTERIOR: saída rápida da compressão (mesma escolha do
 *  crossing do Prototype 001). →IMPOSSIBLE REVEAL: assentamento. */
const SEGMENT_EASES = [easeInOutSine, easeInOutSine, easeInOutQuad, easeOutCubic, easeInOutSine];

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function scrollToCurveU(t: number) {
  const clamped = clamp01(t);
  let i = SCROLL_BOUNDS.length - 2;
  for (let s = 0; s < SCROLL_BOUNDS.length - 1; s++) {
    if (clamped <= SCROLL_BOUNDS[s + 1]) {
      i = s;
      break;
    }
  }
  const span = SCROLL_BOUNDS[i + 1] - SCROLL_BOUNDS[i];
  const local = span > 0 ? (clamped - SCROLL_BOUNDS[i]) / span : 1;
  const eased = SEGMENT_EASES[i](clamp01(local));
  return CURVE_BOUNDS[i] + eased * (CURVE_BOUNDS[i + 1] - CURVE_BOUNDS[i]);
}

function CameraRig({ mobile, scrollRef }: { mobile: boolean; scrollRef: RefObject<number> }) {
  const keyframes = mobile ? KEYFRAMES.mobile : KEYFRAMES.desktop;

  const posCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        keyframes.map((k) => new THREE.Vector3(...k.pos)),
        false,
        "catmullrom",
        0.5,
      ),
    [keyframes],
  );
  const lookCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        keyframes.map((k) => new THREE.Vector3(...k.look)),
        false,
        "catmullrom",
        0.5,
      ),
    [keyframes],
  );
  const fovAt = useMemo(() => {
    return (u: number) => {
      const scaled = clamp01(u) * (keyframes.length - 1);
      const i = Math.min(keyframes.length - 2, Math.floor(scaled));
      const local = scaled - i;
      return THREE.MathUtils.lerp(keyframes[i].fov, keyframes[i + 1].fov, local);
    };
  }, [keyframes]);

  const appliedU = useRef(0);

  useFrame(({ camera }, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const t = scrollRef.current ?? 0;
    const u = scrollToCurveU(t);
    // ~300ms de convergência (validado no Prototype 001 e na Sprint de
    // CHAMBER GAP FIX de X02): picos de scroll não viram degrau perceptível.
    // Em reduced-motion (ver core-v2-experience.tsx) o mesmo fator suaviza a
    // alternância periódica entre as duas poses, sem gerar um corte brusco.
    const k = Math.min(1, delta * 8);
    appliedU.current += (u - appliedU.current) * k;

    camera.position.copy(posCurve.getPoint(appliedU.current));
    camera.lookAt(lookCurve.getPoint(appliedU.current));

    const fov = fovAt(appliedU.current);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export { CameraRig, SCROLL_BOUNDS };
