import type { Metadata } from "next";

import { MonumentalFinalExperience } from "@/components/showcase/x03-lab/final/monumental-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 08A Hypothesis A: Monumental Return",
};

export default function MonumentalFinalPage() {
  return <MonumentalFinalExperience />;
}
