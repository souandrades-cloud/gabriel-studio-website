import type { Metadata } from "next";

import { HeroDigitalCore3DB } from "@/components/lab/hero-refinement/hero-digital-core-3d-b";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function HeroRefinementB() {
  return (
    <>
      <HeroDigitalCore3DB />
      {/* Placeholder para testar o scroll-exit, igual ao /proto-3d de produção. */}
      <div className="bg-background h-[1200px]" aria-hidden="true" />
    </>
  );
}
