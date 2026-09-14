import { AmbientGlow } from "@/components/shared/ambient-glow";
import { GrainTexture } from "@/components/shared/grain-texture";
import { TechGrid } from "@/components/shared/tech-grid";
import { cn } from "@/lib/utils";

type ProceduralVisualVariant = "modules" | "flow" | "signal";

interface ProceduralVisualProps {
  /** Semântica por seção — cada uma tem composição própria, não uma reskin de cor. */
  variant: ProceduralVisualVariant;
  className?: string;
}

const TELEMETRY_LABEL: Record<ProceduralVisualVariant, string> = {
  modules: "Sistemas · Conectados",
  flow: "Fluxo · Em progresso",
  signal: "Sinal · Preciso",
};

/** Serviços — módulos/sistemas conectados: nós ligados em rede, um deles em destaque (o resultado). */
function ModulesCore() {
  return (
    <>
      <AmbientGlow
        className="top-[14%] right-[10%] h-[220px] w-[260px] opacity-[0.16]"
        amplitude={16}
        duration={19}
      />
      <AmbientGlow
        className="bottom-[10%] left-[8%] h-[180px] w-[200px] opacity-[0.1]"
        amplitude={12}
        duration={23}
        breathe
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="absolute top-1/2 left-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
      >
        <g className="stroke-white/10" strokeWidth={1} fill="none">
          <line x1="42" y1="52" x2="148" y2="42" />
          <line x1="42" y1="52" x2="56" y2="152" />
          <line x1="148" y1="42" x2="158" y2="142" />
          <line x1="56" y1="152" x2="158" y2="142" />
        </g>
        <rect
          x="30"
          y="40"
          width="24"
          height="24"
          rx="5"
          className="fill-white/[0.03] stroke-white/15"
          strokeWidth={1}
        />
        <rect
          x="136"
          y="30"
          width="24"
          height="24"
          rx="5"
          className="fill-white/[0.03] stroke-white/15"
          strokeWidth={1}
        />
        <rect
          x="44"
          y="140"
          width="24"
          height="24"
          rx="5"
          className="fill-white/[0.03] stroke-white/15"
          strokeWidth={1}
        />
        <rect
          x="146"
          y="130"
          width="26"
          height="26"
          rx="5"
          className="fill-brand/15 stroke-brand/50"
          strokeWidth={1}
        />
        <circle cx="159" cy="143" r="2.5" className="fill-brand ambient-pulse" />
        <circle cx="42" cy="52" r="2" className="fill-brand/70 ambient-pulse" />
      </svg>
    </>
  );
}

/** Processo — fluxo/orquestração: caminho ascendente de nós que ganham peso até o nó final aceso. */
function FlowCore() {
  return (
    <>
      <AmbientGlow
        className="top-[12%] right-[14%] h-[240px] w-[280px] opacity-[0.14]"
        amplitude={18}
        duration={20}
      />
      <div aria-hidden="true" className="tech-flow absolute inset-x-0 top-[45%] h-px opacity-70" />
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="absolute top-1/2 left-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
      >
        <path
          d="M20 160 L75 120 L130 95 L180 40"
          className="stroke-white/12"
          strokeWidth={1}
          fill="none"
        />
        <circle cx="20" cy="160" r="3" className="fill-white/20" />
        <circle cx="75" cy="120" r="4" className="fill-white/25" />
        <circle cx="130" cy="95" r="5" className="fill-brand/60" />
        <circle cx="180" cy="40" r="6" className="fill-brand ambient-pulse" />
      </svg>
    </>
  );
}

/** Diferenciais — precisão/sinal: anéis concêntricos e mira ao redor de um único ponto aceso. */
function SignalCore() {
  return (
    <>
      <AmbientGlow
        className="top-1/2 left-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 opacity-[0.14]"
        amplitude={10}
        duration={17}
        breathe
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="absolute top-1/2 left-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
      >
        <circle cx="100" cy="100" r="80" className="stroke-white/10" strokeWidth={1} fill="none" />
        <circle cx="100" cy="100" r="52" className="stroke-white/12" strokeWidth={1} fill="none" />
        <circle cx="100" cy="100" r="26" className="stroke-brand/40" strokeWidth={1} fill="none" />
        <line x1="100" y1="4" x2="100" y2="26" className="stroke-white/15" strokeWidth={1} />
        <line x1="100" y1="174" x2="100" y2="196" className="stroke-white/15" strokeWidth={1} />
        <line x1="4" y1="100" x2="26" y2="100" className="stroke-white/15" strokeWidth={1} />
        <line x1="174" y1="100" x2="196" y2="100" className="stroke-white/15" strokeWidth={1} />
        <circle cx="100" cy="100" r="3" className="fill-brand ambient-pulse" />
      </svg>
    </>
  );
}

/**
 * Substituto procedural da fotografia decorativa genérica em Serviços,
 * Processo e Diferenciais (Gate: AI VISUAL ENHANCEMENT — O1 PRODUCTION
 * IMPLEMENTATION 001). Zero fotografia, zero WebGL, zero asset novo — recombina
 * primitivas já existentes (TechGrid, GrainTexture, AmbientGlow, `.tech-flow`,
 * `.ambient-pulse`) em três composições distintas que compartilham a mesma
 * linguagem técnica verde/preto. As animações (`ambient-*`, `.tech-flow`) já
 * são CSS puro e já respeitam `prefers-reduced-motion` globalmente — nenhuma
 * lógica de motion adicional é necessária aqui.
 */
function ProceduralVisual({ variant, className }: ProceduralVisualProps) {
  return (
    <div className={cn("bg-foreground absolute inset-0", className)}>
      <TechGrid
        drift
        size={96}
        className="[mask-image:radial-gradient(85%_75%_at_62%_35%,black_25%,transparent_85%)] opacity-[0.07]"
      />
      <GrainTexture />
      {variant === "modules" && <ModulesCore />}
      {variant === "flow" && <FlowCore />}
      {variant === "signal" && <SignalCore />}
      <span className="text-background/50 absolute bottom-4 left-4 flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase">
        <span className="bg-brand ambient-pulse block size-1 rounded-full" />
        {TELEMETRY_LABEL[variant]}
      </span>
    </div>
  );
}

export { ProceduralVisual };
export type { ProceduralVisualVariant };
