"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { beveledBoxGeometry } from "./geometry-v3";
import { frameStoneMaterial, metalAccentMaterial } from "./materials-v3";

/**
 * EXPERIENCE DIRECTION V2 — CORE V2 PRODUCTION INTEGRATION. Promovido de
 * `x02-lab/core-v2/shell.tsx` — volume fechado com uma única abertura (o
 * FRAME), substituindo a leitura por inferência de `structure.tsx` (duas
 * lajes soltas) por um objeto literalmente fechado: paredes laterais, teto
 * e piso reais, só a fachada frontal tem uma passagem. Sem parede de fundo
 * (Z negativo) DE PROPÓSITO — mesmo raciocínio do laboratório: a névoa e o
 * reveal por opacidade de `core-interior.tsx` escondem essa ausência, e é
 * ela que deixa o interior se estender muito além do que o SHELL aparenta
 * ter, sem nenhuma parede física bloqueando a travessia.
 *
 * FRAME LINEAGE (Experience Direction V2, "Visual Landmark Continuity"):
 * `JAMB_SPLIT` é o MESMO valor de assimetria de jambas do THRESHOLD FRAME
 * (`descent-gates.tsx`, 0.58/0.42) — não um clone, mas parentesco formal
 * real (a mesma proporção herdada no código, não só na descrição). Bevel +
 * soleira em metal (mesma técnica/tokens de `descent-gates.tsx`) fecham a
 * linhagem: FRAME → CHAMBER HERO LANDMARK → CORE FRAME.
 */
const SHELL = {
  halfWidth: 8,
  halfHeight: 6.5,
  halfDepth: 7,
  wallThickness: 1.2,
};

const FRAME_OPENING = {
  width: 4.4,
  /** Do piso até este Y — a abertura chega ao chão, sem soleira alta. */
  top: 0.5,
};

const JAMB_SPLIT = 0.58;
const FRAME_BEVEL = 0.16;
const WALL_BEVEL = 0.1;

/**
 * CORE V2 PRODUCTION INTEGRATION — mesma translação rígida em Z aplicada às
 * poses de câmera em `camera-rig.tsx` (ver o comentário lá para a
 * justificativa completa: reposiciona o palco inteiro para fora do
 * território de DESCENT/FRACTURE). Aplicada aqui como um offset de grupo
 * único (não em cada coordenada individual) para o SHELL continuar
 * exatamente a mesma geometria validada do laboratório — só "onde" ele
 * existe no mundo muda. `core-interior.tsx` importa o mesmo valor.
 */
const CORE_Z_OFFSET = -36;

/** Beat perceptivo de DISTANCE: o SHELL emerge do VOID em vez de aparecer
 *  de repente — "algo pequeno aparece" precisa ser um evento visto, não um
 *  pop instantâneo. Termina antes do keyframe "Distance" da câmera (t=0.68,
 *  ver camera-rig.tsx) para já estar visível quando a pose se assenta. */
const SHELL_REVEAL_START = 0.64;
const SHELL_REVEAL_END = 0.685;

type BoxSpec = {
  size: readonly [number, number, number];
  position: readonly [number, number, number];
};

/** Centro real do vão dado o par de jambas assimétrico — mesma fórmula
 *  usada por `descent-gates.tsx` (não é mais `0`). Exportada para a soleira
 *  (abaixo) e para `core-interior.tsx` reusarem sem duplicar a conta. */
function frameOpeningCenterX(outerHalfWidth: number, openingWidth: number): number {
  const totalJambWidth = outerHalfWidth * 2 - openingWidth;
  const leftJambWidth = totalJambWidth * JAMB_SPLIT;
  const rightJambWidth = totalJambWidth * (1 - JAMB_SPLIT);
  return (leftJambWidth - rightJambWidth) / 2;
}

/**
 * Gera as 3 peças de uma moldura (2 ombreiras + verga), jambas assimétricas
 * (`JAMB_SPLIT`). Reaproveitada por `core-interior.tsx` para o eco
 * monumental do FRAME lá dentro — mesma função, escala diferente (Visual
 * World System V2: um landmark, proporção sempre idêntica).
 */
function frameParts(
  outerHalfWidth: number,
  outerHalfHeight: number,
  openingWidth: number,
  openingTop: number,
  depth: number,
  centerZ: number,
): BoxSpec[] {
  const totalJambWidth = outerHalfWidth * 2 - openingWidth;
  const leftJambWidth = totalJambWidth * JAMB_SPLIT;
  const rightJambWidth = totalJambWidth * (1 - JAMB_SPLIT);
  const headerHeight = outerHalfHeight - openingTop;
  const openingCenterX = frameOpeningCenterX(outerHalfWidth, openingWidth);
  return [
    {
      size: [leftJambWidth, outerHalfHeight * 2, depth],
      position: [-outerHalfWidth + leftJambWidth / 2, 0, centerZ],
    },
    {
      size: [rightJambWidth, outerHalfHeight * 2, depth],
      position: [outerHalfWidth - rightJambWidth / 2, 0, centerZ],
    },
    {
      size: [openingWidth, headerHeight, depth],
      position: [openingCenterX, openingTop + headerHeight / 2, centerZ],
    },
  ];
}

function Shell({ scrollRef }: { scrollRef: RefObject<number> }) {
  const frontZ = SHELL.halfDepth - SHELL.wallThickness / 2;

  // Bevel maior nas 3 peças do FRAME (índices 0-2, ver `frameParts`) que no
  // resto do SHELL — o mesmo tratamento diferenciado de descent-gates.tsx
  // (jambBevel vs. lipBevel): o FRAME é o landmark, precisa da leitura de
  // aresta mais pronunciada.
  const FRAME_PART_COUNT = 3;

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

  const geometries = useMemo(
    () =>
      boxes.map((b, i) =>
        beveledBoxGeometry(...b.size, i < FRAME_PART_COUNT ? FRAME_BEVEL : WALL_BEVEL),
      ),
    [boxes],
  );
  // `transparent=true`: o SHELL precisa emergir do VOID (ver useFrame
  // abaixo), diferente do FRAME/HERO_MASSES de THRESHOLD/CHAMBER que usam
  // este mesmo helper sempre opaco.
  const material = useMemo(() => frameStoneMaterial(true), []);

  // Soleira em metal escovado — único detalhe metálico do SHELL, mesma
  // convenção "apenas em detalhes" do THRESHOLD FRAME.
  const sillGeometry = useMemo(
    () => beveledBoxGeometry(FRAME_OPENING.width * 0.94, 0.14, SHELL.wallThickness * 0.7, 0.03),
    [],
  );
  const sillMaterial = useMemo(() => metalAccentMaterial(true), []);

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = scrollRef.current ?? 0;
    const opacity = THREE.MathUtils.smoothstep(t, SHELL_REVEAL_START, SHELL_REVEAL_END);
    const group = groupRef.current;
    if (!group) return;
    // LIGHT FOUNDATION 001: castShadow segue a mesma janela de opacidade
    // (mesmo raciocínio de descent-gates.tsx/chamber.tsx) — sem isso, o
    // SHELL projetaria sombra opaca enquanto ainda emerge do VOID. Soleira
    // (metal, "apenas em detalhes") fica de fora do cast, mesma convenção
    // do THRESHOLD FRAME.
    const visible = opacity > 0.05;
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshStandardMaterial).opacity = opacity;
        child.castShadow = child.material !== sillMaterial && visible;
      }
    });
  });

  useEffect(() => {
    return () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
      sillGeometry.dispose();
      sillMaterial.dispose();
    };
  }, [geometries, material, sillGeometry, sillMaterial]);

  return (
    <group ref={groupRef} position={[0, 0, CORE_Z_OFFSET]}>
      {boxes.map((b, i) => (
        <mesh
          key={i}
          geometry={geometries[i]}
          material={material}
          position={b.position}
          receiveShadow
        />
      ))}
      {/* Soleira em metal, "apenas em detalhes": fora de cast E receive —
          sob VSMShadowMap, receiveShadow=true também vira pseudo-caster no
          depth pass (ver comentário em descent-gates.tsx), custo sem ganho
          numa peça deste tamanho. */}
      <mesh
        geometry={sillGeometry}
        material={sillMaterial}
        position={[
          frameOpeningCenterX(SHELL.halfWidth, FRAME_OPENING.width),
          -SHELL.halfHeight + SHELL.wallThickness + 0.07,
          frontZ,
        ]}
      />
    </group>
  );
}

export {
  frameParts,
  Shell,
  CORE_Z_OFFSET,
  FRAME_BEVEL,
  FRAME_OPENING,
  JAMB_SPLIT,
  SHELL,
  WALL_BEVEL,
};
export type { BoxSpec };
