import type { Metadata } from "next";

import { ReentryFieldExperience } from "@/components/showcase/x03-lab/field/reentry-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 05A Hypothesis B: Body Reentry",
};

export default function ReentryFieldPage() {
  return <ReentryFieldExperience />;
}
