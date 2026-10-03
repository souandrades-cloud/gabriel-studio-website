import type { EcosystemLayout, Float, Vec3 } from "./ecosystem-config";
import { createEnvironment, mulberry32, type WorldCanvases } from "./ecosystem-environment";

/**
 * Motor da Hero V3 — "Floating Connected Ecosystem".
 *
 * Sem WebGL: uma câmera em perspectiva escrita à mão (≈ 20 linhas) projeta o
 * mundo em 2D e alimenta duas camadas:
 *  · DOM — Core (cubo CSS 3D) e cards (texto nítido, ícones). O motor só
 *    escreve `transform`/`opacity` neles: nada de layout por frame.
 *  · Canvas 2D — piso, luz do Core, condutos e a ENERGIA.
 *
 * Os condutos são roteados em 3D (saem de uma face do Core, correm no plano
 * dos condutos com cantos arredondados e sobem/descem até o card) e são
 * reprojetados a cada frame: acompanham a flutuação dos corpos como cabos.
 * Um pulso é uma cabeça luminosa + rastro que percorre o COMPRIMENTO REAL do
 * caminho projetado (parametrização por comprimento de arco) — é isso que
 * faz a energia ler como algo que viaja, e não como uma linha que pisca.
 *
 * Estados:
 *  · CHEGADA — piso aparece, Core sobe e acende (ignição), condutos são
 *    desenhados por uma frente de energia que nasce no Core; cada módulo
 *    surge quando a frente o alcança;
 *  · REPOUSO — flutuação independente de cada corpo (períodos
 *    incomensuráveis + balanço próprio), câmera em órbita lentíssima
 *    (parallax entre planos), Core respirando com o núcleo girando;
 *  · EVENTO — um por vez: o Core escolhe um módulo, carrega e dispara; o
 *    pacote percorre o conduto (os cabos ficam apagados — só a energia os
 *    acende, e só atrás dela); o módulo responde; pausa; próximo. Às vezes
 *    uma resposta fraca volta ao Core;
 *  · REDUCED MOTION — um único quadro composto: um pacote congelado a caminho
 *    de um módulo e o anterior ainda aceso.
 */

export type EngineElements = {
  stage: HTMLElement;
  canvas: HTMLCanvasElement;
  core: HTMLElement;
  coreCube: HTMLElement;
  coreLight: HTMLElement;
  /** Núcleo emissivo (gira por dentro do invólucro). */
  coreInner: HTMLElement;
  /** Luz do respiro na tampa — sobe com a carga. */
  coreVent: HTMLElement;
  /** Na ordem de `layout.placements`. */
  cards: HTMLElement[];
  /**
   * Mundo em volta do sistema: cobre a seção inteira (atrás da copy), com a
   * mesma câmera do palco. Sem ele, não há ambiente.
   */
  world?: {
    root: HTMLElement;
    canvases: WorldCanvases;
    /** Onde está o texto (copy, legenda): atrás dele, o mundo fica quieto. */
    quiet?: readonly (HTMLElement | null | undefined)[];
  };
};

/**
 * Inspeção (temporária, só nas rotas de lab): `system` desliga o ambiente
 * (fundo preto da versão anterior); `environment` esconde Core, cards e rede
 * para julgar o ambiente sozinho.
 */
export type SceneMode = "full" | "system" | "environment";

export type EngineOptions = {
  layout: EcosystemLayout;
  animate: boolean;
  scene?: SceneMode;
  pointerRef?: { current: { x: number; y: number } };
  pulseRef?: { current: number };
};

export type EcosystemEngine = {
  setPaused: (paused: boolean) => void;
  destroy: () => void;
};

const TAU = Math.PI * 2;
const DEG = 180 / Math.PI;
const CORNER_RADIUS = 0.6;
const CORNER_STEPS = 8;

/**
 * Infraestrutura (unidades de mundo): conector na saída do Core e relé sobre
 * o conduto (o cabo passa por dentro dele).
 */
const PORT_LEN = 0.38;
const RELAY = { half: 0.17, height: 0.09 } as const;
const SQUARE: readonly (readonly [number, number])[] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

/** Linha do tempo da chegada (s, relógio da cena). */
const ARRIVAL = {
  grid: [0, 1.8],
  core: [0.2, 1.3],
  ignitePeak: 1.25,
  conduitStart: 1.55,
  conduitStagger: 0.17,
  conduitDur: 1.0,
  firstPulse: 4.6,
} as const;

/** Evento de energia (s; velocidade em px/s × escala do palco). */
const EVENT = {
  charge: 0.55,
  speed: 250,
  minDur: 1.35,
  maxDur: 2.6,
  response: 1.6,
  pause: [0.6, 1.5],
  returnChance: 0.35,
} as const;

/** Viagem do pacote: sai devagar do Core, cruza, desacelera ao atracar. */
function pulseEase(raw: number) {
  if (raw >= 1) return 1 + (raw - 1) * 0.6;
  const x = Math.max(0, raw);
  return 0.3 * x + 0.7 * x * x * (3 - 2 * x);
}

/** Estado congelado usado no reduced motion. */
const STILL_T = 30;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** PRNG determinístico — o ritmo varia, mas é o mesmo a cada visita. */
function floatOffset(f: Float, t: number): [number, number, number] {
  return [
    f.amp[0] * Math.sin((TAU * t) / f.period[0] + f.phase),
    f.amp[1] * Math.sin((TAU * t) / f.period[1] + f.phase * 1.7),
    f.amp[2] * Math.sin((TAU * t) / f.period[2] + f.phase * 0.6),
  ];
}

let spriteCache: HTMLCanvasElement | null = null;
/** Luz pontual pré-renderizada: um drawImage por cabeça de pulso. */
function energySprite() {
  if (spriteCache) return spriteCache;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  if (g) {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(240,255,247,1)");
    r.addColorStop(0.12, "rgba(170,255,210,0.9)");
    r.addColorStop(0.34, "rgba(52,214,140,0.32)");
    r.addColorStop(1, "rgba(34,181,115,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  }
  spriteCache = c;
  return c;
}

let shadowCache: HTMLCanvasElement | null = null;
/** Sombra de contato pré-renderizada (escura, macia). */
function shadowSprite() {
  if (shadowCache) return shadowCache;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  if (g) {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(0,0,0,0.85)");
    r.addColorStop(0.45, "rgba(0,0,0,0.5)");
    r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  }
  shadowCache = c;
  return c;
}

type Route = {
  /** Vértices de mundo sem flutuação e o peso de flutuação do módulo em cada um. */
  base: Vec3[];
  weight: number[];
  /** Pontos de tela amostrados (x, y intercalados) e comprimento acumulado. */
  pts: Float32Array;
  cum: Float32Array;
  count: number;
  length: number;
  /** Nó de junção no primeiro trecho reto. */
  node: Vec3;
};

type Pulse = { conn: number; start: number; dur: number; back: boolean; arrived: boolean };

export function mountEcosystem(el: EngineElements, opts: EngineOptions): EcosystemEngine {
  const { layout, animate } = opts;
  const ctx = el.canvas.getContext("2d");
  const sprite = energySprite();
  const shadow = shadowSprite();
  const n = layout.placements.length;
  const coreHalf = layout.core.size / 2;
  const glows = el.cards.map((c) => c.querySelector<HTMLElement>("[data-glow]"));
  const scene = opts.scene ?? "full";
  const showSystem = scene !== "environment";

  // ── câmera ────────────────────────────────────────────────────────────
  let W = 0;
  let H = 0;
  let dpr = 1;
  let F = 1;
  let cx = 0;
  let cy = 0;
  let lw = 1; // escala de traço/luz relativa ao palco
  let yaw = layout.yaw;
  let pitch = layout.pitch;
  let cosY = 1;
  let sinY = 0;
  let cosP = 1;
  let sinP = 0;
  const D = layout.distance;
  const [tx, ty, tz] = layout.target;

  const proj = { x: 0, y: 0, depth: D };
  function project(x: number, y: number, z: number) {
    const dx = x - tx;
    const dy = y - ty;
    const dz = z - tz;
    const x1 = dx * cosY - dz * sinY;
    const z1 = dx * sinY + dz * cosY;
    const y2 = dy * cosP - z1 * sinP;
    const z2 = dy * sinP + z1 * cosP;
    const depth = D - z2;
    const k = F / depth;
    proj.x = cx + x1 * k;
    proj.y = cy - y2 * k;
    proj.depth = depth;
    return proj;
  }

  /**
   * Câmera com o movimento atual (órbita + cursor) multiplicado por `k`: o
   * plano distante usa `k` baixo e fica quase imóvel — parallax entre planos.
   */
  function camera(k: number) {
    const y = layout.yaw + (yaw - layout.yaw) * k;
    const p = layout.pitch + (pitch - layout.pitch) * k;
    cosY = Math.cos(y);
    sinY = Math.sin(y);
    cosP = Math.cos(p);
    sinP = Math.sin(p);
  }

  // ── rotas ─────────────────────────────────────────────────────────────
  let cardHalfWorld: number[] = el.cards.map(() => 0.6);
  const cy3 = layout.conduitY;

  function buildRoutes(): Route[] {
    return layout.placements.map((p, i) => {
      const [px, py, pz] = p.pos;
      const half = cardHalfWorld[i];
      const ey = py > cy3 ? py - half : py + half;
      const verts: Vec3[] = [];
      const weight: number[] = [];
      if (p.exit === "x") {
        const sx = Math.sign(px) || 1;
        verts.push([sx * coreHalf * 0.98, cy3, p.lane], [px, cy3, p.lane]);
        weight.push(0, 0.3);
        if (Math.abs(p.lane - pz) > 0.05) {
          verts.push([px, cy3, pz]);
          weight.push(0.7);
        }
      } else {
        const sz = Math.sign(pz) || 1;
        verts.push([p.lane, cy3, sz * coreHalf * 0.98], [p.lane, cy3, pz]);
        weight.push(0, 0.3);
        if (Math.abs(p.lane - px) > 0.05) {
          verts.push([px, cy3, pz]);
          weight.push(0.7);
        }
      }
      verts.push([px, ey, pz]);
      weight.push(1);
      const interior = verts.length - 2;
      const count = 2 + interior * (CORNER_STEPS + 1);
      const a = verts[0];
      const b = verts[1];
      return {
        base: verts,
        weight,
        pts: new Float32Array(count * 2),
        cum: new Float32Array(count),
        count,
        length: 0,
        node: [a[0] + (b[0] - a[0]) * 0.42, cy3, a[2] + (b[2] - a[2]) * 0.42],
      };
    });
  }
  let routes = buildRoutes();

  // Buffers de mundo reutilizados por frame.
  const wv: number[][] = [];
  const coreOff: [number, number, number] = [0, 0, 0];
  const lightPos: [number, number, number] = [0, 0, 0];
  const environment =
    el.world && scene !== "system"
      ? createEnvironment({
          canvases: el.world.canvases,
          env: layout.environment,
          ground: layout.floorY,
          project,
          camera,
          sprite,
        })
      : null;
  const modOff: [number, number, number][] = layout.placements.map(() => [0, 0, 0]);

  function sampleRoute(r: Route, i: number) {
    const m = modOff[i];
    const len = r.base.length;
    for (let v = 0; v < len; v++) {
      const b = r.base[v];
      const w = r.weight[v];
      const row = (wv[v] ??= [0, 0, 0]);
      row[0] = b[0] + coreOff[0] * (1 - w) + m[0] * w;
      row[1] = b[1] + coreOff[1] * (1 - w) + m[1] * w;
      row[2] = b[2] + coreOff[2] * (1 - w) + m[2] * w;
    }
    let k = 0;
    const put = (x: number, y: number, z: number) => {
      const p = project(x, y, z);
      r.pts[k * 2] = p.x;
      r.pts[k * 2 + 1] = p.y;
      k++;
    };
    put(wv[0][0], wv[0][1], wv[0][2]);
    for (let v = 1; v < len - 1; v++) {
      const P = wv[v - 1];
      const V = wv[v];
      const N = wv[v + 1];
      const l1 = Math.hypot(V[0] - P[0], V[1] - P[1], V[2] - P[2]) || 1;
      const l2 = Math.hypot(N[0] - V[0], N[1] - V[1], N[2] - V[2]) || 1;
      const rad = Math.min(CORNER_RADIUS, l1 * 0.45, l2 * 0.45);
      const ax = V[0] + ((P[0] - V[0]) / l1) * rad;
      const ay = V[1] + ((P[1] - V[1]) / l1) * rad;
      const az = V[2] + ((P[2] - V[2]) / l1) * rad;
      const bx = V[0] + ((N[0] - V[0]) / l2) * rad;
      const by = V[1] + ((N[1] - V[1]) / l2) * rad;
      const bz = V[2] + ((N[2] - V[2]) / l2) * rad;
      for (let s = 0; s <= CORNER_STEPS; s++) {
        const t = s / CORNER_STEPS;
        const u = 1 - t;
        put(
          u * u * ax + 2 * u * t * V[0] + t * t * bx,
          u * u * ay + 2 * u * t * V[1] + t * t * by,
          u * u * az + 2 * u * t * V[2] + t * t * bz,
        );
      }
    }
    const E = wv[len - 1];
    put(E[0], E[1], E[2]);
    let acc = 0;
    r.cum[0] = 0;
    for (let q = 1; q < r.count; q++) {
      acc += Math.hypot(r.pts[q * 2] - r.pts[q * 2 - 2], r.pts[q * 2 + 1] - r.pts[q * 2 - 1]);
      r.cum[q] = acc;
    }
    r.length = acc;
  }

  const at = { x: 0, y: 0 };
  function pointAt(r: Route, s: number) {
    const d = s <= 0 ? 0 : s >= r.length ? r.length : s;
    let q = 1;
    while (q < r.count - 1 && r.cum[q] < d) q++;
    const s0 = r.cum[q - 1];
    const seg = r.cum[q] - s0 || 1;
    const f = (d - s0) / seg;
    at.x = r.pts[q * 2 - 2] + (r.pts[q * 2] - r.pts[q * 2 - 2]) * f;
    at.y = r.pts[q * 2 - 1] + (r.pts[q * 2 + 1] - r.pts[q * 2 - 1]) * f;
    return at;
  }

  function strokeRange(r: Route, from: number, to: number) {
    if (!ctx || to <= from) return;
    ctx.beginPath();
    const a = pointAt(r, from);
    ctx.moveTo(a.x, a.y);
    for (let q = 1; q < r.count; q++) {
      if (r.cum[q] <= from) continue;
      if (r.cum[q] >= to) break;
      ctx.lineTo(r.pts[q * 2], r.pts[q * 2 + 1]);
    }
    const b = pointAt(r, to);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // ── tamanho ───────────────────────────────────────────────────────────
  let coreBasePx = 0;
  let coreDepth0 = D;
  const cardDepth0: number[] = el.cards.map(() => D);

  function resize() {
    const rect = el.stage.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    const isNarrow = W < 640;
    dpr = Math.min(window.devicePixelRatio || 1, isNarrow ? 1.75 : 2);
    el.canvas.width = Math.round(W * dpr);
    el.canvas.height = Math.round(H * dpr);
    F = (W / layout.span) * D;
    cx = W * layout.center[0];
    cy = H * layout.center[1];
    lw = Math.max(0.75, Math.min(1.25, W / 860));
    el.stage.style.fontSize = `${layout.fontSize(W)}px`;
    if (environment && el.world) {
      const area = el.world.root.getBoundingClientRect();
      environment.resize({
        width: Math.max(1, area.width),
        height: Math.max(1, area.height),
        ox: rect.left - area.left,
        oy: rect.top - area.top,
        // O mundo é macio (névoa, volumes): densidade menor que a do palco.
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        lw,
        quiet: (el.world.quiet ?? []).flatMap((node) => {
          if (!node) return [];
          const q = node.getBoundingClientRect();
          return [[q.left - area.left, q.top - area.top, q.right - area.left, q.bottom - area.top]];
        }),
      });
    }

    // Altura real dos cards (uma leitura de layout por resize) → meia
    // altura em unidades de mundo, para o conduto encostar na borda.
    const pxPerUnit = F / D;
    cardHalfWorld = el.cards.map((c) => ((c.offsetHeight || 60) * 0.46) / pxPerUnit);
    routes = buildRoutes();

    cosY = Math.cos(layout.yaw);
    sinY = Math.sin(layout.yaw);
    cosP = Math.cos(layout.pitch);
    sinP = Math.sin(layout.pitch);
    coreDepth0 = project(0, cy3, 0).depth;
    coreBasePx = (layout.core.size * F) / coreDepth0;
    el.core.style.width = el.core.style.height = `${coreBasePx}px`;
    el.coreCube.style.setProperty("--half", `${coreBasePx / 2}px`);

    // Ordem de profundidade fixa (a flutuação nunca inverte a ordem).
    const depths = layout.placements.map((p, i) => {
      const d = project(p.pos[0], p.pos[1], p.pos[2]).depth;
      cardDepth0[i] = d;
      return { i, d };
    });
    // Plano 3 — atmosfera: quanto mais distante o módulo, mais apagado e
    // menos contrastado (estático: filtro definido só no resize).
    const ds = depths.map((x) => x.d);
    const dMin = Math.min(...ds);
    const dMax = Math.max(...ds);
    depths.forEach(({ i, d }) => {
      const far = dMax > dMin ? (d - dMin) / (dMax - dMin) : 0;
      el.cards[i].style.filter =
        `brightness(${(1 - 0.3 * far).toFixed(3)}) saturate(${(1 - 0.25 * far).toFixed(3)})`;
    });
    depths.push({ i: -1, d: coreDepth0 });
    depths
      .sort((a, b) => b.d - a.d)
      .forEach(({ i }, z) => {
        const node = i < 0 ? el.core : el.cards[i];
        node.style.zIndex = String(10 + z);
      });
  }

  // ── energia: um EVENTO por vez ────────────────────────────────────────
  // Ciclo: o Core escolhe um módulo → CARREGA (luz interna sobe, a face de
  // saída acende) → DISPARA → o pacote percorre o conduto → o módulo
  // RESPONDE → pausa → próximo evento. Nunca dois disparos simultâneos.
  const rng = mulberry32(0x6a5f3c);
  const pulses: Pulse[] = [];
  const arrivedAt = new Float64Array(n).fill(-99);
  const activeUntil = new Float64Array(n).fill(-1);
  let nextEventAt: number = ARRIVAL.firstPulse;
  let charging: { conn: number; from: number; at: number } | null = null;
  let lastConn = -1;
  let emitAt = -99;
  let emitConn = -1;
  let backBlipAt = -99;
  let lastPulseReq = opts.pulseRef?.current ?? 0;

  function pickConn() {
    let c = Math.floor(rng() * n);
    if (c === lastConn) c = (c + 1 + Math.floor(rng() * (n - 1))) % n;
    lastConn = c;
    return c;
  }

  const forwardInFlight = () => pulses.some((p) => !p.back && !p.arrived);

  function schedule(t: number) {
    // Clique/toque na Hero antecipa o próximo evento (se o sistema está livre).
    const req = opts.pulseRef?.current ?? 0;
    if (req !== lastPulseReq) {
      lastPulseReq = req;
      if (t > ARRIVAL.firstPulse - 1 && !charging && !forwardInFlight()) nextEventAt = t;
    }
    if (!charging && t >= nextEventAt && !forwardInFlight()) {
      charging = { conn: pickConn(), from: t, at: t + EVENT.charge };
      nextEventAt = Infinity; // reagendado quando o pacote atracar
    }
    if (charging && t >= charging.at) {
      const r = routes[charging.conn];
      const dur = Math.max(EVENT.minDur, Math.min(EVENT.maxDur, r.length / (EVENT.speed * lw)));
      pulses.push({ conn: charging.conn, start: charging.at, dur, back: false, arrived: false });
      emitAt = charging.at;
      emitConn = charging.conn;
      charging = null;
    }
  }

  /** Carga do Core (0–1): sobe antes do disparo, pico no disparo, decai. */
  function coreCharge(t: number) {
    const pre = charging ? smooth(t, charging.from, charging.at) : 0;
    const flash = Math.exp(-Math.max(0, t - emitAt) / 0.35);
    const blip = 0.3 * Math.exp(-Math.max(0, t - backBlipAt) / 0.35);
    return Math.max(pre * 0.85, flash, blip);
  }

  function arrive(i: number, t: number) {
    arrivedAt[i] = t;
    activeUntil[i] = t + EVENT.response;
    el.cards[i].dataset.active = "true";
  }

  // ── desenho ───────────────────────────────────────────────────────────
  function drawGrid(alpha: number) {
    if (!ctx || alpha <= 0.01) return;
    const E = layout.gridExtent;
    const fy = layout.floorY;
    const SEG = 14;
    const LEVELS = 6;
    const paths: Path2D[] = Array.from({ length: LEVELS }, () => new Path2D());
    const addLine = (x0: number, z0: number, x1: number, z1: number) => {
      for (let s = 0; s < SEG; s++) {
        const ta = s / SEG;
        const tb = (s + 1) / SEG;
        const mx = x0 + (x1 - x0) * (ta + tb) * 0.5;
        const mz = z0 + (z1 - z0) * (ta + tb) * 0.5;
        const d = Math.hypot(mx, mz) / E;
        if (d >= 1) continue;
        const level = Math.min(LEVELS - 1, Math.floor((1 - d) * (1 - d) * LEVELS));
        const a = project(x0 + (x1 - x0) * ta, fy, z0 + (z1 - z0) * ta);
        const ax = a.x;
        const ay = a.y;
        const b = project(x0 + (x1 - x0) * tb, fy, z0 + (z1 - z0) * tb);
        paths[level].moveTo(ax, ay);
        paths[level].lineTo(b.x, b.y);
      }
    };
    for (let g = -E; g <= E; g++) {
      addLine(g, -E, g, E);
      addLine(-E, g, E, g);
    }
    // Plano 1: o mais apagado da cena — textura de espaço, não desenho.
    ctx.lineWidth = 1;
    for (let l = 0; l < LEVELS; l++) {
      ctx.strokeStyle = `rgba(170,235,205,${(0.01 + (l / LEVELS) * 0.055) * alpha})`;
      ctx.stroke(paths[l]);
    }
  }

  function drawFloorLight(glow: number, vis: number) {
    if (!ctx || vis <= 0.01) return;
    const c = project(coreOff[0], layout.floorY, coreOff[2]);
    const rx = 3.6 * (F / c.depth);
    const ry = rx * Math.sin(pitch) * 1.05;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(34,181,115,${0.3 * glow * vis})`);
    g.addColorStop(0.3, `rgba(34,181,115,${0.09 * glow * vis})`);
    g.addColorStop(0.6, `rgba(34,181,115,${0.02 * glow * vis})`);
    g.addColorStop(1, "rgba(34,181,115,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
    ctx.restore();
  }

  /** Onda no piso a cada disparo: o Core bate e o espaço registra. */
  function drawEmitRing(t: number) {
    if (!ctx) return;
    const p = (t - emitAt) / 1.5;
    if (p < 0 || p > 1) return;
    const c = project(coreOff[0], layout.floorY, coreOff[2]);
    const rx = (coreHalf * 1.2 + 3.4 * easeOutCubic(p)) * (F / c.depth);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(1, Math.sin(pitch));
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, TAU);
    ctx.restore();
    ctx.lineWidth = 1.2 * lw;
    ctx.strokeStyle = `rgba(110,240,180,${0.45 * Math.pow(1 - p, 1.6)})`;
    ctx.stroke();
  }

  /** Reflexo no piso sob um módulo: revela a altura e acende com a energia. */
  function drawFloorSpot(i: number, act: number, vis: number) {
    if (!ctx || vis <= 0.01) return;
    const p = layout.placements[i].pos;
    const m = modOff[i];
    const c = project(p[0] + m[0], layout.floorY, p[2] + m[2]);
    // Quanto mais alto o card (flutuando), mais larga e fraca a luz.
    const lift = p[1] + m[1] - layout.floorY;
    const size = (1.9 + lift * 0.22) * (F / c.depth);
    const alpha = (0.08 + 0.42 * act) * vis * (3.2 / (2 + lift));
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(1, Math.sin(pitch) * 0.9);
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(sprite, -size, -size, size * 2, size * 2);
    ctx.restore();
  }

  function drawSprite(x: number, y: number, size: number, alpha: number) {
    if (!ctx || alpha <= 0.01 || size <= 0.5) return;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    ctx.globalAlpha = 1;
  }

  /** Posição de mundo do nó de junção, acompanhando a flutuação. */
  function nodeAt(r: Route, i: number): Vec3 {
    const m = modOff[i];
    return [
      r.node[0] + coreOff[0] * 0.85 + m[0] * 0.15,
      r.node[1] + coreOff[1] * 0.85 + m[1] * 0.15,
      r.node[2] + coreOff[2] * 0.85 + m[2] * 0.15,
    ];
  }

  /**
   * Relé: bloco pequeno sobre o conduto — o cabo entra e sai dele. Acende
   * (aro + luz de status) quando o pacote passa: o percurso tem matéria.
   */
  const relayTop = new Float32Array(8);
  const relayBot = new Float32Array(8);
  function drawRelay(r: Route, i: number, lit: number, vis: number) {
    if (!ctx || vis <= 0.01) return;
    const [nx, ny, nz] = nodeAt(r, i);
    const w = RELAY.half;
    const h = RELAY.height;
    for (let c = 0; c < 4; c++) {
      const [ox, oz] = SQUARE[c];
      const a = project(nx + ox * w, ny + h, nz + oz * w);
      relayTop[c * 2] = a.x;
      relayTop[c * 2 + 1] = a.y;
      const b = project(nx + ox * w, ny - h, nz + oz * w);
      relayBot[c * 2] = b.x;
      relayBot[c * 2 + 1] = b.y;
    }
    ctx.fillStyle = `rgba(9,13,11,${0.97 * vis})`;
    for (let c = 0; c < 4; c++) {
      const d = (c + 1) % 4;
      ctx.beginPath();
      ctx.moveTo(relayTop[c * 2], relayTop[c * 2 + 1]);
      ctx.lineTo(relayTop[d * 2], relayTop[d * 2 + 1]);
      ctx.lineTo(relayBot[d * 2], relayBot[d * 2 + 1]);
      ctx.lineTo(relayBot[c * 2], relayBot[c * 2 + 1]);
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    for (let c = 0; c < 4; c++) {
      if (c === 0) ctx.moveTo(relayTop[0], relayTop[1]);
      else ctx.lineTo(relayTop[c * 2], relayTop[c * 2 + 1]);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(26,35,31,${vis})`;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(110,240,175,${(0.26 + 0.7 * lit) * vis})`;
    ctx.stroke();
    const top = project(nx, ny + h, nz);
    const tx0 = top.x;
    const ty0 = top.y;
    ctx.globalCompositeOperation = "lighter";
    drawSprite(tx0, ty0, (9 + 26 * lit) * lw, (0.3 + 0.7 * lit) * vis);
    ctx.globalCompositeOperation = "source-over";
  }

  /**
   * Ancoragem: haste do relé até o piso + sapata. Poucas e deliberadas — é
   * o que amarra a rede ao chão (o Core e os módulos seguem flutuando).
   */
  function drawAnchor(r: Route, i: number, lit: number, vis: number) {
    if (!ctx || vis <= 0.01) return;
    const [nx, ny, nz] = nodeAt(r, i);
    const fy = layout.floorY;
    const a = project(nx, ny - RELAY.height, nz);
    const ax = a.x;
    const ay = a.y;
    const b = project(nx, fy, nz);
    const bx = b.x;
    const by = b.y;
    ctx.lineWidth = 1.2 * lw;
    ctx.strokeStyle = `rgba(150,220,192,${(0.13 + 0.22 * lit) * vis})`;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    // Sapata: placa quadrada no piso.
    const w = 0.2;
    ctx.beginPath();
    SQUARE.forEach(([ox, oz], c) => {
      const p = project(nx + ox * w, fy, nz + oz * w);
      if (c === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = `rgba(14,20,17,${0.9 * vis})`;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(120,235,180,${(0.2 + 0.4 * lit) * vis})`;
    ctx.stroke();
  }

  /** Conector na saída do Core: luva escura com aro, acende na carga. */
  function drawPort(r: Route, lit: number, vis: number) {
    if (!ctx || vis <= 0.01) return;
    const len = PORT_LEN * (F / coreDepth0);
    ctx.lineCap = "butt";
    ctx.lineWidth = 6.4 * lw;
    ctx.strokeStyle = `rgba(120,245,185,${(0.2 + 0.65 * lit) * vis})`;
    strokeRange(r, 0, len);
    ctx.lineWidth = 4.2 * lw;
    ctx.strokeStyle = `rgba(13,19,16,${vis})`;
    strokeRange(r, 0, len);
    ctx.lineCap = "round";
  }

  /** Sombra de contato: a base sólida do Core bloqueia a própria luz. */
  function drawCoreFootprint(vis: number) {
    if (!ctx || vis <= 0.01) return;
    const fy = layout.floorY;
    const c = project(coreOff[0], fy, coreOff[2]);
    const rx = coreHalf * 1.25 * (F / c.depth);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(1, Math.sin(pitch));
    ctx.globalAlpha = 0.6 * vis;
    ctx.drawImage(shadow, -rx, -rx, rx * 2, rx * 2);
    ctx.restore();
  }

  /** Posição de arco do nó (fica no 1º trecho reto do conduto). */
  function nodeArc(r: Route, i: number) {
    const [nx, ny, nz] = nodeAt(r, i);
    const p = project(nx, ny, nz);
    return Math.hypot(p.x - r.pts[0], p.y - r.pts[1]);
  }

  /** Gradiente ao longo do conduto até `to` (mais forte na frente). */
  function gradientRange(
    r: Route,
    from: number,
    to: number,
    M: number,
    width: number,
    rgb: string,
    alpha: number,
  ) {
    if (!ctx) return;
    const a0 = Math.max(0, from);
    const b0 = Math.min(r.length, to);
    if (b0 <= a0) return;
    ctx.lineWidth = width * lw;
    for (let j = 0; j < M; j++) {
      const a = a0 + ((b0 - a0) * j) / M;
      const b = a0 + ((b0 - a0) * (j + 1)) / M;
      // Intensidade pela distância à frente (`to`), não pelo índice: um
      // trecho cortado no fim do conduto mantém o mesmo perfil.
      const f = Math.pow(clamp01(1 - (to - b) / (to - from)), 1.8);
      ctx.strokeStyle = `rgba(${rgb},${f * alpha})`;
      strokeRange(r, a, b);
    }
  }

  /**
   * Pacote de energia: esteira longa (o caminho já percorrido acende atrás
   * dele e se apaga → direção), rastro curto intenso, duas faíscas e a
   * cabeça. `head` pode passar do fim do conduto: o pacote foi absorvido
   * pelo módulo e só a esteira termina de escoar.
   */
  function drawPacket(r: Route, head: number, intensity: number) {
    const wake = Math.min(r.length, 380 * lw);
    const trail = Math.min(r.length * 0.4, 90 * lw);
    gradientRange(r, head - wake, head, 8, 1.5, "120,240,180", 0.5 * intensity);
    gradientRange(r, head - trail, head, 6, 10, "34,181,115", 0.26 * intensity);
    gradientRange(r, head - trail, head, 7, 2.6, "210,255,232", intensity);
    if (head >= r.length) return;
    const sparks: [number, number, number][] = [
      [16, 15, 0.75],
      [36, 10, 0.45],
    ];
    for (const [back, size, a] of sparks) {
      if (head - back * lw <= 0) continue;
      const p = pointAt(r, head - back * lw);
      drawSprite(p.x, p.y, size * lw, a * intensity);
    }
    const hp = pointAt(r, head);
    drawSprite(hp.x, hp.y, 70 * lw, intensity);
  }

  // ── frame ─────────────────────────────────────────────────────────────
  let T = animate ? 0 : STILL_T;
  let last = 0;
  let raf = 0;
  let paused = false;
  let destroyed = false;
  let innerSpin = 0;

  function frame(now: number) {
    if (!ctx) return;
    let dt = 0;
    if (animate) {
      dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      T += dt;
    }
    const t = T;

    // Câmera: órbita lentíssima (o espaço inteiro desliza — planos próximos
    // mais que os distantes = parallax) + parallax de cursor, suavizado.
    const ptr = opts.pointerRef?.current;
    const driftYaw = animate ? 0.04 * Math.sin((TAU * t) / 27) : 0;
    const driftPitch = animate ? 0.02 * Math.sin((TAU * t) / 19 + 1.1) : 0;
    const yawTarget = layout.yaw + driftYaw + (animate && ptr ? ptr.x * 0.11 : 0);
    const pitchTarget = layout.pitch + driftPitch + (animate && ptr ? ptr.y * 0.06 : 0);
    yaw += (yawTarget - yaw) * (animate ? 0.045 : 1);
    pitch += (pitchTarget - pitch) * (animate ? 0.045 : 1);
    camera(1);

    // Flutuação.
    const co = floatOffset(layout.core.float, t);
    const coreVis = animate ? smooth(t, ARRIVAL.core[0], ARRIVAL.core[1]) : 1;
    coreOff[0] = co[0];
    coreOff[1] = co[1] - (1 - easeOutCubic(coreVis)) * 0.7;
    coreOff[2] = co[2];
    layout.placements.forEach((p, i) => {
      const o = floatOffset(p.float, t);
      modOff[i][0] = o[0];
      modOff[i][1] = o[1];
      modOff[i][2] = o[2];
    });

    if (animate) schedule(t);

    // Ignição → respiração → carga.
    const ignite = animate
      ? smooth(t, 0.6, ARRIVAL.ignitePeak) * (1 + 0.45 * (1 - smooth(t, ARRIVAL.ignitePeak, 2.1)))
      : 1;
    const breath = 1 + 0.08 * Math.sin((TAU * t) / 4.7);
    const charge = animate ? coreCharge(t) : 0.35;
    const coreGlow = ignite * breath + charge * 0.7;
    const sinceEmit = t - emitAt;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";

    // ── Plano 0–2: ambiente (infraestrutura maior, atrás de tudo) ──
    const gridVis = animate ? smooth(t, ARRIVAL.grid[0], ARRIVAL.grid[1]) : 1;
    lightPos[0] = coreOff[0];
    lightPos[1] = cy3 + coreOff[1];
    lightPos[2] = coreOff[2];
    environment?.draw({
      t,
      animate,
      glow: Math.min(1.5, coreGlow) * coreVis,
      light: lightPos,
      sinceEmit: animate ? sinceEmit : 99,
      quiet: !charging && !forwardInFlight(),
      vis: gridVis,
    });

    // ── Plano 2: piso do sistema ──
    drawGrid(gridVis);
    drawFloorLight(Math.min(1.5, coreGlow), coreVis);
    if (showSystem) drawCoreFootprint(coreVis * gridVis);
    if (animate) drawEmitRing(t);
    if (!showSystem) {
      el.core.style.opacity = "0";
      el.cards.forEach((c) => (c.style.opacity = "0"));
      return;
    }

    // Rotas e progresso de desenho (chegada).
    const drawProg: number[] = [];
    routes.forEach((r, i) => {
      sampleRoute(r, i);
      const start = ARRIVAL.conduitStart + i * ARRIVAL.conduitStagger;
      const p = animate ? clamp01((t - start) / ARRIVAL.conduitDur) : 1;
      drawProg.push(p);
      if (animate && p >= 1 && arrivedAt[i] < start) arrive(i, start + ARRIVAL.conduitDur);
    });

    ctx.globalCompositeOperation = "lighter";
    layout.placements.forEach((_, i) => {
      const start = ARRIVAL.conduitStart + i * ARRIVAL.conduitStagger;
      const vis = animate
        ? smooth(t, start + ARRIVAL.conduitDur * 0.75, start + ARRIVAL.conduitDur + 0.55)
        : 1;
      const since = t - arrivedAt[i];
      const act = animate ? (since >= 0 ? Math.exp(-since / 0.8) : 0) : i === 1 ? 0.6 : 0;
      drawFloorSpot(i, act, vis);
    });

    // Halo do Core (atrás do cubo DOM) — cresce na carga.
    const { x: cpx, y: cpy, depth: cpDepth } = project(coreOff[0], cy3 + coreOff[1], coreOff[2]);
    drawSprite(
      cpx,
      cpy,
      coreBasePx * (3.4 + 0.35 * charge),
      (0.36 + 0.08 * charge) * Math.min(1.25, coreGlow) * coreVis,
    );

    // ── Plano 2: condutos — cabos adormecidos; só a energia os acende ──
    ctx.globalCompositeOperation = "source-over";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const heads: number[] = routes.map(() => -1);
    if (animate) {
      for (const pu of pulses) {
        if (pu.back) continue;
        heads[pu.conn] = pulseEase((t - pu.start) / pu.dur) * routes[pu.conn].length;
      }
    }
    // O relé acende quando o pacote passa por ele.
    const relayLit = routes.map((r, i) => {
      if (!animate) return i === 0 ? 0.5 : 0;
      if (heads[i] < 0) return 0;
      const d = heads[i] - nodeArc(r, i);
      return d >= 0 ? Math.exp(-d / (110 * lw)) : Math.exp(d / (22 * lw));
    });
    // Ancoragens primeiro: ficam atrás dos cabos.
    routes.forEach((r, i) => {
      if (layout.placements[i].anchor) drawAnchor(r, i, relayLit[i], smooth(drawProg[i], 0.3, 0.6));
    });
    routes.forEach((r, i) => {
      const p = drawProg[i];
      if (p <= 0) return;
      const end = r.length * (p * p * (3 - 2 * p));
      ctx.lineWidth = 5 * lw;
      ctx.strokeStyle = "rgba(34,181,115,0.02)";
      strokeRange(r, 0, end);
      ctx.lineWidth = 1.1 * lw;
      ctx.strokeStyle = "rgba(80,222,156,0.11)";
      strokeRange(r, 0, end);
      // Conector do Core: acende na carga do conduto escolhido e no disparo.
      let portLit = animate ? 0 : i === 0 ? 0.6 : 0;
      if (charging && charging.conn === i) portLit = smooth(t, charging.from, charging.at);
      if (animate && emitConn === i && sinceEmit >= 0) {
        portLit = Math.max(portLit, Math.exp(-sinceEmit / 0.5));
      }
      drawPort(r, portLit, smooth(p, 0, 0.2));
      drawRelay(r, i, relayLit[i], smooth(p, 0.3, 0.5));
    });

    // Face de saída acesa durante a carga (o disparo tem origem visível).
    ctx.globalCompositeOperation = "lighter";
    if (charging) {
      const r = routes[charging.conn];
      drawSprite(r.pts[0], r.pts[1], 40 * lw, 0.85 * smooth(t, charging.from, charging.at));
    }
    if (animate && emitConn >= 0 && sinceEmit >= 0 && sinceEmit < 0.7) {
      const r = routes[emitConn];
      drawSprite(r.pts[0], r.pts[1], 56 * lw, Math.exp(-sinceEmit / 0.2));
    }

    // ── Energia ──
    routes.forEach((r, i) => {
      const p = drawProg[i];
      // Chegada: frente de energia que desenha o conduto.
      if (p > 0 && p < 1) drawPacket(r, r.length * (p * p * (3 - 2 * p)), 0.85);
    });

    if (animate) {
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pu = pulses[k];
        const r = routes[pu.conn];
        const raw = (t - pu.start) / pu.dur;
        if (raw < 0) continue;
        const fadeIn = clamp01(raw / 0.06);
        if (!pu.back) {
          const head = pulseEase(raw) * r.length;
          drawPacket(r, head, fadeIn);
          if (raw >= 1 && !pu.arrived) {
            pu.arrived = true;
            arrive(pu.conn, t);
            const [p0, p1] = EVENT.pause;
            nextEventAt = t + EVENT.response * 0.55 + p0 + rng() * (p1 - p0);
            // Atividade secundária: às vezes um sinal fraco volta ao Core.
            if (rng() < EVENT.returnChance) {
              pulses.push({
                conn: pu.conn,
                start: t + 0.7 + rng() * 0.4,
                dur: Math.max(1.6, Math.min(3, r.length / (170 * lw))),
                back: true,
                arrived: false,
              });
            }
          }
          if (head - 380 * lw >= r.length) pulses.splice(k, 1);
        } else {
          // Resposta: percorre do módulo ao Core, discreta.
          const sHead = r.length * (1 - Math.min(1, raw));
          const len = Math.min(r.length * 0.3, 60 * lw);
          if (raw < 1) {
            ctx.lineWidth = 1.4 * lw;
            for (let j = 0; j < 6; j++) {
              const a = sHead + (len * j) / 6;
              const b = Math.min(r.length, sHead + (len * (j + 1)) / 6);
              ctx.strokeStyle = `rgba(165,255,208,${0.32 * fadeIn * Math.pow(1 - j / 6, 1.8)})`;
              strokeRange(r, a, b);
            }
            const hp = pointAt(r, sHead);
            drawSprite(hp.x, hp.y, 16 * lw, 0.45 * fadeIn);
          } else {
            backBlipAt = t;
            pulses.splice(k, 1);
          }
        }
      }
    } else {
      // Reduced motion: um evento congelado — pacote a caminho de um módulo,
      // o anterior ainda aceso.
      drawPacket(routes[0], routes[0].length * 0.62, 1);
    }

    // Chegada nos módulos: flare na porta (o pacote é absorvido).
    routes.forEach((r, i) => {
      const since = t - arrivedAt[i];
      if (since < 0 || since > 1.6) return;
      const a = Math.exp(-since / 0.45);
      const ex = r.pts[(r.count - 1) * 2];
      const ey = r.pts[(r.count - 1) * 2 + 1];
      drawSprite(ex, ey, (34 + 70 * (1 - a)) * lw, a);
    });
    ctx.globalCompositeOperation = "source-over";

    // ── DOM ──
    // Plano 4 — Core: respiração própria, núcleo girando (computação) e
    // acelerando na carga; um coice mínimo de escala no disparo.
    const kick = animate && sinceEmit >= 0 ? 0.035 * Math.exp(-sinceEmit / 0.25) : 0;
    const coreScale =
      (coreDepth0 / cpDepth) *
      (0.88 + 0.12 * easeOutCubic(coreVis)) *
      (1 + 0.014 * Math.sin((TAU * t) / 4.7) + kick);
    el.core.style.transform = `translate3d(${cpx.toFixed(2)}px,${cpy.toFixed(2)}px,0) translate(-50%,-50%) scale(${coreScale.toFixed(4)})`;
    el.core.style.opacity = coreVis.toFixed(3);
    const wobble = animate ? 5 * Math.sin((TAU * t) / 16) : 0;
    el.coreCube.style.transform = `rotateX(${(-pitch * DEG).toFixed(2)}deg) rotateY(${(-yaw * DEG + wobble).toFixed(2)}deg)`;
    innerSpin += dt * (16 + 150 * charge);
    el.coreInner.style.transform = `rotateY(${(innerSpin + 30).toFixed(2)}deg) rotateX(${(innerSpin * 0.55 + 20).toFixed(2)}deg)`;
    el.coreLight.style.opacity = Math.min(1, 0.4 + 0.5 * coreGlow).toFixed(3);
    // Respiro da tampa: a carga sobe ANTES do disparo — a máquina se prepara.
    const vent = animate ? (0.35 + 0.65 * Math.min(1, charge)) * ignite : 0.7;
    el.coreVent.style.opacity = Math.min(1, vent * (0.94 + 0.06 * breath)).toFixed(3);

    // Plano 3 — módulos.
    const fx = -pitch * DEG * layout.facePitch;
    const fyDeg = (-yaw * DEG * layout.faceYaw).toFixed(2);
    layout.placements.forEach((p, i) => {
      const m = modOff[i];
      const c = project(p.pos[0] + m[0], p.pos[1] + m[1], p.pos[2] + m[2]);
      const start = ARRIVAL.conduitStart + i * ARRIVAL.conduitStagger;
      const vis = animate
        ? smooth(t, start + ARRIVAL.conduitDur * 0.75, start + ARRIVAL.conduitDur + 0.55)
        : 1;
      const s = (D / c.depth) * (0.94 + 0.06 * vis);
      const card = el.cards[i];
      // Balanço próprio de cada módulo (graus) — a assinatura de movimento
      // de cada um vem do config (`float.tilt`).
      const fl = p.float;
      const tiltX = animate
        ? fl.tilt[0] * Math.sin((TAU * t) / (fl.period[2] * 0.83) + fl.phase * 2.3)
        : 0;
      const tiltZ = animate
        ? fl.tilt[1] * Math.sin((TAU * t) / (fl.period[0] * 1.21) + fl.phase * 0.9)
        : 0;
      card.style.transform = `translate3d(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px,0) translate(-50%,-50%) scale(${s.toFixed(4)}) perspective(900px) rotateX(${(fx + tiltX).toFixed(2)}deg) rotateY(${fyDeg}deg) rotateZ(${tiltZ.toFixed(2)}deg)`;
      card.style.opacity = vis.toFixed(3);
      const since = t - arrivedAt[i];
      const act = animate ? (since >= 0 ? Math.exp(-since / 0.75) : 0) : i === 1 ? 0.6 : 0;
      const g = glows[i];
      if (g) g.style.opacity = act.toFixed(3);
      if (animate && card.dataset.active && t > activeUntil[i]) delete card.dataset.active;
      if (!animate) {
        if (i === 1) card.dataset.active = "true";
        else delete card.dataset.active;
      }
    });
  }

  function loop(now: number) {
    if (destroyed || paused) return;
    frame(now);
    raf = requestAnimationFrame(loop);
  }

  resize();
  if (animate) raf = requestAnimationFrame(loop);
  else frame(0);

  const ro = new ResizeObserver(() => {
    resize();
    if (!animate) frame(0);
  });
  ro.observe(el.stage);
  if (environment && el.world) ro.observe(el.world.root);

  return {
    setPaused(next) {
      if (!animate || next === paused) return;
      paused = next;
      if (!paused) {
        last = 0;
        raf = requestAnimationFrame(loop);
      } else cancelAnimationFrame(raf);
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    },
  };
}
