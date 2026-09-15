/**
 * Hipóteses de apresentação visual para Outbound — Gate HOME PORTFOLIO B —
 * COMMERCIAL + SYSTEMS POLISH DISCOVERY 001, Missão 2. Interface FICTÍCIA
 * construída em código (não é o Outbound real, não é screenshot do produto
 * real), com dados 100% demonstrativos e nomes fictícios. Nenhum dado
 * operacional é exposto. Isolado em rota /lab, nunca linkado publicamente.
 */

const ACCENT = "#22b573";

function Chrome({ tabs, active }: { tabs: string[]; active: number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
      <span className="shrink-0 text-sm font-semibold text-white">Outbound</span>
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
  { label: "Total de leads", value: "27" },
  { label: "Em acompanhamento", value: "10" },
  { label: "Convertido", value: "6" },
];

type Stage = { title: string; leads: { name: string; segment: string }[] };

const STAGES: Stage[] = [
  { title: "Novo", leads: [{ name: "Ateliê Cravo", segment: "salão de beleza" }] },
  { title: "Em contato", leads: [{ name: "Cantina Bella", segment: "restaurante" }] },
  { title: "Follow-up", leads: [{ name: "Barbearia União", segment: "barbearia" }] },
  { title: "Convertido", leads: [{ name: "Clínica Bem Estar", segment: "clínica" }] },
];

/** Hipótese A — Login / Entry screen. */
function OutboundLogin() {
  return (
    <div className="flex h-full flex-col bg-black">
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-10">
        <div
          aria-hidden="true"
          className="mb-6 flex size-10 items-center justify-center rounded-lg text-sm font-bold text-black"
          style={{ backgroundColor: ACCENT }}
        >
          O
        </div>
        <p className="text-sm font-semibold text-white">Outbound</p>
        <p className="mt-1 text-xs text-white/40">Organização e acompanhamento de prospecção</p>

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

/** Hipótese B — Dashboard hero refinado (pipeline em colunas), um lead por estágio — cabe sem cortar. */
function OutboundDashboard() {
  return (
    <div className="flex h-full flex-col bg-black">
      <Chrome tabs={["Visão geral", "Pipeline"]} active={1} />
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

        <div className="grid grid-cols-4 gap-2.5">
          {STAGES.map((stage) => (
            <div
              key={stage.title}
              className="min-w-0 rounded-lg border border-white/10 bg-white/5 p-2.5"
            >
              <p className="mb-2 truncate text-[9px] tracking-wide text-white/40 uppercase">
                {stage.title}
              </p>
              {stage.leads.map((lead) => (
                <div
                  key={lead.name}
                  className="min-w-0 rounded-md border border-white/10 bg-white/5 px-2 py-1.5"
                >
                  <p className="truncate text-[10px] text-white">{lead.name}</p>
                  <p className="truncate text-[9px] text-white/35">{lead.segment}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Versão minimalista do dashboard, só para a Composição (Hipótese C) — texto robusto em painéis bem estreitos (~100–250px). */
function OutboundDashboardPreview() {
  return (
    <div className="flex h-full flex-col bg-black px-3 py-3">
      <p className="truncate text-[10px] font-semibold text-white">Outbound</p>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <div className="min-w-0 rounded-md border border-white/10 bg-white/5 px-2 py-1.5">
          <p className="truncate text-[7px] tracking-wide text-white/40 uppercase">Leads</p>
          <p className="text-sm font-semibold text-white">27</p>
        </div>
        <div className="min-w-0 rounded-md border border-white/10 bg-white/5 px-2 py-1.5">
          <p className="truncate text-[7px] tracking-wide text-white/40 uppercase">Convertido</p>
          <p className="text-sm font-semibold text-white">6</p>
        </div>
      </div>
      <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-hidden">
        {STAGES.slice(0, 2).map((stage) => (
          <div
            key={stage.title}
            className="min-w-0 rounded-md border border-white/10 bg-white/5 px-2 py-1.5"
          >
            <p className="truncate text-[8px] text-white">{stage.leads[0]?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Versão minimalista do login, só para a Composição (Hipótese C). */
function OutboundLoginPreview() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-black px-3">
      <div
        aria-hidden="true"
        className="mb-2 flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-black"
        style={{ backgroundColor: ACCENT }}
      >
        O
      </div>
      <p className="truncate text-[10px] font-semibold text-white">Outbound</p>
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
function OutboundComposition() {
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
            <OutboundDashboardPreview />
          </div>
        </div>
        <div className="relative z-20 -ml-10 w-[34%] overflow-hidden rounded-lg border border-white/15 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)]">
          <div style={{ aspectRatio: "4/3" }}>
            <OutboundLoginPreview />
          </div>
        </div>
      </div>
    </div>
  );
}

export { OutboundLogin, OutboundDashboard, OutboundComposition };
