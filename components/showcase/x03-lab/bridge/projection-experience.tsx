"use client";

import { BridgeShell } from "./bridge-shell";
import { ProjectionBridgeCanvas } from "./projection-scene";

export function ProjectionBridgeExperience() {
  return (
    <BridgeShell
      label="Approach B — Camera Projection"
      approachTag="camera-projection"
      note="Three axis-aligned boxes (background, module mass, foreground band), textured by true projective mapping from a fixed projector camera. At 0.00 it matches the flat photo exactly; scrub forward to see seams open between layers."
      renderScene={(args) => <ProjectionBridgeCanvas {...args} />}
    />
  );
}
