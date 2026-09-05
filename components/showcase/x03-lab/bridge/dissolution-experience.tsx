"use client";

import { BridgeShell } from "./bridge-shell";
import { DissolutionBridgeCanvas } from "./dissolution-scene";

export function DissolutionBridgeExperience() {
  return (
    <BridgeShell
      label="Approach C — Structural Dissolution"
      approachTag="structural-dissolution"
      note="Flat plane, no proxy geometry. A per-pixel shader dissolves the photo into Sobel-edge line art, starting at the focal subject and spreading outward as progress advances."
      renderScene={(args) => <DissolutionBridgeCanvas {...args} />}
    />
  );
}
