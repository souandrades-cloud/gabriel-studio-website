"use client";

import { motion, type MotionValue } from "framer-motion";

import { cn } from "@/lib/utils";

interface CursorGlowProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  className?: string;
}

/**
 * Luz ambiente que se desloca sutilmente em direção ao cursor, com atraso
 * (spring) e amplitude limitada pelo chamador — nunca "gruda" no ponteiro,
 * é a atmosfera reagindo, não um spotlight. Só deve ser montado com
 * `pointer: fine` e fora de `reduced-motion` (ver Hero para os hooks).
 */
function CursorGlow({ x, y, className }: CursorGlowProps) {
  return (
    <motion.div
      aria-hidden="true"
      style={{ x, y }}
      className={cn(
        "bg-brand pointer-events-none absolute top-1/2 left-1/2 -mt-[280px] -ml-[280px] size-[560px] rounded-full opacity-[0.11] blur-[110px] mix-blend-screen",
        className,
      )}
    />
  );
}

export { CursorGlow };
