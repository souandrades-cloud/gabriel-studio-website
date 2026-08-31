import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const headingVariants = cva(
  "font-heading font-semibold tracking-tight text-balance text-foreground",
  {
    variants: {
      size: {
        display: "text-4xl leading-[1.1] sm:text-5xl xl:text-6xl",
        h1: "text-3xl leading-tight sm:text-4xl lg:text-5xl",
        h2: "text-2xl leading-tight sm:text-3xl lg:text-4xl",
        h3: "text-xl leading-snug sm:text-2xl",
        h4: "text-lg leading-snug sm:text-xl",
        h5: "text-base leading-snug sm:text-lg",
      },
    },
    defaultVariants: {
      size: "h2",
    },
  },
);

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  /** Semantic tag rendered. Defaults to "h2"; set independently from `size`. */
  as?: HeadingLevel;
}

function Heading({ as, size, className, ...props }: HeadingProps) {
  // Tipado como o union pequeno de HeadingLevel (não `ElementType`): com o
  // react-three-fiber instalado, `ElementType` passa a cobrir centenas de
  // tags three.js globais junto das HTML, e a interseção de props de um
  // union tão amplo colapsa `data-slot` para `never`.
  const Comp = as ?? "h2";
  return (
    <Comp data-slot="heading" className={cn(headingVariants({ size }), className)} {...props} />
  );
}

export { Heading, headingVariants };
