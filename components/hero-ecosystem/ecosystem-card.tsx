import type { CSSProperties, Ref } from "react";

import { cn } from "@/lib/utils";

import type { EcosystemModule, MicroKind } from "./ecosystem-config";

/**
 * Módulo do ecossistema: painel de vidro escuro suspenso. Medidas em `em` —
 * o motor ajusta o `font-size` do palco por largura, então o card escala
 * por tipografia (nítido), e o `transform` por frame só cuida de
 * profundidade/flutuação (escala perto de 1).
 *
 * Reação à energia: o motor escreve a opacidade de `[data-glow]` (contorno
 * verde que se apaga) e liga `data-active` por ~1,5s — o sinal interno
 * responde por CSS (`group-data-[active=true]/card`).
 */

/**
 * Microvisual de cada capacidade — primeiro TEXTURA (identidade do módulo),
 * depois informação. Em repouso fica em cinza baixo; quando a energia chega,
 * acende em sequência (atrasos curtos), como um sistema respondendo.
 */
function Micro({ kind }: { kind: MicroKind }) {
  const base = "relative h-[2.6em] w-[4.6em] shrink-0";
  const t = "transition-all duration-500 ease-out";

  // Sites — composição de página: barra, hero, três blocos.
  if (kind === "browser") {
    return (
      <div
        className={cn(
          base,
          "flex flex-col gap-[0.2em] rounded-[0.35em] border border-white/10 bg-white/[0.025] p-[0.32em]",
        )}
      >
        <div className="flex items-center gap-[0.18em]">
          {[0, 1, 2].map((d) => (
            <span key={d} className="size-[0.22em] rounded-full bg-white/20" />
          ))}
          <span className="ml-auto h-[0.16em] w-[35%] rounded-full bg-white/10" />
        </div>
        <div className="flex flex-1 gap-[0.2em]">
          <div
            className={cn(
              t,
              "flex-[1.6] rounded-[0.1em] bg-white/12",
              "group-data-[active=true]/card:bg-brand/70",
            )}
          />
          <div className="flex flex-1 flex-col gap-[0.15em]">
            <div className="h-[0.2em] rounded-full bg-white/12" />
            <div className="h-[0.2em] w-[70%] rounded-full bg-white/8" />
          </div>
        </div>
        <div className="flex gap-[0.2em]">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              style={{ transitionDelay: `${150 + d * 90}ms` }}
              className={cn(
                t,
                "h-[0.38em] flex-1 rounded-[0.08em] bg-white/8",
                "group-data-[active=true]/card:bg-brand/35",
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // Landing — curva de conversão: grade, área, linha e o ponto de chegada.
  if (kind === "trend") {
    const d = "M1 22 L10 18 L17 20 L26 12 L34 14 L45 5";
    return (
      <svg viewBox="0 0 46 26" className={base} fill="none" aria-hidden="true">
        {[8, 15, 22].map((y) => (
          <line key={y} x1="0" x2="46" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" />
        ))}
        <path
          d={`${d} L45 26 L1 26 Z`}
          className={cn(
            "fill-white/[0.03] transition-[fill] duration-700 ease-out",
            "group-data-[active=true]/card:fill-brand/15",
          )}
        />
        <path d={d} stroke="rgba(255,255,255,0.2)" strokeWidth="1.4" strokeLinejoin="round" />
        <path
          d={d}
          pathLength={1}
          strokeDasharray="1"
          className={cn(
            "stroke-brand transition-[stroke-dashoffset] duration-700 ease-out [stroke-dashoffset:1]",
            "group-data-[active=true]/card:[stroke-dashoffset:0]",
          )}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <line
          x1="45"
          x2="45"
          y1="5"
          y2="26"
          strokeDasharray="1.5 1.5"
          className={cn("stroke-white/10", t, "group-data-[active=true]/card:stroke-brand/40")}
        />
        <circle
          cx="45"
          cy="5"
          r="1.8"
          className={cn("fill-white/30", t, "group-data-[active=true]/card:fill-brand delay-500")}
        />
      </svg>
    );
  }

  // Automações — fluxo: gatilho, etapa, ramificação e conclusão.
  if (kind === "flow") {
    const edges = [
      "M7 13 L16 13",
      "M22 13 L26 13 Q28 13 28 11 L28 8 Q28 6 30 6 L32 6",
      "M22 13 L26 13 Q28 13 28 15 L28 18 Q28 20 30 20 L32 20",
      "M37 6 L38 6 Q40 6 40 8 L40 11 Q40 13 42 13",
      "M37 20 L38 20 Q40 20 40 18 L40 15 Q40 13 42 13",
    ];
    const nodes = [
      { round: true, x: 4.5, y: 13, delay: 0 },
      { round: false, x: 19, y: 13, delay: 110 },
      { round: false, x: 34.5, y: 6, delay: 220 },
      { round: false, x: 34.5, y: 20, delay: 260 },
    ];
    return (
      <svg viewBox="0 0 46 26" className={base} fill="none" aria-hidden="true">
        {edges.map((e, i) => (
          <path
            key={i}
            d={e}
            strokeWidth="1"
            style={{ transitionDelay: `${60 + i * 70}ms` }}
            className={cn("stroke-white/15", t, "group-data-[active=true]/card:stroke-brand/60")}
          />
        ))}
        {nodes.map((n, i) => (
          <rect
            key={i}
            x={n.x - 2.6}
            y={n.y - 2.6}
            width="5.2"
            height="5.2"
            rx={n.round ? 2.6 : 1.1}
            strokeWidth="1"
            style={{ transitionDelay: `${n.delay}ms` }}
            className={cn(
              "fill-[#0c110f] stroke-white/25",
              t,
              "group-data-[active=true]/card:stroke-brand group-data-[active=true]/card:fill-brand/45",
            )}
          />
        ))}
        <circle
          cx="43.5"
          cy="13"
          r="1.6"
          className={cn("fill-white/30", t, "group-data-[active=true]/card:fill-brand delay-500")}
        />
      </svg>
    );
  }

  // Dados — série de barras sobre um eixo + matriz de registros.
  if (kind === "bars") {
    const rest = [0.45, 0.7, 0.4, 0.85];
    const live = [0.7, 0.5, 0.9, 1];
    return (
      <div className={cn(base, "flex items-end gap-[0.45em] pb-[0.1em]")}>
        <div className="relative flex h-full flex-[1.5] items-end justify-between border-b border-white/12 px-[0.1em]">
          {rest.map((h, i) => (
            <span
              key={i}
              style={
                { "--h0": h, "--h1": live[i], transitionDelay: `${i * 60}ms` } as CSSProperties
              }
              className={cn(
                t,
                "h-[92%] w-[0.42em] origin-bottom scale-y-[var(--h0)] rounded-t-[0.1em] bg-white/18",
                "group-data-[active=true]/card:bg-brand/75 group-data-[active=true]/card:scale-y-[var(--h1)]",
              )}
            />
          ))}
        </div>
        <div className="grid flex-1 grid-cols-3 gap-[0.16em] self-center">
          {Array.from({ length: 9 }, (_, i) => (
            <span
              key={i}
              style={{ transitionDelay: `${200 + ((i * 4) % 9) * 45}ms` }}
              className={cn(
                t,
                "aspect-square rounded-[0.06em]",
                i % 4 === 0
                  ? "group-data-[active=true]/card:bg-brand/80 bg-white/20"
                  : "group-data-[active=true]/card:bg-brand/25 bg-white/8",
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  // Integrações — hub ligado a sistemas de portes diferentes.
  const spokes = [
    [7, 5, 2.2],
    [39, 4, 2.2],
    [43, 15, 1.6],
    [8, 21, 2.2],
    [37, 22, 2.2],
    [3, 13, 1.5],
  ] as const;
  return (
    <svg viewBox="0 0 46 26" className={base} fill="none" aria-hidden="true">
      <circle cx="23" cy="13" r="8" strokeDasharray="1.2 2" className="stroke-white/10" />
      {spokes.map(([x, y, r], i) => (
        <g key={i}>
          <line
            x1="23"
            y1="13"
            x2={x}
            y2={y}
            strokeWidth="1"
            style={{ transitionDelay: `${i * 70}ms` }}
            className={cn("stroke-white/14", t, "group-data-[active=true]/card:stroke-brand/55")}
          />
          <circle
            cx={x}
            cy={y}
            r={r}
            style={{ transitionDelay: `${80 + i * 70}ms` }}
            className={cn("fill-white/25", t, "group-data-[active=true]/card:fill-brand")}
          />
        </g>
      ))}
      <circle
        cx="23"
        cy="13"
        r="3.4"
        className={cn("fill-white/40", t, "group-data-[active=true]/card:fill-brand")}
      />
    </svg>
  );
}

function EcosystemCard({
  module,
  compact,
  ref,
}: {
  module: EcosystemModule;
  compact: boolean;
  ref?: Ref<HTMLDivElement>;
}) {
  const Icon = module.icon;
  return (
    <div
      ref={ref}
      className="group/card absolute top-0 left-0 opacity-0"
      style={{ width: compact ? "10.6em" : "16.5em" }}
    >
      <div
        className={cn(
          "relative overflow-hidden border border-white/[0.07]",
          "bg-[linear-gradient(155deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.02)_42%,rgba(255,255,255,0.01)_100%),linear-gradient(#0b0f0dE6,#0b0f0dE6)]",
          "shadow-[0_2.4em_3.2em_-1.8em_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.13),inset_1px_0_0_rgba(255,255,255,0.04)]",
          compact ? "rounded-[0.75em] p-[0.6em]" : "rounded-[0.9em] p-[0.85em]",
        )}
      >
        <div
          data-glow
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 [box-shadow:inset_0_0_0_1px_rgba(52,214,140,0.6),inset_0_0_2.4em_rgba(34,181,115,0.16)]"
        />
        {/* Barramento na base: a energia que chega carrega o módulo. */}
        <div className="pointer-events-none absolute inset-x-[1.1em] bottom-0 h-px bg-white/[0.06]">
          <div className="bg-brand/70 h-full origin-left scale-x-0 transition-transform duration-700 ease-out group-data-[active=true]/card:scale-x-100" />
        </div>
        <div className="flex items-center gap-[0.75em]">
          <span
            className={cn(
              "border-brand/15 bg-brand/[0.05] text-brand/70 grid shrink-0 place-items-center rounded-[0.55em] border transition-colors duration-500",
              "group-data-[active=true]/card:bg-brand/25 group-data-[active=true]/card:border-brand/60 group-data-[active=true]/card:text-brand",
              compact ? "size-[2.2em]" : "size-[2.6em]",
            )}
          >
            <Icon className={compact ? "size-[1.1em]" : "size-[1.3em]"} strokeWidth={1.75} />
          </span>
          <span
            className={cn(
              "min-w-0 flex-1 leading-[1.15] font-medium tracking-[-0.01em] text-white/80 transition-colors duration-500 group-data-[active=true]/card:text-white",
              compact ? "text-[1em]" : "text-[1.08em]",
            )}
          >
            {module.title}
          </span>
          {!compact && <Micro kind={module.micro} />}
        </div>
      </div>
    </div>
  );
}

export { EcosystemCard };
