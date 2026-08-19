import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface AmbientGlowProps {
  className: string;
  /** Deslocamento máximo do glow durante o drift, em px. */
  amplitude?: number;
  /** Duração de um ciclo completo de drift, em segundos. */
  duration?: number;
  /** Se true, a opacidade também "respira" lentamente junto do drift. */
  breathe?: boolean;
}

/**
 * Mancha de luz verde, borrada e posicionada via className (top/left/size),
 * que deriva muito lentamente para dar sensação de iluminação ambiente viva.
 * Roda via CSS puro (compositor thread) em vez de Framer Motion: com várias
 * instâncias simultâneas pela página, um loop infinito via JS por instância
 * tem custo de CPU real mesmo parado — CSS não. Para com reduced-motion.
 */
function AmbientGlow({ className, amplitude = 24, duration = 18, breathe = false }: AmbientGlowProps) {
  const style = {
    "--drift-x": `${amplitude}px`,
    "--drift-y": `${-amplitude * 0.6}px`,
    "--drift-duration": `${duration}s`,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn(
        "bg-brand ambient-drift pointer-events-none absolute rounded-full blur-3xl",
        breathe && "ambient-breathe",
        className,
      )}
    />
  );
}

export { AmbientGlow };
