"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FloatingBadgeProps {
  children: ReactNode;
  className?: string;
  /** Mostra um ponto verde pulsante antes do texto. */
  dot?: boolean;
  entranceDelay?: number;
  floatDelay?: number;
  floatDuration?: number;
  floatAmplitude?: number;
}

/**
 * Pequeno chip flutuante decorativo (ex: "Em produção", "Deploy"). Entra uma
 * vez com fade+slide (Framer Motion, custo único) e depois flutua em loop
 * lento via CSS puro (compositor thread, sem custo de JS contínuo) — sempre
 * `aria-hidden`, já que carrega apenas atmosfera, nenhuma informação essencial.
 */
function FloatingBadge({
  children,
  className,
  dot = false,
  entranceDelay = 0,
  floatDelay = 0,
  floatDuration = 3,
  floatAmplitude = 3,
}: FloatingBadgeProps) {
  const floatStyle = {
    "--float-y": `${-floatAmplitude}px`,
    "--float-duration": `${floatDuration}s`,
    "--float-delay": `${floatDelay}s`,
  } as CSSProperties;

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: entranceDelay }}
      className={cn("pointer-events-none", className)}
    >
      <div
        style={floatStyle}
        className="border-border bg-background/90 text-foreground ambient-float flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-md backdrop-blur"
      >
        {dot && <span className="bg-brand ambient-pulse block size-1.5 shrink-0 rounded-full" />}
        {children}
      </div>
    </motion.div>
  );
}

export { FloatingBadge };
