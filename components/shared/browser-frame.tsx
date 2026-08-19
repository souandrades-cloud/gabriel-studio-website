import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface BrowserFrameProps {
  children: ReactNode;
  className?: string;
}

/**
 * Moldura discreta de janela/app ao redor de um screenshot real, para que
 * ele leia como apresentação de produto em vez de "imagem jogada na página".
 * Controles neutros (sem semáforo vermelho/amarelo/verde) para manter o tom
 * premium. Espera um ancestral com a classe `group` para reagir ao hover.
 */
function BrowserFrame({ children, className }: BrowserFrameProps) {
  return (
    <div className={cn("relative flex h-full w-full flex-col", className)}>
      <div className="border-border/60 bg-muted/60 relative z-10 flex shrink-0 items-center gap-1.5 border-b px-4 py-2.5 backdrop-blur-sm transition-colors duration-300 group-hover:border-brand/20">
        <span className="bg-muted-foreground/25 size-2 rounded-full" />
        <span className="bg-muted-foreground/25 size-2 rounded-full" />
        <span className="bg-muted-foreground/25 size-2 rounded-full" />
        <span className="border-border/60 bg-background/40 ml-2 h-4 w-full max-w-36 rounded-full border" />
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

export { BrowserFrame };
