import type { Metadata } from "next";

import { HeroEcosystem } from "@/components/sections/hero-ecosystem";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Lab — Hero V3 isolada (Floating Connected Ecosystem). */
export default function HeroV3Lab() {
  return (
    <>
      <HeroEcosystem />
      <div className="bg-background h-[1200px]" aria-hidden="true" />
    </>
  );
}
