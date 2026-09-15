import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";

/**
 * Representação OFICIAL de FIS/Outbound — promovida para a Home real no
 * Gate HOME PORTFOLIO B — PRODUCTION INTEGRATION 001, validada antes em
 * `/lab/home-portfolio/b` (Gate SYSTEMS ASSET INTEGRATION 001 / SYSTEMS
 * PROMOTION 001). Os assets são capturas fiéis das rotas canônicas
 * aprovadas nos projetos de origem (FIS checkpoint 5ee76de, hipótese C1
 * "Product Presentation"; Outbound checkpoint 9d62f69, hipótese C1 "Depth
 * Stack") — não são mockups fictícios construídos dentro do Website V2.
 * Cada imagem já traz sua própria composição de "janela de produto" (chrome,
 * glow, tipografia) definida no projeto de origem, por isso NÃO é envolvida
 * em `BrowserFrame` aqui (evita chrome duplicado).
 *
 * Copy factual — não afirma uso interno pelo Gabriel Studio.
 */
interface SystemEntry {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

const SYSTEMS: readonly SystemEntry[] = [
  {
    title: "FIS Dashboard",
    description:
      "Sistema para coleta, organização, classificação e análise de oportunidades freelance.",
    image: "/images/systems/fis-c1-product-presentation.png",
    imageAlt: "Apresentação visual do FIS Dashboard, com dados demonstrativos.",
  },
  {
    title: "Outbound",
    description: "Sistema para estruturar, organizar e acompanhar prospecção comercial.",
    image: "/images/systems/outbound-c1-depth-stack.png",
    imageAlt: "Apresentação visual do Outbound, com dados demonstrativos.",
  },
];

type SystemsOfficialVariant = "family" | "minimal";

interface SystemsOfficialProps {
  variant?: SystemsOfficialVariant;
}

function SystemsOfficial({ variant = "family" }: SystemsOfficialProps) {
  if (variant === "minimal") {
    return (
      <div className="border-border/60 rounded-2xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading as="h3" size="h4">
            Sistemas
          </Heading>
          <Badge variant="outline">Interface real · dados demonstrativos</Badge>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SYSTEMS.map((system) => (
            <div key={system.title}>
              <dt className="text-sm font-medium">{system.title}</dt>
              <dd className="text-muted-foreground mt-1 text-sm text-balance">
                {system.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      {SYSTEMS.map((system) => (
        <div key={system.title}>
          <div className="border-border/60 relative overflow-hidden rounded-xl border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.4)]">
            <div className="relative w-full" style={{ aspectRatio: "1440/900" }}>
              <Image
                src={system.image}
                alt={system.imageAlt}
                fill
                sizes="(min-width: 640px) 45vw, 90vw"
                className="object-cover"
              />
            </div>
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

export { SystemsOfficial };
