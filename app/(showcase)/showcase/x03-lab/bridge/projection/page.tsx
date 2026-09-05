import type { Metadata } from "next";

import { ProjectionBridgeExperience } from "@/components/showcase/x03-lab/bridge/projection-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 03C Approach B: Camera Projection",
};

export default function ProjectionBridgePage() {
  return <ProjectionBridgeExperience />;
}
