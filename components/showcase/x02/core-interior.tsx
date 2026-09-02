"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { beveledBoxGeometry, taperedColumnGeometry } from "./geometry-v3";
import { coreColumnStoneMaterial, dressingStoneMaterial, floorStoneMaterial } from "./materials-v3";
import { frameParts, CORE_Z_OFFSET, SHELL, FRAME_OPENING, type BoxSpec } from "./core-shell";

/**
 * EXPERIENCE DIRECTION V2 — CORE V2 PRODUCTION INTEGRATION. Promovido de
 * `x02-lab/core-v2/interior.tsx`, substituindo `interior.tsx` (campo de
 * colunas genérico) — COLUMN ROW rítmica + ECHO do FRAME (mesma peça de
 * `core-shell.tsx`, escala ~2.6x — "essa é a mesma porta, só que enorme",
 * reconhecimento não-verbal) + FAR WALL + FLOOR.
 *
 * COLUMN V3 — mesma técnica de `chamber.tsx` (Material World V3
 * Integration 001): `taperedColumnGeometry` assa a proporção na própria
 * geometria (nunca em `mesh.scale`), mesh individual — sem depender do
 * workaround `emissive` para existir visualmente, e a mesma linguagem
 * formal (afunilada) do COLUMN ROW de CHAMBER: parentesco de família, não
 * só de FRAME.
 */
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

type Column = { position: THREE.Vector3; height: number; width: number; tone: number };

const FLOOR_Y = -SHELL.halfHeight + SHELL.wallThickness;
/** Deliberadamente > SHELL.halfWidth (8) — o contraste já visível nas
 *  bordas do quadro em FIRST INTERIOR é uma das pistas redundantes de
 *  OUTSIDE < INSIDE. */
const COLUMN_X = SHELL.halfWidth + 3;
const COLUMN_TAPER = 0.62;

function generateColumns(perSide: number): Column[] {
  const rand = mulberry32(20260901);
  const columns: Column[] = [];
  const startZ = -3;
  const step = 62 / perSide;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < perSide; i++) {
      const z = startZ - i * step;
      const height = 9 + rand() * 24;
      const width = 0.6 + rand() * 0.35;
      columns.push({
        position: new THREE.Vector3(side * (COLUMN_X + rand() * 2), FLOOR_Y + height / 2, z),
        height,
        width,
        tone: rand(),
      });
    }
  }
  return columns;
}

/**
 * Janela de reveal em torno de CROSSING (t=0.82 na jornada principal, ver
 * camera-rig.tsx — era t=0.5 local no laboratório isolado, span
 * relativo preservado: começa pouco antes da travessia, termina já em
 * FIRST INTERIOR). Mesma técnica de dupla camada (opacity + espessura real
 * das jambas do SHELL) do laboratório — a névoa sozinha não impede o
 * interior de "vazar" em ângulos oblíquos de DISTANCE/APPROACH.
 */
const REVEAL_START = 0.8;
const REVEAL_END = 0.86;

/** Eco monumental do FRAME — mesma proporção do exterior (herda JAMB_SPLIT
 *  de core-shell.tsx via frameParts), escala ~2.6x. */
const ECHO_SCALE = 2.6;
const ECHO_Z = -50;
const ECHO_BEVEL = 0.3;

function ChamberColumnLike({
  mono,
}: {
  mono: { position: THREE.Vector3; height: number; width: number; tone: number };
}) {
  const topWidth = mono.width * COLUMN_TAPER;
  const geometry = useMemo(
    () => taperedColumnGeometry(mono.width, mono.width, topWidth, mono.height),
    [mono.width, topWidth, mono.height],
  );
  const material = useMemo(() => coreColumnStoneMaterial(mono.tone, true), [mono.tone]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <mesh geometry={geometry} material={material} position={mono.position} receiveShadow />;
}

function Interior({ mobile, scrollRef }: { mobile: boolean; scrollRef: RefObject<number> }) {
  const perSide = mobile ? 6 : 9;
  const columns = useMemo(() => generateColumns(perSide), [perSide]);

  const fieldGroupRef = useRef<THREE.Group>(null);

  const echoBoxes = useMemo<BoxSpec[]>(
    () =>
      frameParts(
        SHELL.halfWidth * ECHO_SCALE,
        SHELL.halfHeight * ECHO_SCALE,
        FRAME_OPENING.width * ECHO_SCALE,
        FRAME_OPENING.top * ECHO_SCALE,
        SHELL.wallThickness * 2,
        ECHO_Z,
      ),
    [],
  );
  const echoGeometries = useMemo(
    () => echoBoxes.map((b) => beveledBoxGeometry(...b.size, ECHO_BEVEL)),
    [echoBoxes],
  );
  const echoMaterial = useMemo(() => dressingStoneMaterial(), []);
  const echoGroupRef = useRef<THREE.Group>(null);

  const wallRef = useRef<THREE.Mesh>(null);
  const wallGeo = useMemo(() => new THREE.PlaneGeometry(96, 46), []);
  const wallMaterial = useMemo(() => dressingStoneMaterial(), []);

  const floorRef = useRef<THREE.Mesh>(null);
  const floorGeo = useMemo(() => new THREE.PlaneGeometry(70, 150), []);
  const floorMaterial = useMemo(() => floorStoneMaterial(), []);

  useFrame(() => {
    const t = scrollRef.current ?? 0;
    const reveal = THREE.MathUtils.smoothstep(t, REVEAL_START, REVEAL_END);
    // LIGHT FOUNDATION 001: castShadow segue a mesma janela de reveal —
    // mesmo raciocínio de chamber.tsx/core-shell.tsx. Far wall/floor ficam
    // de fora do cast (são as superfícies de fundo/contato, não massas que
    // deveriam projetar sombra sobre outra coisa).
    const visible = reveal > 0.05;
    const field = fieldGroupRef.current;
    if (field) {
      field.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).opacity = reveal;
          child.castShadow = visible;
        }
      });
    }
    const echoGroup = echoGroupRef.current;
    if (echoGroup) {
      echoGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).opacity = reveal;
          child.castShadow = visible;
        }
      });
    }
    const wall = wallRef.current;
    if (wall) (wall.material as THREE.MeshStandardMaterial).opacity = reveal * 0.85;
    const floor = floorRef.current;
    if (floor) (floor.material as THREE.MeshStandardMaterial).opacity = reveal;
  });

  useEffect(() => {
    return () => {
      echoGeometries.forEach((g) => g.dispose());
      echoMaterial.dispose();
      wallGeo.dispose();
      wallMaterial.dispose();
      floorGeo.dispose();
      floorMaterial.dispose();
    };
  }, [echoGeometries, echoMaterial, wallGeo, wallMaterial, floorGeo, floorMaterial]);

  return (
    <group position={[0, 0, CORE_Z_OFFSET]}>
      <group ref={fieldGroupRef}>
        {columns.map((c, i) => (
          <ChamberColumnLike key={i} mono={c} />
        ))}
      </group>
      <group ref={echoGroupRef}>
        {echoBoxes.map((b, i) => (
          <mesh
            key={i}
            geometry={echoGeometries[i]}
            material={echoMaterial}
            position={b.position}
            receiveShadow
          />
        ))}
      </group>
      <mesh
        ref={wallRef}
        geometry={wallGeo}
        material={wallMaterial}
        position={[0, 6, -72]}
        receiveShadow
      />
      <mesh
        ref={floorRef}
        geometry={floorGeo}
        material={floorMaterial}
        position={[0, FLOOR_Y, -75]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      />
    </group>
  );
}

export { Interior };
