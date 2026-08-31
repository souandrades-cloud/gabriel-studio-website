import { cn } from "@/lib/utils";

interface GrainTextureProps {
  className?: string;
}

/**
 * Grão fotográfico extremamente sutil para dar profundidade a superfícies
 * dark — textura estática (sem animação), SVG de ruído fractal inline via
 * `.bg-grain`. Custo de render desprezível: é apenas um background-image.
 */
function GrainTexture({ className }: GrainTextureProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-grain pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay",
        className,
      )}
    />
  );
}

export { GrainTexture };
