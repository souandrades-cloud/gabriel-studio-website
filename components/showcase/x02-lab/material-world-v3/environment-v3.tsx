"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

import { beveledBoxGeometry } from "./geometry";
import { dressingStoneMaterial, floorStoneMaterial } from "./materials";

/**
 * WALL/PLANE V3 — briefing: "não queremos paredes perfeitamente lisas e
 * vazias o tempo inteiro". A parede-herói recebe duas frestas verticais
 * (grooves) — não geometria entalhada de verdade (custo desnecessário para
 * uma leitura que a PROFUNDIDADE já entrega): uma faixa fina do material
 * `stoneDark` posicionada um pouco atrás do plano frontal da parede. Sob
 * luz rasante, o degrau de profundidade já lê como sombra reentrante —
 * mesmo princípio físico de uma junta arquitetônica real, sem entalhar a
 * geometria principal (mantém a parede como uma única peça bevelada).
 */
const WALL_WIDTH = 14;
const WALL_HEIGHT = 9;
const WALL_THICKNESS = 0.6;
const GROOVE_WIDTH = 0.42;
const GROOVE_INSET = 0.07;

const FLOOR_SIZE: [number, number] = [26, 30];
const CEILING_SIZE: [number, number] = [26, 20];

function EnvironmentV3({ wallPosition }: { wallPosition: readonly [number, number, number] }) {
  const wallGeo = useMemo(
    () => beveledBoxGeometry(WALL_WIDTH, WALL_HEIGHT, WALL_THICKNESS, 0.1),
    [],
  );
  const grooveGeo = useMemo(
    () => new THREE.BoxGeometry(GROOVE_WIDTH, WALL_HEIGHT * 0.86, 0.05),
    [],
  );
  const floorGeo = useMemo(() => new THREE.PlaneGeometry(...FLOOR_SIZE), []);
  const ceilingGeo = useMemo(() => new THREE.PlaneGeometry(...CEILING_SIZE), []);

  const wallMaterial = useMemo(() => dressingStoneMaterial(), []);
  const grooveMaterial = useMemo(() => dressingStoneMaterial(), []);
  const floorMaterial = useMemo(() => floorStoneMaterial(), []);
  const ceilingMaterial = useMemo(() => floorStoneMaterial(), []);

  useEffect(() => {
    return () => {
      wallGeo.dispose();
      grooveGeo.dispose();
      floorGeo.dispose();
      ceilingGeo.dispose();
      wallMaterial.dispose();
      grooveMaterial.dispose();
      floorMaterial.dispose();
      ceilingMaterial.dispose();
    };
  }, [
    wallGeo,
    grooveGeo,
    floorGeo,
    ceilingGeo,
    wallMaterial,
    grooveMaterial,
    floorMaterial,
    ceilingMaterial,
  ]);

  const [wx, wy, wz] = wallPosition;

  return (
    <group>
      <mesh geometry={wallGeo} material={wallMaterial} position={[wx, wy, wz]} />
      <mesh
        geometry={grooveGeo}
        material={grooveMaterial}
        position={[wx - WALL_WIDTH * 0.16, wy, wz + WALL_THICKNESS / 2 - GROOVE_INSET]}
      />
      <mesh
        geometry={grooveGeo}
        material={grooveMaterial}
        position={[wx + WALL_WIDTH * 0.27, wy, wz + WALL_THICKNESS / 2 - GROOVE_INSET]}
      />
      <mesh
        geometry={floorGeo}
        material={floorMaterial}
        position={[0, 0, 6]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <mesh
        geometry={ceilingGeo}
        material={ceilingMaterial}
        position={[0, 11.5, 4]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

export { EnvironmentV3 };
