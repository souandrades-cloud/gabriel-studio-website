import type { Metadata } from "next";

import { ThresholdExperience } from "@/components/showcase/x02-lab/threshold/threshold-experience";

export const metadata: Metadata = {
  title: "X02 LAB 002 — Surface / Threshold",
};

export default function ThresholdPage() {
  return <ThresholdExperience />;
}
