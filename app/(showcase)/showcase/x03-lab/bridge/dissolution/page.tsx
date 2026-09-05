import type { Metadata } from "next";

import { DissolutionBridgeExperience } from "@/components/showcase/x03-lab/bridge/dissolution-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 03C Approach C: Structural Dissolution",
};

export default function DissolutionBridgePage() {
  return <DissolutionBridgeExperience />;
}
