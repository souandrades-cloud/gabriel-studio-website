import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const OPTIONS = [
  {
    href: "/lab/home-portfolio/a",
    label: "A — Signature First",
    description: "X03 protagonista, X02+X01 secundários, Cora+Lume, Systems compacto.",
  },
  {
    href: "/lab/home-portfolio/b",
    label: "B — Capabilities",
    description: "Três famílias: Signature, Websites, Systems — igual peso editorial.",
  },
  {
    href: "/lab/home-portfolio/c",
    label: "C — Compact Spotlight",
    description: "Home curta: um Signature em foco, acesso rápido ao resto.",
  },
] as const;

/** Índice das três hipóteses — HOME PORTFOLIO PROTOTYPE 001. Fora da navegação pública. */
export default function HomePortfolioLabIndex() {
  return (
    <Section background="default" className="pt-28 sm:pt-32">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="outline" className="tracking-wide uppercase">
          Lab
        </Badge>
        <Heading as="h1" size="display" className="mt-6">
          Home Portfolio — três hipóteses
        </Heading>
        <p className="text-muted-foreground mt-6 text-lg text-balance">
          Comparação isolada, não é a Home pública. Nenhuma opção está aprovada.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
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
