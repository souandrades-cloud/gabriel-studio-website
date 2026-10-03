"use client";

import { useEffect, useRef, type RefObject } from "react";

import { cn } from "@/lib/utils";

import { EcosystemCard } from "./ecosystem-card";
import { LAYOUTS, MODULES, type LayoutKey } from "./ecosystem-config";
import { mountEcosystem, type EcosystemEngine, type SceneMode } from "./ecosystem-engine";

/**
 * Palco do ecossistema: canvas (piso, condutos, energia) + Core (cubo CSS 3D)
 * + cards. Só monta no cliente — é decorativo (`aria-hidden` no pai) e a
 * legenda da Hero já nomeia os serviços em texto real.
 */

/** Orientação das 6 faces; o índice 4 é o topo e o 5, a base. */
const FACES = [
  "",
  "rotateY(180deg) ",
  "rotateY(90deg) ",
  "rotateY(-90deg) ",
  "rotateX(90deg) ",
  "rotateX(-90deg) ",
];

/**
 * Lateral do invólucro: moldura de metal escuro (cada tira num tom — o
 * chanfro lê a luz que vem de cima), cantoneiras onde as tiras se encontram,
 * reflexo diagonal e vidro fumê no vão. Tudo em `background`: zero DOM extra.
 */
const SIDE_SHELL = [
  "linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0) 42%)",
  "linear-gradient(#232d29,#232d29) left top/17% 10% no-repeat",
  "linear-gradient(#232d29,#232d29) right top/17% 10% no-repeat",
  "linear-gradient(#121815,#121815) left bottom/17% 10% no-repeat",
  "linear-gradient(#121815,#121815) right bottom/17% 10% no-repeat",
  "linear-gradient(#1c2521,#1c2521) top/100% 10% no-repeat",
  "linear-gradient(#0a0e0c,#0a0e0c) bottom/100% 10% no-repeat",
  "linear-gradient(#131a17,#131a17) left/10% 100% no-repeat",
  "linear-gradient(#0f1512,#0f1512) right/10% 100% no-repeat",
  "rgba(8,13,11,0.32)",
].join(",");

/** Tampa: placa fechada, mais clara (luz-chave de cima). */
const TOP_SHELL =
  "linear-gradient(160deg,rgba(255,255,255,0.1),rgba(255,255,255,0) 50%),linear-gradient(135deg,#2b3631,#19211d)";

/**
 * Core computacional — três camadas, de fora para dentro:
 *  · INVÓLUCRO — laterais em moldura + vidro, tampa fechada com uma abertura
 *    (o respiro, por onde a carga aparece) e base sólida;
 *  · CÂMARA — o piso interno, iluminado pelo núcleo (a luz bate em matéria);
 *  · NÚCLEO — o cubo emissivo, girando, contido pela máquina.
 */
function CoreCube({
  cubeRef,
  innerRef,
  ventRef,
  lightRef,
}: {
  cubeRef: RefObject<HTMLDivElement | null>;
  innerRef: RefObject<HTMLDivElement | null>;
  ventRef: RefObject<HTMLDivElement | null>;
  lightRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div ref={cubeRef} className="absolute inset-0 [transform-style:preserve-3d]">
        {/* Núcleo emissivo. */}
        <div ref={innerRef} className="absolute inset-[33%] [transform-style:preserve-3d]">
          {FACES.map((face, i) => (
            <div
              key={i}
              style={{ transform: `${face}translateZ(calc(var(--half) * 0.34))` }}
              className="absolute inset-0 border border-[#e1fff0]/90 bg-[radial-gradient(circle,#f6fffb_0%,#8af8c6_42%,#22bd78_100%)] shadow-[0_0_calc(var(--half)*0.34)_rgba(52,214,140,0.95),inset_0_0_calc(var(--half)*0.08)_rgba(255,255,255,0.6)]"
            />
          ))}
        </div>
        {/* Câmara: piso interno iluminado pelo núcleo. */}
        <div
          style={{ transform: "rotateX(-90deg) translateZ(calc(var(--half) * 0.62))" }}
          className="absolute inset-[19%] bg-[radial-gradient(circle,rgba(150,255,205,0.7)_0%,rgba(34,181,115,0.3)_32%,rgba(10,16,13,0.9)_66%),linear-gradient(#0b100e,#0b100e)] shadow-[inset_0_0_0_1px_rgba(120,245,185,0.3)]"
        />
        {/* Invólucro. */}
        {FACES.map((face, i) => (
          <div
            key={i}
            style={{
              transform: `${face}translateZ(var(--half))`,
              background: i === 4 ? TOP_SHELL : i === 5 ? "#0a0e0c" : SIDE_SHELL,
            }}
            className="absolute inset-0 border border-white/[0.16]"
          >
            {i < 4 && (
              <div className="absolute inset-[10%] bg-[linear-gradient(180deg,rgba(34,181,115,0.02),rgba(34,181,115,0.08))] shadow-[0_0_0_1px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(140,255,200,0.45),inset_0_0_calc(var(--half)*0.4)_rgba(34,181,115,0.34)]" />
            )}
            {i === 4 && (
              <>
                <div className="absolute inset-[33%] bg-[#06100b] shadow-[0_0_0_1px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(160,255,210,0.6)]">
                  {/* Respiro: a luz da carga escapa por aqui (opacidade
                      escrita pelo motor). */}
                  <div
                    ref={ventRef}
                    className="absolute inset-0 bg-[radial-gradient(circle,rgba(170,255,215,0.75),rgba(34,181,115,0.22)_70%)]"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {/* Bloom sobre o cubo — a intensidade (respiração, carga, emissão) é
          escrita pelo motor. Contido: a luz é da máquina, não névoa. */}
      <div
        ref={lightRef}
        className="pointer-events-none absolute -inset-[24%] rounded-full bg-[radial-gradient(circle,rgba(190,255,222,0.42)_0%,rgba(52,214,140,0.16)_30%,transparent_60%)] mix-blend-screen"
      />
    </>
  );
}

/**
 * Inspeção temporária do ambiente — só nas rotas de lab:
 * `?scene=system` (sem ambiente) · `?scene=environment` (só o ambiente).
 */
function readScene(): SceneMode {
  if (!window.location.pathname.startsWith("/lab/")) return "full";
  const v = new URLSearchParams(window.location.search).get("scene");
  return v === "system" || v === "environment" ? v : "full";
}

/**
 * Mundo em volta do sistema: canvases que cobrem a seção inteira, atrás da
 * copy (distante, médio, plataforma, frente — ver `ecosystem-environment`).
 * Quem desenha é o motor do palco — este componente só reserva o lugar.
 */
function EcosystemWorld({
  ref,
  className,
}: {
  ref: RefObject<HTMLDivElement | null>;
  className?: string;
}) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <canvas data-world="far" className="absolute" />
      <canvas data-world="mid" className="absolute" />
      <canvas data-world="near" className="absolute inset-0 size-full" />
      <canvas data-world="fore" className="absolute" />
    </div>
  );
}

function EcosystemStage({
  layoutKey,
  animate,
  paused,
  pointerRef,
  pulseRef,
  worldRef,
  quietRefs,
  className,
}: {
  layoutKey: LayoutKey;
  animate: boolean;
  paused: boolean;
  pointerRef?: RefObject<{ x: number; y: number }>;
  pulseRef?: RefObject<number>;
  /** Container de `EcosystemWorld` — sem ele, o sistema roda sem ambiente. */
  worldRef?: RefObject<HTMLDivElement | null>;
  /** O texto (copy, legenda): atrás dele, o mundo baixa o tom e o detalhe. */
  quietRefs?: readonly RefObject<HTMLElement | null>[];
  className?: string;
}) {
  const layout = LAYOUTS[layoutKey];
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const ventRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const engineRef = useRef<EcosystemEngine | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const core = coreRef.current;
    const coreCube = cubeRef.current;
    const coreLight = lightRef.current;
    const coreInner = innerRef.current;
    const coreVent = ventRef.current;
    const cards = cardRefs.current.slice(0, layout.placements.length);
    if (!stage || !canvas || !core || !coreCube || !coreLight || !coreInner || !coreVent) return;
    if (cards.some((c) => !c)) return;
    const root = worldRef?.current;
    const pick = (key: string) => root?.querySelector<HTMLCanvasElement>(`[data-world="${key}"]`);
    const [far, mid, near, fore] = ["far", "mid", "near", "fore"].map(pick);
    const engine = mountEcosystem(
      {
        stage,
        canvas,
        core,
        coreCube,
        coreLight,
        coreInner,
        coreVent,
        cards: cards as HTMLDivElement[],
        world:
          root && far && mid && near && fore
            ? { root, canvases: { far, mid, near, fore }, quiet: quietRefs?.map((r) => r.current) }
            : undefined,
      },
      { layout, animate, pointerRef, pulseRef, scene: readScene() },
    );
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [layout, animate, pointerRef, pulseRef, worldRef, quietRefs]);

  useEffect(() => {
    engineRef.current?.setPaused(paused);
  }, [paused]);

  return (
    <div ref={stageRef} className={cn("pointer-events-none", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div ref={coreRef} className="absolute top-0 left-0 opacity-0 [perspective:1600px]">
        <CoreCube cubeRef={cubeRef} innerRef={innerRef} ventRef={ventRef} lightRef={lightRef} />
      </div>
      {layout.placements.map((p, i) => (
        <EcosystemCard
          key={`${layoutKey}-${p.module}`}
          ref={(node) => {
            cardRefs.current[i] = node;
          }}
          module={MODULES[p.module]}
          compact={layout.compact}
        />
      ))}
    </div>
  );
}

export { EcosystemStage, EcosystemWorld };
