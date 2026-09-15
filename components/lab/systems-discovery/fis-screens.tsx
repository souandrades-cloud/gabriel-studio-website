/**
 * Hipóteses de apresentação visual para FIS Dashboard — Gate HOME PORTFOLIO B
 * — COMMERCIAL + SYSTEMS POLISH DISCOVERY 001, Missão 2. Interface FICTÍCIA
 * construída em código (não é o FIS real, não é screenshot do produto real),
 * com dados 100% demonstrativos. Nenhum dado operacional é exposto. Isolado
 * em rota /lab, nunca linkado publicamente.
 */

const ACCENT = "#22b573";

function Chrome({ tabs, active }: { tabs: string[]; active: number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-sm font-semibold text-white">FIS</span>
        <span className="truncate text-xs text-white/40">Dashboard</span>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-[11px] whitespace-nowrap">
        {tabs.map((tab, i) => (
          <span key={tab} className={i === active ? "text-white" : "text-white/40"}>
            {tab}
          </span>
        ))}
      </div>
    </div>
  );
}

const KPIS = [
  { label: "Novas oportunidades", value: "18" },
  { label: "Em análise", value: "9" },
  { label: "Prontas p/ decisão", value: "5" },
];

const OPPORTUNITIES = [
  { name: "Ateliê Lumen — site institucional", tech: 88, biz: 79 },
  { name: "Nordika Arquitetura — landing page", tech: 81, biz: 74 },
];

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, backgroundColor: ACCENT }}
      />
    </div>
  );
}

/** Hipótese A — Login / Entry screen. */
function FisLogin() {
  return (
    <div className="flex h-full flex-col bg-black">
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-10">
        <div
          aria-hidden="true"
          className="mb-6 flex size-10 items-center justify-center rounded-lg text-sm font-bold text-black"
          style={{ backgroundColor: ACCENT }}
        >
          F
        </div>
        <p className="text-sm font-semibold text-white">FIS</p>
        <p className="mt-1 text-xs text-white/40">Triagem e priorização de oportunidades</p>

        <div className="mt-8 w-full max-w-64 space-y-3">
          <div className="rounded-md border border-white/15 bg-white/5 px-3 py-2.5">
            <span className="text-[11px] text-white/30">email@estudio.com</span>
          </div>
          <div className="rounded-md border border-white/15 bg-white/5 px-3 py-2.5">
            <span className="text-[11px] text-white/30">••••••••</span>
          </div>
          <div
            className="mt-1 rounded-md py-2.5 text-center text-[11px] font-medium text-black"
            style={{ backgroundColor: ACCENT }}
          >
            Entrar
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hipótese B — Dashboard hero refinado. KPIs + oportunidades classificadas, sem gráfico — cabe sem cortar em um card de aspect-ratio compacto. */
function FisDashboard() {
  return (
    <div className="flex h-full flex-col bg-black">
      <Chrome tabs={["Visão geral", "Pipeline"]} active={0} />
      <div className="flex flex-1 flex-col gap-4 px-5 py-4">
        <div className="grid grid-cols-3 gap-3">
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className="min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5"
            >
              <p className="truncate text-[9px] tracking-wide text-white/40 uppercase">
                {kpi.label}
              </p>
              <p className="mt-1 text-base font-semibold text-white">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] tracking-wide text-white/40 uppercase">
            Melhores oportunidades
          </p>
          {OPPORTUNITIES.map((o) => (
            <div key={o.name} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span className="min-w-0 truncate text-xs text-white">{o.name}</span>
                <span className="shrink-0 text-[10px] text-white/40">
                  {o.tech}/{o.biz}
                </span>
              </div>
              <div className="mt-2">
                <ScoreBar value={o.tech} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Versão minimalista do dashboard, só para a Composição (Hipótese C) — texto robusto em painéis bem estreitos (~100–250px). */
function FisDashboardPreview() {
  return (
    <div className="flex h-full flex-col bg-black px-3 py-3">
      <p className="truncate text-[10px] font-semibold text-white">FIS</p>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <div className="min-w-0 rounded-md border border-white/10 bg-white/5 px-2 py-1.5">
          <p className="truncate text-[7px] tracking-wide text-white/40 uppercase">Oportunidades</p>
          <p className="text-sm font-semibold text-white">18</p>
        </div>
        <div className="min-w-0 rounded-md border border-white/10 bg-white/5 px-2 py-1.5">
          <p className="truncate text-[7px] tracking-wide text-white/40 uppercase">Prontas</p>
          <p className="text-sm font-semibold text-white">5</p>
        </div>
      </div>
      <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-hidden">
        {OPPORTUNITIES.map((o) => (
          <div
            key={o.name}
            className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1.5"
          >
            <span className="min-w-0 truncate text-[8px] text-white">{o.name}</span>
            <span className="shrink-0 text-[7px] text-white/40">{o.tech}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Versão minimalista do login, só para a Composição (Hipótese C). */
function FisLoginPreview() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-black px-3">
      <div
        aria-hidden="true"
        className="mb-2 flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-black"
        style={{ backgroundColor: ACCENT }}
      >
        F
      </div>
      <p className="truncate text-[10px] font-semibold text-white">FIS</p>
      <div
        className="mt-3 w-full max-w-[80px] rounded py-1.5 text-center text-[8px] font-medium text-black"
        style={{ backgroundColor: ACCENT }}
      >
        Entrar
      </div>
    </div>
  );
}

/** Hipótese C — Composição de produto (login + dashboard sobrepostos). */
function FisComposition() {
  return (
    <div className="relative flex h-full items-center bg-black">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(${ACCENT} 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
        }}
      />
      <div className="relative z-10 mx-auto flex w-[88%] items-center">
        <div className="w-[68%] overflow-hidden rounded-lg border border-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
          <div style={{ aspectRatio: "4/3" }}>
            <FisDashboardPreview />
          </div>
        </div>
        <div className="relative z-20 -ml-10 w-[34%] overflow-hidden rounded-lg border border-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)]">
          <div style={{ aspectRatio: "4/3" }}>
            <FisLoginPreview />
          </div>
        </div>
      </div>
    </div>
  );
}

export { FisLogin, FisDashboard, FisComposition };
