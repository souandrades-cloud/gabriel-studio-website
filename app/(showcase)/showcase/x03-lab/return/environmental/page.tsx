import type { Metadata } from "next";

import { EnvironmentalReturnExperience } from "@/components/showcase/x03-lab/return/environmental-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 06A Hypothesis B — Environmental Return",
};

export default function EnvironmentalReturnPage() {
  return <EnvironmentalReturnExperience />;
}
