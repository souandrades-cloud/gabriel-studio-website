import type { EnvBlock, Environment } from "./ecosystem-config";

/**
 * Ambiente da Hero V3 — o mundo onde o ecossistema vive.
 *
 * Um TERRENO DE COLUNAS: volumes que sobem do escuro, cada um com o topo numa
 * altura — os topos são os níveis do chão. O sistema está em cima da coluna
 * central (a plataforma); as vizinhas são plataformas mais baixas ou mais
 * altas, os vãos entre elas são canais, e o campo continua além das bordas.
 * Alguns monólitos altos dão a escala.
 *
 * Cobre a seção inteira (atrás da copy), com a MESMA câmera do motor deslocada
 * para a origem do palco, em quatro camadas:
 *  · DISTANTE — atmosfera, colunas longe e monólitos. Baixa resolução e
 *    desfoque; pré-renderizada no resize, quase imóvel;
 *  · MÉDIO — colunas atrás da plataforma. Nítida, pré-renderizada, micro
 *    parallax por `transform`;
 *  · PLATAFORMA — a coluna do sistema, redesenhada por quadro com a câmera
 *    real (a luz do Core e a onda de cada disparo correm pela borda), mais as
 *    luzes que respiram e o sinal ambiente;
 *  · FRENTE — colunas entre a plataforma e a câmera. Desfocadas (fora do
 *    plano de foco), pré-renderizadas, acompanham a câmera.
 * Por quadro, o custo é só a plataforma, algumas luzes e três `transform`.
 *
 * Atrás da copy (zona quieta) o mundo baixa o tom e perde o detalhe: forma
 * grande, contraste baixo.
 */

type Projected = { x: number; y: number; depth: number };

export type WorldCanvases = {
  far: HTMLCanvasElement;
  mid: HTMLCanvasElement;
  near: HTMLCanvasElement;
  fore: HTMLCanvasElement;
};

export type EnvironmentDeps = {
  canvases: WorldCanvases;
  env: Environment;
  ground: number;
  project: (x: number, y: number, z: number) => Projected;
  /** Câmera com o movimento (órbita + cursor) multiplicado por `k` (0 = repouso). */
  camera: (k: number) => void;
  sprite: HTMLCanvasElement;
};

export type EnvironmentView = {
  /** Área do mundo (a seção inteira), px CSS. */
  width: number;
  height: number;
  /** Origem do palco dentro dessa área — onde a câmera do motor projeta. */
  ox: number;
  oy: number;
  dpr: number;
  lw: number;
  /** Zonas quietas (copy, legenda), na mesma área: [x0, y0, x1, y1]. */
  quiet: readonly (readonly [number, number, number, number])[];
};

export type EnvironmentFrame = {
  t: number;
  animate: boolean;
  /** Intensidade da luz do Core (respiração + carga). */
  glow: number;
  /** Posição da luz (centro do Core, com flutuação). */
  light: readonly [number, number, number];
  /** Segundos desde o último disparo. */
  sinceEmit: number;
  /** Sistema livre: sem carga e sem pacote em voo. */
  quiet: boolean;
  /** Entrada do ambiente na chegada (0–1). */
  vis: number;
};

/** Gerador determinístico (mesma semente → o mesmo mundo em todo load). */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Camadas pré-renderizadas: fração do movimento da câmera, resolução (× px
 * CSS; 0 = a do canvas da plataforma) e desfoque (px da camada).
 */
const LAYER = {
  far: { camera: 0.12, scale: 0.5, blur: 2.2 },
  mid: { camera: 0.4, scale: 0, blur: 0 },
  fore: { camera: 1, scale: 0.5, blur: 3 },
} as const;
/** Margem das camadas além da seção (o deslocamento nunca mostra a borda). */
const BLEED = 48;
/** Colunas com o topo além desta profundidade vão para o distante. */
const FAR_SPLIT = 30;
/** Quanto do alto de cada lateral pega luz antes de cair no escuro (mundo). */
const BAND = 1.8;
/** Profundidade das colunas abaixo do topo (somem no escuro antes). */
const COLUMN = 24;

const SIDES: readonly (readonly [number, number])[] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];
/** Normal externa de cada lateral (aresta c → c+1 de `SIDES`). */
const NORMALS: readonly (readonly [number, number])[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/** Sinal ambiente: primeira vez, intervalo e duração da viagem (s). */
const SIGNAL = { first: 9, every: 15.5, travel: 3.4 } as const;

/**
 * Névoa iluminada: o longe clareia (perspectiva aérea), não some no preto —
 * neutra, sem verde: o verde do mundo vem só do Core.
 */
const HAZE = [13, 14, 14] as const;
const ABYSS = [3, 4, 4] as const;
/** Luz ambiente (neutra) que vem da direita: forte numa lateral, quase nada na oposta. */
const keyLight = (nx: number) => {
  const a = 0.5 + 0.5 * nx;
  return a * a;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number, a: number, b: number) => {
  const x = clamp01((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};

type Rgb = readonly [number, number, number];
const rgb = (c: Rgb, a = 1) =>
  `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a.toFixed(3)})`;
const mix = (c: Rgb, d: Rgb, k: number): Rgb => [
  c[0] + (d[0] - c[0]) * k,
  c[1] + (d[1] - c[1]) * k,
  c[2] + (d[2] - c[2]) * k,
];

/** Coluna resolvida: retângulo no chão, topo (mundo), tom e camada. */
type Column = {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  top: number;
  tone: number;
  layer: "far" | "mid" | "fore";
  /** Ponto de luz fixo no topo (vira bokeh no desfoque). */
  lamp: boolean;
  /** Monólito: fica sempre no distante. */
  fixed: boolean;
  /** Tom da tampa (a da plataforma é escura: a grade do sistema mora nela). */
  lid: number;
  /** Quanto da lateral pega luz abaixo do topo (mundo). */
  band: number;
};

export function createEnvironment(deps: EnvironmentDeps) {
  const { env, ground, project, camera, sprite, canvases } = deps;
  const nearCtx = canvases.near.getContext("2d");
  const scratch = document.createElement("canvas");
  const scratchCtx = scratch.getContext("2d");
  // Contexto em uso (o mesmo desenho serve a todas as camadas).
  let g = nearCtx as CanvasRenderingContext2D;

  const view: EnvironmentView = {
    width: 1,
    height: 1,
    ox: 0,
    oy: 0,
    dpr: 1,
    lw: 1,
    quiet: [],
  };
  const top = new Float32Array(8);
  const bot = new Float32Array(8);
  const band = new Float32Array(8);
  const visible = [false, false, false, false];
  const faceLight = new Float32Array(4);
  const faceKey = new Float32Array(4);
  // Espessura do lábio (px CSS): nas camadas desfocadas ele engrossa para o
  // reflexo sobreviver ao desfoque como um brilho macio.
  let lipWidth = 1;
  // Sentido (no papel) de uma tampa vista de cima — acima da câmera, a tampa
  // não aparece (o monólito do mobile passa do horizonte).
  let upSign = 1;
  const area = (pts: Float32Array) => {
    let a = 0;
    for (let i = 0; i < 4; i++) {
      const e = (i + 1) % 4;
      a += pts[i * 2] * pts[e * 2 + 1] - pts[e * 2] * pts[i * 2 + 1];
    }
    return a;
  };

  const platform = blockColumn(env.platform, "mid");
  platform.top = ground;
  platform.lid = 0.15;

  // ── o terreno ─────────────────────────────────────────────────────────
  function blockColumn(b: EnvBlock, layer: Column["layer"]): Column {
    return {
      x0: b.at[0] - b.size[0] / 2,
      x1: b.at[0] + b.size[0] / 2,
      z0: b.at[1] - b.size[2] / 2,
      z1: b.at[1] + b.size[2] / 2,
      top: ground + (b.lift ?? 0) + b.size[1],
      tone: b.tone ?? 1,
      layer,
      lamp: false,
      fixed: layer === "far",
      lid: 1,
      // Monólito: a lateral acende na altura toda (o topo sai do quadro).
      band: layer === "far" ? b.size[1] * 0.8 : BAND,
    };
  }

  /**
   * Campo de colunas (determinístico) + monólitos, sem invadir a plataforma.
   * Pegadas variadas — uma baia, duas (plataformas longas) ou uma torre
   * estreita — para o campo não virar uma grade de cubos iguais.
   */
  function buildColumns(): Column[] {
    const out: Column[] = env.monoliths.map((b) => blockColumn(b, "far"));
    // A plataforma e os monólitos reservam o chão.
    const blocked = [platform, ...out];
    const f = env.field;
    const rng = mulberry32(f.seed);
    const m = f.margin;
    const P = f.pitch;
    const nx = Math.floor((f.x[1] - f.x[0]) / P);
    const nz = Math.floor((f.z[1] - f.z[0]) / P);
    const used = new Uint8Array(nx * nz);
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < nz; j++) {
        const [a, b, c, d, e, l, t] = [rng(), rng(), rng(), rng(), rng(), rng(), rng()];
        if (used[i * nz + j]) continue;
        used[i * nz + j] = 1;
        if (a < f.empty) continue;
        // Pegada: duas baias quando a vizinha está livre.
        let sx = 1;
        let sz = 1;
        if (b < f.merge) {
          if (c < 0.5 && i + 1 < nx && !used[(i + 1) * nz + j]) sx = 2;
          else if (j + 1 < nz && !used[i * nz + j + 1]) sz = 2;
          if (sx === 2) used[(i + 1) * nz + j] = 1;
          if (sz === 2) used[i * nz + j + 1] = 1;
        }
        const tower = sx === 1 && sz === 1 && t < f.towers;
        const fill = tower ? f.fill[0] * 0.75 : f.fill[0] + (f.fill[1] - f.fill[0]) * c;
        const gap = (P * (1 - fill)) / 2;
        const x0 = f.x[0] + i * P;
        const z0 = f.z[0] + j * P;
        const col = {
          x0: x0 + gap,
          x1: x0 + sx * P - gap,
          z0: z0 + gap * (0.6 + 0.8 * e),
          z1: z0 + sz * P - gap * (1.4 - 0.8 * e),
        };
        if (
          blocked.some(
            (r) => col.x1 > r.x0 - m && col.x0 < r.x1 + m && col.z1 > r.z0 - m && col.z0 < r.z1 + m,
          )
        )
          continue;
        // Mais alto quanto mais longe do sistema; perto da câmera, abaixo da
        // plataforma (nunca tampa o sistema nem a copy de baixo).
        const cx = (col.x0 + col.x1) / 2;
        const cz = (col.z0 + col.z1) / 2;
        const dist = Math.hypot(cx, cz);
        let h = f.base + Math.min(f.rise[1], dist * f.rise[0]) * d + (e - 0.5) * f.jitter;
        if (tower) h += f.towerRise * (0.6 + 0.4 * d);
        if (cz > f.near[0]) h = Math.min(h, f.near[1]);
        out.push({
          ...col,
          top: ground + h,
          tone: 1,
          layer: "mid",
          lamp: l < f.lamps,
          fixed: false,
          lid: 1,
          band: tower ? BAND * 2.5 : BAND,
        });
      }
    }
    return out;
  }

  const columns = buildColumns();

  /** Névoa: 0 perto, 1 no fundo do mundo. */
  const fog = (depth: number) => smooth(depth, env.fog[0], env.fog[1]);

  /** Luz do Core numa face: virada para ele + distância + onda do disparo. */
  function spill(f: EnvironmentFrame, px: number, py: number, pz: number, nx: number, nz: number) {
    const vx = f.light[0] - px;
    const vy = f.light[1] - py;
    const vz = f.light[2] - pz;
    const dist = Math.hypot(vx, vy, vz) || 1;
    const facing = Math.max(0, (vx * nx + vz * nz) / dist);
    // Queda rápida: perto do Core a luz é forte, alguns blocos adiante já é
    // o escuro — a luz pertence ao Core, não ao ambiente.
    const q = dist / env.reach;
    const q2 = 1 + q * q;
    const r = 1.2 + 6 * f.sinceEmit;
    const wave = Math.exp(-((dist - r) * (dist - r)) / 3.2) * Math.exp(-f.sinceEmit / 1.9);
    return facing * ((1.3 * f.glow) / (q2 * Math.sqrt(q2)) + 0.9 * wave);
  }

  /** Lateral: grafite neutro (clara do lado da luz ambiente) + verde só do Core. */
  const sideColor = (nx: number, s: number, tone: number): Rgb => {
    const a = keyLight(nx) * tone;
    return [5 + 40 * a + 12 * s, 6 + 42 * a + 78 * s, 6 + 41 * a + 46 * s];
  };
  /** Tampa: escura (o nível se lê pelo lábio, não pela face). */
  const topColor = (s: number, tone: number): Rgb => [
    7 + 15 * tone + 10 * s,
    8 + 16 * tone + 56 * s,
    8 + 16 * tone + 34 * s,
  ];
  /** Lábio: reflexo neutro estreito; vira verde onde a luz do Core bate. */
  const lipColor = (s: number) => {
    const w = clamp01(s * 1.6);
    return [215 - 75 * w, 228 + 27 * w, 222 - 22 * w] as const;
  };

  function quad(a: Float32Array, b: Float32Array, c: number) {
    const e = (c + 1) % 4;
    g.beginPath();
    g.moveTo(a[c * 2], a[c * 2 + 1]);
    g.lineTo(a[e * 2], a[e * 2 + 1]);
    g.lineTo(b[e * 2], b[e * 2 + 1]);
    g.lineTo(b[c * 2], b[c * 2 + 1]);
    g.closePath();
  }

  /** Projeta topo, faixa iluminada e base; devolve a profundidade do topo. */
  function corners(c: Column) {
    const cx = (c.x0 + c.x1) / 2;
    const cz = (c.z0 + c.z1) / 2;
    const hw = (c.x1 - c.x0) / 2;
    const hd = (c.z1 - c.z0) / 2;
    let sum = 0;
    for (let i = 0; i < 4; i++) {
      const x = cx + SIDES[i][0] * hw;
      const z = cz + SIDES[i][1] * hd;
      let p = project(x, c.top, z);
      top[i * 2] = p.x;
      top[i * 2 + 1] = p.y;
      sum += p.depth;
      p = project(x, c.top - c.band, z);
      band[i * 2] = p.x;
      band[i * 2 + 1] = p.y;
      p = project(x, c.top - COLUMN, z);
      bot[i * 2] = p.x;
      bot[i * 2 + 1] = p.y;
    }
    for (let i = 0; i < 4; i++) {
      const e = (i + 1) % 4;
      visible[i] =
        (top[i * 2] - bot[i * 2]) * (top[e * 2 + 1] - bot[i * 2 + 1]) -
          (top[e * 2] - bot[i * 2]) * (top[i * 2 + 1] - bot[i * 2 + 1]) <
        0;
    }
    return sum / 4;
  }

  /** A parte acesa da coluna (topo + faixa) passa atrás da copy ou da legenda? */
  function inQuiet() {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (let i = 0; i < 8; i += 2) {
      x0 = Math.min(x0, top[i], band[i]);
      x1 = Math.max(x1, top[i], band[i]);
      y0 = Math.min(y0, top[i + 1], band[i + 1]);
      y1 = Math.max(y1, top[i + 1], band[i + 1]);
    }
    const { ox, oy } = view;
    return view.quiet.some(
      (q) => x1 + ox > q[0] && x0 + ox < q[2] && y1 + oy > q[1] && y0 + oy < q[3],
    );
  }

  /**
   * Uma coluna: as laterais visíveis acendem numa faixa curta logo abaixo do
   * topo e caem no escuro; o topo é a face mais clara; os lábios (arestas de
   * cima voltadas para a câmera) desenham o nível. `f` traz a luz do Core
   * (só a plataforma, por quadro); sem ele, a coluna é estática.
   */
  function drawColumn(c: Column, f: EnvironmentFrame, sharp: number) {
    const depth = corners(c);
    if (depth < 5) return true;
    const k = fog(depth);
    // Atrás do texto: a forma fica (tom um pouco mais baixo), o risco some.
    const quiet = c !== platform && inQuiet();
    const tone = c.tone * (quiet ? 0.72 : 1);
    const cx = (c.x0 + c.x1) / 2;
    const cz = (c.z0 + c.z1) / 2;
    let lit = 0;
    for (let i = 0; i < 4; i++) {
      if (!visible[i]) continue;
      const e = (i + 1) % 4;
      const [nx, nz] = NORMALS[i];
      const s = spill(
        f,
        cx + (nx * (c.x1 - c.x0)) / 2,
        c.top,
        cz + (nz * (c.z1 - c.z0)) / 2,
        nx,
        nz,
      );
      lit = Math.max(lit, s);
      // Luz da face (ambiente + Core): decide o reflexo do lábio.
      faceLight[i] = s;
      faceKey[i] = keyLight(nx);
      const y0 = Math.min(top[i * 2 + 1], top[e * 2 + 1]);
      const y1 = Math.max(band[i * 2 + 1], band[e * 2 + 1]);
      const side = sideColor(nx, s, tone);
      // Reflexo estreito logo abaixo do topo (material denso), queda rápida
      // para o preto: a base da coluna é escura de verdade.
      const sheen = (0.6 * faceKey[i] + 1.4 * Math.min(1, s)) * tone;
      const gr = g.createLinearGradient(0, y0, 0, Math.max(y0 + 1, y1));
      gr.addColorStop(0, rgb(mix(mix(side, [150, 175, 165], 0.26 * sheen), HAZE, k)));
      gr.addColorStop(0.1, rgb(mix(side, HAZE, k)));
      gr.addColorStop(0.5, rgb(mix(mix(side, ABYSS, 0.72), HAZE, k)));
      gr.addColorStop(1, rgb(mix(ABYSS, HAZE, k)));
      g.fillStyle = gr;
      quad(top, bot, i);
      g.fill();
    }
    if (Math.sign(area(top)) === upSign) {
      g.beginPath();
      g.moveTo(top[0], top[1]);
      for (let i = 1; i < 4; i++) g.lineTo(top[i * 2], top[i * 2 + 1]);
      g.closePath();
      g.fillStyle = rgb(mix(topColor(lit * 0.4, tone * c.lid), HAZE, k));
      g.fill();
    }
    // Lábios: arestas de cima das laterais visíveis — e a quina entre duas
    // delas, acesa logo abaixo do topo. Reflexo seletivo: forte na lateral
    // que pega a luz ambiente ou a do Core, quase nada na oposta.
    const base = sharp * (quiet ? 0.22 : 1) * tone * (1 - k);
    const boost = tone * (1 - k);
    g.lineWidth = lipWidth;
    for (let i = 0; i < 4; i++) {
      if (!visible[i]) continue;
      const e = (i + 1) % 4;
      const s = faceLight[i];
      const a = Math.min(1, base * (0.08 + 1.2 * faceKey[i]) + 0.75 * s * boost);
      if (a <= 0.01) continue;
      const [r, gg, b] = lipColor(s);
      g.strokeStyle = `rgba(${Math.round(r)},${Math.round(gg)},${Math.round(b)},${a.toFixed(3)})`;
      g.beginPath();
      g.moveTo(top[i * 2], top[i * 2 + 1]);
      g.lineTo(top[e * 2], top[e * 2 + 1]);
      g.stroke();
      // Quina com a lateral seguinte: o reflexo desce um pouco pela aresta.
      if (!visible[e]) continue;
      const rim = g.createLinearGradient(0, top[e * 2 + 1], 0, band[e * 2 + 1]);
      rim.addColorStop(
        0,
        `rgba(${Math.round(r)},${Math.round(gg)},${Math.round(b)},${a.toFixed(3)})`,
      );
      rim.addColorStop(1, `rgba(${Math.round(r)},${Math.round(gg)},${Math.round(b)},0)`);
      g.strokeStyle = rim;
      g.beginPath();
      g.moveTo(top[e * 2], top[e * 2 + 1]);
      g.lineTo(band[e * 2], band[e * 2 + 1]);
      g.stroke();
    }
    return quiet;
  }

  /** Luz pontual pousada no mundo (y absoluto). */
  function point(x: number, y: number, z: number, size: number, alpha: number) {
    if (alpha <= 0.01) return;
    const p = project(x, y, z);
    const k = 1 - 0.6 * fog(p.depth);
    const s = size * k;
    g.globalAlpha = Math.min(1, alpha * k);
    g.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
    g.globalAlpha = 1;
  }

  // Caminho secundário: comprimento total, para o sinal andar por arco.
  const trace = env.trace.points;
  let traceLen = 0;
  for (let i = 1; i < trace.length; i++)
    traceLen += Math.hypot(trace[i][0] - trace[i - 1][0], trace[i][1] - trace[i - 1][1]);
  const along: [number, number] = [0, 0];
  function alongTrace(u: number) {
    let left = clamp01(u) * traceLen;
    for (let i = 1; i < trace.length; i++) {
      const seg = Math.hypot(trace[i][0] - trace[i - 1][0], trace[i][1] - trace[i - 1][1]);
      if (left <= seg || i === trace.length - 1) {
        const k = seg ? Math.min(1, left / seg) : 0;
        along[0] = trace[i - 1][0] + (trace[i][0] - trace[i - 1][0]) * k;
        along[1] = trace[i - 1][1] + (trace[i][1] - trace[i - 1][1]) * k;
        return along;
      }
      left -= seg;
    }
    return along;
  }

  // ── camadas pré-renderizadas ──────────────────────────────────────────
  // Luz de repouso do Core, gravada nas camadas estáticas (a onda de cada
  // disparo só corre pela plataforma, que é redesenhada).
  const REST: EnvironmentFrame = {
    t: 0,
    animate: false,
    glow: 1.4,
    light: [0, ground + 2.95, 0],
    sinceEmit: 99,
    quiet: true,
    vis: 1,
  };

  type Layer = {
    key: "far" | "mid" | "fore";
    canvas: HTMLCanvasElement;
    ref: [number, number, number];
    refX: number;
    refY: number;
    shift: string;
  };
  const layers: Layer[] = (["far", "mid", "fore"] as const).map((key) => ({
    key,
    canvas: canvases[key],
    ref: [0, ground, 0],
    refX: 0,
    refY: 0,
    shift: "",
  }));

  /** Classifica as colunas (distante / médio / frente) na câmera de repouso. */
  function classify() {
    for (const c of columns) {
      if (c.fixed) continue;
      const d = project((c.x0 + c.x1) / 2, c.top, (c.z0 + c.z1) / 2).depth;
      // Na frente da plataforma (entre ela e a câmera): separada dela pelo
      // lado +x ou +z, e não por trás.
      const front =
        (c.x0 >= platform.x1 || c.z0 >= platform.z1) &&
        !(c.x1 <= platform.x0 || c.z1 <= platform.z0);
      c.layer = front ? "fore" : d > FAR_SPLIT ? "far" : "mid";
    }
    // Do mais distante para o mais próximo.
    const depthOf = (c: Column) => project((c.x0 + c.x1) / 2, c.top, (c.z0 + c.z1) / 2).depth;
    columns.sort((a, b) => depthOf(b) - depthOf(a));
    // Referência de cada camada (o centro das suas colunas) para o deslocamento.
    for (const layer of layers) {
      const own = columns.filter((c) => c.layer === layer.key);
      const n = own.length || 1;
      layer.ref[0] = own.reduce((s, c) => s + (c.x0 + c.x1) / 2, 0) / n;
      layer.ref[2] = own.reduce((s, c) => s + (c.z0 + c.z1) / 2, 0) / n;
    }
  }

  /** Desenha uma camada estática (câmera de repouso), com desfoque se pedido. */
  function renderLayer(layer: Layer) {
    const cfg = LAYER[layer.key];
    const ctx = layer.canvas.getContext("2d");
    if (!ctx || !scratchCtx) return;
    const { width, height, ox, oy } = view;
    const s = cfg.scale || view.dpr;
    const w = Math.round((width + 2 * BLEED) * s);
    const h = Math.round((height + 2 * BLEED) * s);
    layer.canvas.width = w;
    layer.canvas.height = h;
    if (cfg.blur) {
      scratch.width = w;
      scratch.height = h;
    }
    Object.assign(layer.canvas.style, {
      left: `${-BLEED}px`,
      top: `${-BLEED}px`,
      width: `${width + 2 * BLEED}px`,
      height: `${height + 2 * BLEED}px`,
    });
    g = cfg.blur ? scratchCtx : ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, w, h);
    g.setTransform(s, 0, 0, s, (BLEED + ox) * s, (BLEED + oy) * s);

    if (layer.key === "far") {
      // Atmosfera (coordenadas da seção): o alto escurece (vinheta), a faixa
      // onde o mundo se afasta ganha névoa, o perto volta ao preto da página.
      const [h0, h1, h2] = env.haze;
      const air = g.createLinearGradient(0, -oy - BLEED, 0, height - oy + BLEED);
      air.addColorStop(0, "rgb(4,5,5)");
      air.addColorStop(h0, "rgb(6,7,7)");
      air.addColorStop(h1, "rgb(13,14,14)");
      air.addColorStop(h2, "rgb(8,9,9)");
      air.addColorStop(1, "rgb(10,10,10)");
      g.fillStyle = air;
      g.fillRect(-ox - BLEED, -oy - BLEED, width + 2 * BLEED, height + 2 * BLEED);
    }

    lipWidth = cfg.blur ? 3.2 : 1;
    const lamps: Column[] = [];
    for (const c of columns) {
      if (c.layer !== layer.key) continue;
      const quiet = drawColumn(c, REST, layer.key === "far" ? 0.75 : 0.8);
      if (c.lamp && !quiet) lamps.push(c);
    }
    // Pontos de luz fixos no topo das colunas (no desfoque, viram bokeh).
    g.globalCompositeOperation = "lighter";
    for (const c of lamps)
      point(c.x0 + 0.5, c.top, c.z1 - 0.01, 20 * view.lw, layer.key === "mid" ? 0.6 : 0.85);
    g.globalCompositeOperation = "source-over";

    const ref = project(layer.ref[0], layer.ref[1], layer.ref[2]);
    layer.refX = ref.x;
    layer.refY = ref.y;
    layer.shift = "";
    if (cfg.blur) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if ("filter" in ctx) ctx.filter = `blur(${cfg.blur}px)`;
      ctx.drawImage(scratch, 0, 0);
      if ("filter" in ctx) ctx.filter = "none";
    }
  }

  function resize(next: EnvironmentView) {
    Object.assign(view, next);
    if (nearCtx) {
      canvases.near.width = Math.round(view.width * view.dpr);
      canvases.near.height = Math.round(view.height * view.dpr);
    }
    camera(0);
    corners(platform);
    upSign = Math.sign(area(top)) || 1;
    classify();
    for (const layer of layers) renderLayer(layer);
    camera(1);
    g = nearCtx as CanvasRenderingContext2D;
    lipWidth = 1;
  }

  // Próxima janela do sinal e início do último (NaN = nunca correu).
  let signalAt: number = SIGNAL.first;
  let signalStart = NaN;
  let opacity = "";

  function draw(f: EnvironmentFrame) {
    if (!nearCtx) return;
    g = nearCtx;
    const { width, height, ox, oy, dpr, lw } = view;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, width, height);
    const o = f.vis >= 1 ? "" : f.vis.toFixed(2);
    if (o !== opacity) {
      for (const layer of layers) layer.canvas.style.opacity = o;
      opacity = o;
    }
    if (f.vis <= 0.01) return;

    // ── Camadas estáticas: só deslizam ──
    for (const layer of layers) {
      camera(LAYER[layer.key].camera);
      const p = project(layer.ref[0], layer.ref[1], layer.ref[2]);
      const shift = `translate3d(${(p.x - layer.refX).toFixed(1)}px,${(p.y - layer.refY).toFixed(1)}px,0)`;
      if (shift !== layer.shift) {
        layer.canvas.style.transform = shift;
        layer.shift = shift;
      }
    }

    // ── Plataforma do sistema (câmera real, luz do Core) ──
    camera(1);
    g.setTransform(dpr, 0, 0, dpr, ox * dpr, oy * dpr);
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = f.vis;
    drawColumn(platform, f, 0.34);
    g.globalAlpha = 1;

    // Caminho do sinal: um traço fino no fundo do canal.
    const ty = ground + env.trace.y;
    g.lineWidth = 1;
    for (let i = 1; i < trace.length; i++) {
      const [x0, z0] = trace[i - 1];
      const [x1, z1] = trace[i];
      const p = project(x0, ty, z0);
      const ax = p.x;
      const ay = p.y;
      const q = project(x1, ty, z1);
      g.strokeStyle = `rgba(110,225,170,${(0.12 * (1 - fog(q.depth)) * f.vis).toFixed(3)})`;
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(q.x, q.y);
      g.stroke();
    }

    // ── Atividade ambiente (luz aditiva) ──
    g.globalCompositeOperation = "lighter";
    const { t } = f;
    // Só sai com o sistema livre — nunca disputa com um evento de energia.
    if (trace.length > 1 && f.animate && f.quiet && t >= signalAt) {
      signalStart = t;
      signalAt = t + SIGNAL.every;
    }
    const sp = f.animate ? (t - signalStart) / SIGNAL.travel : NaN;
    if (sp >= 0 && sp <= 1) {
      const fade = Math.sin(Math.PI * Math.min(1, sp * 1.1));
      let a = alongTrace(sp);
      point(a[0], ty, a[1], 16 * lw, 0.55 * fade);
      a = alongTrace(sp - 0.05);
      point(a[0], ty, a[1], 10 * lw, 0.25 * fade);
    }
    // O fim do caminho recebe o sinal: um pulso lento quando ele chega.
    const landed = sp * SIGNAL.travel - SIGNAL.travel;
    const kick = landed >= 0 ? Math.exp(-landed / 1.1) : 0;
    for (const l of env.lights) {
      const breath = f.animate
        ? 0.5 + 0.5 * Math.sin((Math.PI * 2 * t) / l.period + (l.phase ?? 0))
        : 0.6;
      const k = l.beacon ? kick : 0;
      point(
        l.at[0],
        ground + l.at[1],
        l.at[2],
        (l.size + 22 * k) * lw,
        (l.alpha * (0.35 + 0.65 * breath) + 0.6 * k) * f.vis,
      );
    }
    g.globalCompositeOperation = "source-over";
  }

  return { resize, draw };
}
