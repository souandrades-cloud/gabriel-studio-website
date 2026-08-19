interface EdgeFadeProps {
  /** Tom da seção ANTERIOR, que se dissolve no topo desta seção. */
  tone: "dark" | "light";
  className?: string;
}

const TONE_COLOR = {
  dark: "oklch(0.145 0 0)",
  light: "oklch(0.9911 0.0013 106.42)",
};

/**
 * Faixa de gradiente no topo de uma seção, dissolvendo o tom da seção
 * anterior em vez de cortar seco. Mesma técnica reaproveitada em todas as
 * transições claro↔escuro da página — só o `tone` muda.
 */
function EdgeFade({ tone, className }: EdgeFadeProps) {
  return (
    <div
      aria-hidden="true"
      className={className ?? "pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 sm:h-36"}
      style={{ background: `linear-gradient(to bottom, ${TONE_COLOR[tone]}, transparent)` }}
    />
  );
}

export { EdgeFade };
