import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface TechGridProps {
  className?: string;
  /** Deriva extremamente lenta do grid, para não parecer papel quadriculado parado. */
  drift?: boolean;
}

/**
 * Textura de grid técnico (reaproveita `.bg-grid` de globals.css). Levemente
 * maior que o container para que o drift nunca revele uma borda. Deriva via
 * CSS puro (compositor thread), não Framer Motion — ver `AmbientGlow`.
 */
function TechGrid({ className, drift = false }: TechGridProps) {
  const style = drift
    ? ({ "--drift-x": "-10px", "--drift-y": "8px", "--drift-duration": "34s" } as CSSProperties)
    : undefined;

  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn("bg-grid pointer-events-none absolute -inset-4", drift && "ambient-drift", className)}
    />
  );
}

export { TechGrid };
