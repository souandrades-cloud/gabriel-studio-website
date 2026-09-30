"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * Cena da Hero oficial — "Spatial Architecture". Nasceu como H2 do Hero
 * Cinematic Discovery 001 (lab em `/lab/hero-cinematic/h2-spatial`, mantido
 * congelado para regressão) e foi refinada aqui para produção.
 *
 * O visitante está DENTRO da arquitetura do Studio: uma galeria de pórticos
 * recuando em profundidade até o Core (a mesma silhueta da Hero anterior),
 * cuja abertura é a fonte de luz do espaço.
 *
 * Dentro da abertura vive o Computational Core (`CoreLattice`): a própria
 * linguagem da galeria — quadros 3:2 aninhados — reduzida a um sistema de
 * arestas, nós e ligações. Em repouso os quadros flutuam desalinhados e
 * sinais correm pelas ligações (computação acontecendo); antes de cada pulso
 * eles se ALINHAM (o mesmo gesto dos pórticos travando), concentram energia
 * e disparam a onda. É a razão visual de a energia nascer ali:
 * Core → geração de energia → onda verde → ativação da arquitetura.
 *
 * Linguagem: os pórticos são arquitetura escura que RECEBE luz — nada de
 * frisos emissivos permanentes (no lab eles liam como túnel sci-fi). O verde
 * da marca é ENERGIA: luz que viaja, reflexo no chão, atmosfera em volta do
 * Core — forte nos eventos, contida no repouso. Os pórticos próximos da
 * câmera, os que cruzam a coluna de texto, são sempre os mais escuros, e
 * nenhuma luz verde chega até eles.
 *
 * Três estados perceptíveis:
 *  · CHEGADA: o Core se FORMA (quadros nascendo do centro), acende com um
 *    pico de ignição, alinha, dispara — a atmosfera se enche de verde e uma
 *    onda de energia percorre a galeria em direção à câmera; cada pórtico
 *    trava no lugar quando ela o alcança; câmera em push-in;
 *  · REPOUSO: micro-atividade contínua — Core respirando, sinais no
 *    lattice, energia residual verde vagando pelo meio/fundo da galeria,
 *    névoa respirando, deriva de câmera quase imperceptível — intercalada
 *    com pulsos a cada ~4,4–5s (intervalo e força variam de forma
 *    determinística: nunca um metrônomo);
 *  · INTERAÇÃO: parallax de cursor (a energia residual acompanha o cursor e
 *    ilumina a parede daquele lado), clique/toque dispara um pulso, e o scroll
 *    atravessa a galeria.
 */

type Layout = {
  count: number;
  spacing: number;
  axisX: number;
  fov: number;
  cam: [number, number, number];
  look: [number, number, number];
  /** Intensidade da névoa larga em volta do Core, calibrada por enquadramento. */
  haze: number;
  /**
   * Distância a partir do Core (u) em que a onda de energia se apaga
   * [começa, termina] — calibrada para nunca alcançar os pórticos que
   * passam atrás de texto/CTAs naquele enquadramento.
   */
  reach: [number, number];
  /**
   * Até onde a carga dos pórticos segue (luz e véu da onda ficam em
   * `reach`). No mobile vai mais longe que `reach`: a carga é cortada em
   * espaço de tela logo abaixo do fim da coluna de texto (ver `stacked`).
   */
  flashReach: [number, number];
  /**
   * Texto EMPILHADO acima da cena (mobile), com a posição real medida na
   * Hero. A cena então (1) enquadra o Core entre o fim do texto e a legenda
   * — em telas baixas o ponto de fuga padrão cairia sobre os CTAs — e
   * (2) corta a carga verde dos pórticos acima do texto: os topos que
   * encostam nos CTAs nunca acendem, e a energia ainda atravessa a galeria
   * com a mesma leitura de propagação do desktop.
   */
  stacked: boolean;
  /** Profundidade média da energia residual, medida a partir do Core (u). */
  residual: number;
};

/**
 * Onde o texto da Hero termina e a legenda começa, em frações da altura da
 * Hero (0 = ainda sem medida). Medido no DOM pela Hero.
 */
type TextBounds = { bottom: number; legend: number };

const LAYOUT: Record<"desktop" | "mobile", Layout> = {
  // Olhar levemente para a esquerda empurra o ponto de fuga para a direita
  // do centro — a coluna de texto fica sobre a parede, não sobre o vazio.
  desktop: {
    count: 9,
    spacing: 2.1,
    axisX: 0.9,
    fov: 40,
    cam: [0, 0.15, 4.6],
    look: [-2.6, -0.2, -20],
    haze: 0.3,
    reach: [6.5, 11.5],
    flashReach: [6.5, 11.5],
    stacked: false,
    residual: 8,
  },
  // Mobile: sem desvio lateral; olhar para cima baixa o ponto de fuga para
  // abaixo dos CTAs, onde a tela está livre. Os topos dos pórticos do meio
  // da galeria ficam logo abaixo dos CTAs — por isso a onda morre antes
  // deles e a energia residual mora mais no fundo; a propagação continua
  // pela metade de baixo da galeria (`flashReach`/`stacked`).
  mobile: {
    count: 7,
    spacing: 2.1,
    axisX: 0.2,
    fov: 62,
    cam: [0, 0.1, 4.2],
    look: [0.2, 4.1, -20],
    haze: 0.34,
    reach: [4, 8],
    flashReach: [7, 12.5],
    stacked: true,
    residual: 5.5,
  },
};

/** Pórtico: face fina e alma profunda — lê como arquitetura, não como moldura. */
const FRAME = { w: 5.4, h: 3.6, face: 0.1, depth: 0.55 };
/** Core: mesma silhueta da Hero anterior (frame usinado com abertura). */
const CORE = { w: 1.34, h: 1.0, holeW: 0.92, holeH: 0.6, depth: 0.2, scale: 3.2 };
/**
 * Computational Core: quadros 3:2 aninhados (a proporção dos pórticos),
 * cada um menor e mais recuado, na frente da abertura.
 */
const LATTICE = { frames: 5, w: 3.5, h: 2.33, shrink: 0.18, step: 0.3, bar: 0.045, z: 1.5 };
/** Tamanho da semente em relação aos nós. */
const SEED_SIZE = 2.2;
const ENERGY = "#22b573";
const FRAME_COLOR = "#252a28";
/** `--background` do tema escuro (oklch 0.145 ≈ #0a0a0a) — canvas opaco casa com a página. */
const BACKDROP = "#0a0a0a";
/** Luz do espaço: branco levemente mentolado — o verde saturado é energia. */
const LIGHT = "#dcefe4";
const tint = (k: number) => new THREE.Color(LIGHT).lerp(new THREE.Color(ENERGY), k);

// Linha do tempo (s desde o primeiro frame desenhado).
const T_OPEN = 0.3; // o Core se acende (canvas já ~meio revelado)
const T_FORM = 0.2; // os quadros do lattice começam a nascer do centro
const T_WAVE = 1.05; // o Core dispara: a energia deixa o Core rumo à câmera
const WAVE_SPEED = 11; // u/s — atravessa a galeria em ~1,6s
/** O Core reage PRIMEIRO: alinha e carrega por este tempo antes de disparar. */
const LEAD = 0.45;
const T_FIRST_BEAT = 4.6; // primeiro pulso, depois de a chegada assentar
/** Clique/toque só dispara pulso depois da chegada, e não em rajada. */
const T_PULSE_READY = 2.6;
const PULSE_GAP = 1.4;

/** Pseudo-aleatório determinístico em [0, 1) — mesma sequência sempre. */
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
/** Intervalo até o pulso n+1: 4,4–5,0s. */
const beatInterval = (n: number) => 4.4 + 0.6 * hash(n);
/** Força do pulso n: 0,62–0,86 (clique = 1). */
const beatStrength = (n: number) => 0.62 + 0.24 * hash(n + 17);

function hollow(w: number, h: number, hw: number, hh: number, depth: number, bevel: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -h / 2);
  s.lineTo(w / 2, -h / 2);
  s.lineTo(w / 2, h / 2);
  s.lineTo(-w / 2, h / 2);
  s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-hw / 2, -hh / 2);
  hole.lineTo(hw / 2, -hh / 2);
  hole.lineTo(hw / 2, hh / 2);
  hole.lineTo(-hw / 2, hh / 2);
  hole.closePath();
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    curveSegments: 1,
  });
  g.center();
  return g;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smoothstep = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/** Tone mapping + sRGB iguais aos dos materiais padrão do three. */
const OUTPUT_CHUNKS = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

/**
 * Luz dentro da abertura do Core: queda RETANGULAR (acompanha a abertura, não
 * um oval), campo verde profundo com um miolo menta. `uGreen` empurra o campo
 * para o verde da marca nos eventos (ignição, pulso).
 *
 * O miolo é LIMITADO (`1 - exp(-x)`): por mais forte que seja o disparo, ele
 * satura num menta abaixo do brilho das arestas do lattice — o pico deixa o
 * campo mais intenso e mais verde, nunca uma mancha branca que engole os
 * quadros internos e a semente (a leitura de "janela" que o Core superou).
 */
function coreLightMaterial() {
  return new THREE.ShaderMaterial({
    fog: false,
    uniforms: {
      uHot: { value: tint(0.22) },
      uEdge: { value: tint(0.4) },
      uEnergy: { value: new THREE.Color(ENERGY) },
      uGreen: { value: 0 },
      uIntensity: { value: 0 },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot;
      uniform vec3 uEdge;
      uniform vec3 uEnergy;
      uniform float uGreen;
      uniform float uIntensity;
      varying vec2 vUv;
      void main() {
        vec2 p = abs(vUv - 0.5);
        float f = (1.0 - smoothstep(0.0, 0.5, p.x)) * (1.0 - smoothstep(0.0, 0.5, p.y));
        vec3 edge = mix(uEdge, uEnergy, uGreen) * 0.13 * uIntensity;
        vec3 hot = mix(uHot, uEnergy, uGreen * 0.7) * 0.62 * (1.0 - exp(-uIntensity * 0.8));
        gl_FragColor = vec4(mix(edge, hot, pow(f, 2.2)), 1.0);
        ${OUTPUT_CHUNKS}
      }
    `,
  });
}

/**
 * Luz no ar — plano aditivo com queda radial. Todos os usos compartilham o
 * MESMO programa de shader: halo, névoa, poça de luz no chão e a frente da
 * onda de energia. Substitui o bloom do lab: pós-processamento custava ~8
 * programas de shader a mais (compilação lenta no ANGLE/D3D — o 1º frame
 * saía ~2s depois do canvas montar) e um passe de tela cheia por frame.
 * `hollowCenter` (0–1) esvazia o miolo: halo e névoa brilham EM VOLTA do
 * lattice sem somar luz por trás dos quadros internos. (Cada plano aditivo
 * soma depois do próprio tone mapping — três camadas médias empilhadas no
 * mesmo pixel estouravam o centro do Core em branco.)
 */
function glowMaterial(falloff: number, color: THREE.Color, hollowCenter = 0) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: {
      uColor: { value: color },
      uIntensity: { value: 0 },
      uFalloff: { value: falloff },
      uHollow: { value: hollowCenter },
    },
    vertexShader: PLANE_VERT,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform float uFalloff;
      uniform float uHollow;
      varying vec2 vUv;
      void main() {
        vec2 p = (vUv - 0.5) * vec2(1.5, 1.0);
        float r = length(p) * 2.0;
        float a = pow(max(0.0, 1.0 - r), uFalloff) * uIntensity;
        a *= 1.0 - uHollow * (1.0 - smoothstep(0.05, 0.5, r));
        gl_FragColor = vec4(uColor * a, 1.0);
        ${OUTPUT_CHUNKS}
      }
    `,
  });
}

function setIntensity(mesh: THREE.Mesh | null, value: number) {
  if (mesh) (mesh.material as THREE.ShaderMaterial).uniforms.uIntensity.value = value;
}

/** Nós do lattice: ponto redondo com núcleo quase branco e halo verde (`aSize` = escala). */
function nodeMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: {
      uSize: { value: 8 },
      uHot: { value: new THREE.Color("#f4fbf7") },
      uColor: { value: new THREE.Color(ENERGY) },
    },
    vertexShader: /* glsl */ `
      attribute float aGlow;
      attribute float aSize;
      uniform float uSize;
      varying float vGlow;
      varying float vSize;
      void main() {
        vGlow = aGlow;
        vSize = aSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize * aSize * (0.7 + 0.5 * min(aGlow, 1.6));
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot;
      uniform vec3 uColor;
      varying float vGlow;
      varying float vSize;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        // Pontos maiores crescem no halo, não no miolo branco.
        float core = 1.0 - smoothstep(0.0, 0.38 / vSize, d);
        float halo = pow(1.0 - d, 2.0);
        gl_FragColor = vec4((uColor * halo * 0.9 + uHot * core * 1.6) * vGlow, 1.0);
        ${OUTPUT_CHUNKS}
      }
    `,
  });
}

/** O que a cena manda para o Core a cada frame (escrito pela `Architecture`). */
type CoreDrive = {
  /** Tempo da cena (congelado em 0 no reduced motion). */
  t: number;
  /** Formação da chegada: 0 = só a semente, 1 = todos os quadros formados. */
  form: number;
  /** 0 = quadros livres/desalinhados, 1 = alinhados (prestes a disparar). */
  align: number;
  /** Carga/disparo: brilho verde do sistema no instante do pulso. */
  fire: number;
};

/** Posição (em "quadros", 0 = externo) do sinal que corre na cadeia de cantos i. */
const signalAt = (i: number, t: number) =>
  ((t * 0.34 + i * 0.27 + hash(i) * 0.5) % 1) * LATTICE.frames;

const CORNERS: Array<[number, number]> = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

/**
 * Computational Core — sistema abstrato na frente da abertura: arestas dos
 * quadros + ligações entre cantos correspondentes (1 InstancedMesh) e nós
 * nos cantos + semente no centro (1 Points). Tudo recalculado na CPU por
 * frame (36 barras, 21 nós): 2 draw calls, nenhum shader pesado.
 */
function CoreLattice({
  position,
  driveRef,
}: {
  position: [number, number, number];
  driveRef: RefObject<CoreDrive>;
}) {
  const F = LATTICE.frames;
  const edgeCount = F * 4;
  const linkCount = (F - 1) * 4;
  // Cantos + semente central + 4 sinais viajando pelas ligações.
  const nodeCount = F * 4 + 1 + 4;

  const parts = useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const barMat = new THREE.MeshBasicMaterial({ color: "#ffffff", fog: false });
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(nodeCount * 3), 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    nodeGeo.setAttribute(
      "aGlow",
      new THREE.BufferAttribute(new Float32Array(nodeCount), 1).setUsage(THREE.DynamicDrawUsage),
    );
    // A semente é maior: seu halo verde é o núcleo luminoso do Core — a
    // origem da luz continua legível sem o miolo virar uma mancha branca.
    const size = new Float32Array(nodeCount).fill(1);
    size[F * 4] = SEED_SIZE;
    nodeGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    return { box, barMat, nodeGeo, nodeMat: nodeMaterial() };
  }, [nodeCount, F]);

  useEffect(
    () => () => {
      parts.box.dispose();
      parts.barMat.dispose();
      parts.nodeGeo.dispose();
      parts.nodeMat.dispose();
    },
    [parts],
  );

  // Mutação por frame só via refs (regra do React Compiler).
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const nodesRef = useRef<THREE.Points>(null);

  const scratch = useMemo(
    () => ({
      corners: Array.from({ length: F * 4 }, () => new THREE.Vector3()),
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      e: new THREE.Euler(),
      p: new THREE.Vector3(),
      s: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      c: new THREE.Color(),
      light: new THREE.Color(LIGHT),
      // Verde acima de 1 (linear): no disparo as arestas viram o traço mais
      // claro do Core — verde-luz sobre o campo verde saturado; a estrutura
      // continua desenhada no pico.
      energy: tint(0.62).multiplyScalar(3.0),
      xAxis: new THREE.Vector3(1, 0, 0),
    }),
    [F],
  );

  useFrame((state) => {
    const bars = barsRef.current;
    const nodes = nodesRef.current;
    if (!bars || !nodes) return;
    const { t, form, align, fire } = driveRef.current;
    const x = scratch;
    const free = 1 - align;
    const fireMix = Math.min(1, fire);

    // Quadros: nascem do centro (o menor primeiro) e flutuam desalinhados
    // em repouso; `align` os traz para o plano da câmera antes do disparo.
    for (let k = 0; k < F; k++) {
      const born = easeOutCubic(clamp01((form - (F - 1 - k) * 0.11) / 0.5));
      const size = (1 - k * LATTICE.shrink) * born;
      x.e.set(
        // Giro no plano domina (quadros aninhados defasados — leitura
        // paramétrica); inclinações pequenas dão profundidade sem virar "cubo".
        free * 0.2 * Math.sin(t * 0.16 + k * 0.9 + 1.4),
        free * 0.34 * Math.sin(t * 0.21 + k * 1.3 + 0.6),
        free * (0.1 + 0.07 * k) * Math.sin(t * 0.13 + k * 1.9 + 0.3),
      );
      x.m.compose(
        x.p.set(0, 0, -k * LATTICE.step),
        x.q.setFromEuler(x.e),
        x.s.set(size, size, size),
      );
      for (let i = 0; i < 4; i++) {
        const [cx, cy] = CORNERS[i];
        x.corners[k * 4 + i].set((cx * LATTICE.w) / 2, (cy * LATTICE.h) / 2, 0).applyMatrix4(x.m);
      }
    }

    let n = 0;
    const bar = (a: THREE.Vector3, b: THREE.Vector3, glow: number) => {
      x.dir.subVectors(b, a);
      const len = x.dir.length();
      x.q.setFromUnitVectors(x.xAxis, len > 1e-5 ? x.dir.divideScalar(len) : x.xAxis);
      x.m.compose(
        x.p.addVectors(a, b).multiplyScalar(0.5),
        x.q,
        x.s.set(len, LATTICE.bar, LATTICE.bar),
      );
      bars.setMatrixAt(n, x.m);
      x.c.copy(x.light).multiplyScalar(glow).lerp(x.energy, fireMix);
      bars.setColorAt(n, x.c);
      n++;
    };

    // Arestas: respiram devagar, cada quadro em sua fase.
    for (let k = 0; k < F; k++) {
      const glow = (1.9 + 0.45 * Math.sin(t * 0.8 + k * 1.7)) * (1 - k * 0.06);
      for (let i = 0; i < 4; i++) {
        bar(x.corners[k * 4 + i], x.corners[k * 4 + ((i + 1) % 4)], glow);
      }
    }
    // Ligações: um sinal corre de fora para dentro em cada cadeia de cantos
    // (o sistema concentrando energia) — a micro-atividade entre pulsos.
    for (let i = 0; i < 4; i++) {
      const p = signalAt(i, t) - 0.5;
      for (let k = 0; k < F - 1; k++) {
        const signal = Math.exp(-((k + 0.5 - p) ** 2) * 3);
        bar(x.corners[k * 4 + i], x.corners[(k + 1) * 4 + i], 0.6 + signal * 2.2);
      }
    }
    bars.instanceMatrix.needsUpdate = true;
    if (bars.instanceColor) bars.instanceColor.needsUpdate = true;

    // Nós: cintilam de forma esparsa e assíncrona; a semente no centro é a
    // primeira coisa a existir e a última a apagar.
    const pos = nodes.geometry.attributes.position as THREE.BufferAttribute;
    const glow = nodes.geometry.attributes.aGlow as THREE.BufferAttribute;
    for (let j = 0; j < F * 4; j++) {
      const c = x.corners[j];
      pos.setXYZ(j, c.x, c.y, c.z);
      const k = Math.floor(j / 4);
      const born = clamp01((form - (F - 1 - k) * 0.11) / 0.5);
      const twinkle = Math.pow(0.5 + 0.5 * Math.sin(t * (0.7 + 0.11 * j) + j * 2.3), 8);
      glow.setX(j, born * (0.8 + twinkle * 0.9 + fire * 1.1));
    }
    pos.setXYZ(F * 4, 0, 0, -(F - 1) * LATTICE.step - 0.1);
    glow.setX(F * 4, clamp01(form * 4) * (1.1 + 0.25 * Math.sin(t * 1.3) + fire * 1.4));
    // Sinais: um ponto por cadeia, viajando pelas ligações rumo ao centro —
    // dados chegando à semente. Some nas pontas (nasce e morre suave).
    for (let i = 0; i < 4; i++) {
      const u = Math.min(F - 1.001, Math.max(0, signalAt(i, t) - 0.5));
      const k = Math.floor(u);
      const a = x.corners[k * 4 + i];
      const b = x.corners[(k + 1) * 4 + i];
      const f = u - k;
      pos.setXYZ(
        F * 4 + 1 + i,
        a.x + (b.x - a.x) * f,
        a.y + (b.y - a.y) * f,
        a.z + (b.z - a.z) * f,
      );
      glow.setX(F * 4 + 1 + i, clamp01(form * 2 - 1) * 1.5 * Math.sin((Math.PI * u) / (F - 1)));
    }
    pos.needsUpdate = true;
    glow.needsUpdate = true;
    (nodes.material as THREE.ShaderMaterial).uniforms.uSize.value = 10 * state.gl.getPixelRatio();
  });

  return (
    <group position={position}>
      <instancedMesh
        ref={barsRef}
        args={[parts.box, parts.barMat, edgeCount + linkCount]}
        frustumCulled={false}
        onUpdate={(m) => m.instanceMatrix.setUsage(THREE.DynamicDrawUsage)}
      />
      <points
        ref={nodesRef}
        geometry={parts.nodeGeo}
        material={parts.nodeMat}
        frustumCulled={false}
      />
    </group>
  );
}

function Architecture({
  layout,
  active,
  scrollRef,
  pointerRef,
  pulseRef,
  textBoundsRef,
  onFirstFrame,
}: {
  layout: Layout;
  active: boolean;
  scrollRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  pulseRef: RefObject<number>;
  textBoundsRef: RefObject<TextBounds>;
  onFirstFrame: () => void;
}) {
  const { count, spacing, axisX, reach } = layout;
  const endZ = -(count - 1) * spacing - 2.2;
  const coreY = -0.25;
  const floorY = -FRAME.h / 2;

  // Onde o Core cai na tela (fração da altura, a partir do topo) na pose de
  // repouso, e meia altura do lattice. A projeção vertical não depende do
  // aspecto — só do fov —, então basta uma câmera de referência.
  const coreRest = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(layout.fov, 1, 0.1, 40);
    cam.position.set(...layout.cam);
    cam.lookAt(new THREE.Vector3(...layout.look));
    cam.updateMatrixWorld();
    const z = endZ + LATTICE.z;
    const c = new THREE.Vector3(axisX, coreY, z).project(cam);
    const top = new THREE.Vector3(axisX, coreY + LATTICE.h / 2, z).project(cam);
    return { y: (1 - c.y) / 2, half: (top.y - c.y) / 2 };
  }, [layout, axisX, endZ, coreY]);
  const viewRef = useRef("");

  const geo = useMemo(
    () => ({
      frame: hollow(
        FRAME.w,
        FRAME.h,
        FRAME.w - FRAME.face * 2,
        FRAME.h - FRAME.face * 2,
        FRAME.depth,
        0.012,
      ),
      core: hollow(CORE.w, CORE.h, CORE.holeW, CORE.holeH, CORE.depth, 0.018),
      plane: new THREE.PlaneGeometry(1, 1),
      floor: new THREE.PlaneGeometry(12, 60),
    }),
    [],
  );

  // Linha (px do buffer, a partir de baixo) acima da qual a carga dos
  // pórticos some, e a largura da transição. x < 0 = sem corte.
  const flashMask = useMemo(() => ({ value: new THREE.Vector2(-1, 1) }), []);

  const mats = useMemo(() => {
    const maskFlash = (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uFlashMask = flashMask;
      shader.fragmentShader = shader.fragmentShader
        .replace("void main() {", "uniform vec2 uFlashMask;\nvoid main() {")
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          if (uFlashMask.x >= 0.0)
            totalEmissiveRadiance *= 1.0 - smoothstep(uFlashMask.x - uFlashMask.y, uFlashMask.x, gl_FragCoord.y);`,
        );
    };
    return {
      // Um material por pórtico (mesmo programa de shader): o brilho de cada
      // um é ajustado pela distância à câmera no loop.
      frames: Array.from({ length: count }, () => {
        const m = new THREE.MeshStandardMaterial({
          color: FRAME_COLOR,
          roughness: 0.55,
          metalness: 0.45,
        });
        m.onBeforeCompile = maskFlash;
        return m;
      }),
      // Core em metal escuro: a face não pode virar um "painel" aceso — quem
      // brilha é a abertura.
      core: new THREE.MeshStandardMaterial({ color: "#2f3533", roughness: 0.35, metalness: 0.85 }),
      // Chão acetinado: é nele que a energia verde vira reflexo.
      floor: new THREE.MeshStandardMaterial({ color: "#0c0d0d", roughness: 0.36, metalness: 0.6 }),
      light: coreLightMaterial(),
      halo: glowMaterial(3.2, tint(0.3), 1),
      haze: glowMaterial(2.2, tint(0.7), 0.85),
      pool: glowMaterial(2.0, tint(0.55)),
      front: glowMaterial(1.6, new THREE.Color(ENERGY)),
    };
  }, [count, flashMask]);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats)
        .flat()
        .forEach((m) => m.dispose());
    },
    [geo, mats],
  );

  const frameRefs = useRef<Array<THREE.Group | null>>([]);
  const lightPlaneRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const hazeRef = useRef<THREE.Mesh>(null);
  const poolRef = useRef<THREE.Mesh>(null);
  const frontRef = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const waveLightRef = useRef<THREE.PointLight>(null);
  const residualLightRef = useRef<THREE.PointLight>(null);
  const smooth = useRef({ x: 0, y: 0 });
  const startRef = useRef<number | null>(null);
  /**
   * Pulsos: `launch` = instante em que o último pulso DEIXOU o Core; `next` =
   * próximo disparo agendado (o Core carrega nos LEAD segundos antes dele).
   * Um clique só antecipa `next` — o mesmo caminho do pulso periódico.
   */
  const beatRef = useRef({
    launch: -1,
    strength: 0,
    next: T_FIRST_BEAT,
    nextStrength: beatStrength(0),
    n: 0,
    seen: 0,
  });
  const driveRef = useRef<CoreDrive>({ t: 0, form: 0, align: 0, fire: 0 });
  const look = useMemo(() => new THREE.Vector3(), []);
  const frameBase = useMemo(() => new THREE.Color(FRAME_COLOR), []);
  const energy = useMemo(() => new THREE.Color(ENERGY), []);

  useFrame((state, delta) => {
    // Relógio a partir do PRIMEIRO frame desenhado, não da montagem: a
    // compilação de shaders pode atrasar o 1º frame, e a chegada não pode
    // acontecer "às escuras" antes de o canvas aparecer.
    if (startRef.current === null) {
      startRef.current = state.clock.elapsedTime;
      onFirstFrame();
    }
    const t = active ? state.clock.elapsedTime - startRef.current : 999;
    const scroll = active ? (scrollRef.current ?? 0) : 0;

    // --- Pulsos: periódicos no repouso + sob demanda (clique/toque)
    const b = beatRef.current;
    if (active) {
      const requested = pulseRef.current ?? 0;
      if (requested !== b.seen) {
        b.seen = requested;
        // Clique: antecipa o próximo disparo (o Core ainda carrega antes).
        if (t > T_PULSE_READY && t - b.launch > PULSE_GAP && b.next - t > LEAD) {
          b.next = t + LEAD;
          b.nextStrength = 1;
        }
      }
      if (t >= b.next) {
        b.launch = b.next;
        b.strength = b.nextStrength;
        b.n += 1;
        b.next = b.launch + beatInterval(b.n);
        b.nextStrength = beatStrength(b.n);
        // Aba pausada por muito tempo: retoma do agora, sem disparar atrasado.
        if (t - b.launch > 2) {
          b.launch = -1;
          b.next = t + 1.5;
        }
      }
    }
    const beatPhase = active && b.launch >= 0 ? t - b.launch : -1;
    const beat = beatPhase >= 0 ? b.strength * Math.exp(-beatPhase * 1.8) : 0;

    // --- Core: carrega ANTES de disparar (chegada e pulsos) e devolve depois.
    // `fire` acende o sistema; `align` o organiza (decai mais devagar).
    const pre = active ? smoothstep(b.next - LEAD, b.next, t) * b.nextStrength : 0;
    const arrival = (k: number) =>
      t < T_WAVE ? smoothstep(T_WAVE - LEAD, T_WAVE, t) : Math.exp(-(t - T_WAVE) * k);
    const post = (k: number) => (beatPhase >= 0 ? b.strength * Math.exp(-beatPhase * k) : 0);
    const drive = driveRef.current;
    drive.t = active ? t : 0;
    drive.form = active ? clamp01((t - T_FORM) / 0.9) : 1;
    drive.fire = active ? Math.max(1.2 * arrival(2.6), pre, post(2.6)) : 0;
    drive.align = active ? Math.min(1, Math.max(arrival(1.1), pre, post(1.1))) : 0;

    // --- Câmera: push-in de chegada + deriva lenta + parallax + scroll
    const k = Math.min(1, delta * 2.4);
    const px = active ? pointerRef.current.x : 0;
    const py = active ? pointerRef.current.y : 0;
    smooth.current.x += (px - smooth.current.x) * k;
    smooth.current.y += (py - smooth.current.y) * k;
    const sx = smooth.current.x;
    const sy = smooth.current.y;
    const push = 1 - easeOutCubic(clamp01(t / 3));
    // Deriva de repouso: períodos de ~45–70s — o quadro nunca está congelado,
    // mas o movimento não chama atenção.
    const driftX = active ? Math.sin(t * 0.14) * 0.14 : 0;
    const driftY = active ? Math.sin(t * 0.09 + 1.3) * 0.06 : 0;
    const cam = state.camera as THREE.PerspectiveCamera;
    // Mobile: o Core cabe entre o fim do texto e a legenda. Se o ponto de
    // fuga padrão cairia sobre o texto (telas baixas), a imagem inteira desce
    // (lens shift — a perspectiva não muda); se a faixa livre for menor que o
    // Core, o campo de visão abre antes (o Core encolhe até 65%). Sem espaço
    // nem assim (celular pequeno com as barras do navegador), o Core vai para
    // o lado direito da última linha de CTAs, que ocupa só a esquerda.
    let fov = layout.fov;
    let shiftX = 0;
    let shiftY = 0;
    const bounds = textBoundsRef.current;
    if (layout.stacked && bounds.bottom > 0) {
      const floor = bounds.legend > bounds.bottom ? bounds.legend : 1;
      const room = floor - bounds.bottom - 0.05;
      const zoom = Math.min(1, Math.max(0.65, room / (2 * coreRest.half)));
      const half = coreRest.half * zoom;
      const restY = 0.5 + (coreRest.y - 0.5) * zoom;
      const lo = bounds.bottom + 0.03 + half;
      const hi = floor - 0.02 - half;
      shiftY = Math.max(0, Math.min(Math.max(restY, lo), hi) - restY);
      if (lo > hi) shiftX = 0.15;
      if (zoom < 1) {
        fov = (360 / Math.PI) * Math.atan(Math.tan((layout.fov * Math.PI) / 360) / zoom);
      }
    }
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    const { width: vw, height: vh } = state.size;
    const view = shiftX || shiftY ? `${vw}x${vh}:${shiftX}:${shiftY.toFixed(4)}` : "";
    if (view !== viewRef.current) {
      viewRef.current = view;
      if (view) cam.setViewOffset(vw, vh, -shiftX * vw, -shiftY * vh, vw, vh);
      else cam.clearViewOffset();
    }
    const camZ = layout.cam[2] + push * 2.4 - scroll * 7.5;
    cam.position.set(layout.cam[0] + sx * 0.55 + driftX, layout.cam[1] - sy * 0.32 + driftY, camZ);
    look.set(layout.look[0] + sx * 1.2, layout.look[1] - sy * 0.8, layout.look[2]);
    cam.lookAt(look);

    // --- Core: abre de baixo para cima, com pico de ignição que assenta no
    // repouso; depois respira (duas frequências — nunca um metrônomo).
    const open = easeOutCubic(clamp01((t - T_OPEN) / 0.9));
    const ignite = smoothstep(T_OPEN + 0.2, T_OPEN + 0.8, t) * (1 - smoothstep(1.3, 3.4, t));
    const breathe = active ? Math.sin(t * 0.9) * 0.06 + Math.sin(t * 0.37 + 2) * 0.05 : 0;
    const holeH = CORE.holeH * CORE.scale + 0.1;
    if (lightPlaneRef.current) {
      lightPlaneRef.current.scale.y = holeH * Math.max(0.02, open);
      lightPlaneRef.current.position.y = coreY - holeH * (1 - open) * 0.5;
      const u = (lightPlaneRef.current.material as THREE.ShaderMaterial).uniforms;
      // Campo de luz, não "janela": mais baixo e mais verde que o lattice,
      // que é o ponto mais claro do Core; sobe quando o sistema dispara.
      u.uIntensity.value = open * (1.7 + ignite * 0.8 + breathe * 2 + drive.fire * 1.1);
      u.uGreen.value = Math.min(1, 0.5 + ignite * 0.3 + drive.fire * 0.4);
    }
    // Base > 0: a "brasa" do pôster CSS continua no 1º frame do canvas.
    setIntensity(
      haloRef.current,
      0.14 + open * (0.62 + ignite * 0.55 + breathe * 2.5 + drive.fire * 0.45),
    );
    setIntensity(
      hazeRef.current,
      0.05 +
        open *
          (layout.haze +
            ignite * 0.32 +
            beat * 0.14 +
            (active ? Math.sin(t * 0.42) * 0.04 : 0) +
            scroll * 0.12),
    );
    setIntensity(poolRef.current, open * (0.2 + ignite * 0.3 + beat * 0.14 + breathe));
    if (coreLightRef.current) {
      coreLightRef.current.intensity = open * (11 + ignite * 8 + drive.fire * 5);
    }

    // --- Onda de energia: do Core em direção à câmera, acendendo cada
    // pórtico e o chão em sequência; cada pórtico trava ao ser alcançado.
    // Luz e véu apagam ANTES dos pórticos próximos — a coluna de texto nunca
    // recebe verde; a carga dos pórticos segue até `flashReach` (mascarada).
    const inBeat = beatPhase >= 0;
    const lightZ = inBeat
      ? endZ + beatPhase * WAVE_SPEED * 0.75
      : endZ + Math.max(0, t - T_WAVE) * WAVE_SPEED;
    const strength = inBeat ? b.strength : t > T_WAVE ? 1.25 : 0;
    const travel = lightZ - endZ;
    const fade = (d: number, r: [number, number] = reach) =>
      smoothstep(0, 1.2, d) * (1 - smoothstep(r[0], r[1], d));
    const envelope = fade(travel);
    const wave = active ? strength * envelope : 0;
    if (waveLightRef.current) {
      waveLightRef.current.position.set(axisX, 0.2, lightZ);
      waveLightRef.current.intensity = 13 * wave;
    }
    if (frontRef.current) {
      frontRef.current.position.z = lightZ;
      setIntensity(frontRef.current, 0.22 * wave);
    }

    // --- Energia residual: uma luz verde fraca vagando devagar pelo
    // meio/fundo da galeria — mantém materialidade e profundidade legíveis
    // no repouso. Acompanha o cursor (a parede daquele lado responde) e
    // cresce um pouco na travessia do scroll.
    if (residualLightRef.current) {
      const drift = active ? Math.sin(t * 0.21) : 0;
      residualLightRef.current.position.set(
        axisX + sx * 2.4 + (active ? Math.sin(t * 0.17 + 1) * 0.5 : 0),
        0.3 - sy * 1.2 + (active ? Math.sin(t * 0.33) * 0.25 : 0),
        endZ + layout.residual + drift * 2.4,
      );
      residualLightRef.current.intensity =
        open * (4.2 + (active ? Math.sin(t * 0.5) * 0.9 : 0) + ignite * 3 + scroll * 3);
    }

    // Corte da carga: nada acima de 3% abaixo do fim do texto, carga plena
    // 8% abaixo disso (sem medida ainda: 55%, o fim do texto num celular).
    const bufH = state.gl.domElement.height;
    const cut = clamp01((bounds.bottom || 0.55) + 0.03);
    flashMask.value.set(layout.stacked ? bufH * (1 - cut) : -1, bufH * 0.08);
    frameRefs.current.forEach((g, i) => {
      if (!g) return;
      const z = -i * spacing;
      const fromCore = z - endZ;
      const reachedAt = fromCore / WAVE_SPEED + T_WAVE;
      const lock = easeOutCubic(clamp01((t - reachedAt) / 0.6));
      // Chega desalinhado (rotação + recuo) e trava quando a energia passa.
      g.position.set(axisX, 0, z - (1 - lock) * 0.9);
      g.rotation.z = (1 - lock) * (i % 2 ? 0.06 : -0.05);
      const mesh = g.children[0] as THREE.Mesh | undefined;
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      // Pórticos colados na câmera (os que cruzam a coluna de texto, e os
      // que a câmera atravessa no scroll) escurecem: nenhuma aresta clara
      // passa por trás da tipografia.
      const near = smoothstep(2, 6.5, camZ - g.position.z);
      mat.color.copy(frameBase).multiplyScalar(0.3 + 0.7 * near);
      // O pórtico "carrega" quando a energia o atravessa e devolve em <1s —
      // resposta da arquitetura ao evento, nunca contorno aceso permanente.
      // Mesmo envelope da onda: os pórticos próximos nunca recebem verde.
      let flash = 0;
      if (active) {
        const beatReach = b.launch + fromCore / (WAVE_SPEED * 0.75);
        flash = Math.max(
          t >= reachedAt ? Math.exp(-(t - reachedAt) * 3.6) : 0,
          inBeat && t >= beatReach ? 0.6 * b.strength * Math.exp(-(t - beatReach) * 3.6) : 0,
        );
        flash *= fade(fromCore, layout.flashReach);
      }
      mat.emissive.copy(energy).multiplyScalar(0.3 * flash);
    });
  });

  const coreW = CORE.holeW * CORE.scale + 0.1;

  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <group
          key={i}
          ref={(g) => {
            frameRefs.current[i] = g;
          }}
        >
          <mesh geometry={geo.frame} material={mats.frames[i]} />
        </group>
      ))}

      {/* Fim do espaço: o Core, com a luz nascendo DE DENTRO da abertura. */}
      <group position={[axisX, coreY, endZ]} scale={CORE.scale}>
        <mesh geometry={geo.core} material={mats.core} />
      </group>
      <CoreLattice position={[axisX, coreY, endZ + LATTICE.z]} driveRef={driveRef} />
      <mesh
        ref={lightPlaneRef}
        geometry={geo.plane}
        material={mats.light}
        position={[axisX, coreY, endZ - CORE.depth * CORE.scale * 0.5 - 0.05]}
        scale={[coreW, 0.02, 1]}
      />
      <mesh
        ref={haloRef}
        geometry={geo.plane}
        material={mats.halo}
        position={[axisX, coreY, endZ + 0.3]}
        scale={[5, 3.3, 1]}
      />
      <mesh
        ref={hazeRef}
        geometry={geo.plane}
        material={mats.haze}
        position={[axisX, coreY, endZ + 0.4]}
        scale={[12, 7.5, 1]}
      />
      {/* Poça de luz no chão diante do Core: a luz "sai" da abertura. */}
      <mesh
        ref={poolRef}
        geometry={geo.plane}
        material={mats.pool}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[axisX, floorY + 0.01, endZ + 3.2]}
        scale={[4.2, 8, 1]}
      />
      {/* Frente da onda: um véu verde que atravessa a galeria com a luz. */}
      <mesh
        ref={frontRef}
        geometry={geo.plane}
        material={mats.front}
        position={[axisX, 0, endZ]}
        scale={[FRAME.w * 0.95, FRAME.h * 0.95, 1]}
      />
      <pointLight
        ref={coreLightRef}
        position={[axisX, coreY + 0.3, endZ + 0.9]}
        color={LIGHT}
        intensity={0}
        decay={1.4}
      />
      <pointLight ref={waveLightRef} color={ENERGY} intensity={0} distance={7.5} decay={1.4} />
      <pointLight ref={residualLightRef} color={ENERGY} intensity={0} distance={9} decay={1.5} />

      {/* Chão acetinado: ancora o espaço e rebate a luz do Core. */}
      <mesh
        geometry={geo.floor}
        material={mats.floor}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[axisX, floorY, -24]}
      />
    </group>
  );
}

function SpatialArchitectureScene({
  active,
  mobile,
  paused,
  scrollRef,
  pointerRef,
  pulseRef,
  textBoundsRef,
  onContextLost,
  onReady,
}: {
  active: boolean;
  mobile: boolean;
  paused: boolean;
  scrollRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  /** Contador incrementado a cada pedido de pulso (clique/toque na Hero). */
  pulseRef: RefObject<number>;
  textBoundsRef: RefObject<TextBounds>;
  onContextLost: () => void;
  /** Primeiro frame desenhado — a Hero só revela o canvas a partir daqui. */
  onReady: () => void;
}) {
  const layout = mobile ? LAYOUT.mobile : LAYOUT.desktop;
  return (
    <Canvas
      // Sem pós-processamento: MSAA nativo resolve as arestas, DPR contido.
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ near: 0.1, far: 40, fov: layout.fov, position: layout.cam }}
      frameloop={!active || paused ? "demand" : "always"}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("aria-hidden", "true");
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}
    >
      <color attach="background" args={[BACKDROP]} />
      {/* Névoa recuada: o meio/fundo da galeria continua legível. */}
      <fog attach="fog" args={[BACKDROP, 9, 34]} />
      <ambientLight intensity={0.04} />
      {/* Key rasante de cima/esquerda, fraca: desenha chanfros e repetição. */}
      <directionalLight position={[-3, 5, 4]} intensity={0.3} color="#eef3f0" />
      <Architecture
        layout={layout}
        active={active}
        scrollRef={scrollRef}
        pointerRef={pointerRef}
        pulseRef={pulseRef}
        textBoundsRef={textBoundsRef}
        onFirstFrame={onReady}
      />
    </Canvas>
  );
}

export { SpatialArchitectureScene };
