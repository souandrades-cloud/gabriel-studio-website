"use client";

import { Canvas, extend, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

// R3F v9 omite `line`/`path`/`audio`/`source` do catálogo automático (colidem
// com tags SVG/HTML) e expõe os tipos como `threeLine` etc., mas ainda exige
// registrar o construtor manualmente para o runtime resolver a tag.
extend({ ThreeLine: THREE.Line });

/**
 * MODULAR DIGITAL ENGINE — geometria da Sprint 3H, encenação da Sprint 3I.
 *
 * A peça em si (núcleo em camadas, módulos com frames vazados, slots e
 * recessos, espessura chanfrada, conexões estruturais + energéticas) foi
 * aprovada na 3H e NÃO foi redesenhada. O que a 3I mudou é cinematografia:
 *
 *  · três planos de profundidade reais (fore/mid/back) em vez de um único
 *    plano raso — ver MODULES e DOCK_DISTANCE/EXIT_SPREAD;
 *  · câmera mais alta, mais próxima e fora do eixo, com o foreground cortado
 *    pela borda do quadro — ver CAMERA;
 *  · cursor movendo a CÂMERA (parallax correto por profundidade) em vez de
 *    girar o objeto — ver CameraRig;
 *  · montagem por encaixe (translação + rotação de acoplamento), não por
 *    scale 0→1, com três microeventos mecânicos;
 *  · saída no scroll em cascata: foreground primeiro, núcleo por último.
 *
 * Princípio de validação herdado da 3H: com NEUTRAL_TEST ligado o objeto
 * renderiza sem verde. Se continuar interessante só com geometria e luz, a
 * silhueta funciona; se depender do verde, a geometria ainda está fraca.
 *
 * HERO FINAL REFINEMENT (Gate "A+B Assembly + Signal", promovida à Home após
 * discovery isolado em `/lab/hero-refinement`) — geometria, materiais,
 * câmera, iluminação e saída no scroll continuam os da 3H–3J, intocados. O
 * que mudou é só a ENCENAÇÃO TEMPORAL da montagem e da energia, para a peça
 * contar um arco em vez de assentar numa pose estática logo na entrada:
 *
 *   FRAGMENTAÇÃO → APROXIMAÇÃO  módulos partem de mais longe (DOCK_DISTANCE
 *     maior) e com mais atraso relativo entre si, com um easing mais "pesado"
 *     (easeOutQuart) do que o resto da peça — a leitura passa de "tudo
 *     encaixa de uma vez" para "peças convergindo com pesos diferentes".
 *   ENCAIXE  ao final da montagem, um beat estrutural único e discreto
 *     (T_COMPLETE_BEAT) marca "sistema completo": pulso central, resposta de
 *     rim light e uma intensificação breve das linhas de conexão — ainda sem
 *     tráfego de dados.
 *   ATIVAÇÃO → CONEXÃO → SISTEMA VIVO  depois de uma pausa curta e legível
 *     (T_ACTIVATE), o núcleo liga e a peça entra num batimento periódico de
 *     energia (core→módulos) seguido por relays module→module em cadeia,
 *     repetidos indefinidamente como estado de repouso — em vez do surge
 *     único seguido de loop assíncrono quase imperceptível de antes.
 */

/** Teste B&W temporário — ver §20 do relatório da Sprint 3H. Nunca `true` no entregue. */
const NEUTRAL_TEST = false;

const ENERGY_COLOR = NEUTRAL_TEST ? "#b3bcb7" : "#22b573";
const RIM_COLOR = NEUTRAL_TEST ? "#8d9691" : "#22b573";
const RIM_BASE_INTENSITY = NEUTRAL_TEST ? 0.55 : 0.8;
const CORE_LIGHT_BASE_INTENSITY = NEUTRAL_TEST ? 0 : 0.34;

// ---------------------------------------------------------------------------
// Geometria — helpers
// ---------------------------------------------------------------------------

function rectShape(w: number, h: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -h / 2);
  s.lineTo(w / 2, -h / 2);
  s.lineTo(w / 2, h / 2);
  s.lineTo(-w / 2, h / 2);
  s.closePath();
  return s;
}

function rectHole(w: number, h: number, cx = 0, cy = 0) {
  const p = new THREE.Path();
  p.moveTo(cx - w / 2, cy - h / 2);
  p.lineTo(cx + w / 2, cy - h / 2);
  p.lineTo(cx + w / 2, cy + h / 2);
  p.lineTo(cx - w / 2, cy + h / 2);
  p.closePath();
  return p;
}

/**
 * Extrusão com chanfro — é o chanfro que dá materialidade: cria uma aresta
 * estreita que captura a key light e separa frente de lateral. Sem ele, um
 * box escuro contra fundo preto vira silhueta chapada (o problema da 3G).
 * `bevelSegments: 1` mantém a contagem de polígonos baixa.
 */
function extrudePlate(shape: THREE.Shape, depth: number, bevel = 0.015) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 1,
  });
  geo.center();
  return geo;
}

// ---------------------------------------------------------------------------
// Layout — o desenho da máquina
// ---------------------------------------------------------------------------

type Tier = "primary" | "secondary";
/** Plano de profundidade — é o que cria foreground/midground/background perceptíveis (§4). */
type Depth = "fore" | "mid" | "back";

type ModuleDef = {
  id: string;
  /** Qual geometria do catálogo compartilhado este módulo usa. */
  geo: "deck" | "gate" | "block" | "veil" | "fin" | "wedge";
  material: "graphiteDeep" | "graphite" | "metal" | "veil";
  position: [number, number, number];
  rotation: [number, number, number];
  tier: Tier;
  depth: Depth;
  /** Painel recuado na face frontal — lê como recesso usinado. */
  recess?: { w: number; h: number; z: number };
  /** Respiração estrutural em repouso: amplitude, velocidade, fase. */
  breathe: [number, number, number];
  /** Atraso na sequência de montagem, em segundos. */
  delay: number;
};

/**
 * Escala global da peça (§4 da 3J). Testada em 1.00 / 1.05 / 1.10 com
 * screenshot real — ver a seção "Escala" do relatório. Não é um valor
 * arbitrário: acima de 1.05 o gate começa a ser cortado pelo topo e o deck
 * invade a legenda técnica.
 */
const CORE_SCALE = 1.05;

/**
 * Distância de onde cada plano "chega" durante a montagem. Aumentada no
 * Hero Final Refinement (era 2.4/1.5/1.1): os módulos agora nascem
 * visivelmente fora do enquadramento do núcleo, não a meio caminho — é o que
 * dá à Fase 1 (Fragmentação) tempo de ser lida antes da convergência.
 */
const DOCK_DISTANCE: Record<Depth, number> = { fore: 3.3, mid: 2.2, back: 1.7 };
/** Quanto cada plano se afasta ao sair da Hero — o foreground se separa primeiro e mais (§14). */
const EXIT_SPREAD: Record<Depth, number> = { fore: 2.2, mid: 1.05, back: 1.5 };

/**
 * Sprint 3I — a geometria da 3H é preservada; o que mudou foi a ENCENAÇÃO.
 * Os módulos foram redistribuídos em três planos de profundidade reais para a
 * cena ter foreground/midground/background perceptíveis mesmo congelada:
 *
 *   FORE (z ≈ +1.5)  fin e wedge, perto da câmera, deliberadamente cortados
 *                    pela borda do viewport — é o corte que dá escala.
 *   MID  (z ≈ 0)     núcleo, deck e block: a leitura principal.
 *   BACK (z ≈ -2)    gate, veil e shard, menores e mais escuros, abrindo o
 *                    fundo e deixando as conexões atravessarem a profundidade.
 *
 * A assimetria da 3H foi mantida: massa à direita e abaixo, block como
 * contrapeso em cima à esquerda, nada equidistante do núcleo.
 *
 * `delay` de cada módulo foi quase dobrado no Hero Final Refinement (o
 * espalhamento original — 0 a 0.38s — era rápido demais para ler como
 * chegada escalonada; ver MODULE_DURATION/T_PRIMARY/T_SECONDARY abaixo).
 */
const MODULES: ModuleDef[] = [
  {
    // A maior placa da peça vive no FOREGROUND e é cortada pela borda inferior
    // direita. É esse corte que dá escala à cena: o olho entende que a máquina
    // continua fora do quadro. Um elemento fino no foreground não faria isso.
    id: "deck",
    geo: "deck",
    material: "graphiteDeep",
    position: [1.78, -1.12, 1.12],
    rotation: [0.16, -0.42, -0.07],
    tier: "primary",
    depth: "fore",
    recess: { w: 0.62, h: 0.3, z: 0.056 },
    breathe: [0.03, 0.42, 0],
    delay: 0.0,
  },
  {
    id: "block",
    geo: "block",
    material: "metal",
    position: [-0.36, 0.82, 0.22],
    rotation: [-0.12, 0.34, 0.46],
    tier: "primary",
    depth: "mid",
    recess: { w: 0.24, h: 0.16, z: 0.105 },
    breathe: [0.026, 0.37, 3.4],
    delay: 0.2,
  },
  {
    id: "gate",
    geo: "gate",
    material: "metal",
    position: [2.32, 0.86, -1.95],
    rotation: [0.22, 0.52, 0.14],
    tier: "primary",
    depth: "back",
    breathe: [0.042, 0.31, 1.9],
    delay: 0.34,
  },
  {
    id: "veil",
    geo: "veil",
    material: "veil",
    position: [-0.72, -0.28, -2.6],
    rotation: [0.04, -0.14, -0.3],
    tier: "primary",
    depth: "back",
    breathe: [0.05, 0.22, 2.4],
    delay: 0.43,
  },
  {
    id: "shard",
    geo: "fin",
    material: "graphite",
    position: [1.72, -1.32, -1.55],
    rotation: [0.0, 0.15, -0.22],
    tier: "secondary",
    depth: "back",
    breathe: [0.018, 0.6, 5.2],
    delay: 0.5,
  },
  {
    id: "fin",
    geo: "fin",
    material: "metal",
    position: [1.42, 0.52, 0.18],
    rotation: [0.05, -0.2, 0.62],
    tier: "secondary",
    depth: "mid",
    breathe: [0.02, 0.55, 0.9],
    delay: 0.59,
  },
  {
    // Segundo foreground: pequeno, na borda inferior, preenchendo a faixa
    // vazia entre os CTAs e a legenda técnica.
    id: "wedge",
    geo: "wedge",
    material: "graphiteDeep",
    position: [0.28, -0.52, 1.38],
    rotation: [0.1, 0.28, -0.34],
    tier: "secondary",
    depth: "fore",
    breathe: [0.024, 0.47, 4.1],
    delay: 0.68,
  },
];

/** Mobile: enquadramento próprio — núcleo, deck, um foreground cortado e o veil ao fundo. */
const MOBILE_IDS = new Set(["deck", "block", "veil", "wedge"]);

// Pequeno deslocamento em direção ao centro (§3 da 3J): o núcleo se aproxima
// da coluna de texto sem cruzar sobre nenhuma letra — a barra estrutural até
// o deck já fazia essa ponte visualmente, isto só encurta a distância.
const CORE_POSITION = new THREE.Vector3(0.4, 0.02, 0);

/**
 * Conexões estruturais: barras escuras que parecem sustentar fisicamente os
 * módulos. `delay` alargado no Hero Final Refinement, acompanhando a
 * aproximação mais longa dos módulos (ver STRUT_DURATION/T_STRUT abaixo).
 */
const STRUTS: Array<{ id: string; to: string; thickness: number; delay: number }> = [
  { id: "strut-deck", to: "deck", thickness: 0.034, delay: 0.0 },
  { id: "strut-block", to: "block", thickness: 0.03, delay: 0.11 },
  // A barra até o gate atravessa quase 2 unidades de profundidade — é ela que
  // torna o eixo Z legível na imagem congelada.
  { id: "strut-gate", to: "gate", thickness: 0.024, delay: 0.21 },
  // O segundo foreground também precisa de amarração estrutural: sem ela ele
  // lê como uma forma solta flutuando na frente da cena, não como parte da
  // mesma máquina.
  { id: "strut-wedge", to: "wedge", thickness: 0.022, delay: 0.32 },
];

/**
 * Rotas de energia: polilinhas com cotovelo, não raios retos do centro. O
 * cotovelo faz a energia parecer roteada por um canal da arquitetura, e não
 * um spoke de roda — é o que separa "sistema" de "molécula".
 * Sequência CORE → ROTA → MÓDULO → STATUS: cada rota acende o chip de status
 * do módulo que ela alimenta ao chegar, nunca todos ao mesmo tempo.
 *
 * `rest` recalibrado (mais baixo) para o modelo de batimento periódico do
 * Hero Final Refinement: a rede fica com um brilho residual bem discreto
 * entre batimentos, para o PULSO em trânsito continuar sendo o evento que
 * chama atenção, não a linha em repouso.
 */
const ROUTES: Array<{
  id: string;
  to: string;
  /** Cotovelo em coordenadas absolutas do layout base. */
  elbow: [number, number, number];
  speed: number;
  offset: number;
  /**
   * Opacidade da rota em repouso. Valores diferentes fazem a imagem
   * CONGELADA já comunicar quais rotas estão ativas (§7) — sem isso o
   * roteamento só existiria enquanto houvesse animação.
   */
  rest: number;
}> = [
  {
    id: "route-deck",
    to: "deck",
    elbow: [1.18, -0.42, 0.62],
    speed: 0.29,
    offset: 0.0,
    rest: 0.24,
  },
  {
    id: "route-block",
    to: "block",
    elbow: [0.04, 0.32, 0.16],
    speed: 0.26,
    offset: 0.38,
    rest: 0.16,
  },
  {
    id: "route-gate",
    to: "gate",
    elbow: [1.54, 0.6, -0.86],
    speed: 0.22,
    offset: 0.66,
    rest: 0.12,
  },
  // O foreground também é alimentado — sem isso ele leria como decoração solta
  // em vez de parte da mesma máquina.
  { id: "route-fin", to: "fin", elbow: [1.06, 0.14, 0.1], speed: 0.31, offset: 0.86, rest: 0.18 },
];

/**
 * Fase 5 (Conexão) — conexões module→module ("relays"), novas no Hero Final
 * Refinement. É o que muda a leitura de "spokes saindo de um centro" para
 * "rede: os módulos também conversam entre si". Disparam em cadeia logo
 * depois do batimento principal (ver RELAY_START abaixo). `deck→wedge`
 * também existe no conjunto mobile simplificado; `block→fin` só roda no
 * desktop.
 */
const RELAYS: Array<{ id: string; from: string; to: string; elbow: [number, number, number] }> = [
  { id: "relay-deck-wedge", from: "deck", to: "wedge", elbow: [1.02, -0.94, 1.32] },
  { id: "relay-block-fin", from: "block", to: "fin", elbow: [0.62, 0.72, 0.24] },
];

// ---------------------------------------------------------------------------
// Cronograma — FRAGMENTAÇÃO → APROXIMAÇÃO → ENCAIXE → ATIVAÇÃO → CONEXÃO →
// SISTEMA VIVO (alvo ~2,8s até o núcleo ligar; ver docblock do arquivo)
// ---------------------------------------------------------------------------

const T_EMITTER = 0.12; // 1. emissor sobe para dentro do núcleo (microevento)
const T_CORE_FRAME = 0.2; // 2. estrutura central encaixa
const T_CORE_LOCK = 0.3; // 2b. camada concêntrica gira e trava (microevento)

/**
 * Fases 1–2 (Fragmentação → Aproximação). Tiers atrasados e delays por
 * módulo bem mais espaçados que a encenação original (que tinha T_PRIMARY
 * = 0.32/T_SECONDARY = 0.6): dá tempo de ler "peças ainda separadas,
 * convergindo com pesos e ritmos diferentes" antes do encaixe.
 */
const T_PRIMARY = 0.46; // 3. módulos primários começam a aproximar
const T_SECONDARY = 0.85; // 5. secundários começam (delay próprio por módulo)
const T_STRUT = 1.23; // 4. conexões estruturais começam a fechar
const T_PANEL = 1.27; // 5b. painel do deck desliza e abre (microevento)
/** Duração da aproximação por tier — quase o dobro da original (0.55/0.45). */
const MODULE_DURATION: Record<Tier, number> = { primary: 0.95, secondary: 0.8 };
const STRUT_DURATION = 0.735;

/**
 * Fase 3 (Encaixe) — instante em que o último strut/módulo assenta. Marca o
 * beat estrutural "sistema completo": pulso central + resposta de rim light
 * + intensificação breve das conexões, ainda sem tráfego de dados.
 */
const T_ASSEMBLY_DONE = 2.35;
const T_COMPLETE_BEAT = T_ASSEMBLY_DONE;
const COMPLETE_BEAT_DECAY = 6.5;

/**
 * Fase 4 (Ativação) — pausa curta e legível antes do núcleo ligar. A partir
 * daqui a peça entra no batimento periódico de energia (Fase 5, Conexão),
 * repetido indefinidamente como estado de repouso (Fase 6, Sistema vivo).
 */
const T_ACTIVATE = T_COMPLETE_BEAT + 0.45;
/** Ponto em que a rotação/respiração idle atinge amplitude plena. */
const T_STABLE = T_ACTIVATE;

/**
 * Parâmetros do batimento de energia. A primeira ativação usa esta mesma
 * coreografia (core → rota → módulo); a partir de T_ACTIVATE ela SE REPETE a
 * cada HEARTBEAT_PERIOD segundos, com uma pausa em repouso entre um
 * batimento e o próximo — é a pausa que torna o pulso seguinte legível como
 * evento, e não como ruído constante (o problema da encenação anterior, que
 * caía num loop assíncrono contínuo e quase imperceptível logo após a
 * montagem).
 */
const HEARTBEAT_PERIOD = 6.4;
const SURGE_STAGGER = 0.11;
const SURGE_TRAVEL = 0.34;
const SURGE_WINDOW = 0.78;
/** Início da onda de relay, relativo ao início do batimento — logo depois da onda primária assentar. */
const RELAY_START = SURGE_WINDOW + 0.4;
const RELAY_STAGGER = 0.18;
const RELAY_TRAVEL = 0.42;
const RELAY_WINDOW = RELAY_START + 1.1;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Fase 2 — curva mais "pesada" que easeOutCubic, só para a aproximação dos módulos. */
function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

function phase(elapsed: number, delay: number, duration: number) {
  return Math.min(1, Math.max(0, (elapsed - delay) / duration));
}

// ---------------------------------------------------------------------------
// Cena
// ---------------------------------------------------------------------------

/**
 * Direção de câmera (§3). Três variantes foram renderizadas e comparadas
 * antes de fechar — ver a seção "Câmera" do relatório da 3I. A escolhida é a
 * mais próxima e de lente mais aberta que ainda não distorce: ela é o que
 * transforma "objeto centrado no quadro" em enquadramento cinematográfico,
 * com o foreground cortado pela borda.
 */
const CAMERA: Record<
  "desktop" | "mobile",
  { fov: number; pos: [number, number, number]; target: [number, number, number] }
> = {
  // Variante C do teste de câmera: mais alta e olhando para baixo. É a que
  // constrói a diagonal espacial gate (fundo) → núcleo (meio) → deck
  // (foreground), com a barra estrutural funcionando como espinha da cena.
  desktop: { fov: 31, pos: [0.02, 1.4, 5.3], target: [1.12, -0.18, 0] },
  // Mobile tem enquadramento próprio: aproxima o núcleo e aceita cortar a
  // máquina nas bordas — o corte aumenta o impacto em tela estreita.
  mobile: { fov: 34, pos: [0.34, 0.62, 4.35], target: [0.78, -0.22, 0] },
};

/**
 * Aplica o enquadramento e acopla o cursor à CÂMERA (§13) em vez de girar o
 * objeto: deslocar a câmera alguns centésimos de unidade produz parallax
 * correto por profundidade de graça — o foreground responde mais que o
 * background porque a perspectiva faz essa conta sozinha. A amplitude é
 * pequena o bastante para não ler como "seguindo o mouse".
 */
function CameraRig({
  mobile,
  active,
  pointerRef,
}: {
  mobile: boolean;
  active: boolean;
  pointerRef: RefObject<{ x: number; y: number }>;
}) {
  const applied = useRef<boolean | null>(null);
  const smoothed = useRef({ x: 0, y: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const cfg = mobile ? CAMERA.mobile : CAMERA.desktop;

    if (applied.current !== mobile) {
      applied.current = mobile;
      camera.fov = cfg.fov;
      camera.updateProjectionMatrix();
      smoothed.current.x = 0;
      smoothed.current.y = 0;
    }

    const px = active ? pointerRef.current.x : 0;
    const py = active ? pointerRef.current.y : 0;
    const k = Math.min(1, delta * 2.6);
    smoothed.current.x += (px - smoothed.current.x) * k;
    smoothed.current.y += (py - smoothed.current.y) * k;

    camera.position.set(
      cfg.pos[0] + smoothed.current.x * 0.26,
      cfg.pos[1] - smoothed.current.y * 0.18,
      cfg.pos[2],
    );
    // O alvo acompanha uma fração do deslocamento: a câmera orbita levemente
    // em vez de apenas transladar, o que preserva o ponto de fuga descentrado.
    target.set(
      cfg.target[0] + smoothed.current.x * 0.08,
      cfg.target[1] - smoothed.current.y * 0.05,
      cfg.target[2],
    );
    camera.lookAt(target);
  });
  return null;
}

function ModularEngine({
  active,
  simplified,
  scrollRef,
  rimLightRef,
}: {
  active: boolean;
  simplified: boolean;
  scrollRef: RefObject<number>;
  /** Luz de rim vive no `<Canvas>` do componente pai — só a intensidade é mutada aqui, no beat de encaixe. */
  rimLightRef: RefObject<THREE.DirectionalLight | null>;
}) {
  const modules = useMemo(
    () => (simplified ? MODULES.filter((m) => MOBILE_IDS.has(m.id)) : MODULES),
    [simplified],
  );
  const routes = useMemo(() => ROUTES.filter((r) => modules.some((m) => m.id === r.to)), [modules]);
  const struts = useMemo(() => STRUTS.filter((s) => modules.some((m) => m.id === s.to)), [modules]);
  const relays = useMemo(
    () =>
      RELAYS.filter(
        (r) => modules.some((m) => m.id === r.from) && modules.some((m) => m.id === r.to),
      ),
    [modules],
  );

  const groupRef = useRef<THREE.Group>(null);
  const coreGroupRef = useRef<THREE.Group>(null);
  const coreFrameRef = useRef<THREE.Group>(null);
  const coreMidRef = useRef<THREE.Mesh>(null);
  const coreInnerRef = useRef<THREE.Mesh>(null);
  const emitterRef = useRef<THREE.Mesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const moduleRefs = useRef<Array<THREE.Group | null>>([]);
  const recessRefs = useRef<Array<THREE.Mesh | null>>([]);
  const strutRefs = useRef<Array<THREE.Mesh | null>>([]);
  const pulseRefs = useRef<Array<THREE.Mesh | null>>([]);
  const chipRefs = useRef<Array<THREE.Mesh | null>>([]);
  const lineMatRefs = useRef<Array<THREE.LineBasicMaterial | null>>([]);
  const relayPulseRefs = useRef<Array<THREE.Mesh | null>>([]);
  const relayLineMatRefs = useRef<Array<THREE.LineBasicMaterial | null>>([]);

  /**
   * Catálogo compartilhado de geometrias — cada forma é criada uma única vez
   * e reutilizada por todos os módulos que a usam (§22: sofisticação vem do
   * desenho, não da densidade poligonal).
   */
  const geometries = useMemo(() => {
    // Núcleo: frame estrutural vazado + bloco interno + emissor.
    const coreOuter = rectShape(1.34, 1.0);
    coreOuter.holes.push(rectHole(0.92, 0.6));
    // Segunda camada concêntrica NÃO circular, deslocada — quebra a leitura de "moldura de quadro".
    const coreMid = rectShape(0.98, 0.72);
    coreMid.holes.push(rectHole(0.66, 0.4, 0.04, -0.02));

    // Deck: placa grande com um slot horizontal atravessando.
    const deck = rectShape(1.46, 0.9);
    deck.holes.push(rectHole(0.84, 0.14, -0.18, 0.2));

    // Gate: vazado com a abertura deliberadamente descentrada — a moldura
    // fica larga de um lado e estreita do outro, para não repetir o motivo
    // simétrico do núcleo.
    const gate = rectShape(0.86, 0.66);
    gate.holes.push(rectHole(0.5, 0.34, 0.13, 0.05));

    // Wedge: lasca sólida com um único canto cortado — sem furo, para
    // quebrar a repetição de "moldura vazada" na peça.
    const wedge = new THREE.Shape();
    wedge.moveTo(-0.27, -0.17);
    wedge.lineTo(0.27, -0.17);
    wedge.lineTo(0.27, 0.06);
    wedge.lineTo(0.1, 0.17);
    wedge.lineTo(-0.27, 0.17);
    wedge.closePath();

    return {
      coreOuter: extrudePlate(coreOuter, 0.2, 0.018),
      coreMid: extrudePlate(coreMid, 0.3, 0.016),
      // Bloco interno dimensionado para PREENCHER a cavidade do frame: sem
      // ele o núcleo lia como uma caixa vazia iluminada (quase uma tela).
      coreInner: new THREE.BoxGeometry(0.62, 0.4, 0.34),
      // Emissor em lâmina fina, não em ponto: um ponto emissivo com falloff
      // radial vira "olho brilhante" — o clichê que o briefing proíbe.
      emitter: new THREE.BoxGeometry(0.03, 0.3, 0.03),
      deck: extrudePlate(deck, 0.12, 0.015),
      gate: extrudePlate(gate, 0.16, 0.016),
      block: new THREE.BoxGeometry(0.62, 0.44, 0.2),
      veil: extrudePlate(rectShape(1.9, 1.15), 0.03, 0.01),
      fin: new THREE.BoxGeometry(0.5, 0.075, 0.13),
      wedge: extrudePlate(wedge, 0.1, 0.013),
      recess: new THREE.BoxGeometry(1, 1, 0.02),
      strut: new THREE.BoxGeometry(1, 1, 1),
      chip: new THREE.BoxGeometry(0.023, 0.023, 0.012),
      pulse: new THREE.BoxGeometry(0.034, 0.034, 0.034),
    };
  }, []);

  /** Família pequena de materiais, compartilhados — menos trocas de estado por frame. */
  const materials = useMemo(() => {
    const energyBase = {
      color: ENERGY_COLOR,
      emissive: ENERGY_COLOR,
      toneMapped: false,
      roughness: 0.4,
      metalness: 0,
      // A energia é SINAL, não atmosfera: ela não recebe névoa, então continua
      // legível independentemente da profundidade em que o módulo está.
      fog: false,
    } as const;
    return {
      /* Metalness fica deliberadamente MODERADA em toda a família: sem
         environment map, um material muito metálico não tem o que refletir e
         renderiza quase preto — foi o que apagava os módulos "metal" nas
         primeiras iterações. A leitura de superfície usinada vem do contraste
         de roughness entre os materiais e do brilho nos chanfros, não de
         empurrar metalness para 1.

         Sprint 3J — GRADAÇÃO POR PLANO. O blur test da 3I mostrou que os três
         planos de profundidade existiam em posição mas não em VALOR: tudo
         colapsava numa única mancha cinza. A família ganhou uma faixa tonal
         explícita, do primeiro plano (quase silhueta) até o núcleo (o mais
         claro), que é o que faz a hierarquia sobreviver ao borrão. */
      /** FOREGROUND — quase silhueta, emoldura a cena sem competir com ela. */
      graphiteDeep: new THREE.MeshStandardMaterial({
        color: "#141817",
        roughness: 0.78,
        metalness: 0.16,
      }),
      graphite: new THREE.MeshStandardMaterial({
        color: "#252b28",
        roughness: 0.72,
        metalness: 0.2,
      }),
      metal: new THREE.MeshStandardMaterial({ color: "#4a534f", roughness: 0.31, metalness: 0.44 }),
      /* Material exclusivo do núcleo: o mais claro e o menos rugoso da
         família. É por ele — não pelo verde — que o centro vira o elemento
         de maior hierarquia da peça. */
      coreMetal: new THREE.MeshStandardMaterial({
        color: "#6b7570",
        roughness: 0.22,
        metalness: 0.5,
      }),
      veil: new THREE.MeshStandardMaterial({
        color: "#141918",
        roughness: 0.42,
        metalness: 0.5,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
      }),
      recess: new THREE.MeshStandardMaterial({
        color: "#0c0f0e",
        roughness: 0.85,
        metalness: 0.06,
      }),
      /* Barras estruturais mais finas e mais escuras que na 3I: no blur test
         elas liam como vigas industriais pesadas. Agora são traços de
         estrutura, não vigas. */
      strut: new THREE.MeshStandardMaterial({ color: "#0d1110", roughness: 0.74, metalness: 0.3 }),
      emitter: new THREE.MeshStandardMaterial({ ...energyBase, emissiveIntensity: 1.6 }),
      chips: modules.map(
        () => new THREE.MeshStandardMaterial({ ...energyBase, emissiveIntensity: 0.12 }),
      ),
      pulses: routes.map(
        () => new THREE.MeshStandardMaterial({ ...energyBase, emissiveIntensity: 1.4 }),
      ),
      relayPulses: relays.map(
        () => new THREE.MeshStandardMaterial({ ...energyBase, emissiveIntensity: 1.2 }),
      ),
    };
  }, [modules, routes, relays]);

  /** Geometrias das rotas de energia (polilinha de 3 pontos, reescrita por frame). */
  const routeGeometries = useMemo(
    () =>
      routes.map(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
        return geo;
      }),
    [routes],
  );

  /** Geometrias dos relays (Fase 5) — mesmo formato das rotas: polilinha de 3 pontos por frame. */
  const relayGeometries = useMemo(
    () =>
      relays.map(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
        return geo;
      }),
    [relays],
  );

  // Vetores de trabalho reutilizados — nunca alocar dentro do loop de frame.
  const scratch = useMemo(
    () => ({
      dir: new THREE.Vector3(),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      axis: new THREE.Vector3(1, 0, 0),
      /** Posição corrente (pós-explode) de cada módulo, por id. */
      current: new Map<string, THREE.Vector3>(
        modules.map((m) => [m.id, new THREE.Vector3(...m.position)]),
      ),
      /** Direção de afastamento no scroll, por id. */
      outward: new Map<string, THREE.Vector3>(
        modules.map((m) => [m.id, new THREE.Vector3(...m.position).sub(CORE_POSITION).normalize()]),
      ),
    }),
    [modules],
  );

  // R3F só descarta automaticamente o que ele mesmo criou; geometrias e
  // materiais vindos de useMemo precisam ser liberados na desmontagem.
  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
      routeGeometries.forEach((g) => g.dispose());
      relayGeometries.forEach((g) => g.dispose());
      materials.chips.forEach((m) => m.dispose());
      materials.pulses.forEach((m) => m.dispose());
      materials.relayPulses.forEach((m) => m.dispose());
      [
        materials.graphite,
        materials.metal,
        materials.coreMetal,
        materials.veil,
        materials.recess,
        materials.strut,
        materials.emitter,
      ].forEach((m) => m.dispose());
    };
  }, [geometries, routeGeometries, relayGeometries, materials]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    // Caminho único para os dois estados: com reduced-motion o "tempo" salta
    // para depois da montagem e as amplitudes de idle vão a zero, então a
    // pose final é exatamente a mesma — só que congelada.
    const t = active ? state.clock.elapsedTime : 999;
    const idle = active ? 1 : 0;
    const scrollT = active ? (scrollRef.current ?? 0) : 0;

    // Fase 3 (Encaixe) — beat estrutural único quando a montagem termina.
    // Decai exponencialmente logo após T_COMPLETE_BEAT; sob reduced-motion
    // `idle=0` zera o termo inteiro, igual ao resto da camada de energia.
    const completeSpike =
      idle && t >= T_COMPLETE_BEAT ? Math.exp(-(t - T_COMPLETE_BEAT) * COMPLETE_BEAT_DECAY) : 0;

    // --- 1. MICROEVENTO: o emissor DESLIZA para dentro do núcleo ---
    // Não é um fade nem um scale: a lâmina sobe por dentro da cavidade e
    // acende ao chegar. É o primeiro sinal de que o sistema ligou.
    const emitterP = easeOutCubic(phase(t, T_EMITTER, 0.4));
    if (emitterRef.current) {
      emitterRef.current.position.y = -0.34 + emitterP * 0.34;
      emitterRef.current.scale.set(1, 0.25 + emitterP * 0.75, 1);
      const breath = 0.82 + Math.sin(t * 1.4) * 0.18 * idle;
      // Pico no instante da Ativação (Fase 4): é o núcleo "descarregando"
      // para o sistema, e é o que dá causa visível ao primeiro batimento.
      const activateSpike = idle && t > T_ACTIVATE ? Math.exp(-(t - T_ACTIVATE) * 5.5) * 1.15 : 0;
      // Materiais são lidos pelo ref da mesh, nunca pelo objeto do useMemo:
      // mutar o retorno de um hook por frame é o que o React Compiler proíbe.
      (emitterRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        emitterP * breath + activateSpike + completeSpike * 0.8;
    }

    // Fase 3 — resposta de luz do beat de encaixe: rim e luz interna do
    // núcleo recebem um pico breve e moderado, sincronizado com o pulso
    // central abaixo. Com extrema moderação, por instrução da Gate.
    if (rimLightRef.current) {
      rimLightRef.current.intensity = RIM_BASE_INTENSITY + completeSpike * 0.9;
    }
    if (coreLightRef.current) {
      coreLightRef.current.intensity = CORE_LIGHT_BASE_INTENSITY + completeSpike * 0.6;
    }

    // --- 2. Estrutura central encaixa (translação em Z, não scale) ---
    const coreP = easeOutCubic(phase(t, T_CORE_FRAME, 0.42));
    if (coreFrameRef.current) {
      coreFrameRef.current.position.z = (1 - coreP) * 1.1;
      coreFrameRef.current.scale.setScalar(0.94 + coreP * 0.06);
    }

    // --- 2b. MICROEVENTO: a camada concêntrica gira e TRAVA ---
    if (coreMidRef.current) {
      const lockP = easeOutCubic(phase(t, T_CORE_LOCK, 0.43));
      // Chega desalinhada e assenta no ângulo final com um leve overshoot.
      const overshoot = Math.sin(lockP * Math.PI) * 0.055 * (1 - lockP);
      coreMidRef.current.rotation.z = 0.11 + (1 - lockP) * 0.46 - overshoot;
    }
    if (coreInnerRef.current) {
      // +5% de escala no beat de encaixe — parte do mesmo "pulso central".
      coreInnerRef.current.scale.setScalar(coreP * (1 + completeSpike * 0.05));
      // O bloco interno preenche a cavidade, então ele não gira (rasparia no
      // frame): ele se ajusta. Micro-oscilação angular + um vaivém de
      // profundidade — lê como mecanismo operando, nunca como vitrine girando.
      coreInnerRef.current.rotation.z = Math.sin(t * 0.43) * 0.035 * idle;
      coreInnerRef.current.rotation.x = Math.sin(t * 0.29 + 0.8) * 0.05 * idle;
      coreInnerRef.current.position.z = -0.02 + Math.sin(t * 0.61) * 0.022 * idle;
    }
    if (coreGroupRef.current) {
      // O núcleo é o último a se desfazer no scroll — recua bem menos que os módulos.
      coreGroupRef.current.position.set(
        CORE_POSITION.x,
        CORE_POSITION.y - scrollT * 0.12,
        CORE_POSITION.z - scrollT * 0.5,
      );
      // "Pulso central" (Fase 3) — o cluster inteiro do núcleo respira uma
      // vez no beat de encaixe.
      coreGroupRef.current.scale.setScalar(1.16 * (1 + completeSpike * 0.035));
    }

    // --- 3/5. Módulos: ENCAIXE, não scale 0→1 (§10) ---
    modules.forEach((m, i) => {
      const ref = moduleRefs.current[i];
      const start = m.tier === "primary" ? T_PRIMARY : T_SECONDARY;
      // Fase 2 (Aproximação) — easeOutQuart no lugar de easeOutCubic: curva
      // mais "pesada", só para a posição dos módulos (núcleo/struts
      // continuam em easeOutCubic, por instrução explícita de preservar a
      // lógica estrutural).
      const p = easeOutQuart(phase(t, start + m.delay, MODULE_DURATION[m.tier]));

      const outward = scratch.outward.get(m.id)!;
      const [amp, speed, ph] = m.breathe;
      // Respiração estrutural: cada módulo pulsa alguns pixels no seu próprio
      // eixo de afastamento, com período e fase distintos — o conjunto nunca
      // "bate junto", que é o que faria parecer animação de loading.
      const breathe = Math.sin(t * speed + ph) * amp * idle;
      // Cada módulo chega de fora ao longo do PRÓPRIO vetor de afastamento, de
      // uma distância proporcional ao seu plano de profundidade — o foreground
      // vem de mais longe e por isso cruza mais quadro ao entrar.
      const approach = (1 - p) * DOCK_DISTANCE[m.depth];
      // Pequeno overshoot no fim do trajeto: o módulo passa do ponto e assenta.
      const settleKick = Math.sin(p * Math.PI) * -0.09 * (1 - p);
      const explode = scrollT * EXIT_SPREAD[m.depth];
      const offset = breathe + approach + settleKick + explode;

      const cur = scratch.current.get(m.id)!;
      cur.set(
        m.position[0] + outward.x * offset,
        m.position[1] + outward.y * offset,
        m.position[2] + outward.z * offset,
      );

      if (ref) {
        ref.position.copy(cur);
        // Escala varia pouco (0.93→1): o que comunica a chegada é a translação
        // e a rotação, não um "pop" de tamanho.
        ref.scale.setScalar(0.93 + p * 0.07);
        ref.visible = p > 0.002;
        // Rotação de acoplamento: o módulo chega desalinhado e desenrola até o
        // ângulo final — é isso que faz a chegada ler como encaixe. Amplitude
        // (0.5→0.68) levemente maior que a original: mais diferença de
        // rotação visível durante a Fragmentação/Aproximação.
        const dock = (1 - p) * 0.68;
        ref.rotation.set(
          m.rotation[0] +
            Math.sin(t * speed * 0.7 + ph) * 0.012 * idle +
            dock * 0.4 +
            scrollT * 0.12,
          m.rotation[1] +
            Math.sin(t * speed * 0.5 + ph * 1.7) * 0.016 * idle -
            dock * 0.7 -
            scrollT * 0.26,
          m.rotation[2] + dock + scrollT * 0.16,
        );
      }

      // --- 5b. MICROEVENTO: o painel recuado do deck desliza e abre ---
      const recess = recessRefs.current[i];
      if (recess && m.recess) {
        const openP = m.id === "deck" ? easeOutCubic(phase(t, T_PANEL, 0.4)) : 1;
        recess.position.x = openP * 0.14;
        recess.scale.x = m.recess.w * (1 - openP * 0.18);
      }

      // Status chip do módulo acompanha a face frontal.
      const chip = chipRefs.current[i];
      if (chip) {
        chip.position.set(cur.x, cur.y, cur.z + 0.16);
        chip.scale.setScalar(p);
      }
    });

    // --- 4. Conexões estruturais ---
    struts.forEach((s, i) => {
      const mesh = strutRefs.current[i];
      if (!mesh) return;
      const target = scratch.current.get(s.to);
      if (!target) return;
      const corePos = coreGroupRef.current?.position ?? CORE_POSITION;
      scratch.dir.subVectors(target, corePos);
      const len = scratch.dir.length();
      const p = easeOutCubic(phase(t, T_STRUT + s.delay, STRUT_DURATION));
      // A barra "fecha" crescendo do núcleo em direção ao módulo.
      const grown = len * p;
      scratch.a.copy(corePos).addScaledVector(scratch.dir.normalize(), grown / 2);
      mesh.position.copy(scratch.a);
      mesh.quaternion.setFromUnitVectors(scratch.axis, scratch.dir);
      mesh.scale.set(Math.max(grown, 0.0001), s.thickness, s.thickness * 0.7);
      mesh.visible = p > 0.01;
    });

    // --- Fases 4–6: ATIVAÇÃO → CONEXÃO → SISTEMA VIVO ---
    // Batimento periódico ancorado em T_ACTIVATE (não mais um surge único
    // seguido de loop assíncrono lento): a primeira ativação dispara a MESMA
    // coreografia core→rota→módulo que se repete a cada HEARTBEAT_PERIOD, com
    // uma pausa legível entre um batimento e o próximo.
    const sinceEnergy = active ? t - T_ACTIVATE : -1;
    const beatT = sinceEnergy >= 0 ? sinceEnergy % HEARTBEAT_PERIOD : -1;
    const inSurge = beatT >= 0 && beatT < SURGE_WINDOW;
    const preEnergy = t < T_ACTIVATE || !active;

    routes.forEach((r, i) => {
      const target = scratch.current.get(r.to);
      const geo = routeGeometries[i];
      const mat = lineMatRefs.current[i];
      if (!target || !geo) return;

      const corePos = coreGroupRef.current?.position ?? CORE_POSITION;
      // O cotovelo acompanha metade do deslocamento do módulo, então o canal
      // continua coerente enquanto a peça se abre no scroll.
      const half = 0.5;
      const ex = r.elbow[0] + (target.x - MODULES.find((m) => m.id === r.to)!.position[0]) * half;
      const ey = r.elbow[1] + (target.y - MODULES.find((m) => m.id === r.to)!.position[1]) * half;
      const ez = r.elbow[2] + (target.z - MODULES.find((m) => m.id === r.to)!.position[2]) * half;

      const pos = geo.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, corePos.x, corePos.y, corePos.z);
      pos.setXYZ(1, ex, ey, ez);
      pos.setXYZ(2, target.x, target.y, target.z);
      pos.needsUpdate = true;

      // Ao sair da Hero a energia se apaga POR SEQUÊNCIA (§14): cada rota tem
      // seu próprio ponto de corte, então o sistema desliga em cascata em vez
      // de tudo escurecer junto.
      const fadeStart = 0.1 + i * 0.11;
      const fadeK = Math.min(1, Math.max(0, (scrollT - fadeStart) / 0.26));
      // Estrutura sempre levemente visível em repouso: a rede existe mesmo
      // sem tráfego — só o TRÁFEGO é periódico. Antes de T_ACTIVATE, o beat
      // de encaixe (Fase 3) ainda dá um brilho breve e residual às conexões,
      // sem chegar a ser tráfego real.
      const restGlow = preEnergy ? completeSpike * 0.3 : r.rest * (1 - fadeK);
      if (mat) mat.opacity = restGlow;

      const pulse = pulseRefs.current[i];
      const moduleIndex = modules.findIndex((m) => m.id === r.to);
      const chipMat = chipRefs.current[moduleIndex]?.material as
        THREE.MeshStandardMaterial | undefined;

      if (preEnergy || scrollT > 0.6) {
        if (pulse) pulse.visible = false;
        if (chipMat) chipMat.emissiveIntensity = 0.22;
        return;
      }

      // Durante a onda, a rota ainda não disparada fica invisível em vez de
      // aparecer parada na origem.
      const surgeLocal = (beatT - i * SURGE_STAGGER) / SURGE_TRAVEL;

      if (!inSurge || surgeLocal < 0 || surgeLocal >= 1) {
        // Fora da janela de disparo: pulso escondido, chip em repouso até o próximo batimento.
        if (pulse) pulse.visible = false;
        if (chipMat) chipMat.emissiveIntensity = 0.22;
        return;
      }

      const s = surgeLocal;
      scratch.a.set(corePos.x, corePos.y, corePos.z);
      scratch.b.set(ex, ey, ez);
      if (s < 0.5) {
        scratch.a.lerp(scratch.b, s / 0.5);
      } else {
        scratch.a.copy(scratch.b).lerp(target, (s - 0.5) / 0.5);
      }
      if (pulse) {
        pulse.visible = true;
        pulse.position.copy(scratch.a);
        const fade = Math.sin(s * Math.PI);
        (pulse.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + fade * 1.8;
        pulse.scale.setScalar(0.6 + fade * 0.6);
      }
      if (chipMat) {
        // Sobe com a chegada do pulso e decai em seguida.
        const arrival =
          s > 0.85 ? Math.exp(-((s - 0.85) / 0.15) * 3.4) : Math.sin(s * Math.PI) * 0.4;
        chipMat.emissiveIntensity = 0.22 + arrival * 2.1;
      }
    });

    // Fase 5 (Conexão) — cadeia module→module logo após o batimento.
    const inRelay = beatT >= RELAY_START && beatT < RELAY_WINDOW;
    relays.forEach((r, i) => {
      const geo = relayGeometries[i];
      const mat = relayLineMatRefs.current[i];
      const pulse = relayPulseRefs.current[i];
      const fromPos = scratch.current.get(r.from);
      const toPos = scratch.current.get(r.to);
      if (!geo || !fromPos || !toPos) return;

      const pos = geo.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, fromPos.x, fromPos.y, fromPos.z);
      pos.setXYZ(1, r.elbow[0], r.elbow[1], r.elbow[2]);
      pos.setXYZ(2, toPos.x, toPos.y, toPos.z);
      pos.needsUpdate = true;

      if (preEnergy || scrollT > 0.5) {
        if (mat) mat.opacity = 0;
        if (pulse) pulse.visible = false;
        return;
      }

      const local = (beatT - RELAY_START - i * RELAY_STAGGER) / RELAY_TRAVEL;
      const firing = inRelay && local >= 0 && local < 1;

      if (mat) mat.opacity = firing ? 0.5 : 0;
      if (!firing) {
        if (pulse) pulse.visible = false;
        return;
      }

      scratch.a.set(fromPos.x, fromPos.y, fromPos.z);
      scratch.b.set(r.elbow[0], r.elbow[1], r.elbow[2]);
      if (local < 0.5) {
        scratch.a.lerp(scratch.b, local / 0.5);
      } else {
        scratch.a.copy(scratch.b).lerp(toPos, (local - 0.5) / 0.5);
      }
      if (pulse) {
        pulse.visible = true;
        pulse.position.copy(scratch.a);
        const fade = Math.sin(local * Math.PI);
        (pulse.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + fade * 1.6;
        pulse.scale.setScalar(0.5 + fade * 0.5);
      }
    });

    // --- Idle: micro-rotação oscilante, nunca giro contínuo do conjunto.
    // O cursor NÃO entra aqui: na 3I ele move a câmera (ver CameraRig), o que
    // gera parallax correto por profundidade em vez de girar a peça inteira. ---
    const idleRotY = Math.sin(t * 0.21) * 0.05 * idle;
    const idleRotX = Math.sin(t * 0.17 + 1.1) * 0.028 * idle;
    const settle = t > T_STABLE ? 1 : easeOutCubic(phase(t, T_PRIMARY, 1.4));
    group.rotation.y = -0.16 + idleRotY * settle + scrollT * 0.3;
    group.rotation.x = 0.03 + idleRotX * settle - scrollT * 0.14;
    group.position.y = -scrollT * 0.4;
  });

  return (
    <group ref={groupRef} scale={CORE_SCALE}>
      {/* ---------- NÚCLEO ---------- */}
      <group
        ref={coreGroupRef}
        position={CORE_POSITION}
        rotation={[0.05, -0.22, 0.04]}
        scale={1.16}
      >
        <group ref={coreFrameRef}>
          <mesh geometry={geometries.coreOuter} material={materials.coreMetal} />
          <mesh
            ref={coreMidRef}
            geometry={geometries.coreMid}
            material={materials.graphite}
            rotation={[0, 0, 0.11]}
            position={[0.03, -0.02, 0.02]}
          />
        </group>
        <mesh
          ref={coreInnerRef}
          geometry={geometries.coreInner}
          material={materials.metal}
          position={[0.02, -0.01, -0.02]}
          scale={active ? 0.001 : 1}
        />
        <mesh
          ref={emitterRef}
          geometry={geometries.emitter}
          material={materials.emitter}
          position={[-0.14, 0, 0.2]}
        />
        {/* Luz interna discreta: dá o vazamento verde nas paredes da cavidade
            sem criar um hotspot redondo. O que se vê é a lâmina emissiva,
            não a luz. Intensidade recebe um pico breve no beat de encaixe. */}
        <pointLight
          ref={coreLightRef}
          position={[-0.14, 0, 0.16]}
          color={ENERGY_COLOR}
          intensity={CORE_LIGHT_BASE_INTENSITY}
          distance={1.1}
          decay={2}
        />
      </group>

      {/* ---------- CONEXÕES ESTRUTURAIS ---------- */}
      {struts.map((s, i) => (
        <mesh
          key={s.id}
          ref={(m) => {
            strutRefs.current[i] = m;
          }}
          geometry={geometries.strut}
          material={materials.strut}
          visible={false}
        />
      ))}

      {/* ---------- MÓDULOS ---------- */}
      {modules.map((m, i) => (
        <group
          key={m.id}
          ref={(g) => {
            moduleRefs.current[i] = g;
          }}
          position={m.position}
          rotation={m.rotation}
          visible={!active}
        >
          <mesh geometry={geometries[m.geo]} material={materials[m.material]} />
          {m.recess && (
            <mesh
              ref={(mesh) => {
                recessRefs.current[i] = mesh;
              }}
              geometry={geometries.recess}
              material={materials.recess}
              position={[0, 0, m.recess.z]}
              scale={[m.recess.w, m.recess.h, 1]}
            />
          )}
        </group>
      ))}

      {/* ---------- STATUS (telemetria de cada módulo) ---------- */}
      {modules.map((m, i) => (
        <mesh
          key={`chip-${m.id}`}
          ref={(mesh) => {
            chipRefs.current[i] = mesh;
          }}
          geometry={geometries.chip}
          material={materials.chips[i]}
          scale={active ? 0.001 : 1}
        />
      ))}

      {/* ---------- CONEXÕES ENERGÉTICAS (core → módulo) ---------- */}
      {routes.map((r, i) => (
        <threeLine key={r.id} geometry={routeGeometries[i]}>
          <lineBasicMaterial
            ref={(m) => {
              lineMatRefs.current[i] = m;
            }}
            color={ENERGY_COLOR}
            transparent
            opacity={active ? 0 : r.rest}
          />
        </threeLine>
      ))}

      {routes.map((r, i) => (
        <mesh
          key={`pulse-${r.id}`}
          ref={(m) => {
            pulseRefs.current[i] = m;
          }}
          geometry={geometries.pulse}
          material={materials.pulses[i]}
          visible={false}
        />
      ))}

      {/* ---------- CONEXÕES ENERGÉTICAS (Fase 5 — module → module) ---------- */}
      {relays.map((r, i) => (
        <threeLine key={r.id} geometry={relayGeometries[i]}>
          <lineBasicMaterial
            ref={(m) => {
              relayLineMatRefs.current[i] = m;
            }}
            color={ENERGY_COLOR}
            transparent
            opacity={0}
          />
        </threeLine>
      ))}

      {relays.map((r, i) => (
        <mesh
          key={`relay-pulse-${r.id}`}
          ref={(m) => {
            relayPulseRefs.current[i] = m;
          }}
          geometry={geometries.pulse}
          material={materials.relayPulses[i]}
          visible={false}
        />
      ))}
    </group>
  );
}

function DigitalCoreScene({
  active,
  simplified,
  paused,
  scrollRef,
  pointerRef,
  onContextLost,
}: {
  active: boolean;
  simplified: boolean;
  paused: boolean;
  scrollRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  onContextLost?: () => void;
}) {
  // Ref vive aqui (fora de ModularEngine) porque a luz é um elemento irmão
  // do <ModularEngine> dentro do <Canvas>, não um filho dele.
  const rimLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <Canvas
      dpr={[1, simplified ? 1 : 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={!active || paused ? "demand" : "always"}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        // O `aria-hidden` do <Canvas> pousa no wrapper que o R3F cria (o que
        // já basta para remover a subárvore da árvore de acessibilidade),
        // mas marcamos o elemento também para a intenção ficar explícita.
        gl.domElement.setAttribute("aria-hidden", "true");
        if (!onContextLost) return;
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}
    >
      <CameraRig mobile={simplified} active={active} pointerRef={pointerRef} />

      {/* Névoa linear — o terceiro elemento da gradação por plano (§7).
          Ela puxa os módulos do fundo em direção à cor do background, criando
          perspectiva atmosférica real. É recurso nativo do material padrão,
          não pós-processamento: custa zero draw call. As faixas foram
          calibradas para começar logo depois do núcleo, de modo que
          foreground e midground ficam intocados. */}
      <fog attach="fog" args={["#0a0d0b", 5.2, 9.6]} />

      {/* Iluminação que MODELA (§9): ambient muito baixa para as faces em
          sombra caírem quase no preto, key raking para revelar chanfros e
          espessura, fill mínima só para a sombra não virar buraco chapado,
          rim verde atrás para recortar algumas arestas do fundo. */}
      {/* Ambient baixa de propósito: é ela que deixa as faces em sombra
          caírem quase no preto e amplia a faixa tonal da peça. Toda a leitura
          de volume vem da key raking contra essa sombra. */}
      <ambientLight intensity={0.09} color="#c3ccc7" />
      <directionalLight position={[-2.4, 3.4, 3.6]} intensity={4.75} color="#f4f7f4" />
      <directionalLight position={[3.4, -1.4, 1.8]} intensity={0.3} color="#4a534e" />
      {/* Rim contido: recorta algumas arestas do fundo sem virar contorno
          neon — o verde é sinal, não a estética dominante da peça. Recebe um
          pico breve de intensidade no beat de encaixe (Fase 3). */}
      <directionalLight
        ref={rimLightRef}
        position={[2.2, 1.2, -3.4]}
        intensity={RIM_BASE_INTENSITY}
        color={RIM_COLOR}
      />

      <ModularEngine
        active={active}
        simplified={simplified}
        scrollRef={scrollRef}
        rimLightRef={rimLightRef}
      />
    </Canvas>
  );
}

export { DigitalCoreScene };
