"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * EXPERIMENTO A — cena mínima atrás da costura. Deliberadamente estática
 * (sem câmera dirigida por scroll): a hipótese em teste é o COMPOSITING
 * DOM↔Canvas, não movimento de câmera — mantê-la parada isola a variável.
 * Só três formas verticais simples em profundidades diferentes, com névoa —
 * o mínimo que ainda lê como "havia espaço aqui", sem reaproveitar a
 * geometria do protótipo 001 (isolamento entre experimentos).
 */
/*
 * Achado do experimento: com o campo de visão totalmente aberto, formas
 * posicionadas perto do centro liam como um eco dos próprios painéis DOM
 * que acabaram de sair de cena — a revelação parecia pouco diferente do
 * estado anterior. Espalhadas mais largo e mais fundo (com uma quarta forma
 * quase perdida na névoa), a leitura passa a ser genuinamente "havia um
 * espaço aqui", não "as mesmas duas barras".
 */
const FORMS: Array<{ size: [number, number, number]; position: [number, number, number] }> = [
  { size: [2, 9, 1.6], position: [-4.2, 2.5, -1] },
  { size: [1.6, 12, 1.6], position: [3.4, 4, -5] },
  { size: [1.4, 7, 1.2], position: [-1.6, 1.5, -9] },
  { size: [1.1, 6, 1.1], position: [5.4, 1, -13] },
];

function DepthForms() {
  const geometries = useMemo(() => FORMS.map((f) => new THREE.BoxGeometry(...f.size)), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#20262a", roughness: 0.8, metalness: 0.12 }),
    [],
  );

  useEffect(() => {
    return () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    };
  }, [geometries, material]);

  return (
    <>
      {FORMS.map((f, i) => (
        <mesh key={i} geometry={geometries[i]} material={material} position={f.position} />
      ))}
    </>
  );
}

function ThresholdScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ position: [0, 2.4, 9], fov: 42, near: 0.1, far: 60 }}
      frameloop="always"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => gl.domElement.setAttribute("aria-hidden", "true")}
    >
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 4, 24]} />
      <ambientLight intensity={0.3} color="#aab4b0" />
      <directionalLight position={[-4, 8, 6]} intensity={2} color="#eef2f0" />
      <directionalLight position={[5, -2, -3]} intensity={0.25} color="#39423f" />
      <DepthForms />
    </Canvas>
  );
}

export { ThresholdScene };
