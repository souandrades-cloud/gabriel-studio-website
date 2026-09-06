import type { Metadata } from "next";

import { PossibilitySpaceExperience } from "@/components/showcase/x03-lab/perception/possibility-space-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 04A Hypothesis C: Possibility Space",
};

export default function PossibilitySpacePage() {
  return <PossibilitySpaceExperience />;
}
