import type { Metadata } from "next";

import { HybridReturnExperience } from "@/components/showcase/x03-lab/return/hybrid-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 06A Hypothesis C — Hybrid Return",
};

export default function HybridReturnPage() {
  return <HybridReturnExperience />;
}
