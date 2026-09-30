import type { Metadata } from "next";

import { HeroDigitalCore3D } from "@/components/sections/hero-digital-core-3d";

// CONTROL da Hero anterior — rota interna, fora do índice (mesmo padrão dos labs).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Proto3D() {
  return (
    <>
      <HeroDigitalCore3D />
      {/* Placeholder só para permitir testar o scroll-exit da Hero nesta rota
          isolada — a rota real terá Serviços logo em seguida. */}
      <div className="bg-background h-[1200px]" aria-hidden="true" />
    </>
  );
}
