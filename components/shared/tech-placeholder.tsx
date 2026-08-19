import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface TechPlaceholderProps {
  icon: LucideIcon;
  iconSize?: string;
  className?: string;
}

/**
 * Placeholder editorial (grid técnico + ícone) para itens sem asset real
 * ainda. Usado tanto nos cards de projeto quanto nas landing pages
 * demonstrativas — mesma linguagem visual, para não inventar imagens.
 */
function TechPlaceholder({ icon: Icon, iconSize = "size-12", className }: TechPlaceholderProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted/30 relative h-full w-full overflow-hidden transition-transform duration-700 group-hover:scale-[1.03]",
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden="true"
        className="bg-brand/15 pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative flex h-full items-center justify-center">
        <div
          className={cn(
            "border-border bg-background text-brand flex items-center justify-center rounded-xl border transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-105",
            iconSize,
          )}
        >
          <Icon className="size-1/2" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export { TechPlaceholder };
