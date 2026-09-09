"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * Extrusão com chanfro leve — mesma técnica de
 * components/three/digital-core-scene.tsx, reescrita isoladamente aqui: o
 * laboratório precisa poder ser descartado sem acoplamento ao futuro X02
 * (ver briefing, "Arquitetura").
 */
function slabGeometry(w: number, h: number, d: number, bevel = 0.05) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, -h / 2);
  shape.lineTo(w / 2, -h / 2);
  shape.lineTo(w / 2, h / 2);
  shape.lineTo(-w / 2, h / 2);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 1,
  });
  geo.translate(0, 0, -d / 2);
  return geo;
}

/**
 * Duas lajes assimétricas (altura, profundidade em Z da face frontal e
 * inclinação diferentes) — de propósito, para não ler como um portal
 * simétrico ou um obelisco. Alturas/profundidades escolhidas para que a base
 * de ambas fique em y = -2 (mesmo nível do piso do interior, ver
 * interior.tsx) e a fenda entre as faces internas meça ≈1.1 unidade em
 * x ∈ [-0.4, 0.7] — estreita o bastante para ler como passagem, larga o
 * bastante para a câmera atravessar sem tocar a geometria.
 */
const SLAB_A = {
  size: [3.2, 24, 6.4] as const,
  position: [-2, 10, 0] as const,
  rotation: [0, 0.02, -0.008] as const,
};
const SLAB_B = {
  size: [2.6, 17, 6.4] as const,
  position: [2, 6.5, -0.6] as const,
  rotation: [0, -0.035, 0.01] as const,
};

/**
 * ESTRUTURA EXTERNA — "the impossible structure" vista de fora. A travessia
 * (CROSSING) NÃO usa clipping, stencil, shader ou troca de cena: é
 * literalmente a câmera passando pela fenda entre as duas lajes, um espaço
 * vazio que já existe na geometria. É a solução mais simples que resolve a
 * continuidade espacial pedida no briefing — ver camera-rig.tsx.
 */
function Structure() {
  const geoA = useMemo(() => slabGeometry(...SLAB_A.size), []);
  const geoB = useMemo(() => slabGeometry(...SLAB_B.size), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1d2224", roughness: 0.78, metalness: 0.14 }),
    [],
  );
  // Traço vertical discreto ao longo da fenda — sinaliza o threshold sem
  // virar decoração sci-fi: sem neon, intensidade mínima, cor fria neutra.
  const edgeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0d1112",
        emissive: "#3a4750",
        emissiveIntensity: 0.45,
        roughness: 0.6,
        metalness: 0.2,
        toneMapped: false,
      }),
    [],
  );
  const edgeGeo = useMemo(() => new THREE.BoxGeometry(0.02, 22, 6.6), []);

  useEffect(() => {
    return () => {
      geoA.dispose();
      geoB.dispose();
      material.dispose();
      edgeMaterial.dispose();
      edgeGeo.dispose();
    };
  }, [geoA, geoB, material, edgeMaterial, edgeGeo]);

  return (
    <group>
      <mesh
        geometry={geoA}
        material={material}
        position={SLAB_A.position}
        rotation={SLAB_A.rotation}
      />
      <mesh
        geometry={geoB}
        material={material}
        position={SLAB_B.position}
        rotation={SLAB_B.rotation}
      />
      <mesh geometry={edgeGeo} material={edgeMaterial} position={[-0.42, 9, 0]} />
      <mesh geometry={edgeGeo} material={edgeMaterial} position={[0.72, 9, 0]} />
    </group>
  );
}

export { Structure };
