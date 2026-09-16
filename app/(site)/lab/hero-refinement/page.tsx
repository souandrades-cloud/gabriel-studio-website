import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const OPTIONS = [
  {
    href: "/proto-3d",
    label: "Atual — Assembly + atmosfera",
    description:
      "Baseline de produção. Montagem única na entrada, depois respiração e loop de energia quase imperceptível.",
  },
  {
    href: "/lab/hero-refinement/b",
    label: "B — Signal / Connection",
    description:
      "Mesma geometria, materiais e câmera. Energia em batimento periódico legível (~6,4s) + duas conexões module→module em cadeia.",
  },
  {
    href: "/lab/hero-refinement/ab",
    label: "A+B — Assembly + Signal",
    description:
      'Sobre a B: montagem mais longa e mais espaçada (fragmentação → aproximação com peso), um beat estrutural de "sistema completo" no encaixe, e só então a coreografia de energia da B assume como estado de sistema vivo.',
  },
] as const;

/** Índice — HERO FINAL REFINEMENT DISCOVERY 001. Fora da navegação pública. */
export default function HeroRefinementLabIndex() {
  return (
    <Section background="default" className="pt-28 sm:pt-32">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="outline" className="tracking-wide uppercase">
          Lab
        </Badge>
        <Heading as="h1" size="display" className="mt-6">
          Hero Refinement — comparação
        </Heading>
        <p className="text-muted-foreground mt-6 text-lg text-balance">
          Discovery isolado, não é a Home pública. Nenhuma direção está aprovada — comparar lado a
          lado com o baseline atual antes de decidir.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {OPTIONS.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="group border-border focus-visible:ring-brand/50 block rounded-2xl border p-6 outline-none focus-visible:ring-3"
          >
            <Heading as="h2" size="h4">
              {option.label}
            </Heading>
            <p className="text-muted-foreground mt-2 text-sm text-balance">{option.description}</p>
          </Link>
        ))}
      </div>
    </Section>
  );
}
