import type { Metadata } from "next";

import { ConsequenceFieldExperience } from "@/components/showcase/x03-lab/field/consequence-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 05A Hypothesis C: Consequence First",
};

export default function ConsequenceFieldPage() {
  return <ConsequenceFieldExperience />;
}
