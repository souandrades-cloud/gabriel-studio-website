"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { beveledBoxGeometry, taperedColumnGeometry } from "./geometry-v3";
import { columnStoneMaterial, floorStoneMaterial, metalAccentMaterial } from "./materials-v3";

/**
 * CHAMBER DIRECTION 002 — causa raiz confirmada por QA visual (Art
 * Direction 001): a câmera é AUTORADA/determinística (camera-rig.tsx), mas
 * o campo era PROCEDURAL/disperso — em muitos instantes a câmera olhava
 * para um vão do campo (quadro quase vazio) ou passava colada demais numa
 * massa (painel sem silhueta). Nenhuma quantidade de luz/FOV/densidade
 * resolve isso: o problema é onde as massas nascem, não como são
 * renderizadas.
 *
 * Fix: PROCEDURAL-DIRECTED. Continua um InstancedMesh só (1 draw call),
 * mas cada massa nasce em COORDENADAS RELATIVAS a uma amostra real da
 * trajetória (posição + look de camera-rig.tsx, interpolados nos mesmos
 * pontos) — nunca em x/z do mundo direto. Isso garante que o assunto
 * principal SEMPRE existe relativo ao que a câmera está olhando naquele
 * instante, em vez de confiar que um x aleatório caia dentro do cone.
 *
 * Três camadas (briefing "Composição"):
 * FOREGROUND — HERO_MASSES: massas autoradas (não aleatórias em
 *   posição), ancoram ENTRY/MID/EXIT (+ duas em CHAMBER GAP FIX 003 para
 *   o trecho MID/LATE). Nunca centralizadas no eixo de mira — sempre com
 *   offset lateral mínimo, então nunca bloqueiam a lente.
 * MIDGROUND — carrega a leitura principal ("existe um campo"): disperso
 *   dentro de uma banda AUTORADA por amostra (offsets/profundidade têm
 *   limites definidos), só o valor exato dentro da banda é aleatório.
 * BACKGROUND — silhuetas menores nas amostras mais distantes (ENTRY/
 *   CHAMBER-enter), sumindo no fog, sem função compositiva precisa.
 *
 * Randomness (seed fixa) só decide: altura/largura secundárias, rotação
 * mínima, tom mineral, e o valor exato dentro de uma banda já autorada —
 * nunca SE existe massa em quadro.
 */
/**
 * SPATIAL WORLD V2 — CHAMBER. Composição substituída (briefing: "não
 * preservar o antigo apenas porque já foi corrigido"): campo de massas
 * dispersas → COLUMN ROW rítmica (1 ou 2 colunas por amostra, sempre —
 * nunca "N aleatório") + duas massas autoradas (ENTRY e um landmark
 * distante) + um PLANE de piso. O motor de posicionamento (CHAMBER_SAMPLES,
 * sampleBasis, placeFromSample, InstancedMesh único, opacity gating) é
 * engenharia já validada (CHAMBER GAP FIX 003) e continua sem alteração —
 * só a REGRA de o que nasce em cada amostra mudou.
 *
 * COMPOSITION + COLOR PASS 002 — "Black Void Problem": a janela anterior
 * (0.19-0.26) terminava de revelar DEPOIS da travessia do FRAME (t≈0.22,
 * ver descent-gates.tsx) — bem no momento de maior atenção (o próprio
 * cruzamento), a câmera já tinha passado a última massa de DESCENT e
 * CHAMBER ainda estava só ~40-60% opaco, produzindo o buraco preto
 * reportado pelo QA humano logo após "entrar". Fix: reveal termina ANTES
 * da travessia (0.205 < 0.22), e começa mais cedo (0.14, dentro do trecho
 * em que a câmera ainda acelera na queda — ver SEGMENT_EASES em
 * camera-rig.tsx) para que a aproximação inteira já tenha alguma
 * referência espacial contínua, não só o FRAME distante.
 *
 * RHYTHM + EVENTS (Pass 2) — PAYOFF 01 "CHAMBER REVEAL": a janela antiga
 * terminava ANTES da travessia (t=0.205 < crossing em t≈0.22) — o campo já
 * estava 100% opaco quando a câmera cruzava o FRAME, então não havia
 * "acontecimento" nenhum no momento de maior atenção, só composições que já
 * existiam. Agora a janela começa exatamente na COMPRESSION (t=0.22, câmera
 * ainda comprimida em FOV=24°, ver camera-rig.tsx) e termina no pico do
 * RELEASE (t=0.26, nova pose "Chamber release", FOV salta para 50°) — o
 * campo literalmente aparece NO estouro do FOV, sincronizado com o
 * clímax de luz de atmosphere-rig.tsx (mesmo t=0.26). Durante a compressão
 * em si (t<0.22) o quadro continua legível via FRAME/WALLS de
 * descent-gates.tsx (sempre opacos desde t=0.18) — não é blackout.
 */
const REVEAL_START = 0.22;
const REVEAL_END = 0.26;
/** Limpa a composição antes de CHAMBER→FRACTURE (t=0.45) — o campo não pode contaminar a silhueta do alinhamento. */
const EXIT_FADE_START = 0.4;
const EXIT_FADE_END = 0.44;

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

type Monolith = {
  position: THREE.Vector3;
  width: number;
  height: number;
  depth: number;
  rotationY: number;
  tone: number;
};

/**
 * Amostras reais da trajetória de CHAMBER — os 4 pontos existem em
 * camera-rig.tsx (t=0.22 fim de DESCENT, 0.30 e 0.40 CHAMBER, 0.45 início
 * de FRACTURE); t=0.26/0.35/0.43 são interpolações lineares dos mesmos
 * pontos, só para dar mais resolução de composição — não criam poses de
 * câmera novas, a câmera real continua exatamente a de camera-rig.tsx.
 * minDepth/maxDepth: o quanto se pode avançar à frente de cada amostra
 * antes de esbarrar em z≈0 (Structure) ou negativo (FRACTURE) — mais
 * folga nas amostras iniciais (campo aberto), quase nenhuma nas finais
 * (já saindo de CHAMBER).
 */
type CamSample = {
  pos: readonly [number, number, number];
  look: readonly [number, number, number];
  minDepth: number;
  maxDepth: number;
};

const CHAMBER_SAMPLES: Record<"desktop" | "mobile", CamSample[]> = {
  desktop: [
    { pos: [1.5, 6, 38], look: [0, 4, 15], minDepth: 4, maxDepth: 20 }, // t=0.22 — fim de DESCENT
    { pos: [0.25, 5.25, 32], look: [-4.5, 4.5, 14.5], minDepth: 4, maxDepth: 17 }, // t=0.26
    { pos: [-1, 4.5, 26], look: [-9, 5, 14], minDepth: 3, maxDepth: 15 }, // t=0.30 — Chamber-enter
    { pos: [-2.25, 4.15, 20], look: [-10, 4.5, 8], minDepth: 3, maxDepth: 12 }, // t=0.35
    { pos: [-3.5, 3.8, 14], look: [-11, 4, 2], minDepth: 2.5, maxDepth: 8 }, // t=0.40 — Chamber-mid
    { pos: [-6.8, 4.22, 6.8], look: [-12.2, 3.4, -4], minDepth: 1.5, maxDepth: 4 }, // t=0.43 — saída
    // Ponte t≈0.375: a curva real (CatmullRom) se afasta da interpolação
    // linear entre t=0.35/0.40 o bastante para deixar um vão sem massa em
    // quadro (achado do QA visual desta rodada) — amostra extra cobre.
    { pos: [-2.875, 3.975, 17], look: [-10.5, 4.25, 5], minDepth: 2.75, maxDepth: 10 },
    // CHAMBER GAP FIX 003: t=0.35–0.43 continuava lendo quase vazio mesmo
    // com a ponte acima — a ponte era interpolação LINEAR de t=0.35/0.40,
    // e a curva CatmullRom real diverge dela o bastante (~1.2 unidade em z)
    // pra empurrar as massas ancoradas para fora do FOV=40° estreito nesse
    // trecho. As duas amostras abaixo vêm de posCurve.getPoint()/
    // lookCurve.getPoint() calculados de verdade (mesmo scrollToCurveU de
    // camera-rig.tsx), não estimados. minDepth/maxDepth mais largos que os
    // vizinhos: um teste angular (câmera real vs. posição da massa a cada
    // t) mostrou que profundidade pequena faz a massa sair de quadro quase
    // assim que a câmera passa pelo ponto da amostra — precisa estar bem
    // À FRENTE da amostra para continuar em quadro enquanto a câmera se
    // aproxima ao longo de todo o trecho 0.35–0.43.
    { pos: [-2.79, 3.84, 16.47], look: [-10.71, 4.24, 4.53], minDepth: 10, maxDepth: 20 }, // t=0.37 real
    { pos: [-3.93, 3.82, 12.84], look: [-11.22, 3.9, 0.98], minDepth: 10, maxDepth: 18 }, // t=0.41 real
    // QA visual desta rodada: mesmo com as duas amostras acima, sobrava um
    // vão residual estreito perto de t≈0.37–0.39 — checagem angular 3D
    // confirmou que nenhuma âncora existente cobria essa faixa específica
    // com folga suficiente. Terceira amostra real, ancorada exatamente em
    // t=0.38, fecha com folga (cobre 0.34–0.42 sozinha).
    { pos: [-3.144, 3.809, 15.146], look: [-10.838, 4.104, 3.113], minDepth: 10, maxDepth: 18 }, // t=0.38 real
  ],
  mobile: [
    { pos: [1.2, 6.4, 42], look: [0, 4, 15], minDepth: 4, maxDepth: 20 },
    { pos: [0.2, 5.6, 35.5], look: [-4.5, 4.5, 15.5], minDepth: 4, maxDepth: 17 },
    { pos: [-0.8, 4.8, 29], look: [-9, 5, 16], minDepth: 3, maxDepth: 15 },
    { pos: [-1.9, 4.4, 22.5], look: [-10, 4.5, 10], minDepth: 3, maxDepth: 12 },
    { pos: [-3, 4, 16], look: [-11, 4, 4], minDepth: 2.5, maxDepth: 8 },
    { pos: [-6, 4.48, 8.8], look: [-12.2, 3.4, -3.2], minDepth: 1.5, maxDepth: 4 },
    { pos: [-2.45, 4.2, 19.25], look: [-10.5, 4.25, 7], minDepth: 2.75, maxDepth: 10 },
    // CHAMBER GAP FIX 003: mesmas amostras reais de t=0.37/0.41, versão
    // mobile — minDepth/maxDepth também mais largos pelo mesmo motivo (ver
    // comentário da versão desktop acima).
    { pos: [-2.36, 4.05, 18.61], look: [-10.71, 4.24, 6.69], minDepth: 10, maxDepth: 20 },
    { pos: [-3.39, 4.02, 14.79], look: [-11.22, 3.9, 2.86], minDepth: 10, maxDepth: 18 },
    // Terceira amostra (fecha o vão residual perto de t≈0.38), versão mobile.
    { pos: [-2.68, 4.01, 17.2], look: [-10.838, 4.104, 5.2], minDepth: 10, maxDepth: 22 },
  ],
};

/** Massas-âncora — não aleatórias. Índices em CHAMBER_SAMPLES; lateral>0/<0 só rotula lados opostos. */
type Hero = { sample: number; depth: number; lateral: number; height: number; width: number };

/**
 * SPATIAL WORLD V2: só duas massas autoradas agora (o resto do "campo"
 * vira COLUMN ROW rítmica, ver generateColumnRow abaixo) — ENTRY dá o
 * primeiro landmark perceptível ao cruzar o FRAME; LANDMARK é a massa
 * grande na amostra mais aberta (sample 2, t=0.30) que estabelece "isso é
 * um espaço grande", não "isso era só uma unidade" de antes — mesma
 * função, papel mais claro dentro da nova gramática.
 */
const HERO_MASSES: Record<"desktop" | "mobile", Hero[]> = {
  desktop: [
    { sample: 0, depth: 11, lateral: 5.5, height: 18, width: 2.6 }, // ENTRY
    { sample: 2, depth: 13, lateral: -8, height: 24, width: 3.4 }, // LANDMARK distante
  ],
  mobile: [
    { sample: 0, depth: 10, lateral: 5, height: 16, width: 2.4 },
    { sample: 2, depth: 12, lateral: -7, height: 20, width: 2.9 },
  ],
};

const UP = new THREE.Vector3(0, 1, 0);
function sampleBasis(s: CamSample) {
  const pos = new THREE.Vector3(...s.pos);
  const forward = new THREE.Vector3(...s.look).sub(pos).normalize();
  const right = new THREE.Vector3().crossVectors(forward, UP).normalize();
  return { pos, forward, right };
}
function placeFromSample(s: CamSample, depth: number, lateral: number, heightOffset: number) {
  const { pos, forward, right } = sampleBasis(s);
  const world = pos.clone().add(forward.multiplyScalar(depth)).add(right.multiplyScalar(lateral));
  world.y += heightOffset;
  // Backstop: nunca deixar uma massa nascer em z<=1 — evita contaminar a
  // fachada de Structure (z≈0) ou o campo de FRACTURE (z negativo).
  world.z = Math.max(world.z, 1.2);
  return world;
}

/**
 * COLUMN ROW — ritmo regular, não campo aleatório (Visual World System V2,
 * "gramática espacial": COLUMN = escala/profundidade, sempre em fileira).
 * Uma coluna de cada lado por amostra (desktop) ou uma alternando de lado
 * (mobile, campo mais leve) — nunca "N aleatório" por amostra. depth é
 * sempre uma fração fixa (0.78) da banda minDepth–maxDepth já validada de
 * cada amostra (mesma banda que a CHAMBER GAP FIX 003 comprovou manter
 * massas em quadro) — só o jitter dentro dessa fração e a altura/tom são
 * aleatórios.
 */
function generateColumnRow(mobile: boolean, samples: CamSample[], rand: () => number): Monolith[] {
  const columns: Monolith[] = [];
  samples.forEach((s, si) => {
    const sides = mobile ? [si % 2 === 0 ? -1 : 1] : [-1, 1];
    for (const side of sides) {
      const depthFrac = 0.74 + (rand() - 0.5) * 0.12;
      const depth = THREE.MathUtils.lerp(
        s.minDepth,
        s.maxDepth,
        THREE.MathUtils.clamp(depthFrac, 0.4, 0.95),
      );
      const lateral = side * THREE.MathUtils.clamp(depth * 0.4, 2.6, 6.5);
      const height = 8 + rand() * 6;
      const position = placeFromSample(s, depth, lateral, height / 2 - 2);
      columns.push({
        position,
        width: 1 + rand() * 0.6,
        height,
        depth: 0.9 + rand() * 0.6,
        // QA visual: com jitter mínimo (±0.06, valor herdado do campo
        // aleatório antigo) todas as colunas da fileira apresentavam
        // praticamente a MESMA face para a câmera e para a key light — o
        // campo disperso de antes mascarava isso variando muito a
        // profundidade por instância; a fileira rítmica, por ser regular,
        // deixa a maioria das colunas do lado de sombra da mesma key light
        // ao mesmo tempo (ACES tone mapping crava esse lado quase preto,
        // mesmo com cor-base clara — confirmado testando lightness=0.9 sem
        // nenhuma mudança visual). Rotação ampla garante que cada coluna
        // apresente uma face diferente à luz, evitando o apagão em bloco.
        rotationY: rand() * Math.PI * 2,
        tone: rand(),
      });
    }
  });
  return columns;
}

/**
 * MATERIAL WORLD V3 INTEGRATION 001 — antes um único array `monoliths`
 * (heroes + column row) alimentando um InstancedMesh só; agora heroes e
 * colunas viram meshes individuais com geometrias DIFERENTES (beveled box
 * vs. tapered column), então precisam de arrays separados. O MESMO gerador
 * `rand` (seed 20260908) é consumido primeiro pelos heroes e só depois
 * passado para `generateColumnRow` — idêntica ordem de chamadas do
 * `generateMonoliths` anterior — então a composição/tons resultantes são
 * bit-a-bit os mesmos já validados em CHAMBER GAP FIX 003, só a
 * representação (um array vs. dois) mudou.
 */
function generateMonolithGroups(mobile: boolean): { heroes: Monolith[]; columns: Monolith[] } {
  const samples = CHAMBER_SAMPLES[mobile ? "mobile" : "desktop"];
  const heroDefs = HERO_MASSES[mobile ? "mobile" : "desktop"];
  const rand = mulberry32(20260908);

  const heroes: Monolith[] = heroDefs.map((h) => {
    const s = samples[h.sample];
    const position = placeFromSample(s, h.depth, h.lateral, h.height / 2 - 2);
    return {
      position,
      width: h.width,
      height: h.height,
      depth: h.width * (0.5 + rand() * 0.3),
      rotationY: (rand() - 0.5) * 0.08,
      tone: rand(),
    };
  });

  const columns = generateColumnRow(mobile, samples, rand);

  return { heroes, columns };
}

/**
 * COLUMN V3 — briefing: "não pode continuar parecendo cubo esticado".
 * `taperedColumnGeometry` assa a proporção base/topo/altura na PRÓPRIA
 * geometria (não em `mesh.scale`) — a mesh só precisa de position/rotation,
 * nunca scale, o que elimina pela raiz o bug de shading de escala
 * não-uniforme documentado no InstancedMesh anterior (nenhum `emissive`
 * workaround necessário aqui: normals corretas, mesh individual, ver
 * "IMPORTANTE — EMISSIVE" do briefing).
 */
const COLUMN_TAPER = 0.62;

function ChamberColumn({ mono }: { mono: Monolith }) {
  const topWidth = mono.width * COLUMN_TAPER;
  const geometry = useMemo(
    () => taperedColumnGeometry(mono.width, mono.depth, topWidth, mono.height),
    [mono.width, mono.depth, topWidth, mono.height],
  );
  const material = useMemo(() => columnStoneMaterial(mono.tone, true), [mono.tone]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={mono.position}
      rotation={[0, mono.rotationY, 0]}
      receiveShadow
    />
  );
}

/**
 * HERO LANDMARK — beveled box (aresta chanfrada real, mesma técnica do
 * FRAME) + uma faixa de metal escovado no topo (capitel mínimo, briefing
 * "apenas em detalhes") para funcionar como protagonista, não só uma coluna
 * maior. Mesmo princípio "sem scale não-uniforme" das colunas: a geometria
 * já nasce no tamanho final.
 */
const HERO_BEVEL = 0.18;
const HERO_CAP_HEIGHT = 0.22;
const HERO_CAP_MARGIN = 0.16;

function ChamberHero({ mono }: { mono: Monolith }) {
  const geometry = useMemo(
    () => beveledBoxGeometry(mono.width, mono.height, mono.depth, HERO_BEVEL),
    [mono.width, mono.height, mono.depth],
  );
  const capGeometry = useMemo(
    () =>
      new THREE.BoxGeometry(
        mono.width + HERO_CAP_MARGIN,
        HERO_CAP_HEIGHT,
        mono.depth + HERO_CAP_MARGIN,
      ),
    [mono.width, mono.depth],
  );
  const material = useMemo(() => columnStoneMaterial(mono.tone, true), [mono.tone]);
  const capMaterial = useMemo(() => metalAccentMaterial(true), []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      capGeometry.dispose();
      material.dispose();
      capMaterial.dispose();
    };
  }, [geometry, capGeometry, material, capMaterial]);

  return (
    <group position={mono.position} rotation={[0, mono.rotationY, 0]}>
      <mesh geometry={geometry} material={material} receiveShadow />
      {/* Capitel em metal, "apenas em detalhes": sem receiveShadow — sob
          VSMShadowMap isso também o tornaria pseudo-caster no depth pass
          (ver comentário em descent-gates.tsx); ele ainda projeta sombra
          normalmente (castShadow segue a mesma janela de opacidade do resto
          da HERO, ver useFrame abaixo). */}
      <mesh
        geometry={capGeometry}
        material={capMaterial}
        position={[0, mono.height / 2 + HERO_CAP_HEIGHT / 2, 0]}
      />
    </group>
  );
}

/**
 * PLANE — piso do CHAMBER (briefing: "PLANE/piso claramente percebido").
 * Não existia antes; sua ausência é parte do motivo de a experiência ler
 * como "câmera passando por blocos" em vez de "espaço" (sem referência de
 * chão, nada ancora as massas ao solo). Cobre a extensão lateral/longitudinal
 * de CHAMBER_SAMPLES com folga; Y fixo um pouco abaixo da base das colunas
 * (mesma lógica de heightOffset = height/2-2 em placeFromSample).
 */
const FLOOR = {
  desktop: { position: [-2, 1.6, 20] as const, size: [34, 46] as const },
  mobile: { position: [-1.6, 1.9, 21] as const, size: [26, 46] as const },
};

function Chamber({ mobile, scrollRef }: { mobile: boolean; scrollRef: RefObject<number> }) {
  // MATERIAL WORLD V3 INTEGRATION 001 — substitui o InstancedMesh único
  // (BoxGeometry(1,1,1) escalada não-uniformemente por instância, a causa
  // raiz do bug de shading documentado nas versões anteriores deste
  // arquivo) por meshes individuais com geometria própria por peça
  // (ChamberHero/ChamberColumn abaixo) — mais draw calls (orçamento
  // <100/<100k tris do briefing folga bastante para isso), zero scale
  // não-uniforme, zero dependência de `emissive` para existir visualmente.
  const { heroes, columns } = useMemo(() => generateMonolithGroups(mobile), [mobile]);

  const fieldGroupRef = useRef<THREE.Group>(null);

  const floorRef = useRef<THREE.Mesh>(null);
  const floor = mobile ? FLOOR.mobile : FLOOR.desktop;
  const floorGeometry = useMemo(() => new THREE.PlaneGeometry(...floor.size), [floor.size]);
  const floorMaterial = useMemo(() => floorStoneMaterial(), []);

  useFrame(() => {
    const t = scrollRef.current ?? 0;
    const revealIn = THREE.MathUtils.smoothstep(t, REVEAL_START, REVEAL_END);
    const revealOut = 1 - THREE.MathUtils.smoothstep(t, EXIT_FADE_START, EXIT_FADE_END);
    const opacity = revealIn * revealOut;
    // Heroes/colunas agora são meshes individuais (a HERO tem um <group>
    // interno com 2 meshes) — `traverse` em vez de `children.forEach` para
    // alcançar os meshes aninhados também, mesma ideia de gating por scroll
    // já usada em descent-gates.tsx, generalizada para uma árvore não-plana.
    const field = fieldGroupRef.current;
    if (field) {
      field.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).opacity = opacity;
          // LIGHT FOUNDATION 001: castShadow segue a mesma janela de
          // opacidade (mesmo raciocínio de descent-gates.tsx) — sem isso,
          // heroes/colunas projetariam sombra opaca durante o próprio fade
          // in/out de REVEAL/EXIT_FADE.
          child.castShadow = opacity > 0.05;
        }
      });
    }
    // Piso só recebe — nunca projeta (é a superfície de contato).
    const floorMesh = floorRef.current;
    if (floorMesh) (floorMesh.material as THREE.MeshStandardMaterial).opacity = opacity;
  });

  useEffect(() => {
    return () => {
      floorGeometry.dispose();
      floorMaterial.dispose();
    };
  }, [floorGeometry, floorMaterial]);

  return (
    <group>
      <group ref={fieldGroupRef}>
        {heroes.map((h, i) => (
          <ChamberHero key={`hero-${i}`} mono={h} />
        ))}
        {columns.map((c, i) => (
          <ChamberColumn key={`column-${i}`} mono={c} />
        ))}
      </group>
      <mesh
        ref={floorRef}
        geometry={floorGeometry}
        material={floorMaterial}
        position={floor.position}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      />
    </group>
  );
}

export { Chamber };
