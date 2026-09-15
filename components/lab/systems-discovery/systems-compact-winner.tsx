import { FisComposition } from "@/components/lab/systems-discovery/fis-screens";
import { OutboundComposition } from "@/components/lab/systems-discovery/outbound-screens";
import { BrowserFrame } from "@/components/shared/browser-frame";

/**
 * Vencedor recomendado do discovery FIS/Outbound (Hipótese C — Product
 * Composition, ver RETURN do Gate HOME PORTFOLIO B — COMMERCIAL + SYSTEMS
 * POLISH DISCOVERY 001). Substitui, apenas nesta rota de discovery, o
 * screenshot real usado em `systems-compact.tsx` — não altera esse arquivo.
 * Por não ser mais um screenshot capturado da interface real, a badge não
 * usa "Interface real"; usa "Estudo visual de produto" para permanecer
 * factual.
 */
const SYSTEMS = [
  {
    title: "FIS Dashboard",
    description:
      "Sistema para coleta, organização, classificação e análise de oportunidades freelance.",
    Composition: FisComposition,
  },
  {
    title: "Outbound",
    description: "Sistema para estruturar, organizar e acompanhar prospecção comercial.",
    Composition: OutboundComposition,
  },
] as const;

function SystemsCompactWinner() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {SYSTEMS.map((system) => (
        <div key={system.title}>
          <div className="border-border/60 relative overflow-hidden rounded-xl border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.4)]">
            <BrowserFrame>
              <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
                <system.Composition />
              </div>
            </BrowserFrame>
          </div>
          <div className="mt-3">
            <p className="text-sm font-medium">{system.title}</p>
            <p className="text-muted-foreground mt-1 text-sm text-balance">{system.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export { SystemsCompactWinner };
