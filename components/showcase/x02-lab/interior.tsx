"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * PRNG determinística (mulberry32) — a cena só existe no cliente (Canvas
 * importado com `ssr: false`, ver experience.tsx), então não há risco de
 * mismatch de hidratação; a semente fixa só evita que o layout das colunas
 * "pisque" diferente a cada hot reload durante o desenvolvimento.
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

type ColumnLayout = { position: THREE.Vector3; height: number; width: number; rotationY: number };

/**
 * Gera as verticais do interior: recuam de -6 a -74 (nunca resolvem um
 * "fundo" antes do fog), abrem lateralmente à medida que se afastam (bem
 * além da largura de 1,1 unidade da fenda externa — é esse contraste, não
 * decoração, que carrega o OUTSIDE < INSIDE) e variam em altura o bastante
 * para algumas sumirem na névoa sem um "teto" legível.
 */
function generateColumns(count: number): ColumnLayout[] {
  const rand = mulberry32(20260831);
  const columns: ColumnLayout[] = [];
  for (let i = 0; i < count; i++) {
    const depth = -6 - rand() * 68;
    const spread = 8 + (Math.abs(depth) / 74) * 34;
    const x = (rand() - 0.5) * 2 * spread;
    const height = 14 + rand() * 78;
    const width = 0.4 + rand() * 0.9;
    columns.push({
      position: new THREE.Vector3(x, height / 2 - 2, depth),
      height,
      width,
      rotationY: (rand() - 0.5) * 0.06,
    });
  }
  return columns;
}

/**
 * Janela de scroll em que o interior aparece — não antes. As duas lajes de
 * structure.tsx não formam uma fachada contínua (são massas isoladas no
 * vazio), então nada bloqueia fisicamente a visão das colunas largas por
 * trás/ao redor delas a partir de longe (§ bug encontrado no lab: o
 * interior "vazava" já em DISTANCE). Em vez de inflar a fachada externa —
 * o que destruiria a leitura de exterior compacto — o interior só fica
 * opaco perto do CROSSING (0.55): a revelação acontece exatamente quando a
 * câmera está dentro da fenda, mascarada pela proximidade das lajes.
 */
const REVEAL_START = 0.5;
const REVEAL_END = 0.6;

/**
 * INTERIOR IMPOSSÍVEL — arquitetura procedural repetida num único
 * InstancedMesh (um draw call para todas as colunas, ver briefing
 * "Performance"). Sem teto, sem parede de fundo legível: o que fecha o
 * espaço é só a névoa da cena (ver scene.tsx).
 */
function Interior({ mobile, scrollRef }: { mobile: boolean; scrollRef: RefObject<number> }) {
  const count = mobile ? 26 : 46;
  const columns = useMemo(() => generateColumns(count), [count]);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#343c3e",
        roughness: 0.82,
        metalness: 0.06,
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
      q.setFromEuler(new THREE.Euler(0, c.rotationY, 0));
      m.compose(c.position, q, new THREE.Vector3(c.width, c.height, c.width));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [columns]);

  const floorRef = useRef<THREE.Mesh>(null);
  const floorGeo = useMemo(() => new THREE.PlaneGeometry(220, 220), []);
  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0a0c0d",
        roughness: 0.95,
        metalness: 0.02,
        transparent: true,
        opacity: 0,
      }),
    [],
  );

  useFrame(() => {
    // Lido pelos refs das meshes, nunca pelo objeto do useMemo (mesmo padrão
    // de components/three/digital-core-scene.tsx): mutar o retorno de um
    // hook por frame é o que o React Compiler proíbe.
    const t = scrollRef.current ?? 0;
    const reveal = THREE.MathUtils.smoothstep(t, REVEAL_START, REVEAL_END);
    const mesh = meshRef.current;
    const floor = floorRef.current;
    if (mesh) (mesh.material as THREE.MeshStandardMaterial).opacity = reveal;
    if (floor) (floor.material as THREE.MeshStandardMaterial).opacity = reveal;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      floorGeo.dispose();
      floorMaterial.dispose();
    };
  }, [geometry, material, floorGeo, floorMaterial]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[geometry, material, count]} />
      <mesh
        ref={floorRef}
        geometry={floorGeo}
        material={floorMaterial}
        position={[0, -2, -40]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

export { Interior };
