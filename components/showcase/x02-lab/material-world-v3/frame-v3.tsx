"use client";

import { useEffect, useMemo } from "react";

import { archedHeaderGeometry, beveledBoxGeometry } from "./geometry";
import { dressingStoneMaterial, frameStoneMaterial, metalAccentMaterial } from "./materials";

export type FormVariant = "A" | "B";

/**
 * FRAME V3 — briefing: "não 4 caixas ao redor de um buraco", precisa
 * parecer UMA PEÇA ARQUITETÔNICA. Jambas assimétricas (mesma técnica de
 * `x02/descent-gates.tsx`, reaproveitada) + chanfro real (`beveledBoxGeometry`)
 * + uma segunda camada recuada visível através do vão (profundidade real,
 * não pintada) + uma soleira em metal (único detalhe metálico, briefing
 * "Material": "apenas em detalhes"). Variant A mantém o header reto
 * chanfrado; Variant B substitui por `archedHeaderGeometry` — a
 * "intervenção curva dominante" pedida para o estudo B, com a MESMA
 * pegada externa (mesma largura de banda, mesma altura), para a
 * comparação lado a lado ser justa.
 */
const OUTER_WIDTH = 8;
const OUTER_HEIGHT = 12.5;
const THICKNESS = 2.6;
const OPENING_WIDTH = OUTER_WIDTH * 0.42;
const SPRINGLINE = OUTER_HEIGHT * 0.62;
const BEVEL = 0.14;

function FrameV3({
  variant,
  position = [0, 0, 0] as [number, number, number],
}: {
  variant: FormVariant;
  position?: [number, number, number];
}) {
  const totalJambWidth = OUTER_WIDTH - OPENING_WIDTH;
  const leftJambWidth = totalJambWidth * 0.58;
  const rightJambWidth = totalJambWidth * 0.42;
  const openingCenterX = (leftJambWidth - rightJambWidth) / 2;
  const headerBandHeight = OUTER_HEIGHT - SPRINGLINE;

  const jambGeoLeft = useMemo(
    () => beveledBoxGeometry(leftJambWidth, SPRINGLINE, THICKNESS, BEVEL),
    [leftJambWidth],
  );
  const jambGeoRight = useMemo(
    () => beveledBoxGeometry(rightJambWidth, SPRINGLINE, THICKNESS, BEVEL),
    [rightJambWidth],
  );
  const straightHeaderGeo = useMemo(
    () => beveledBoxGeometry(OUTER_WIDTH, headerBandHeight, THICKNESS, BEVEL),
    [headerBandHeight],
  );
  const archHeaderGeo = useMemo(
    () =>
      archedHeaderGeometry(
        OUTER_WIDTH,
        headerBandHeight,
        OPENING_WIDTH / 2 + 0.3,
        THICKNESS,
        BEVEL,
      ),
    [headerBandHeight],
  );
  const backerGeo = useMemo(
    () => beveledBoxGeometry(OPENING_WIDTH + 0.6, SPRINGLINE + 1.2, 0.5, 0.06),
    [],
  );
  const sillGeo = useMemo(() => beveledBoxGeometry(OPENING_WIDTH + 0.3, 0.16, 0.5, 0.04), []);

  const stone = useMemo(() => frameStoneMaterial(), []);
  const backerMaterial = useMemo(() => dressingStoneMaterial(), []);
  const metal = useMemo(() => metalAccentMaterial(), []);

  useEffect(() => {
    return () => {
      jambGeoLeft.dispose();
      jambGeoRight.dispose();
      straightHeaderGeo.dispose();
      archHeaderGeo.dispose();
      backerGeo.dispose();
      sillGeo.dispose();
      stone.dispose();
      backerMaterial.dispose();
      metal.dispose();
    };
  }, [
    jambGeoLeft,
    jambGeoRight,
    straightHeaderGeo,
    archHeaderGeo,
    backerGeo,
    sillGeo,
    stone,
    backerMaterial,
    metal,
  ]);

  const [px, py, pz] = position;

  return (
    <group position={[px, py, pz]}>
      <mesh
        geometry={jambGeoLeft}
        material={stone}
        position={[-OUTER_WIDTH / 2 + leftJambWidth / 2, SPRINGLINE / 2, 0]}
      />
      <mesh
        geometry={jambGeoRight}
        material={stone}
        position={[OUTER_WIDTH / 2 - rightJambWidth / 2, SPRINGLINE / 2, 0]}
      />
      {variant === "A" ? (
        <mesh
          geometry={straightHeaderGeo}
          material={stone}
          position={[openingCenterX, SPRINGLINE + headerBandHeight / 2, 0]}
        />
      ) : (
        <mesh
          geometry={archHeaderGeo}
          material={stone}
          position={[openingCenterX, SPRINGLINE, 0]}
        />
      )}
      {/* Segunda camada — recuo real atrás do vão (briefing FRAME V3: "profundidade; segunda camada"). */}
      <mesh
        geometry={backerGeo}
        material={backerMaterial}
        position={[openingCenterX, SPRINGLINE * 0.42, -THICKNESS / 2 - 1.1]}
      />
      {/* Soleira — único traço de metal escovado deste elemento (briefing "apenas em detalhes"). */}
      <mesh
        geometry={sillGeo}
        material={metal}
        position={[openingCenterX, 0.08, THICKNESS * 0.32]}
      />
    </group>
  );
}

export { FrameV3, OPENING_WIDTH, OUTER_HEIGHT, OUTER_WIDTH, SPRINGLINE, THICKNESS };
