"use client";

import {
  Building2,
  Layers,
  Scale,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import { BrowserFrame } from "@/components/shared/browser-frame";
import { TechPlaceholder } from "@/components/shared/tech-placeholder";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

interface LandingPageDemo {
  icon: LucideIcon;
  segment: string;
  title: string;
  description: string;
  /**
   * Screenshot real, quando existir — esperado em
   * `public/images/projects/landing-pages/lp-<segmento>.png`.
   * Sem imagem = placeholder editorial (nenhum screenshot foi inventado).
   */
  image?: string;
  /** URL da demo real, quando existir. Sem URL = card não é clicável. */
  url?: string;
}

const LANDING_PAGES: LandingPageDemo[] = [
  {
    icon: Stethoscope,
    segment: "Clínica",
    title: "Clínica Cora",
    description: "Identidade visual e landing page completas para uma clínica fictícia.",
    image: "/images/projects/landing-pages/lp-clinica-cora.png",
    url: "https://portfolio-lp-clinica.vercel.app",
  },
  {
    icon: Scale,
    segment: "Advocacia",
    title: "Advocacia",
    description: "Landing page conceitual para escritórios de advocacia.",
  },
  {
    icon: Building2,
    segment: "Imobiliária",
    title: "Imobiliária",
    description: "Landing page conceitual para lançamentos imobiliários.",
  },
  {
    icon: UtensilsCrossed,
    segment: "Restaurante",
    title: "Restaurante",
    description: "Landing page conceitual para reservas e delivery.",
  },
  {
    icon: Layers,
    segment: "SaaS B2B",
    title: "SaaS B2B",
    description: "Landing page conceitual para produtos de software.",
  },
  {
    icon: Sparkles,
    segment: "Estética",
    title: "Estética",
    description: "Landing page conceitual para clínicas de estética.",
  },
];

function LandingPageCard({
  lp,
  className,
  ariaHidden,
}: {
  lp: LandingPageDemo;
  className?: string;
  ariaHidden?: boolean;
}) {
  const content = (
    <>
      <div className="aspect-[16/10] w-full">
        <BrowserFrame>
          {lp.image ? (
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={lp.image}
                alt={`Prévia da landing page demonstrativa — ${lp.title}`}
                fill
                sizes="(min-width: 640px) 280px, 68vw"
                className="object-cover object-top transition-transform duration-700 group-hover:-translate-y-1 group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <TechPlaceholder icon={lp.icon} iconSize="size-10" />
          )}
        </BrowserFrame>
      </div>
      <div className="mt-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {lp.segment}
        </p>
        <Heading as="h4" size="h5" className="mt-1">
          {lp.title}
        </Heading>
        <p className="text-muted-foreground mt-1 text-sm text-balance">{lp.description}</p>
        <Badge variant="outline" className="mt-3">
          Projeto demonstrativo
        </Badge>
      </div>
    </>
  );

  const cardClassName = cn(
    "group border-border hover:border-brand/30 shrink-0 rounded-2xl border p-3 outline-none transition-all duration-300 hover:-translate-y-1 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    className,
  );

  if (ariaHidden) {
    return (
      <div aria-hidden="true" className={cardClassName}>
        {content}
      </div>
    );
  }

  if (lp.url) {
    return (
      <a href={lp.url} target="_blank" rel="noopener noreferrer" className={cardClassName}>
        {content}
      </a>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

function LandingPagesShowcase() {
  return (
    <div className="mt-24">
      <div className="max-w-2xl">
        <Badge variant="outline" className="tracking-wide uppercase">
          Landing Pages
        </Badge>
        <Heading as="h3" size="h2" className="mt-6">
          Experiências digitais criadas para diferentes negócios.
        </Heading>
        <p className="text-muted-foreground mt-4 text-lg text-balance">
          Uma seleção de projetos demonstrativos explorando diferentes mercados, linguagens
          visuais e objetivos de conversão.
        </p>
      </div>

      {/* Mobile: scroll horizontal manual (swipe), sem loop automático — o
          marquee contínuo atrapalha em vez de ajudar em touch. */}
      <div
        className="scrollbar-hide mt-10 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:hidden"
      >
        {LANDING_PAGES.map((lp) => (
          <LandingPageCard key={lp.segment} lp={lp} className="w-[68vw] snap-start" />
        ))}
      </div>

      {/* Desktop: marquee automático da direita para a esquerda, pausa no
          hover/focus (.marquee-track já cobre isso), para com reduced-motion. */}
      <div
        className="mt-10 hidden -mx-4 overflow-hidden sm:block sm:-mx-6 lg:-mx-8"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="marquee-track flex w-max gap-6 px-4">
          <div className="flex shrink-0 gap-6">
            {LANDING_PAGES.map((lp) => (
              <LandingPageCard key={lp.segment} lp={lp} className="w-64" />
            ))}
          </div>
          {/* Cópia puramente visual para o loop contínuo — invisível para leitores de tela. */}
          <div className="flex shrink-0 gap-6">
            {LANDING_PAGES.map((lp) => (
              <LandingPageCard key={`dup-${lp.segment}`} lp={lp} className="w-64" ariaHidden />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { LandingPagesShowcase };
