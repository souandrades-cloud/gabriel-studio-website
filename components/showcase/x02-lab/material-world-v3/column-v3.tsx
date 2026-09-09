"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

import { taperedColumnGeometry } from "./geometry";
import { frameStoneMaterial, metalAccentMaterial } from "./materials";

/**
 * COLUMN V3 — briefing: "não pode continuar parecendo cubo esticado".
 * Seção retangular AFUNILADA (base mais larga que o topo — `taper`, opção
 * explícita do briefing) + um anel de capitel em metal escovado (leitura
 * "base/topo estrutural mínimo" sem entrar em ornamento). Poucas colunas
 * neste laboratório (2–4, cada uma um mesh próprio, não instanciada) — a
 * meta aqui é fidelidade da peça HERO, não repetição em massa (isso fica
 * para uma futura COLUMN ROW instanciada, fora de escopo desta sprint).
 */
const BOTTOM_WIDTH = 1.35;
const BOTTOM_DEPTH = 1.1;
const TOP_WIDTH = 0.85;
const CAP_HEIGHT = 0.14;
const CAP_MARGIN = 0.12;

function ColumnV3({
  position,
  height,
}: {
  position: readonly [number, number, number];
  height: number;
}) {
  const columnGeo = useMemo(
    () => taperedColumnGeometry(BOTTOM_WIDTH, BOTTOM_DEPTH, TOP_WIDTH, height),
    [height],
  );
  const capGeo = useMemo(() => {
    const capWidth = TOP_WIDTH + CAP_MARGIN;
    const capDepth = (BOTTOM_DEPTH / BOTTOM_WIDTH) * TOP_WIDTH + CAP_MARGIN;
    return new THREE.BoxGeometry(capWidth, CAP_HEIGHT, capDepth);
  }, []);

  const stone = useMemo(() => frameStoneMaterial(), []);
  const metal = useMemo(() => metalAccentMaterial(), []);

  useEffect(() => {
    return () => {
      columnGeo.dispose();
      capGeo.dispose();
      stone.dispose();
      metal.dispose();
    };
  }, [columnGeo, capGeo, stone, metal]);

  const [px, py, pz] = position;

  return (
    <group position={[px, py, pz]}>
      <mesh geometry={columnGeo} material={stone} />
      <mesh geometry={capGeo} material={metal} position={[0, height / 2 + CAP_HEIGHT / 2, 0]} />
    </group>
  );
}

export { ColumnV3 };
