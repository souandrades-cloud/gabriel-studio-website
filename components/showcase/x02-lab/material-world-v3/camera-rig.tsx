"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * 3 poses autoradas (briefing "Lab — Camera"): 01 FRAME CLOSE/MID, 02
 * ARCHITECTURAL SPACE, 03 MONUMENTAL VIEW. Mesma técnica de dupla curva +
 * easing por trecho do CORE V2 (`x02-lab/core-v2/camera-rig.tsx`) — só com
 * metade dos pontos, já que este laboratório não precisa de uma jornada
 * longa, apenas transitar entre os 3 enquadramentos pedidos.
 */
type Keyframe = {
  pos: readonly [number, number, number];
  look: readonly [number, number, number];
  fov: number;
};

const KEYFRAMES: Record<"desktop" | "mobile", Keyframe[]> = {
  desktop: [
    // 01 — FRAME CLOSE/MID
    { pos: [3, 4.2, 21], look: [0, 5, 9], fov: 34 },
    // 02 — ARCHITECTURAL SPACE (recua para o lado — frame + colunas + parede + piso juntos)
    { pos: [9.5, 5, 7], look: [-1, 3.6, -3], fov: 44 },
    // 03 — MONUMENTAL VIEW (baixa, leitura de escala). Duas tentativas
    // anteriores falharam pelo mesmo motivo (achado do QA visual, mesma
    // classe de erro do "black hole" já corrigido no X02 principal): olhar
    // quase reto para cima enquadra o INTERCOLÚNIO/forro/verga por baixo —
    // superfícies sem nenhuma luz motivada apontando para elas por baixo,
    // então dominam o quadro em preto quase puro. Câmera baixa mas NÃO
    // olhando quase-vertical: de lado e recuada, a mesma vantagem de 02
    // (colunas + parede + FRAME já comprovadamente bem iluminados de
    // frente), só mais baixa e com FOV mais aberto — a monumentalidade vem
    // da escala relativa no quadro largo, não de fitar o teto.
    { pos: [10, 1.4, 16], look: [-1, 5, 2], fov: 56 },
  ],
  mobile: [
    { pos: [2.2, 4.6, 25], look: [0, 5, 9], fov: 42 },
    { pos: [8.4, 5.4, 8], look: [-1, 3.6, -3], fov: 50 },
    { pos: [9, 1.6, 17], look: [-1, 5, 2], fov: 62 },
  ],
};

const SCROLL_BOUNDS = [0, 0.5, 1];
const CURVE_BOUNDS = [0, 0.5, 1];

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

const SEGMENT_EASES = [easeInOutSine, easeInOutSine];

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

function CameraRigV3({ mobile, scrollRef }: { mobile: boolean; scrollRef: RefObject<number> }) {
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

export { CameraRigV3, SCROLL_BOUNDS };
