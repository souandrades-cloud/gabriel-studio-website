import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const sectionVariants = cva("w-full py-16 sm:py-20 lg:py-28", {
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
