"use client";

import { BridgeShell } from "./bridge-shell";
import { DepthBridgeCanvas } from "./depth-scene";

export function DepthBridgeExperience() {
  return (
    <BridgeShell
      label="Approach A — Depth / Displacement"
      approachTag="depth-displacement"
      note="Single subdivided plane, vertex-displaced by a hand-authored depth mask. Scrub past ~0.7 to find where displacement starts tearing at the strut bands."
      renderScene={(args) => <DepthBridgeCanvas {...args} />}
    />
  );
}
