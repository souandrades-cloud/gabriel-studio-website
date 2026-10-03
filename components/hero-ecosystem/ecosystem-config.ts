import {
  Database,
  Globe,
  LayoutTemplate,
  Waypoints,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/**
 * Dados da Hero V3 — "Floating Connected Ecosystem". Tudo aqui é declarativo:
 * quais capacidades orbitam o Core, onde cada uma flutua no espaço do mundo e
 * como a câmera enquadra o sistema em cada largura. O motor
 * (`ecosystem-engine.ts`) só lê isto.
 *
 * Espaço do mundo: x → direita, y → cima, z → em direção à câmera. O Core
 * fica na origem; os condutos de energia correm no plano horizontal que passa
 * pelo centro do Core (`conduitY`) e sobem/descem até cada módulo.
 */

export type Vec3 = readonly [number, number, number];

export type MicroKind = "browser" | "trend" | "flow" | "bars" | "hub";

export type EcosystemModule = {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Sinal interno do card — reage quando a energia chega. */
  micro: MicroKind;
};

export const MODULES = {
  sites: { id: "sites", title: "Sites institucionais", icon: Globe, micro: "browser" },
  landing: { id: "landing", title: "Landing pages", icon: LayoutTemplate, micro: "trend" },
  automation: { id: "automation", title: "Automações", icon: Workflow, micro: "flow" },
  data: { id: "data", title: "Sistemas e dados", icon: Database, micro: "bars" },
  integrations: { id: "integrations", title: "Integrações", icon: Waypoints, micro: "hub" },
} as const satisfies Record<string, EcosystemModule>;

export type ModuleKey = keyof typeof MODULES;

/**
 * Flutuação de um corpo: amplitude por eixo (unidades de mundo), período por
 * eixo (s) e fase. Períodos incomensuráveis entre corpos → nunca sincronizam.
 */
export type Float = {
  amp: Vec3;
  period: Vec3;
  phase: number;
  /** Balanço (graus): inclinação para frente/trás e rolagem. */
  tilt: readonly [number, number];
};

export type Placement = {
  module: ModuleKey;
  /** Centro do card no mundo. */
  pos: Vec3;
  /**
   * Por qual face do Core o conduto sai: "x" (laterais) ou "z" (frente/fundo).
   * `lane` é o deslocamento no outro eixo — separa condutos da mesma face.
   */
  exit: "x" | "z";
  lane: number;
  float: Float;
  /** Ancora o relé deste conduto no piso (haste + sapata). Poucos, deliberados. */
  anchor?: boolean;
};

/**
 * Bloco do ambiente: centro (x, z) no chão, tamanho (largura x, altura y,
 * profundidade z). O topo fica em `lift` + altura, a partir do piso do
 * sistema; `tone` atenua (0–1).
 */
export type EnvBlock = {
  at: readonly [number, number];
  size: Vec3;
  lift?: number;
  tone?: number;
};

/** Luz pontual que respira (`at.y` medido a partir do piso do sistema). */
export type EnvLight = {
  at: Vec3;
  size: number;
  alpha: number;
  period: number;
  phase?: number;
  /** Recebe o sinal ambiente quando ele chega ao fim do caminho secundário. */
  beacon?: boolean;
};

/**
 * Campo de colunas (gerado, determinístico): uma baia por `pitch` no
 * retângulo [x, z]; algumas vazias (vãos fundos); nenhuma a menos de
 * `margin` da plataforma. Altura do topo (a partir do piso do sistema):
 * `base` + até `rise[1]` (crescendo `rise[0]` por unidade de distância do
 * sistema) + `jitter`; com z além de `near[0]` (perto da câmera), no máximo
 * `near[1]`. `lamps` = fração de colunas com um ponto de luz fixo.
 */
export type EnvField = {
  seed: number;
  pitch: number;
  /** Tamanho de cada coluna: fração da baia (mín., máx.). */
  fill: readonly [number, number];
  /** Chance de ocupar duas baias (plataforma longa) e de virar torre estreita. */
  merge: number;
  towers: number;
  /** Quanto uma torre sobe além da altura do campo. */
  towerRise: number;
  x: readonly [number, number];
  z: readonly [number, number];
  empty: number;
  margin: number;
  base: number;
  rise: readonly [number, number];
  jitter: number;
  near: readonly [number, number];
  lamps: number;
};

/** O mundo em volta do sistema — ver `ecosystem-environment.ts`. */
export type Environment = {
  /** A coluna do sistema: o topo é o piso da grade; `tone` atenua as laterais. */
  platform: EnvBlock;
  field: EnvField;
  /** Monólitos: as estruturas grandes, no plano distante. */
  monoliths: readonly EnvBlock[];
  /** Caminho secundário (x, z) por onde corre o sinal ambiente, e sua altura. */
  trace: { points: readonly (readonly [number, number])[]; y: number };
  /** Luzes que respiram (`at.y` a partir do piso do sistema). */
  lights: readonly EnvLight[];
  /** Névoa por profundidade da câmera: começa e termina (unidades de mundo). */
  fog: readonly [number, number];
  /** Alcance da luz do Core (unidades de mundo). */
  reach: number;
  /** Ar da seção (frações da altura): início da névoa, pico e fim. */
  haze: readonly [number, number, number];
};

export type EcosystemLayout = {
  /** Rotação da câmera em torno do eixo vertical e inclinação para baixo (rad). */
  yaw: number;
  pitch: number;
  /** Distância da câmera ao alvo (unidades de mundo). */
  distance: number;
  /** Quantas unidades de mundo cabem na largura do palco, na distância do alvo. */
  span: number;
  /** Onde o alvo cai no palco (frações da largura/altura). */
  center: readonly [number, number];
  target: Vec3;
  core: { size: number; float: Float };
  /** Altura dos condutos (centro do Core). */
  conduitY: number;
  /** Altura do piso e meia-extensão da grade. */
  floorY: number;
  gridExtent: number;
  /** Tamanho-base da tipografia dos cards (px) em função da largura do palco. */
  fontSize: (stageWidth: number) => number;
  /** Cards só com ícone + título (sem sinal interno). */
  compact: boolean;
  /** Quanto a face dos cards acompanha a orientação da câmera (0–1). */
  faceYaw: number;
  facePitch: number;
  placements: readonly Placement[];
  environment: Environment;
};

const f = (
  amp: Vec3,
  period: Vec3,
  phase: number,
  tilt: readonly [number, number] = [0.9, 0.6],
): Float => ({ amp, period, phase, tilt });

/**
 * Ambiente do desktop. Câmera olha para baixo: o "fundo" é chão se afastando
 * (sobe na tela) e qualquer aresta horizontal atravessa a tela na diagonal —
 * então atrás da copy só há formas VERTICAIS (monólitos, cortados pelo topo)
 * e as arestas horizontais ficam abaixo dos CTAs (o degrau da plataforma).
 */
const WIDE_ENVIRONMENT: Environment = {
  platform: { at: [-0.25, -1.75], size: [16.5, 0, 16.5], tone: 0.6 },
  field: {
    seed: 7,
    pitch: 6.5,
    fill: [0.6, 0.86],
    merge: 0.35,
    towers: 0.12,
    towerRise: 6,
    x: [-78, 33],
    z: [-85, 24],
    empty: 0.24,
    margin: 1.2,
    base: -2.6,
    rise: [0.17, 9.8],
    jitter: 2,
    near: [4, -3.2],
    lamps: 0.2,
  },
  // As estruturas grandes (escala): atrás da headline, entre a copy e o
  // sistema, e atrás dos módulos de cima — todas cortadas pelo topo.
  monoliths: [
    { at: [-37.2, -2.5], size: [7, 12.2, 6], lift: -2.2, tone: 1 },
    { at: [-34.1, -19.3], size: [6, 12, 5], lift: -2.2, tone: 1.5 },
    { at: [-0.2, -27.8], size: [5, 12, 4.5], lift: -2.2, tone: 1.5 },
  ],
  // Sinal ambiente: corre pela borda da plataforma, da frente do sistema até
  // a quina e de lá para o fundo — costura o sistema ao lado da copy.
  trace: {
    points: [
      [-2, 6.2],
      [-8.2, 6.2],
      [-8.2, -3],
    ],
    y: 0,
  },
  lights: [
    { at: [-8.2, 0.08, -3], size: 10, alpha: 0.3, period: 10.1, phase: 2, beacon: true },
    { at: [-8.2, 0.08, -9.7], size: 9, alpha: 0.4, period: 7.3, phase: 0 },
  ],
  fog: [24, 95],
  reach: 7,
  haze: [0.05, 0.3, 0.7],
};

/** Desktop (≥ lg): palco à direita da coluna de texto, sistema completo. */
const WIDE: EcosystemLayout = {
  yaw: 0.5,
  pitch: 0.46,
  distance: 17,
  span: 15,
  center: [0.52, 0.45],
  target: [0, 1.1, 0],
  core: { size: 2.4, float: f([0.03, 0.12, 0.03], [9.1, 6.8, 11.7], 0) },
  conduitY: 0.55,
  floorY: -2.4,
  gridExtent: 9,
  fontSize: (w) => Math.max(11.5, Math.min(16, w / 64)),
  compact: false,
  faceYaw: 0.62,
  facePitch: 0.55,
  placements: [
    {
      module: "sites",
      pos: [-3.3, 3.8, -2.75],
      // Sai pela face traseira: pela lateral, o conduto passaria atrás do
      // card de Landing pages e esconderia a viagem da energia.
      exit: "z",
      lane: -0.7,
      float: f([0.04, 0.27, 0.04], [10.3, 7.4, 12.9], 1.3, [0.6, 0.4]),
      anchor: true,
    },
    {
      module: "data",
      pos: [1.8, 3.25, -3.5],
      exit: "z",
      lane: 0.5,
      float: f([0.22, 0.08, 0.05], [8.8, 9.3, 9.7], 4.1, [0.5, 0.5]),
      anchor: true,
    },
    {
      module: "landing",
      pos: [-3.4, 2.05, 0.7],
      exit: "x",
      lane: 0.4,
      float: f([0.05, 0.1, 0.04], [8.7, 6.1, 13.3], 2.6, [1.9, 1.4]),
      anchor: true,
    },
    {
      module: "integrations",
      pos: [3.75, -0.8, -0.25],
      exit: "x",
      lane: 0.45,
      float: f([0.05, 0.1, 0.45], [12.4, 8.4, 7.6], 3.5, [0.7, 0.5]),
    },
    {
      module: "automation",
      pos: [-0.15, -1.35, 3.7],
      exit: "z",
      lane: -0.45,
      float: f([0.15, 0.17, 0.06], [10.2, 10.2, 11.1], 1.9, [1, 0.8]),
    },
  ],
  environment: WIDE_ENVIRONMENT,
};

/**
 * Ambiente do mobile: a câmera põe o horizonte logo abaixo da copy, então o
 * mundo atrás do texto é feito de MONÓLITOS que passam do horizonte (dois
 * cortados pelas bordas, um distante) — forma grande, sem detalhe — e o campo
 * de colunas corre até o horizonte, entre os CTAs e o sistema.
 */
const STACKED_ENVIRONMENT: Environment = {
  platform: { at: [0, 0], size: [12, 0, 12], tone: 0.6 },
  field: {
    seed: 7,
    pitch: 5.5,
    fill: [0.6, 0.86],
    merge: 0.35,
    towers: 0.12,
    towerRise: 5,
    x: [-50, 30],
    z: [-80, 16],
    empty: 0.22,
    margin: 1.2,
    base: -2.6,
    rise: [0.15, 8],
    jitter: 2,
    near: [4, -3.2],
    lamps: 0.2,
  },
  monoliths: [
    { at: [-16.5, -22], size: [5, 22, 4], lift: -2.2, tone: 1.6 },
    { at: [2.2, -38], size: [6, 20, 5], lift: -2.2, tone: 1.6 },
    { at: [-5, -52], size: [4, 17, 4], lift: -2.2, tone: 1.2 },
  ],
  trace: { points: [], y: 0 },
  lights: [],
  fog: [20, 110],
  reach: 5,
  haze: [0.1, 0.3, 0.6],
};

/**
 * Mobile/tablet (< lg): palco abaixo dos CTAs. Câmera mais frontal, cards
 * compactos em dois andares (acima e abaixo do plano dos condutos), o mesmo
 * sistema — Core + condutos + energia + flutuação + profundidade — e não uma
 * miniatura do desktop.
 */
const STACKED: EcosystemLayout = {
  yaw: 0.34,
  pitch: 0.5,
  distance: 15,
  span: 10.4,
  center: [0.5, 0.5],
  target: [0, 0.8, 0],
  core: { size: 2.0, float: f([0.03, 0.09, 0.03], [9.1, 6.8, 11.7], 0) },
  conduitY: 0.6,
  floorY: -2.0,
  gridExtent: 7,
  fontSize: (w) => Math.max(10.5, Math.min(14, w / 34)),
  compact: true,
  faceYaw: 0.6,
  facePitch: 0.5,
  placements: [
    {
      module: "sites",
      pos: [-2.4, 2.5, -1.8],
      exit: "x",
      lane: -0.45,
      float: f([0.04, 0.22, 0.04], [10.3, 7.4, 12.9], 1.3, [0.6, 0.4]),
    },
    {
      module: "data",
      pos: [2.2, 2.7, -2.2],
      exit: "z",
      lane: 0.45,
      float: f([0.18, 0.07, 0.05], [8.8, 9.3, 9.7], 4.1, [0.5, 0.5]),
    },
    {
      module: "landing",
      pos: [-2.6, -0.9, 1.6],
      exit: "x",
      lane: 0.4,
      float: f([0.05, 0.09, 0.04], [8.7, 6.1, 13.3], 2.6, [1.7, 1.2]),
    },
    {
      module: "integrations",
      pos: [2.3, -0.5, 1.9],
      exit: "z",
      lane: 0.45,
      float: f([0.05, 0.08, 0.26], [12.4, 8.4, 7.6], 3.5, [0.7, 0.5]),
    },
  ],
  environment: STACKED_ENVIRONMENT,
};

/**
 * Tablet (640–1023px): palco abaixo dos CTAs, mas largo o bastante para o
 * sistema completo do desktop — mesma geometria, câmera centrada.
 */
const TABLET: EcosystemLayout = {
  ...WIDE,
  span: 13.6,
  center: [0.5, 0.47],
  fontSize: (w) => Math.max(11.5, Math.min(14, w / 60)),
};

export const LAYOUTS = { wide: WIDE, tablet: TABLET, stacked: STACKED } as const;
export type LayoutKey = keyof typeof LAYOUTS;
