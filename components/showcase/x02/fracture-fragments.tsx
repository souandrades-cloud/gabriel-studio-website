"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { beveledBoxGeometry, roughnessNoiseTexture, taperedColumnGeometry } from "./geometry-v3";
import { fractureStoneMaterial } from "./materials-v3";
import { ACTIVE_PALETTE } from "./palette";

/**
 * FRACTURE ARCHITECTURAL REDIRECTION — reescrita completa da geração de
 * fragmentos (a matemática de alinhamento anamórfico permanece intocada,
 * ver abaixo). Diagnóstico anterior: os fragmentos eram lascas finas de
 * `BoxGeometry` unitária, escala e ângulo puramente aleatórios — liam como
 * "barras retangulares flutuando", sem nenhuma relação formal com o CHAMBER
 * que o visitante acabou de atravessar.
 *
 * PRINCÍPIO NOVO: fragmentos têm MEMÓRIA ARQUITETÔNICA. Três tiers
 * hierárquicos (briefing, "Direção de Composição"):
 *
 * - HERO (3 desktop / 2 mobile) — peças individuais autoradas (não
 *   instanced), cada uma reconhecível: um segmento de PILAR
 *   (`taperedColumnGeometry`, mesma técnica das colunas do CHAMBER), uma
 *   VERGA/LINTEL deslocada e um fragmento de MOLDURA/JAMB — todas em
 *   `beveledBoxGeometry`/`taperedColumnGeometry`, a mesma gramática do
 *   resto do X02, nunca uma linguagem nova.
 * - MID (17 desktop / 10 mobile) — dois `InstancedMesh` (segmentos de pilar
 *   + placas de parede), responsáveis pelo volume espacial e por reforçar
 *   o alinhamento.
 * - SMALL (11 desktop / 6 mobile) — um `InstancedMesh` de detritos
 *   minerais pequenos, só para ritmo/profundidade (briefing: "não
 *   transformar a cena em partículas" — por isso poucos, não uma nuvem).
 *
 * ANAMORFISMO PRESERVADO: a lei original — `offset = ratio * depth`, o
 * mesmo princípio de `jitterMag = depth * ANGULAR_JITTER` do código
 * anterior — continua sendo o único mecanismo de alinhamento. O que mudou
 * é COMO o `ratio` é escolhido: antes, um ângulo aleatório num círculo;
 * agora, um ponto autorado na silhueta de uma abertura tipo FRAME (dois
 * jambs + verga — a mesma linhagem formal de `core-shell.tsx`
 * `frameParts()`/`JAMB_SPLIT`, sem importar o código de lá para não
 * acoplar CORE V2 — nenhuma alteração ali). ESCALA também passou a ser
 * `baseScale * depth`: um fragmento perto da câmera nasce em escala de
 * mão, um fragmento distante nasce em escala monumental — vistos de
 * `ALIGNED_EYE`, os dois colapsam no MESMO tamanho angular. É essa segunda
 * proporcionalidade (nova) que faz o alinhamento em t≈0.50 ler como "uma
 * estrutura", não só "pontos alinhados".
 *
 * CAUSALIDADE CHAMBER → FRACTURE: `HERO_REVEAL_START = 0.40` coincide
 * exatamente com `EXIT_FADE_START` de chamber.tsx — o primeiro fragmento
 * HERO começa a materializar no MESMO instante em que a última coluna do
 * CHAMBER começa a se dissolver. MID entra em seguida (0.42), SMALL por
 * último (0.44) — peças grandes primeiro, poeira depois, a sequência
 * física de uma falha estrutural real.
 */
const ALIGNED_EYE: readonly [number, number, number] = [-8, 3, -6];
const ALIGNED_LOOK: readonly [number, number, number] = [-8, 3, -22];

/**
 * Alvo de alinhamento — uma abertura tipo FRAME, em unidades de RATIO POR
 * PROFUNDIDADE (o offset mundial real é `ratio * depth`, nunca um valor
 * absoluto): dois jambs verticais + uma verga horizontal entre eles, mesma
 * lógica formal do FRAME de THRESHOLD/CORE, só que aqui existe apenas como
 * alvo geométrico (não como massa construída) — os fragmentos que convergem
 * PARA esses três alvos é que formam a silhueta, momentaneamente, em
 * t≈0.50.
 */
const FRAME_HALF_WIDTH = 0.19;
const FRAME_TOP = 0.15;
const FRAME_BOTTOM = -0.24;
const FRAME_HEADER_BAND = 0.05;
/** SMALL usa uma dispersão mais larga que a própria abertura — "detritos
 *  ao redor", não grudados na silhueta (briefing: "apenas para completar
 *  ritmo e profundidade"). */
const SCATTER_HALF_WIDTH = FRAME_HALF_WIDTH * 1.55;
const SCATTER_TOP = FRAME_TOP * 1.45;
const SCATTER_BOTTOM = FRAME_BOTTOM * 1.3;
/** Imperfeição sobre o alvo autorado — impede que o alinhamento pareça
 *  CAD-perfeito ("uma arquitetura impossível MOMENTANEAMENTE reconstruída",
 *  briefing) — residual, não o mecanismo principal (era o único mecanismo
 *  no código anterior). */
const RESIDUAL_JITTER = 0.018;

/** DISTURBANCE, escalonada por tier — peças grandes primeiro, debris depois. */
const HERO_REVEAL_START = 0.4;
const HERO_REVEAL_END = 0.44;
const MID_REVEAL_START = 0.42;
const MID_REVEAL_END = 0.47;
const SMALL_REVEAL_START = 0.44;
const SMALL_REVEAL_END = 0.49;
/** DISINTEGRATION — uniforme entre tiers (briefing: VOID precisa de
 *  silêncio limpo, não um único fragmento remanescente sozinho). Fecha
 *  antes de t=0.63 (pose "Void" da câmera), mesma margem já validada. */
const FADE_START = 0.56;
const FADE_END = 0.62;
/** ALIGNMENT AS A MOMENT — mesmo timing do código anterior; amplitude
 *  drasticamente reduzida (briefing: "deve continuar, mas extremamente
 *  controlado") — a luz real da Light Foundation agora faz o trabalho
 *  principal de volume/silhueta, o pulso é só o reforço físico no beat. */
const ALIGN_PULSE_START = 0.46;
const ALIGN_PULSE_PEAK = 0.5;
const ALIGN_PULSE_END = 0.54;
const EMISSIVE_BASE = 0.12;
const EMISSIVE_PEAK = 0.3;

function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
function smoothstep(t: number, a: number, b: number) {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
}

type Basis = { eye: THREE.Vector3; dir: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 };

/** Mesma construção de base ortonormal do código anterior — intocada. */
function computeAlignedBasis(): Basis {
  const eye = new THREE.Vector3(...ALIGNED_EYE);
  const look = new THREE.Vector3(...ALIGNED_LOOK);
  const dir = look.clone().sub(eye).normalize();
  const upRef = Math.abs(dir.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(dir, upRef).normalize();
  const up = new THREE.Vector3().crossVectors(right, dir).normalize();
  return { eye, dir, right, up };
}

/** A LEI do anamorfismo — `offset = ratio * depth` — idêntica em espírito à
 *  `jitterMag = depth * ANGULAR_JITTER` original, generalizada para
 *  qualquer ratio (autorado ou aleatório) em vez de só um ângulo num
 *  círculo. */
function worldPositionFor(
  basis: Basis,
  depth: number,
  ratioX: number,
  ratioY: number,
): THREE.Vector3 {
  return basis.eye
    .clone()
    .addScaledVector(basis.dir, depth)
    .addScaledVector(basis.right, ratioX * depth)
    .addScaledVector(basis.up, ratioY * depth);
}

type Slot = "leftJamb" | "rightJamb" | "header" | "scatter";

function slotRatio(slot: Slot, alongT: number, rand: () => number): { x: number; y: number } {
  switch (slot) {
    case "leftJamb":
      return { x: -FRAME_HALF_WIDTH, y: THREE.MathUtils.lerp(FRAME_BOTTOM, FRAME_TOP, alongT) };
    case "rightJamb":
      return { x: FRAME_HALF_WIDTH, y: THREE.MathUtils.lerp(FRAME_BOTTOM, FRAME_TOP, alongT) };
    case "header":
      return {
        x: THREE.MathUtils.lerp(-FRAME_HALF_WIDTH, FRAME_HALF_WIDTH, alongT),
        y: FRAME_TOP + FRAME_HEADER_BAND / 2,
      };
    case "scatter":
      return {
        x: THREE.MathUtils.lerp(-SCATTER_HALF_WIDTH, SCATTER_HALF_WIDTH, rand()),
        y: THREE.MathUtils.lerp(SCATTER_BOTTOM, SCATTER_TOP, rand()),
      };
  }
}

type SlotWeight = { type: Slot; weight: number };

function pickSlot(rand: () => number, slots: readonly SlotWeight[]): Slot {
  const total = slots.reduce((sum, s) => sum + s.weight, 0);
  let r = rand() * total;
  for (const s of slots) {
    if (r < s.weight) return s.type;
    r -= s.weight;
  }
  return slots[slots.length - 1].type;
}

type Instance = {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotationY: number;
  tiltX: number;
  tiltZ: number;
  tone: number;
};

type TierConfig = {
  count: number;
  depthMin: number;
  depthMax: number;
  slots: readonly SlotWeight[];
  /** "uniform": peças tipo pilar — um único fator escalar (preserva a
   *  proporção do afunilamento). "axes": peças tipo placa/detrito — x/y/z
   *  independentes (silhueta de placa larga e fina, não um cubo). */
  scaleMode: "uniform" | "axes";
  baseScale: { x: number; y: number; z: number };
  scaleJitter: number;
  rotationYRange: number;
  tiltRange: number;
};

/** Gerador genérico de um tier (MID_PIER/MID_SLAB/SMALL) — mesma lei de
 *  offset∝depth do resto do arquivo, agora também aplicada à ESCALA
 *  (`baseScale * depth`): perto da câmera nasce em escala de mão, longe
 *  nasce em escala monumental — vistos de ALIGNED_EYE, colapsam no mesmo
 *  tamanho angular. */
function generateTier(basis: Basis, rand: () => number, cfg: TierConfig): Instance[] {
  const out: Instance[] = [];
  for (let i = 0; i < cfg.count; i++) {
    const slot = pickSlot(rand, cfg.slots);
    const depth = THREE.MathUtils.lerp(cfg.depthMin, cfg.depthMax, rand());
    const alongT = rand();
    const base = slotRatio(slot, alongT, rand);
    const jitterX = (rand() - 0.5) * 2 * RESIDUAL_JITTER;
    const jitterY = (rand() - 0.5) * 2 * RESIDUAL_JITTER;
    const position = worldPositionFor(basis, depth, base.x + jitterX, base.y + jitterY);

    const jScale = 1 + (rand() - 0.5) * 2 * cfg.scaleJitter;
    const scale =
      cfg.scaleMode === "uniform"
        ? new THREE.Vector3(1, 1, 1).multiplyScalar(cfg.baseScale.x * depth * jScale)
        : new THREE.Vector3(
            cfg.baseScale.x * depth * jScale,
            cfg.baseScale.y * depth * jScale,
            cfg.baseScale.z * depth * jScale,
          );

    const rotationY = (rand() - 0.5) * 2 * cfg.rotationYRange;
    const tiltX = (rand() - 0.5) * 2 * cfg.tiltRange;
    const tiltZ = (rand() - 0.5) * 2 * cfg.tiltRange;
    out.push({ position, scale, rotationY, tiltX, tiltZ, tone: rand() });
  }
  return out;
}

const MID_PIER_CONFIG: Omit<TierConfig, "count"> = {
  depthMin: 6,
  depthMax: 30,
  slots: [
    { type: "leftJamb", weight: 0.4 },
    { type: "rightJamb", weight: 0.4 },
    { type: "header", weight: 0.2 },
  ],
  scaleMode: "uniform",
  baseScale: { x: 0.044, y: 0, z: 0 },
  scaleJitter: 0.26,
  rotationYRange: 0.5,
  tiltRange: 0.1,
};

/** VISUAL FIX (QA em browser real, t=0.50): a config original
 *  (`baseScale.x=0.22`) produzia placas mais largas que o próprio vão entre
 *  jambs — em vez de ladear a abertura, elas a atravessavam e preenchiam,
 *  lendo como "massa densa" em vez de "estrutura com um vão". `baseScale`
 *  reduzido a menos da metade e peso de `header` rebalanceado para os
 *  jambs — menos placas cruzando o topo, mais reforçando as laterais. */
const MID_SLAB_CONFIG: Omit<TierConfig, "count"> = {
  depthMin: 7,
  depthMax: 30,
  slots: [
    { type: "header", weight: 0.32 },
    { type: "leftJamb", weight: 0.34 },
    { type: "rightJamb", weight: 0.34 },
  ],
  scaleMode: "axes",
  baseScale: { x: 0.1, y: 0.06, z: 0.04 },
  scaleJitter: 0.3,
  rotationYRange: 1.3,
  tiltRange: 0.18,
};

const SMALL_CONFIG: Omit<TierConfig, "count"> = {
  depthMin: 3,
  depthMax: 14,
  slots: [
    { type: "scatter", weight: 0.7 },
    { type: "leftJamb", weight: 0.1 },
    { type: "rightJamb", weight: 0.1 },
    { type: "header", weight: 0.1 },
  ],
  scaleMode: "axes",
  baseScale: { x: 0.09, y: 0.11, z: 0.08 },
  scaleJitter: 0.4,
  rotationYRange: Math.PI,
  tiltRange: 0.35,
};

type HeroSpec = {
  depth: number;
  ratioX: number;
  ratioY: number;
  rotationY: number;
  tiltX: number;
  tiltZ: number;
  tone: number;
};

/** HERO FRAGMENTS — autoradas, não geradas por RNG (briefing: "composição
 *  AUTHOR-DIRECTED"). As três leem, nesta ordem, como um pilar que perdeu
 *  continuidade, uma verga deslocada e um fragmento de moldura — cada uma
 *  atribuída a um dos três alvos (jamb esquerdo / verga / jamb direito) da
 *  mesma abertura que MID/SMALL também alimentam. */
const HERO_SPECS: readonly HeroSpec[] = [
  // Segmento de PILAR — depth baixo (presença dominante), altura de
  // "segmento" (4.4, nunca a altura cheia 8-14 de uma coluna do CHAMBER —
  // é isso que lê como "perdeu continuidade", não uma coluna inteira).
  {
    depth: 8.5,
    ratioX: -FRAME_HALF_WIDTH,
    ratioY: -0.08,
    rotationY: 0.12,
    tiltX: 0.03,
    tiltZ: -0.05,
    tone: 0.58,
  },
  // LINTEL deslocada — tilt deliberado (não random) em Z, a leitura exata
  // de "um lintel aparece deslocado" pedida no briefing.
  {
    depth: 13.5,
    ratioX: 0,
    ratioY: FRAME_TOP + 0.025,
    rotationY: 0.05,
    tiltX: 0.06,
    tiltZ: 0.14,
    tone: 0.42,
  },
  // Fragmento de MOLDURA/JAMB — depth maior, mesma proporção de jamb de
  // core-shell.tsx/descent-gates.tsx (estreita e alta).
  {
    depth: 19,
    ratioX: FRAME_HALF_WIDTH,
    ratioY: -0.02,
    rotationY: -0.09,
    tiltX: -0.04,
    tiltZ: 0.03,
    tone: 0.7,
  },
];

const HERO_PIER_GEO = { bottomWidth: 1.0, bottomDepth: 0.85, topWidth: 0.68, height: 4.4 } as const;
const HERO_LINTEL_GEO = { width: 3.0, height: 0.78, depth: 0.85, bevel: 0.1 } as const;
const HERO_JAMB_GEO = { width: 0.85, height: 3.6, depth: 0.8, bevel: 0.12 } as const;

function toneColor(tone: number): THREE.Color {
  const range = ACTIVE_PALETTE.fractureLightMax - ACTIVE_PALETTE.fractureLightMin;
  return new THREE.Color().setHSL(
    ACTIVE_PALETTE.columnHue,
    ACTIVE_PALETTE.columnSat,
    ACTIVE_PALETTE.fractureLightMin + tone * range,
  );
}

/** Material compartilhado pelos 3 tiers instanced — mesma técnica
 *  vertexColors do código anterior (cor por instância, `material.color`
 *  base branco para não compor duas escuridões, ver histórico). */
function instancedFractureMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.78,
    metalness: 0.05,
    roughnessMap: roughnessNoiseTexture(),
    vertexColors: true,
    emissive: ACTIVE_PALETTE.emissive,
    emissiveIntensity: EMISSIVE_BASE,
    transparent: true,
    opacity: 0,
  });
}

function applyInstances(mesh: THREE.InstancedMesh | null, instances: Instance[]) {
  if (!mesh) return;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  instances.forEach((inst, i) => {
    q.setFromEuler(new THREE.Euler(inst.tiltX, inst.rotationY, inst.tiltZ));
    m.compose(inst.position, q, inst.scale);
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, toneColor(inst.tone));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

function FractureFragments({
  mobile,
  scrollRef,
}: {
  mobile: boolean;
  scrollRef: RefObject<number>;
}) {
  const heroCount = mobile ? 2 : 3;
  const midPierCount = mobile ? 5 : 8;
  const midSlabCount = mobile ? 4 : 7;
  const smallCount = mobile ? 6 : 11;

  const basis = useMemo(() => computeAlignedBasis(), []);

  const heroSpecs = useMemo(() => HERO_SPECS.slice(0, heroCount), [heroCount]);
  const heroPositions = useMemo(
    () => heroSpecs.map((h) => worldPositionFor(basis, h.depth, h.ratioX, h.ratioY)),
    [basis, heroSpecs],
  );

  // Uma única passada de RNG para os 3 tiers instanced — `rand` é um
  // gerador com estado interno mutável; se cada tier fosse seu próprio
  // useMemo independente, uma mudança em SÓ uma contagem (ex.: só
  // `smallCount` reage a um resize) reconsumiria o stream fora de ordem.
  // Um único useMemo garante geração atômica e determinística.
  const tiers = useMemo(() => {
    const rand = mulberry32(20260902);
    return {
      midPier: generateTier(basis, rand, { ...MID_PIER_CONFIG, count: midPierCount }),
      midSlab: generateTier(basis, rand, { ...MID_SLAB_CONFIG, count: midSlabCount }),
      small: generateTier(basis, rand, { ...SMALL_CONFIG, count: smallCount }),
    };
  }, [basis, midPierCount, midSlabCount, smallCount]);

  const heroGeometries = useMemo(
    () =>
      [
        taperedColumnGeometry(
          HERO_PIER_GEO.bottomWidth,
          HERO_PIER_GEO.bottomDepth,
          HERO_PIER_GEO.topWidth,
          HERO_PIER_GEO.height,
        ),
        beveledBoxGeometry(
          HERO_LINTEL_GEO.width,
          HERO_LINTEL_GEO.height,
          HERO_LINTEL_GEO.depth,
          HERO_LINTEL_GEO.bevel,
        ),
        beveledBoxGeometry(
          HERO_JAMB_GEO.width,
          HERO_JAMB_GEO.height,
          HERO_JAMB_GEO.depth,
          HERO_JAMB_GEO.bevel,
        ),
      ].slice(0, heroCount),
    [heroCount],
  );
  const heroMaterials = useMemo(
    () => heroSpecs.map((h) => fractureStoneMaterial(h.tone, true)),
    [heroSpecs],
  );

  const midPierGeometry = useMemo(() => taperedColumnGeometry(1, 0.85, 0.66, 3.2), []);
  const midSlabGeometry = useMemo(() => beveledBoxGeometry(1, 1, 1, 0.1), []);
  const smallGeometry = useMemo(() => beveledBoxGeometry(1, 1, 1, 0.16), []);

  const midPierMaterial = useMemo(() => instancedFractureMaterial(), []);
  const midSlabMaterial = useMemo(() => instancedFractureMaterial(), []);
  const smallMaterial = useMemo(() => instancedFractureMaterial(), []);

  const heroGroupRef = useRef<THREE.Group>(null);
  const midPierRef = useRef<THREE.InstancedMesh>(null);
  const midSlabRef = useRef<THREE.InstancedMesh>(null);
  const smallRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    applyInstances(midPierRef.current, tiers.midPier);
    applyInstances(midSlabRef.current, tiers.midSlab);
    applyInstances(smallRef.current, tiers.small);
  }, [tiers]);

  useFrame(() => {
    const t = scrollRef.current ?? 0;
    const fadeOut = 1 - smoothstep(t, FADE_START, FADE_END);
    const heroOpacity = smoothstep(t, HERO_REVEAL_START, HERO_REVEAL_END) * fadeOut;
    const midOpacity = smoothstep(t, MID_REVEAL_START, MID_REVEAL_END) * fadeOut;
    const smallOpacity = smoothstep(t, SMALL_REVEAL_START, SMALL_REVEAL_END) * fadeOut;

    const pulse =
      smoothstep(t, ALIGN_PULSE_START, ALIGN_PULSE_PEAK) *
      (1 - smoothstep(t, ALIGN_PULSE_PEAK, ALIGN_PULSE_END));
    const emissiveIntensity = THREE.MathUtils.lerp(EMISSIVE_BASE, EMISSIVE_PEAK, pulse);

    const heroGroup = heroGroupRef.current;
    if (heroGroup) {
      heroGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.opacity = heroOpacity;
          mat.emissiveIntensity = emissiveIntensity;
        }
      });
    }
    const midPier = midPierRef.current;
    if (midPier) {
      const mat = midPier.material as THREE.MeshStandardMaterial;
      mat.opacity = midOpacity;
      mat.emissiveIntensity = emissiveIntensity;
    }
    const midSlab = midSlabRef.current;
    if (midSlab) {
      const mat = midSlab.material as THREE.MeshStandardMaterial;
      mat.opacity = midOpacity;
      mat.emissiveIntensity = emissiveIntensity;
    }
    const small = smallRef.current;
    if (small) {
      const mat = small.material as THREE.MeshStandardMaterial;
      mat.opacity = smallOpacity;
      mat.emissiveIntensity = emissiveIntensity;
    }
  });

  useEffect(() => {
    return () => {
      heroGeometries.forEach((g) => g.dispose());
      heroMaterials.forEach((m) => m.dispose());
      midPierGeometry.dispose();
      midSlabGeometry.dispose();
      smallGeometry.dispose();
      midPierMaterial.dispose();
      midSlabMaterial.dispose();
      smallMaterial.dispose();
    };
  }, [
    heroGeometries,
    heroMaterials,
    midPierGeometry,
    midSlabGeometry,
    smallGeometry,
    midPierMaterial,
    midSlabMaterial,
    smallMaterial,
  ]);

  // LIGHT FOUNDATION 001 — decisão reafirmada: sem cast/receiveShadow.
  // Continua sem existir nenhum piso em FRACTURE ("fractured floor" segue
  // fora de escopo) para receber a sombra — custo sem efeito visível.
  // `frustumCulled=false` nos 3 InstancedMesh: a faixa de profundidade
  // agora vai de 3 a 38 (era 3-18), e o bounding sphere automático de um
  // InstancedMesh é calculado a partir da geometria BASE, não das
  // transforms por instância — sem isso, instâncias nos extremos da faixa
  // podem ser cortadas incorretamente pelo frustum culling.
  return (
    <group>
      <group ref={heroGroupRef}>
        {heroSpecs.map((h, i) => (
          <mesh
            key={`hero-${i}`}
            geometry={heroGeometries[i]}
            material={heroMaterials[i]}
            position={heroPositions[i]}
            rotation={[h.tiltX, h.rotationY, h.tiltZ]}
          />
        ))}
      </group>
      <instancedMesh
        ref={midPierRef}
        args={[midPierGeometry, midPierMaterial, midPierCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={midSlabRef}
        args={[midSlabGeometry, midSlabMaterial, midSlabCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={smallRef}
        args={[smallGeometry, smallMaterial, smallCount]}
        frustumCulled={false}
      />
    </group>
  );
}

export { FractureFragments };
