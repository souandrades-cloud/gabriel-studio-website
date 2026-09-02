"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * UMA trajetória autorada só, ponta a ponta — 15 poses cobrindo os 8
 * estados da jornada. Nenhum teleporte, nenhum corte: cada estado é um
 * trecho da MESMA CatmullRomCurve3 (posição) + uma segunda curva de
 * lookAt explícita (não lookahead) — FRACTURE precisa de mira exata para
 * o anamorfismo funcionar, então a técnica é a mesma para a jornada
 * inteira em vez de misturar duas abordagens.
 *
 * SURFACE e THRESHOLD (0.00–0.10) compartilham a MESMA pose: a câmera
 * fica parada — é a cortina do DOM que revela o espaço, não o
 * deslocamento da câmera (hipótese validada no Prototype 002).
 *
 * Art Direction 001 — CHAMBER: os `look` originais miravam direto na
 * estrutura do CORE ao longe (mesma direção geral de DESCENT e FRACTURE)
 * — a câmera atravessava o campo de monólitos olhando PARA ALÉM dele, e o
 * quadro era dominado pela fachada distante da estrutura em vez do campo.
 * `look` de CHAMBER mira através do campo (lateral, não na fenda) — a
 * curva ainda passa exatamente pelos pontos de FRACTURE-aligned (t=0.5),
 * então o anamorfismo não é afetado.
 *
 * CHAMBER DIRECTION 002: FOV voltou de 48°/54° para 40°/46° (a mesma
 * faixa do resto da jornada). O FOV aberto era uma tentativa de "esperar"
 * que algo do campo aleatório caísse em quadro; com chamber.tsx agora
 * posicionando massas em coordenadas relativas às amostras reais desta
 * trajetória (não mais x/z do mundo aleatórios), a composição garante
 * assunto em quadro sem precisar abrir a lente.
 */
type Keyframe = {
  t: number;
  pos: readonly [number, number, number];
  look: readonly [number, number, number];
  fov: number;
  label: string;
};

/**
 * CORE V2 PRODUCTION INTEGRATION — t=0.68 a 1.0 substitui as 5 poses
 * antigas de "Core" (structure.tsx/interior.tsx, agora removidos) pela
 * mesma trajetória de 6 estados validada em `x02-lab/core-v2/camera-rig.tsx`
 * (Distance/Approach/Pre-Crossing/Crossing/First Interior/Impossible
 * Reveal) + uma 7ª pose nova (Reveal Hold, ver abaixo).
 *
 * TRANSFORMAÇÃO: translação rígida em Z (Δz=-36) aplicada a TODAS as poses
 * do laboratório — preserva 100% das relações relativas já validadas
 * (framing/proporção/pacing), só reposiciona o "palco" inteiro (câmera +
 * `core-shell.tsx`/`core-interior.tsx`, ambos também deslocados pelo mesmo
 * Δz implicitamente por já nascerem no mesmo referencial) para fora do
 * território já ocupado por DESCENT (z 31-48) e para depois do campo de
 * FRACTURE (z -9 a -24) — sem essa translação, a pose "Distance" original
 * (z=46) ficaria colada nas paredes de DESCENT. Resultado: z decresce
 * monotonicamente do handoff de VOID (z=20) até Reveal Hold (z=-60) — a
 * jornada nunca "recua" espacialmente, mesmo tendo ganhado uma sub-cena
 * inteira nova.
 *
 * Reveal Hold (t=1.0, NOVA): não existe no laboratório isolado (lá a curva
 * termina em Impossible Reveal). Aqui vira o handoff limpo para RESOLUTION
 * (briefing: "não pode terminar em empty black frame") — pose quase
 * idêntica a Impossible Reveal (mesma composição validada, mudança mínima),
 * resolvendo pela própria trajetória o black-hole t≈0.87-0.93 encontrado em
 * VISUAL CONTINUITY FIX 003 (o CORE antigo recuava para além de toda
 * geometria antes de RESOLUTION; aqui a câmera nunca sai do campo
 * arquitetônico do SHELL/echo/far-wall).
 */
const KEYFRAMES: Record<"desktop" | "mobile", Keyframe[]> = {
  desktop: [
    { t: 0.0, pos: [4.5, 9, 62], look: [0, 7, 20], fov: 38, label: "Surface" }, // pose de repouso — a anomalia (ver x02.css) acontece aqui
    { t: 0.1, pos: [4.1, 8.5, 58.3], look: [0, 6.6, 19.3], fov: 36, label: "Threshold" }, // RHYTHM+EVENTS: creep — a abertura é movimento espacial, não só a cortina DOM
    { t: 0.22, pos: [1.5, 6, 38], look: [0, 4, 15], fov: 24, label: "Descent" }, // COMPRESSION — FOV comprime, posição intocada (frustum já validado)
    { t: 0.26, pos: [0.25, 5.25, 32], look: [-4.5, 4.5, 14.5], fov: 50, label: "Chamber" }, // PAYOFF 01 — RELEASE: mesmo ponto real da curva já referenciado em chamber.tsx ("t=0.26"), agora um vértice explícito
    { t: 0.3, pos: [-1, 4.5, 26], look: [-9, 5, 14], fov: 46, label: "Chamber" }, // ARRIVAL — assenta um pouco abaixo do pico do release
    { t: 0.4, pos: [-3.5, 3.8, 14], look: [-11, 4, 2], fov: 40, label: "Chamber" },
    { t: 0.45, pos: [-9, 4.5, 2], look: [-13, 3, -8], fov: 40, label: "Fracture" },
    { t: 0.5, pos: [-8, 3, -6], look: [-8, 3, -22], fov: 34, label: "Fracture" },
    { t: 0.55, pos: [-4, 2.2, -14], look: [-9, 3, -24], fov: 40, label: "Fracture" },
    { t: 0.63, pos: [6, 10, 20], look: [0, 4, 0], fov: 34, label: "Void" },
    { t: 0.68, pos: [9, 1.5, 10], look: [0, -1, -26], fov: 30, label: "Core" }, // Distance
    { t: 0.74, pos: [4, 0.5, -10], look: [0, -1.5, -30], fov: 30, label: "Core" }, // Approach
    { t: 0.79, pos: [0.6, -1.8, -19], look: [0, -1.8, -29.8], fov: 30, label: "Core" }, // Pre-Crossing
    { t: 0.82, pos: [0, -2.5, -30], look: [0, -2.5, -41], fov: 26, label: "Core" }, // Crossing
    { t: 0.86, pos: [0, -2.5, -38], look: [0, -2, -56], fov: 40, label: "Core" }, // First Interior
    { t: 0.92, pos: [0, 2, -58], look: [0, 12, -91], fov: 52, label: "Core" }, // Impossible Reveal
    { t: 1.0, pos: [0, 2.4, -60], look: [0, 11, -90], fov: 50, label: "Resolution" }, // Reveal Hold
  ],
  // Mobile: mesma trajetória no mundo, câmera adaptada (recuo + FOV maior)
  // nos trechos onde o aspecto estreito cortaria a composição — mesmo
  // princípio já validado no Prototype 001/002, não uma jornada nova.
  //
  // CORE V2: mesma translação Δz=-36. Impossible Reveal/Reveal Hold mobile
  // recebem um look.y mais alto que o desktop (12→15) — achado do briefing
  // ("o flourish final de verticalidade era mais fraco em 390px"): a
  // correção não é abrir mais o FOV (já era maior que o desktop), é mirar
  // mais para cima — "olhar para cima e não achar o teto" é um gesto de
  // ALVO, não só de lente.
  mobile: [
    { t: 0.0, pos: [3.2, 9.2, 66], look: [0, 7, 20], fov: 44, label: "Surface" },
    { t: 0.1, pos: [2.9, 8.8, 62.4], look: [0, 6.6, 19.3], fov: 42, label: "Threshold" }, // RHYTHM+EVENTS: creep, mesmo princípio do desktop
    { t: 0.22, pos: [1.2, 6.4, 42], look: [0, 4, 15], fov: 30, label: "Descent" }, // COMPRESSION
    { t: 0.26, pos: [0.2, 5.6, 35.5], look: [-4.5, 4.5, 15.5], fov: 56, label: "Chamber" }, // PAYOFF 01 — RELEASE, reusa a amostra real já documentada em chamber.tsx (CHAMBER_SAMPLES.mobile[1])
    { t: 0.3, pos: [-0.8, 4.8, 29], look: [-9, 5, 16], fov: 50, label: "Chamber" }, // ARRIVAL
    { t: 0.4, pos: [-3, 4, 16], look: [-11, 4, 4], fov: 46, label: "Chamber" },
    { t: 0.45, pos: [-8, 4.8, 4], look: [-13, 3, -8], fov: 46, label: "Fracture" },
    { t: 0.5, pos: [-8, 3, -3], look: [-8, 3, -22], fov: 40, label: "Fracture" },
    { t: 0.55, pos: [-3.5, 2.4, -12], look: [-9, 3, -24], fov: 46, label: "Fracture" },
    { t: 0.63, pos: [5.4, 10.5, 23], look: [0, 4, 0], fov: 40, label: "Void" },
    { t: 0.68, pos: [8, 1.8, 16], look: [0, -1, -26], fov: 36, label: "Core" },
    { t: 0.74, pos: [3.6, 0.8, -6], look: [0, -1.5, -30], fov: 36, label: "Core" },
    { t: 0.79, pos: [0.6, -1.6, -17], look: [0, -1.6, -29.6], fov: 36, label: "Core" },
    // Crossing: pos.z original (-29.6) caía exatamente no plano central da
    // fachada do SHELL (frontZ, mesmo valor para mobile e desktop — a
    // geometria não muda por device). QA visual: mesmo puxando para -30
    // (mesma margem do desktop) o frame continuava sem leitura — o aspecto
    // estreito (390x844) reduz muito o FOV HORIZONTAL efetivo a partir do
    // FOV vertical (32° no original do laboratório), fechando demais para
    // enquadrar a largura real do vão a essa distância. Câmera puxada mais
    // para dentro (-32, margem maior que o desktop) + FOV subido (32->44).
    { t: 0.82, pos: [0, -2.4, -32], look: [0, -2.4, -42], fov: 44, label: "Core" },
    { t: 0.86, pos: [0, -2.4, -37.6], look: [0, -2, -54], fov: 46, label: "Core" },
    { t: 0.92, pos: [0, 2.2, -54], look: [0, 15, -82], fov: 62, label: "Core" },
    { t: 1.0, pos: [0, 2.6, -56], look: [0, 14, -81], fov: 58, label: "Resolution" },
  ],
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInCubic(t: number) {
  return t * t * t;
}
function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
/** RHYTHM + EVENTS: derivada quase zero perto de t=0 (long dwell — ARRIVAL
 *  HOLD), acelera forte perto de t=1 (retoma o CHAMBER TRAVERSE). Só a forma
 *  da curva muda — os dois pontos do trecho continuam os já validados
 *  (t=0.30/t=0.40 de CHAMBER_SAMPLES), então o campo de colunas/piso não
 *  precisa de nenhuma amostra nova. */
function easeInQuint(t: number) {
  return t * t * t * t * t;
}

/**
 * Um easing por trecho, na mesma ordem dos 14 segmentos entre as 15 poses.
 * Os dois trechos ao redor de FRACTURE-aligned (índices 4 e 5) usam
 * easeInOutSine dos dois lados da fronteira — derivada zero nos dois,
 * então a velocidade cai a zero exatamente no alinhamento (o "beat").
 * CORE mantém o mesmo desenho do Prototype 001: aproximação suave,
 * SURFACE→CROSSING rápido (easeInOutQuad), saída acelerando e assentando.
 *
 * Art Direction 001 — "Motion Direction": DESCENT/CHAMBER-enter (índices 1
 * e 2) trocaram de easeInOutSine uniforme para easeInCubic → easeOutCubic —
 * a câmera acelera como quem cai, depois desacelera ao chegar (não um zoom
 * simétrico). Contraste entre trechos, não suavidade uniforme (briefing).
 */
/**
 * CORE V2 PRODUCTION INTEGRATION: os 8 primeiros trechos (Surface até
 * Fracture->Void) são intocados. Os 7 seguintes (Void->Distance até
 * ImpossibleReveal->RevealHold) reaproveitam — na mesma ordem — os 5 eases
 * já validados em `x02-lab/core-v2/camera-rig.tsx` para seu próprio arco
 * interno (easeInOutSine/easeInOutSine/easeInOutQuad/easeOutCubic/
 * easeInOutSine), com um `easeInOutSine` de entrada (Void->Distance, deriva
 * calma) e um `easeOutCubic` de saída (ImpossibleReveal->RevealHold,
 * assenta com firmeza no handoff).
 */
/**
 * RHYTHM + EVENTS (Pass 2): 16 trechos agora (17 poses — a nova "Chamber
 * release" em t=0.26 entra entre Descent e Chamber-arrival).
 */
const SEGMENT_EASES = [
  easeOutCubic, // Surface -> Threshold: a abertura assenta, não é mais "mesma pose"
  easeInCubic, // Threshold -> Descent: começa a cair, acelera
  easeOutCubic, // Descent(compressão) -> Chamber-release: o estouro da abertura
  easeInOutSine, // Chamber-release -> Chamber-arrival: assenta do pico
  easeInQuint, // Chamber-arrival -> Chamber-mid: ARRIVAL HOLD, depois retoma o traverse
  easeInOutSine, // Chamber-mid -> Fracture-chaosA
  easeInOutSine, // Fracture-chaosA -> aligned
  easeInOutSine, // Fracture-aligned -> chaosB
  easeOutCubic, // Fracture-chaosB -> Void
  easeInOutSine, // Void -> Distance
  easeInOutSine, // Distance -> Approach
  easeInOutSine, // Approach -> Pre-Crossing
  easeInOutQuad, // Pre-Crossing -> Crossing: decisão mais firme
  easeOutCubic, // Crossing -> First Interior: saída rápida da compressão
  easeInOutSine, // First Interior -> Impossible Reveal
  easeOutCubic, // Impossible Reveal -> Reveal Hold: assenta no handoff
];

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

/**
 * Converte progresso de scroll (0–1, limiares não-uniformes da tabela
 * acima) em `u` (0–1 uniforme da curva — 15 pontos = 14 segmentos de
 * 1/14), aplicando o easing do trecho correspondente. Mesma técnica do
 * Prototype 001/002, generalizada para um número arbitrário de pontos.
 */
function makeScrollToCurveU(keyframes: Keyframe[]) {
  const bounds = keyframes.map((k) => k.t);
  const n = keyframes.length - 1;
  return function scrollToCurveU(t: number) {
    const clamped = clamp01(t);
    let i = n - 1;
    for (let s = 0; s < n; s++) {
      if (clamped <= bounds[s + 1]) {
        i = s;
        break;
      }
    }
    const span = bounds[i + 1] - bounds[i];
    const local = span > 0 ? (clamped - bounds[i]) / span : 1;
    const eased = SEGMENT_EASES[i](clamp01(local));
    return (i + eased) / n;
  };
}

/** Estados em que o pointer fica desligado — precisão de câmera importa mais
 *  que presença ambiente. CORE V2: span atualizado para Distance-Impossible
 *  Reveal (0.66-0.92); pointer volta no handoff de Reveal Hold, mesmo
 *  princípio do span antigo (retomava perto do fim). */
function pointerActiveAt(t: number) {
  const inFracture = t >= 0.45 && t <= 0.55;
  const inCore = t >= 0.66 && t <= 0.92;
  return !inFracture && !inCore;
}

/** Só é montada quando o modo motion está ativo (ver scene.tsx) — reduced-motion usa ReducedCameraRig. */
function CameraRig({
  mobile,
  scrollRef,
  pointerRef,
}: {
  mobile: boolean;
  scrollRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
}) {
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
  const scrollToCurveU = useMemo(() => makeScrollToCurveU(keyframes), [keyframes]);
  const fovAt = useMemo(() => {
    return (u: number) => {
      const scaled = clamp01(u) * (keyframes.length - 1);
      const i = Math.min(keyframes.length - 2, Math.floor(scaled));
      const local = scaled - i;
      return THREE.MathUtils.lerp(keyframes[i].fov, keyframes[i + 1].fov, local);
    };
  }, [keyframes]);

  const appliedU = useRef(0);
  const smoothedPointer = useRef({ x: 0, y: 0 });

  useFrame(({ camera }, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const rawT = scrollRef.current ?? 0;
    const u = scrollToCurveU(rawT);
    const k = Math.min(1, delta * 8);
    appliedU.current += (u - appliedU.current) * k;

    const pointerOn = pointerActiveAt(rawT);
    const px = pointerOn ? pointerRef.current.x : 0;
    const py = pointerOn ? pointerRef.current.y : 0;
    const pk = Math.min(1, delta * 2.6);
    smoothedPointer.current.x += (px - smoothedPointer.current.x) * pk;
    smoothedPointer.current.y += (py - smoothedPointer.current.y) * pk;

    const pos = posCurve.getPoint(appliedU.current);
    camera.position.set(
      pos.x + smoothedPointer.current.x * 0.16,
      pos.y - smoothedPointer.current.y * 0.1,
      pos.z,
    );

    const look = lookCurve.getPoint(appliedU.current);
    camera.lookAt(
      look.x + smoothedPointer.current.x * 0.05,
      look.y - smoothedPointer.current.y * 0.03,
      look.z,
    );

    const fov = fovAt(appliedU.current);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

/**
 * Reduced-motion: NÃO é a curva contínua parada num frame — o briefing
 * pede uma apresentação reduzida com os estados essenciais, sem travessia
 * animada entre eles. Cada fatia de scroll salta (corte duro, sem
 * interpolação) para uma das poses.
 *
 * CORE V2 PRODUCTION INTEGRATION: 4 stops -> 5 (briefing, "Reduced Motion":
 * "pode utilizar poses discretas: EXTERIOR -> IMPOSSIBLE INTERIOR" — o
 * payoff 03 precisa de DOIS pontos discretos próprios, não competir com o
 * único stop que antes cobria todo o CORE). t=0.68 (Distance, o SHELL
 * pequeno e fechado) e t=0.92 (Impossible Reveal, o clímax) — ambos
 * precisam existir literalmente em KEYFRAMES (ver acima) para o `find`
 * abaixo encontrar uma pose exata.
 *
 * `scrollRef` já chega pré-encaixado num destes 5 valores em modo reduced
 * (ver experience.tsx) — é o MESMO valor que Interior/Chamber/core-shell
 * usam para decidir o que revelar, então a câmera pula direto para
 * Impossible Reveal (0.92) e o SHELL/interior JÁ aparecem revelados (os
 * gates de opacidade também leem 0.92), em vez de pular pra lá e a cena
 * ainda estar invisível.
 */
const REDUCED_STOPS = [0, 0.5, 0.68, 0.92, 1.0];

function ReducedCameraRig({
  mobile,
  scrollRef,
}: {
  mobile: boolean;
  scrollRef: RefObject<number>;
}) {
  const keyframes = mobile ? KEYFRAMES.mobile : KEYFRAMES.desktop;

  useFrame(({ camera }) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const t = scrollRef.current ?? 0;
    const target = keyframes.find((k) => k.t === t) ?? keyframes[0];
    camera.position.set(...target.pos);
    camera.lookAt(...target.look);
    if (camera.fov !== target.fov) {
      camera.fov = target.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export { CameraRig, KEYFRAMES, pointerActiveAt, REDUCED_STOPS, ReducedCameraRig };
