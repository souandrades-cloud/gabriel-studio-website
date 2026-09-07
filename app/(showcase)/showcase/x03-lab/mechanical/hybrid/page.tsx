import type { Metadata } from "next";

import { HybridMechanicalExperience } from "@/components/showcase/x03-lab/mechanical/hybrid-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 05B Hypothesis C — Hybrid Mechanical Insert",
};

export default function HybridMechanicalPage() {
  return <HybridMechanicalExperience />;
}
