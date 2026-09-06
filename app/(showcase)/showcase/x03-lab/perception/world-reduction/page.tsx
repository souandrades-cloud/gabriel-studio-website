import type { Metadata } from "next";

import { WorldReductionExperience } from "@/components/showcase/x03-lab/perception/world-reduction-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 04A Hypothesis A: World Reduction",
};

export default function WorldReductionPage() {
  return <WorldReductionExperience />;
}
