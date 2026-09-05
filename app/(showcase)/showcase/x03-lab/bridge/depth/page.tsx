import type { Metadata } from "next";

import { DepthBridgeExperience } from "@/components/showcase/x03-lab/bridge/depth-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 03C Approach A: Depth/Displacement",
};

export default function DepthBridgePage() {
  return <DepthBridgeExperience />;
}
