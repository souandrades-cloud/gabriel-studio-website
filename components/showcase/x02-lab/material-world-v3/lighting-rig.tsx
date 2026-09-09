"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

/**
 * LIGHTING V3 — briefing: "precisa produzir MATERIALIDADE", luz rasante
 * suficiente para bevels/recessos/grooves lerem sob luz. Quatro fontes,
 * cada uma com um papel (não "game level"): KEY grande e suave (não
 * pontual) revela volume geral; RAKING lateral quase horizontal é o que
 * de fato acende os chanfros e as frestas da parede (sem ela, o bevel de
 * `beveledBoxGeometry` fica invisível — luz frontal não pega aresta
 * nenhuma); FILL neutro evita sombras completamente pretas; RIM pontual
 * (baixa intensidade) separa silhueta do fundo em MONUMENTAL VIEW.
 *
 * "More alive" (briefing) interpretado como luz que respira, não efeito:
 * a KEY oscila ±4% de intensidade num ciclo de ~11s (`Math.sin`, sem
 * setState, sem re-render) — imperceptível como "efeito", perceptível como
 * ambiente não-estático em exposições longas.
 */
function LightingRigV3() {
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const baseKeyIntensity = 2.6;

  useFrame(({ clock }) => {
    const key = keyRef.current;
    if (!key) return;
    const breathe = Math.sin(clock.elapsedTime * ((2 * Math.PI) / 11)) * 0.04;
    key.intensity = baseKeyIntensity * (1 + breathe);
  });

  return (
    <>
      <ambientLight intensity={0.48} color="#8d9296" />
      <directionalLight
        ref={keyRef}
        position={[6, 12, 16]}
        intensity={baseKeyIntensity}
        color="#eef1f4"
      />
      {/* Raking — quase horizontal, ângulo raso: é ela que desenha o highlight
          nos chanfros do FRAME/colunas e a sombra reentrante das grooves. */}
      <directionalLight position={[-11, 2.4, 4]} intensity={1.5} color="#c9cfd2" />
      <directionalLight position={[8, -2, -10]} intensity={0.32} color="#3a4247" />
      <pointLight position={[-3, 6, -9]} intensity={18} distance={22} color="#cfd3d6" />
    </>
  );
}

export { LightingRigV3 };
