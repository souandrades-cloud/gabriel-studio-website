import type { Metadata } from "next";

import { ActivePerceptionExperience } from "@/components/showcase/x03-lab/perception/active-perception-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 04A Hypothesis B: Active Perception",
};

export default function ActivePerceptionPage() {
  return <ActivePerceptionExperience />;
}
