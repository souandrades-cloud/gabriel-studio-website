import type { Metadata } from "next";

import { PresenceOpeningExperience } from "@/components/showcase/x03-lab/opening/presence-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 07A Hypothesis A: Presence Before Reveal",
};

export default function PresenceOpeningPage() {
  return <PresenceOpeningExperience />;
}
