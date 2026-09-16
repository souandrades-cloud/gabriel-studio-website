import type { Metadata } from "next";

import { HeroDigitalCore3DAB } from "@/components/lab/hero-refinement/hero-digital-core-3d-ab";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function HeroRefinementAB() {
  return (
    <>
      <HeroDigitalCore3DAB />
      {/* Placeholder para testar o scroll-exit, igual ao /proto-3d de produção. */}
      <div className="bg-background h-[1200px]" aria-hidden="true" />
    </>
  );
}
