import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * `isolate` estabelece um stacking context próprio em toda seção (Sprint
 * 3L). Sem isso, um filho com z-index negativo — como o rim de luz de
 * `<AmbientGlow>` ou a dissolução de `<EdgeFade>` — escapa para o contexto do
 * documento inteiro, e o próprio background-color da seção acaba pintando
 * por cima dele: o sintoma era um corte seco entre seções em vez da
 * dissolução pretendida (achado ao integrar a Hero 3D na Sprint 3K, corrigido
 * caso a caso ali; movido para cá na 3L para valer em toda seção, presente ou
 * futura, sem precisar lembrar de repetir `isolate` manualmente).
 */
const sectionVariants = cva("w-full py-16 sm:py-20 lg:py-28 isolate", {
  variants: {
    background: {
      default: "bg-background",
      muted: "bg-muted/40",
      brand: "bg-brand-muted",
    },
  },
  defaultVariants: {
    background: "default",
  },
});

interface SectionProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {
  /** Renders children inside the standard `Container`. Disable for full-bleed content. */
  container?: boolean;
}

function Section({ className, background, container = true, children, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ background }), className)}
      {...props}
    >
      {container ? <Container>{children}</Container> : children}
    </section>
  );
}

export { Section, sectionVariants };
