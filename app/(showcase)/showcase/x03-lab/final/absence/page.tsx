import type { Metadata } from "next";

import { AbsenceFinalExperience } from "@/components/showcase/x03-lab/final/absence-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 08A Hypothesis B: Reveal Through Absence",
};

export default function AbsenceFinalPage() {
  return <AbsenceFinalExperience />;
}
