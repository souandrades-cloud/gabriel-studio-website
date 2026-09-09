import type { Metadata } from "next";

import { MonumentOpeningExperience } from "@/components/showcase/x03-lab/opening/monument-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 07A Hypothesis C: Product as Monument",
};

export default function MonumentOpeningPage() {
  return <MonumentOpeningExperience />;
}
