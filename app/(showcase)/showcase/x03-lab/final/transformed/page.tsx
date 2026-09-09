import type { Metadata } from "next";

import { TransformedFinalExperience } from "@/components/showcase/x03-lab/final/transformed-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 08A Hypothesis C: Transformed Return",
};

export default function TransformedFinalPage() {
  return <TransformedFinalExperience />;
}
