"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { FRAME_OPENING, SHELL, frameParts, type BoxSpec } from "./shell";

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

type Column = { position: THREE.Vector3; height: number; width: number };

const FLOOR_Y = -SHELL.halfHeight + SHELL.wallThickness;
/** Deliberadamente > SHELL.halfWidth (8) — o contraste já visível nas
 *  bordas do quadro em FIRST INTERIOR é uma das pistas redundantes de
 *  OUTSIDE < INSIDE (Visual World System V2, item 12.8-C). */
const COLUMN_X = SHELL.halfWidth + 3;

/**
 * COLUMN ROW — fileira RÍTMICA, não campo aleatório (Visual World System
 * V2, "gramática espacial": COLUMN = "escala/profundidade", sempre em
 * ritmo). Espaçamento em Z é regular; só a altura recebe uma variação
 * determinística pequena, o bastante para não ler como grade digital.
 */
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
      });
    }
  }
  return columns;
}

/**
 * Janela de reveal em torno do CROSSING (t=0.5, ver camera-rig.tsx). Mesma
 * técnica e mesmo motivo do Prototype 001 (interior.tsx de
 * components/showcase/x02-lab): a névoa sozinha não impede o interior de
 * "vazar" em ângulos oblíquos de DISTANCE/APPROACH quando o SHELL não tem
 * parede de fundo — o opacity ramp é a segunda camada de controle,
 * combinada com a espessura real das jambas (que já limita o ângulo de
 * visão possível pela abertura a essas distâncias).
 */
const REVEAL_START = 0.46;
const REVEAL_END = 0.58;

/** Eco monumental do FRAME — mesma proporção do exterior, escala ~2.6x.
 *  Reconhecimento não-verbal: "essa é a mesma porta, só que enorme". */
const ECHO_SCALE = 2.6;
const ECHO_Z = -50;

function Interior({ mobile, scrollRef }: { mobile: boolean; scrollRef: RefObject<number> }) {
  const perSide = mobile ? 6 : 9;
  const columns = useMemo(() => generateColumns(perSide), [perSide]);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const columnGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  // Primeiro teste visual saiu quase totalmente preto — mesma lição da
  // Visibility + Lighting Calibration 001 de X02: cor-base escura demais não
  // sai do preto só com luz direcional. Levantada (ver shell.tsx).
  const columnMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#565a52",
        roughness: 0.85,
        metalness: 0.05,
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    columns.forEach((c, i) => {
      q.identity();
      m.compose(c.position, q, new THREE.Vector3(c.width, c.height, c.width));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [columns]);

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
    () => echoBoxes.map((b) => new THREE.BoxGeometry(...b.size)),
    [echoBoxes],
  );
  const echoMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#4c4e46",
        roughness: 0.88,
        metalness: 0.05,
        transparent: true,
        opacity: 0,
      }),
    [],
  );
  const echoGroupRef = useRef<THREE.Group>(null);

  const wallRef = useRef<THREE.Mesh>(null);
  const wallGeo = useMemo(() => new THREE.PlaneGeometry(96, 46), []);
  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#4a4c44",
        roughness: 0.92,
        metalness: 0.03,
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  const floorRef = useRef<THREE.Mesh>(null);
  const floorGeo = useMemo(() => new THREE.PlaneGeometry(70, 150), []);
  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#26282a",
        roughness: 0.95,
        metalness: 0.02,
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  useFrame(() => {
    const t = scrollRef.current ?? 0;
    const reveal = THREE.MathUtils.smoothstep(t, REVEAL_START, REVEAL_END);
    const mesh = meshRef.current;
    const echoGroup = echoGroupRef.current;
    const wall = wallRef.current;
    const floor = floorRef.current;
    if (mesh) (mesh.material as THREE.MeshStandardMaterial).opacity = reveal;
    // Mutação via ref para o objeto three.js montado (não a variável do
    // useMemo diretamente) — mesmo padrão de mesh/wall/floor abaixo,
    // exigido pelo React Compiler (ver comentário equivalente em
    // components/showcase/x02/chamber.tsx).
    if (echoGroup) {
      echoGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).opacity = reveal;
        }
      });
    }
    if (wall) (wall.material as THREE.MeshStandardMaterial).opacity = reveal * 0.85;
    if (floor) (floor.material as THREE.MeshStandardMaterial).opacity = reveal;
  });

  useEffect(() => {
    return () => {
      columnGeo.dispose();
      columnMaterial.dispose();
      echoGeometries.forEach((g) => g.dispose());
      echoMaterial.dispose();
      wallGeo.dispose();
      wallMaterial.dispose();
      floorGeo.dispose();
      floorMaterial.dispose();
    };
  }, [
    columnGeo,
    columnMaterial,
    echoGeometries,
    echoMaterial,
    wallGeo,
    wallMaterial,
    floorGeo,
    floorMaterial,
  ]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[columnGeo, columnMaterial, columns.length]} />
      <group ref={echoGroupRef}>
        {echoBoxes.map((b, i) => (
          <mesh
            key={i}
            geometry={echoGeometries[i]}
            material={echoMaterial}
            position={b.position}
          />
        ))}
      </group>
      <mesh ref={wallRef} geometry={wallGeo} material={wallMaterial} position={[0, 6, -72]} />
      <mesh
        ref={floorRef}
        geometry={floorGeo}
        material={floorMaterial}
        position={[0, FLOOR_Y, -75]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

export { Interior };
