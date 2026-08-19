import { cn } from "@/lib/utils";

/**
 * Gráfico abstrato de linhas e nós — sugere arquitetura/conexões de sistema
 * sem ser literal. Puramente decorativo (sem texto/dados), monocromático,
 * pensado para opacidade baixa no background de uma seção.
 */
function AmbientLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      className={cn("text-foreground pointer-events-none", className)}
      fill="none"
    >
      <path
        d="M64 72 L216 148 L336 96"
        stroke="currentColor"
        strokeOpacity="0.14"
        strokeWidth="1"
      />
      <path
        d="M216 148 L176 292 L320 336"
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="1"
      />
      <path
        d="M64 72 L176 292"
        stroke="currentColor"
        strokeOpacity="0.07"
        strokeWidth="1"
      />
      <circle cx="64" cy="72" r="3" className="fill-brand/60" />
      <circle cx="216" cy="148" r="3" className="fill-brand/40" />
      <circle cx="336" cy="96" r="2.5" className="fill-brand/30" />
      <circle cx="176" cy="292" r="3" className="fill-brand/40" />
      <circle cx="320" cy="336" r="2.5" className="fill-brand/30" />
    </svg>
  );
}

export { AmbientLines };
