"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * THE SHELL — volume fechado com uma única abertura (o FRAME), substituindo
 * a lógica de "duas lajes com fenda" do Prototype 001 (ver
 * components/showcase/x02-lab/structure.tsx). Ali a leitura de "objeto
 * fechado" dependia de inferência (duas massas soltas, sem topo/base/fundo);
 * aqui o volume é literal — paredes laterais, teto e piso realmente fecham
 * o exterior, e a única passagem é a abertura frontal com espessura real.
 *
 * Sem parede de fundo (Z negativo) DE PROPÓSITO: por fora, a abertura
 * frontal é estreita demais em qualquer ângulo/distância de DISTANCE a
 * PRE-CROSSING para revelar essa ausência — a névoa + o reveal por opacidade
 * do interior (ver interior.tsx) escondem que o volume "continua aberto"
 * por trás. É essa ausência que deixa o interior se estender muito além da
 * profundidade que o SHELL aparenta ter, sem nenhuma parede física
 * bloqueando a câmera na travessia.
 */
const SHELL = {
  halfWidth: 8,
  halfHeight: 6.5,
  halfDepth: 7,
  wallThickness: 1.2,
};

const FRAME_OPENING = {
  width: 4.4,
  /** Do piso até este Y — a abertura chega ao chão, sem soleira. */
  top: 0.5,
};

type BoxSpec = {
  size: readonly [number, number, number];
  position: readonly [number, number, number];
};

/**
 * Gera as 3 peças de uma moldura (2 ombreiras + verga) com espessura real ao
 * longo de Z. Reaproveitada por interior.tsx para o eco monumental do FRAME
 * lá dentro — mesma função, parâmetros de escala diferentes (Visual World
 * System V2: um landmark, proporção sempre idêntica).
 */
function frameParts(
  outerHalfWidth: number,
  outerHalfHeight: number,
  openingWidth: number,
  openingTop: number,
  depth: number,
  centerZ: number,
): BoxSpec[] {
  const jambWidth = outerHalfWidth - openingWidth / 2;
  const jambX = openingWidth / 2 + jambWidth / 2;
  const headerHeight = outerHalfHeight - openingTop;
  return [
    { size: [jambWidth, outerHalfHeight * 2, depth], position: [-jambX, 0, centerZ] },
    { size: [jambWidth, outerHalfHeight * 2, depth], position: [jambX, 0, centerZ] },
    {
      size: [openingWidth, headerHeight, depth],
      position: [0, openingTop + headerHeight / 2, centerZ],
    },
  ];
}

function Shell() {
  const frontZ = SHELL.halfDepth - SHELL.wallThickness / 2;

  const boxes = useMemo<BoxSpec[]>(() => {
    const front = frameParts(
      SHELL.halfWidth,
      SHELL.halfHeight,
      FRAME_OPENING.width,
      FRAME_OPENING.top,
      SHELL.wallThickness,
      frontZ,
    );
    const leftWall: BoxSpec = {
      size: [SHELL.wallThickness, SHELL.halfHeight * 2, SHELL.halfDepth * 2],
      position: [-SHELL.halfWidth + SHELL.wallThickness / 2, 0, 0],
    };
    const rightWall: BoxSpec = {
      size: [SHELL.wallThickness, SHELL.halfHeight * 2, SHELL.halfDepth * 2],
      position: [SHELL.halfWidth - SHELL.wallThickness / 2, 0, 0],
    };
    const roof: BoxSpec = {
      size: [SHELL.halfWidth * 2, SHELL.wallThickness, SHELL.halfDepth * 2],
      position: [0, SHELL.halfHeight - SHELL.wallThickness / 2, 0],
    };
    const floor: BoxSpec = {
      size: [SHELL.halfWidth * 2, SHELL.wallThickness, SHELL.halfDepth * 2],
      position: [0, -SHELL.halfHeight + SHELL.wallThickness / 2, 0],
    };
    return [...front, leftWall, rightWall, roof, floor];
  }, [frontZ]);

  const geometries = useMemo(() => boxes.map((b) => new THREE.BoxGeometry(...b.size)), [boxes]);
  // Mesma lição da Visibility + Lighting Calibration 001 de X02 (ver
  // components/showcase/x02/structure.tsx): um tom mineral escuro só lê
  // como "mineral" com luz raking suficiente E uma cor-base já levantada —
  // não confiar só na luz para tirar a superfície do preto.
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#4a463c", roughness: 0.88, metalness: 0.07 }),
    [],
  );

  useEffect(() => {
    return () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    };
  }, [geometries, material]);

  return (
    <group>
      {boxes.map((b, i) => (
        <mesh key={i} geometry={geometries[i]} material={material} position={b.position} />
      ))}
    </group>
  );
}

export { Shell, frameParts, SHELL, FRAME_OPENING };
export type { BoxSpec };
