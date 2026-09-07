"use client";

import { MechanicalShell } from "./mechanical-shell";
import { HybridMechanicalCanvas } from "./hybrid-scene";

export function HybridMechanicalExperience() {
  return (
    <MechanicalShell
      label="Hypothesis C — Hybrid Mechanical Insert"
      approachTag="hybrid-mechanical-insert"
      note="Holds on PL-1's photographic identity (A-001) while the camera holds; hard cuts — no dissolve — into Hypothesis A's focused mechanism only while the camera moves through the step, then hard cuts back to the photograph once PL-1 is past it. Where the camera moves, we model. Where the camera holds, we photograph."
      variant="canvas"
      renderScene={(args) => <HybridMechanicalCanvas {...args} />}
    />
  );
}
