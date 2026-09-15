import Image from "next/image";

import { BrowserFrame } from "@/components/shared/browser-frame";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";

/**
 * Representação de FIS/Outbound para os protótipos de Home. FIS e Outbound
 * NÃO são cases públicos (não têm entrada no registry, não têm rota /work) —
 * por isso este componente nunca linka para lugar nenhum, só reusa os MESMOS
 * assets já aprovados e publicados na Home real (`components/sections/
 * systems.tsx`, "Interface real · dados demonstrativos"). Nenhum dado
 * operacional novo é exposto; nenhum registry é tocado.
 */
interface SystemEntry {
  title: string;
  image: string;
  imageAlt: string;
  aspect: string;
}

const SYSTEMS: readonly SystemEntry[] = [
  {
    title: "FIS Dashboard",
    image: "/images/products/fis-dashboard-overview.png",
    imageAlt:
      "Prévia do FIS Dashboard, sistema interno do Gabriel Studio para gestão de oportunidades comerciais, com dados demonstrativos.",
    aspect: "480/379",
  },
  {
    title: "Outbound — Gabriel Studio",
    image: "/images/products/outbound-dashboard-overview.png",
    imageAlt:
      "Prévia do Outbound, sistema interno do Gabriel Studio para prospecção comercial, com dados demonstrativos.",
    aspect: "288/187",
  },
];

type SystemsCompactVariant = "compact" | "family" | "minimal";

interface SystemsCompactProps {
  variant: SystemsCompactVariant;
}

function SystemsCompact({ variant }: SystemsCompactProps) {
  if (variant === "minimal") {
    return (
      <div className="border-border/60 rounded-2xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading as="h3" size="h4">
            Sistemas internos
          </Heading>
          <Badge variant="outline">Interface real · dados demonstrativos</Badge>
        </div>
        <ul className="text-muted-foreground mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {SYSTEMS.map((system) => (
            <li key={system.title}>{system.title}</li>
          ))}
        </ul>
      </div>
    );
  }

  const isFamily = variant === "family";

  return (
    <div
      className={
        isFamily ? "grid grid-cols-1 gap-8 sm:grid-cols-2" : "grid grid-cols-1 gap-6 sm:grid-cols-2"
      }
    >
      {SYSTEMS.map((system) => (
        <div key={system.title}>
          <div className="border-border/60 relative overflow-hidden rounded-xl border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.4)]">
            <BrowserFrame>
              <div className="relative w-full" style={{ aspectRatio: system.aspect }}>
                <Image
                  src={system.image}
                  alt={system.imageAlt}
                  fill
                  sizes="(min-width: 640px) 30vw, 90vw"
                  className="object-cover object-top"
                />
              </div>
            </BrowserFrame>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{system.title}</p>
            {isFamily ? <Badge variant="outline">Sistema interno</Badge> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export { SystemsCompact };
