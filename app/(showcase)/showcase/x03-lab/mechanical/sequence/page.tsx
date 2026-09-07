import type { Metadata } from "next";

import { SequenceMechanicalExperience } from "@/components/showcase/x03-lab/mechanical/sequence-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 05B Hypothesis B — Controlled Rendered Sequence",
};

export default function SequenceMechanicalPage() {
  return <SequenceMechanicalExperience />;
}
