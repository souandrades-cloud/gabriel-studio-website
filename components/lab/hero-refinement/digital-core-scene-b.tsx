"use client";

import { Canvas, extend, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

extend({ ThreeLine: THREE.Line });

/**
 * HERO REFINEMENT DISCOVERY 001 — DIRECTION B "SIGNAL / CONNECTION".
 *
 * Fork de `@/components/three/digital-core-scene` (produção). Geometria,
 * materiais, câmera, iluminação, assembly de entrada e scroll-exit são
 * IDÊNTICOS ao original — nada disso foi tocado. A única camada reescrita é
 * a ENERGIA (§6/§16 do original): em vez de um surge único seguido de um
 * loop lento e assíncrono por rota (quase invisível, funciona como
 * atmosfera), a energia agora pulsa em BATIMENTOS periódicos e legíveis, e
 * duas rotas module→module ("relays") acendem em cadeia logo depois do
 * batimento principal — a peça finalmente comunica que dados atravessam o
 * sistema continuamente, não só na entrada.
 *
 * Ver relatório da Gate "Hero Final Refinement Discovery 001" para o
 * racional completo.
 */

const NEUTRAL_TEST = false;
const ENERGY_COLOR = NEUTRAL_TEST ? "#b3bcb7" : "#22b573";
const RIM_COLOR = NEUTRAL_TEST ? "#8d9691" : "#22b573";

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

type Tier = "primary" | "secondary";
type Depth = "fore" | "mid" | "back";

type ModuleDef = {
  id: string;
  geo: "deck" | "gate" | "block" | "veil" | "fin" | "wedge";
  material: "graphiteDeep" | "graphite" | "metal" | "veil";
  position: [number, number, number];
  rotation: [number, number, number];
  tier: Tier;
  depth: Depth;
  recess?: { w: number; h: number; z: number };
  breathe: [number, number, number];
  delay: number;
};

const CORE_SCALE = 1.05;
const DOCK_DISTANCE: Record<Depth, number> = { fore: 2.4, mid: 1.5, back: 1.1 };
const EXIT_SPREAD: Record<Depth, number> = { fore: 2.2, mid: 1.05, back: 1.5 };

const MODULES: ModuleDef[] = [
  {
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
    delay: 0.11,
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
    delay: 0.19,
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
    delay: 0.24,
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
    delay: 0.28,
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
    delay: 0.33,
  },
  {
    id: "wedge",
    geo: "wedge",
    material: "graphiteDeep",
    position: [0.28, -0.52, 1.38],
    rotation: [0.1, 0.28, -0.34],
    tier: "secondary",
    depth: "fore",
    breathe: [0.024, 0.47, 4.1],
    delay: 0.38,
  },
];

const MOBILE_IDS = new Set(["deck", "block", "veil", "wedge"]);
const CORE_POSITION = new THREE.Vector3(0.4, 0.02, 0);

const STRUTS: Array<{ id: string; to: string; thickness: number; delay: number }> = [
  { id: "strut-deck", to: "deck", thickness: 0.034, delay: 0.0 },
  { id: "strut-block", to: "block", thickness: 0.03, delay: 0.06 },
  { id: "strut-gate", to: "gate", thickness: 0.024, delay: 0.12 },
  { id: "strut-wedge", to: "wedge", thickness: 0.022, delay: 0.18 },
];

const ROUTES: Array<{
  id: string;
  to: string;
  elbow: [number, number, number];
  speed: number;
  offset: number;
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
  { id: "route-fin", to: "fin", elbow: [1.06, 0.14, 0.1], speed: 0.31, offset: 0.86, rest: 0.18 },
];

/**
 * NOVO (Direção B) — conexões module→module ("relays"), disparadas em
 * cadeia logo depois de cada batimento principal. É o que muda a leitura de
 * "spokes saindo de um centro" para "rede: os módulos também conversam
 * entre si". `deck→wedge` existe também no conjunto mobile (ambos entram no
 * enquadramento simplificado); `block→fin` só roda no desktop.
 */
const RELAYS: Array<{ id: string; from: string; to: string; elbow: [number, number, number] }> = [
  { id: "relay-deck-wedge", from: "deck", to: "wedge", elbow: [1.02, -0.94, 1.32] },
  { id: "relay-block-fin", from: "block", to: "fin", elbow: [0.62, 0.72, 0.24] },
];

const T_EMITTER = 0.12;
const T_CORE_FRAME = 0.2;
const T_CORE_LOCK = 0.3;
const T_PRIMARY = 0.32;
const T_STRUT = 0.7;
const T_SECONDARY = 0.6;
const T_PANEL = 0.78;
const T_ENERGY = 0.95;
const T_STABLE = 1.62;

/**
 * NOVO (Direção B) — batimento periódico em vez de surge único + loop lento.
 * A primeira ativação (a partir de T_ENERGY) usa a mesma coreografia do
 * surge original; a partir daí ela SE REPETE a cada HEARTBEAT_PERIOD
 * segundos, com uma pausa em repouso (`rest`) entre um batimento e o
 * próximo — é a pausa que torna o pulso seguinte legível como evento, não
 * como ruído constante.
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

function phase(elapsed: number, delay: number, duration: number) {
  return Math.min(1, Math.max(0, (elapsed - delay) / duration));
}

const CAMERA: Record<
  "desktop" | "mobile",
  { fov: number; pos: [number, number, number]; target: [number, number, number] }
> = {
  desktop: { fov: 31, pos: [0.02, 1.4, 5.3], target: [1.12, -0.18, 0] },
  mobile: { fov: 34, pos: [0.34, 0.62, 4.35], target: [0.78, -0.22, 0] },
};

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
}: {
  active: boolean;
  simplified: boolean;
  scrollRef: RefObject<number>;
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
  const moduleRefs = useRef<Array<THREE.Group | null>>([]);
  const recessRefs = useRef<Array<THREE.Mesh | null>>([]);
  const strutRefs = useRef<Array<THREE.Mesh | null>>([]);
  const pulseRefs = useRef<Array<THREE.Mesh | null>>([]);
  const chipRefs = useRef<Array<THREE.Mesh | null>>([]);
  const lineMatRefs = useRef<Array<THREE.LineBasicMaterial | null>>([]);
  const relayPulseRefs = useRef<Array<THREE.Mesh | null>>([]);
  const relayLineMatRefs = useRef<Array<THREE.LineBasicMaterial | null>>([]);

  const geometries = useMemo(() => {
    const coreOuter = rectShape(1.34, 1.0);
    coreOuter.holes.push(rectHole(0.92, 0.6));
    const coreMid = rectShape(0.98, 0.72);
    coreMid.holes.push(rectHole(0.66, 0.4, 0.04, -0.02));

    const deck = rectShape(1.46, 0.9);
    deck.holes.push(rectHole(0.84, 0.14, -0.18, 0.2));

    const gate = rectShape(0.86, 0.66);
    gate.holes.push(rectHole(0.5, 0.34, 0.13, 0.05));

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
      coreInner: new THREE.BoxGeometry(0.62, 0.4, 0.34),
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

  const materials = useMemo(() => {
    const energyBase = {
      color: ENERGY_COLOR,
      emissive: ENERGY_COLOR,
      toneMapped: false,
      roughness: 0.4,
      metalness: 0,
      fog: false,
    } as const;
    return {
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

  const routeGeometries = useMemo(
    () =>
      routes.map(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
        return geo;
      }),
    [routes],
  );

  const relayGeometries = useMemo(
    () =>
      relays.map(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
        return geo;
      }),
    [relays],
  );

  const scratch = useMemo(
    () => ({
      dir: new THREE.Vector3(),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      axis: new THREE.Vector3(1, 0, 0),
      current: new Map<string, THREE.Vector3>(
        modules.map((m) => [m.id, new THREE.Vector3(...m.position)]),
      ),
      outward: new Map<string, THREE.Vector3>(
        modules.map((m) => [m.id, new THREE.Vector3(...m.position).sub(CORE_POSITION).normalize()]),
      ),
    }),
    [modules],
  );

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

    const t = active ? state.clock.elapsedTime : 999;
    const idle = active ? 1 : 0;
    const scrollT = active ? (scrollRef.current ?? 0) : 0;

    const emitterP = easeOutCubic(phase(t, T_EMITTER, 0.4));
    if (emitterRef.current) {
      emitterRef.current.position.y = -0.34 + emitterP * 0.34;
      emitterRef.current.scale.set(1, 0.25 + emitterP * 0.75, 1);
      const breath = 0.82 + Math.sin(t * 1.4) * 0.18 * idle;
      const surgeSpike = idle && t > T_ENERGY ? Math.exp(-(t - T_ENERGY) * 5.5) * 1.15 : 0;
      (emitterRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        emitterP * breath + surgeSpike;
    }

    const coreP = easeOutCubic(phase(t, T_CORE_FRAME, 0.42));
    if (coreFrameRef.current) {
      coreFrameRef.current.position.z = (1 - coreP) * 1.1;
      coreFrameRef.current.scale.setScalar(0.94 + coreP * 0.06);
    }

    if (coreMidRef.current) {
      const lockP = easeOutCubic(phase(t, T_CORE_LOCK, 0.43));
      const overshoot = Math.sin(lockP * Math.PI) * 0.055 * (1 - lockP);
      coreMidRef.current.rotation.z = 0.11 + (1 - lockP) * 0.46 - overshoot;
    }
    if (coreInnerRef.current) {
      coreInnerRef.current.scale.setScalar(coreP);
      coreInnerRef.current.rotation.z = Math.sin(t * 0.43) * 0.035 * idle;
      coreInnerRef.current.rotation.x = Math.sin(t * 0.29 + 0.8) * 0.05 * idle;
      coreInnerRef.current.position.z = -0.02 + Math.sin(t * 0.61) * 0.022 * idle;
    }
    if (coreGroupRef.current) {
      coreGroupRef.current.position.set(
        CORE_POSITION.x,
        CORE_POSITION.y - scrollT * 0.12,
        CORE_POSITION.z - scrollT * 0.5,
      );
    }

    modules.forEach((m, i) => {
      const ref = moduleRefs.current[i];
      const start = m.tier === "primary" ? T_PRIMARY : T_SECONDARY;
      const p = easeOutCubic(phase(t, start + m.delay, m.tier === "primary" ? 0.55 : 0.45));

      const outward = scratch.outward.get(m.id)!;
      const [amp, speed, ph] = m.breathe;
      const breathe = Math.sin(t * speed + ph) * amp * idle;
      const approach = (1 - p) * DOCK_DISTANCE[m.depth];
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
        ref.scale.setScalar(0.93 + p * 0.07);
        ref.visible = p > 0.002;
        const dock = (1 - p) * 0.5;
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

      const recess = recessRefs.current[i];
      if (recess && m.recess) {
        const openP = m.id === "deck" ? easeOutCubic(phase(t, T_PANEL, 0.4)) : 1;
        recess.position.x = openP * 0.14;
        recess.scale.x = m.recess.w * (1 - openP * 0.18);
      }

      const chip = chipRefs.current[i];
      if (chip) {
        chip.position.set(cur.x, cur.y, cur.z + 0.16);
        chip.scale.setScalar(p);
      }
    });

    struts.forEach((s, i) => {
      const mesh = strutRefs.current[i];
      if (!mesh) return;
      const target = scratch.current.get(s.to);
      if (!target) return;
      const corePos = coreGroupRef.current?.position ?? CORE_POSITION;
      scratch.dir.subVectors(target, corePos);
      const len = scratch.dir.length();
      const p = easeOutCubic(phase(t, T_STRUT + s.delay, 0.42));
      const grown = len * p;
      scratch.a.copy(corePos).addScaledVector(scratch.dir.normalize(), grown / 2);
      mesh.position.copy(scratch.a);
      mesh.quaternion.setFromUnitVectors(scratch.axis, scratch.dir);
      mesh.scale.set(Math.max(grown, 0.0001), s.thickness, s.thickness * 0.7);
      mesh.visible = p > 0.01;
    });

    // --- ENERGIA (Direção B): batimento periódico, não surge único + loop lento ---
    const sinceEnergy = active ? t - T_ENERGY : -1;
    const beatT = sinceEnergy >= 0 ? sinceEnergy % HEARTBEAT_PERIOD : -1;
    const inSurge = beatT >= 0 && beatT < SURGE_WINDOW;
    const preEnergy = t < T_ENERGY || !active;

    routes.forEach((r, i) => {
      const target = scratch.current.get(r.to);
      const geo = routeGeometries[i];
      const mat = lineMatRefs.current[i];
      if (!target || !geo) return;

      const corePos = coreGroupRef.current?.position ?? CORE_POSITION;
      const half = 0.5;
      const ex = r.elbow[0] + (target.x - MODULES.find((m) => m.id === r.to)!.position[0]) * half;
      const ey = r.elbow[1] + (target.y - MODULES.find((m) => m.id === r.to)!.position[1]) * half;
      const ez = r.elbow[2] + (target.z - MODULES.find((m) => m.id === r.to)!.position[2]) * half;

      const pos = geo.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, corePos.x, corePos.y, corePos.z);
      pos.setXYZ(1, ex, ey, ez);
      pos.setXYZ(2, target.x, target.y, target.z);
      pos.needsUpdate = true;

      const fadeStart = 0.1 + i * 0.11;
      const fadeK = Math.min(1, Math.max(0, (scrollT - fadeStart) / 0.26));
      // Estrutura sempre levemente visível em repouso (§ hierarquia): a rede
      // existe mesmo sem tráfego — só o TRÁFEGO é que é periódico.
      const restGlow = preEnergy ? 0 : r.rest * (1 - fadeK);
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
        // Sobe com a chegada do pulso e decai em seguida (mesma curva do original).
        const arrival =
          s > 0.85 ? Math.exp(-((s - 0.85) / 0.15) * 3.4) : Math.sin(s * Math.PI) * 0.4;
        chipMat.emissiveIntensity = 0.22 + arrival * 2.1;
      }
    });

    // --- RELAYS (Direção B): cadeia module→module logo após o batimento ---
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

    const idleRotY = Math.sin(t * 0.21) * 0.05 * idle;
    const idleRotX = Math.sin(t * 0.17 + 1.1) * 0.028 * idle;
    const settle = t > T_STABLE ? 1 : easeOutCubic(phase(t, T_PRIMARY, 1.4));
    group.rotation.y = -0.16 + idleRotY * settle + scrollT * 0.3;
    group.rotation.x = 0.03 + idleRotX * settle - scrollT * 0.14;
    group.position.y = -scrollT * 0.4;
  });

  return (
    <group ref={groupRef} scale={CORE_SCALE}>
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
        <pointLight
          position={[-0.14, 0, 0.16]}
          color={ENERGY_COLOR}
          intensity={NEUTRAL_TEST ? 0 : 0.34}
          distance={1.1}
          decay={2}
        />
      </group>

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

      {routes.map((r, i) => (
        <threeLine key={r.id} geometry={routeGeometries[i]}>
          <lineBasicMaterial
            ref={(m) => {
              lineMatRefs.current[i] = m;
            }}
            color={ENERGY_COLOR}
            transparent
            opacity={0}
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

function DigitalCoreSceneB({
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
  return (
    <Canvas
      dpr={[1, simplified ? 1 : 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={!active || paused ? "demand" : "always"}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("aria-hidden", "true");
        if (!onContextLost) return;
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}
    >
      <CameraRig mobile={simplified} active={active} pointerRef={pointerRef} />
      <fog attach="fog" args={["#0a0d0b", 5.2, 9.6]} />
      <ambientLight intensity={0.09} color="#c3ccc7" />
      <directionalLight position={[-2.4, 3.4, 3.6]} intensity={4.75} color="#f4f7f4" />
      <directionalLight position={[3.4, -1.4, 1.8]} intensity={0.3} color="#4a534e" />
      <directionalLight
        position={[2.2, 1.2, -3.4]}
        intensity={NEUTRAL_TEST ? 0.55 : 0.8}
        color={RIM_COLOR}
      />

      <ModularEngine active={active} simplified={simplified} scrollRef={scrollRef} />
    </Canvas>
  );
}

export { DigitalCoreSceneB };
