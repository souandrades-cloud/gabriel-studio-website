"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

type Keyframe = { pos: readonly [number, number, number]; fov: number };

/**
 * Seis poses autorais — DISTANCE / APPROACH / SURFACE / CROSSING / INTERIOR
 * / REVEAL — uma para cada estado do briefing. A câmera atravessa a fenda
 * entre as duas lajes de structure.tsx (x ∈ [-0.4, 0.7] em z ≈ 0): CROSSING
 * é só o ponto da curva que passa por dentro dela, sem geometria a
 * atravessar de verdade.
 *
 * O FOV também é parte da encenação: fecha para 34° em SURFACE/CROSSING
 * (aperta a leitura de massa/proximidade na fenda estreita) e abre para
 * 46–52° logo em INTERIOR/REVEAL — é esse alargamento súbito do campo de
 * visão, mais do que qualquer decoração, que vende o espaço "abrindo".
 */
const KEYFRAMES: Record<"desktop" | "mobile", Keyframe[]> = {
  desktop: [
    // DISTANCE recuada o bastante para a laje (24u de altura) ocupar só
    // ~1/3 do quadro — precisa ler como objeto pequeno e silencioso num
    // vazio grande, não preencher a tela (achado no lab, ver relatório).
    { pos: [4.5, 9, 62], fov: 38 },
    { pos: [2, 6, 28], fov: 36 },
    { pos: [0.35, 2.6, 4.6], fov: 34 },
    { pos: [0.1, 2.35, -0.3], fov: 34 },
    { pos: [-0.6, 4.4, -19], fov: 46 },
    { pos: [2.4, 7.5, -54], fov: 52 },
  ],
  // Mobile: aspecto estreito reduz o FOV horizontal efetivo, então a câmera
  // fica um pouco mais recuada nos trechos próximos e o FOV base é maior —
  // mesma sequência, enquadramento adaptado (briefing, "Responsive").
  mobile: [
    { pos: [3.2, 9.2, 66], fov: 44 },
    { pos: [1.6, 6.4, 30], fov: 42 },
    { pos: [0.3, 2.7, 6.6], fov: 40 },
    { pos: [0.1, 2.5, -0.3], fov: 40 },
    { pos: [-0.4, 4.6, -17], fov: 50 },
    { pos: [1.6, 7.8, -48], fov: 56 },
  ],
};

/** Limiares de scroll do briefing — devem bater exatamente com STATE_BOUNDS em experience.tsx. */
const SCROLL_BOUNDS = [0, 0.2, 0.45, 0.55, 0.7, 1];
/** Parâmetro uniforme da CatmullRomCurve3 (6 pontos = 5 segmentos de 0.2). */
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

/** Um easing por trecho: aproximação lenta, aperto na fenda, saída rápida do crossing, assentamento final. */
const SEGMENT_EASES = [easeInOutSine, easeInOutSine, easeInOutQuad, easeOutCubic, easeInOutSine];

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

/**
 * Converte progresso de scroll (0–1, limiares não-uniformes) em `u` (0–1
 * uniforme da curva), aplicando o easing do trecho correspondente. É isso
 * que garante DISTANCE/APPROACH/.../REVEAL caírem exatamente nos limiares
 * do briefing, com a curva permanecendo suave entre eles (mapeamento
 * determinístico, sem scroll hijacking — o scroll nativo continua no controle).
 */
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

/** Quanto a câmera "olha à frente" ao longo da própria curva — dá o lookAt de graça, sem autorar uma segunda curva sincronizada. */
const LOOKAHEAD = 0.035;

function CameraRig({
  active,
  mobile,
  scrollRef,
  pointerRef,
}: {
  active: boolean;
  mobile: boolean;
  scrollRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
}) {
  const keyframes = mobile ? KEYFRAMES.mobile : KEYFRAMES.desktop;

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        keyframes.map((k) => new THREE.Vector3(...k.pos)),
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

  const smoothedPointer = useRef({ x: 0, y: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);
  const appliedU = useRef(0);

  useFrame(({ camera }, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const rawT = active ? (scrollRef.current ?? 0) : 1;
    const u = scrollToCurveU(rawT);
    // Suaviza a variação de `u` (não a posição em si) para picos de scroll
    // (roda de mouse vs. trackpad) não virarem um "degrau" perceptível no
    // crossing. Em reduced-motion (active=false) o fator é 1: a pose final
    // é aplicada de uma vez, sem travessia animada.
    const k = active ? Math.min(1, delta * 8) : 1;
    appliedU.current += (u - appliedU.current) * k;

    const px = active ? pointerRef.current.x : 0;
    const py = active ? pointerRef.current.y : 0;
    const pk = Math.min(1, delta * 2.6);
    smoothedPointer.current.x += (px - smoothedPointer.current.x) * pk;
    smoothedPointer.current.y += (py - smoothedPointer.current.y) * pk;

    const pos = curve.getPoint(appliedU.current);
    camera.position.set(
      pos.x + smoothedPointer.current.x * 0.16,
      pos.y - smoothedPointer.current.y * 0.1,
      pos.z,
    );

    const aheadU = Math.min(1, appliedU.current + LOOKAHEAD);
    const ahead = curve.getPoint(aheadU);
    // Viés de "olhar para cima" cresce só depois do crossing — é o gesto que
    // revela a verticalidade impossível do interior (briefing, STATE 06).
    const upBias = THREE.MathUtils.smoothstep(appliedU.current, 0.58, 0.95) * 4.2;
    target.set(
      ahead.x + smoothedPointer.current.x * 0.05,
      ahead.y + upBias - smoothedPointer.current.y * 0.03,
      ahead.z,
    );
    camera.lookAt(target);

    const fov = fovAt(appliedU.current);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export { CameraRig };
