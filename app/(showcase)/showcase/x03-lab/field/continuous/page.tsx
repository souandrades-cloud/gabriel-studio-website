import type { Metadata } from "next";

import { ContinuousFieldExperience } from "@/components/showcase/x03-lab/field/continuous-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 05A Hypothesis A: Continuous Commitment",
};

export default function ContinuousFieldPage() {
  return <ContinuousFieldExperience />;
}
