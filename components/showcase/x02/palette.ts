/**
 * COMPOSITION + COLOR PASS 002 — três famílias cromáticas controladas
 * testadas diretamente no código (briefing, "Color Direction"), comparadas
 * em THRESHOLD OPEN / DESCENT MID / CHAMBER MID antes de qualquer escolha
 * final. Nenhuma delas é a paleta preto+bege/marrom anterior (não estava
 * congelada — o QA humano rejeitou explicitamente sua sofisticação).
 *
 * VISUAL CONTINUITY FIX 003 — escopo ampliado: agora é a fonte cromática de
 * TODO o X02 (briefing, "Source of Truth" — "ACTIVE_PALETTE/palette.ts deve
 * se tornar a fonte cromática do X02"), THRESHOLD→CORE, exceto o PICO de
 * CORE (t=0.81/0.88 em atmosphere-rig.tsx) e o próprio VOID — preservados
 * deliberadamente fora daqui (ver comentários nesses pontos). Auditoria
 * desta sprint encontrou a identidade preto+marrom antiga sobrevivendo em
 * `fracture-fragments.tsx` (setHSL hue 0.07), `interior.tsx` (hue 0.09) e
 * `structure.tsx` (`color`/`emissive` hardcoded, nunca ligados a esta
 * paleta) — os quatro agora leem `ACTIVE_PALETTE`.
 */
export type Palette = {
  /** Background — o "black level" do briefing: nunca #000000 puro. Vazio profundo. */
  background: string;
  /** LIGHT FOUNDATION 001 — fog deixou de copiar `background` 1:1 (fog e
   *  background eram o MESMO valor, sempre — objetos distantes "acabavam"
   *  no vazio em vez de recuar para uma atmosfera). Levemente mais claro e
   *  mais frio que `background`, calibrado dentro desta família (nunca um
   *  hue novo): a névoa precisa ler como ar entre a câmera e a massa, não
   *  como o fim do mundo. */
  fogColor: string;
  /** Tom principal da arquitetura (FRAME, WALL, COLUMN). */
  stone: string;
  /** Tom secundário/sombra da arquitetura (frestas, bordas, massas distantes). */
  stoneDark: string;
  /** VISUAL CONTINUITY FIX 003 — tom mais claro que `stone`, para acentos/rim
   *  que precisam se destacar de uma superfície já clara (ex.: aresta de
   *  FRACTURE, capitel). */
  stoneHighlight: string;
  /** Piso. */
  floor: string;
  /** Matiz/saturação da variação por instância das colunas (lightness continua por-instância). */
  columnHue: number;
  columnSat: number;
  /** Emissive workaround (ver chamber.tsx) — cor calibrada à família. */
  emissive: string;
  /** VISUAL CONTINUITY FIX 003 — par metal (substitui o âmbar/bronze antigo
   *  de structure.tsx: era a última cor hardcoded fora da família Graphite/
   *  Cold Stone). */
  metalDark: string;
  metalHighlight: string;
  /** VISUAL CONTINUITY FIX 003 — FRACTURE precisa ler como "mesma matéria"
   *  da arquitetura anterior (briefing): faixa de lightness só, mesmo
   *  hue/sat de `columnHue`/`columnSat` — não um hue novo. */
  fractureLightMin: number;
  fractureLightMax: number;
  /** VISUAL CONTINUITY FIX 003 — CORE/interior: mesma lógica de FRACTURE. */
  coreLightMin: number;
  coreLightMax: number;
  /** MATERIAL WORLD V3 INTEGRATION 001 — faixa de lightness por instância da
   *  COLUMN ROW de CHAMBER (mesmo hue/sat de `columnHue`/`columnSat`),
   *  promovida do valor fixo `0.5 + tone*0.2` hardcoded em chamber.tsx. */
  chamberLightMin: number;
  chamberLightMax: number;
  /** Piso do CORE/interior — precisa se separar do vazio sem virar a mesma
   *  cor do `floor` de CHAMBER (ambientes narrativamente distintos). */
  coreDepth: string;
  atmosphere: {
    entry: { ambient: string; key: string; fill: string; zenith: string };
    descent: { ambient: string; key: string; fill: string; zenith: string };
    chamber: { ambient: string; key: string; fill: string; zenith: string };
    /** VISUAL CONTINUITY FIX 003 — cobre t=0.45 e t=0.5 (aligned) de
     *  atmosphere-rig.tsx: ambient/fill eram claramente bege/marrom
     *  (#948d80/#38332a…) — resolvido para a família fria. */
    fracture: { ambient: string; key: string; fill: string; zenith: string };
    /** VISUAL CONTINUITY FIX 003 — cobre t=0.7 (CORE exterior/approach) e
     *  t=1.0 (RESOLUTION). O PICO de CORE (t=0.81/0.88) é uma exceção
     *  deliberada, preservada fora deste token — ver atmosphere-rig.tsx. */
    core: { ambient: string; key: string; fill: string; zenith: string };
  };
};

/**
 * OPTION A — GRAPHITE / BONE. Museum/mineral/editorial. Quase sem accent.
 */
const graphiteBone: Palette = {
  background: "#0c0d0f",
  fogColor: "#141619",
  stone: "#6b6a63",
  stoneDark: "#403f3a",
  stoneHighlight: "#9a988e",
  floor: "#232420",
  columnHue: 0.11,
  columnSat: 0.05,
  emissive: "#77746a",
  metalDark: "#2c2d2c",
  metalHighlight: "#a3a59d",
  fractureLightMin: 0.42,
  fractureLightMax: 0.64,
  coreLightMin: 0.4,
  coreLightMax: 0.6,
  chamberLightMin: 0.5,
  chamberLightMax: 0.7,
  coreDepth: "#1b1c19",
  atmosphere: {
    entry: { ambient: "#8f8d86", key: "#f2f1ec", fill: "#3a3a38", zenith: "#d8d6ce" },
    descent: { ambient: "#a6a49a", key: "#eeece4", fill: "#46453f", zenith: "#cdcabf" },
    chamber: { ambient: "#b4b1a5", key: "#f4f1e6", fill: "#4c4a41", zenith: "#d4d0c1" },
    fracture: { ambient: "#9c9a91", key: "#e8e5dc", fill: "#38372f", zenith: "#c6c3b6" },
    core: { ambient: "#93918a", key: "#e0ded4", fill: "#302f2b", zenith: "#c0bdb1" },
  },
};

/**
 * OPTION B — GRAPHITE / COLD STONE. Cinematic/monumentalcontemporary, menos "marrom".
 */
const graphiteColdStone: Palette = {
  background: "#0a0c10",
  // LIGHT FOUNDATION 001 — derivado de `background` (HSL 220°/0.231/0.051):
  // +0.035 de lightness, hue puxado ~18% em direção ao azul do zenith
  // (atmosphere.entry.zenith, #cdd4d6, hue 193°) em vez de um hue novo,
  // saturação levemente reduzida (0.231 -> ~0.19) para não competir com o
  // stone neutro. "Mais claro e mais frio", medido, não estimado.
  fogColor: "#12151a",
  stone: "#63665f",
  stoneDark: "#34383d",
  stoneHighlight: "#8f9490",
  floor: "#1c2023",
  columnHue: 0.5,
  columnSat: 0.04,
  emissive: "#697066",
  metalDark: "#282b2e",
  metalHighlight: "#9aa3a6",
  fractureLightMin: 0.42,
  fractureLightMax: 0.64,
  coreLightMin: 0.4,
  coreLightMax: 0.6,
  chamberLightMin: 0.5,
  chamberLightMax: 0.7,
  coreDepth: "#181c1f",
  atmosphere: {
    entry: { ambient: "#868d90", key: "#eef3f6", fill: "#2f363b", zenith: "#cdd4d6" },
    descent: { ambient: "#9aa1a3", key: "#e8eef2", fill: "#3a4247", zenith: "#c3cbcd" },
    chamber: { ambient: "#a9aeae", key: "#eef1ee", fill: "#404846", zenith: "#c9cec8" },
    fracture: { ambient: "#959c9e", key: "#e2e8ea", fill: "#333a3d", zenith: "#bcc3c4" },
    core: { ambient: "#8c9294", key: "#dbe1e2", fill: "#2c3234", zenith: "#b6bcbc" },
  },
};

/**
 * OPTION C — DEEP UMBER / MINERAL. Geological/earth/premium — undertone
 * quente controlado, mais próximo do território anterior mas dessaturado
 * e sem ler como "marrom barro".
 */
const deepUmberMineral: Palette = {
  background: "#0e0b09",
  fogColor: "#181811",
  stone: "#6c6154",
  stoneDark: "#3c332a",
  stoneHighlight: "#9c8f78",
  floor: "#211a14",
  columnHue: 0.08,
  columnSat: 0.12,
  emissive: "#7a6b58",
  metalDark: "#302a22",
  metalHighlight: "#a89b80",
  fractureLightMin: 0.42,
  fractureLightMax: 0.64,
  coreLightMin: 0.4,
  coreLightMax: 0.6,
  chamberLightMin: 0.5,
  chamberLightMax: 0.7,
  coreDepth: "#1e1712",
  atmosphere: {
    entry: { ambient: "#948a7a", key: "#f2ecdd", fill: "#3d352a", zenith: "#dccdad" },
    descent: { ambient: "#a89c88", key: "#eee5d2", fill: "#493e2f", zenith: "#d2c0a0" },
    chamber: { ambient: "#b3a58e", key: "#f4ead6", fill: "#4f4232", zenith: "#d8c6a3" },
    fracture: { ambient: "#a2977f", key: "#e9e0cd", fill: "#3e352a", zenith: "#cbbb9c" },
    core: { ambient: "#988d76", key: "#e2d8c3", fill: "#362e24", zenith: "#c3b294" },
  },
};

export const PALETTES = { graphiteBone, graphiteColdStone, deepUmberMineral };

/**
 * ESCOLHA: OPTION B — GRAPHITE / COLD STONE (ver relatório, "Opções
 * cromáticas testadas" / "Paleta escolhida"). Vence em separação espacial
 * (o undertone frio no background contrasta mais claramente com o stone
 * neutro do que as outras duas, que liam mais "todo-um-tom-só" nas
 * capturas comparativas) e é a que menos se aproxima do "marrom barro"
 * explicitamente rejeitado pelo QA humano.
 */
export const ACTIVE_PALETTE: Palette = PALETTES.graphiteColdStone;
