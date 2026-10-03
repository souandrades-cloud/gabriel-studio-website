import type { Metadata } from "next";

import { HeroSpatial } from "@/components/sections/hero-spatial";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Lab — CONTROL: Hero H2 Spatial Architecture (baseline aprovada). */
export default function HeroV3ControlH2() {
  return (
    <>
      <HeroSpatial />
      <div className="bg-background h-[1200px]" aria-hidden="true" />
    </>
  );
}
