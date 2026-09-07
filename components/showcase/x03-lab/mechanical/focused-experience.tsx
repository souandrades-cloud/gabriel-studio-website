"use client";

import { MechanicalShell } from "./mechanical-shell";
import { FocusedMechanicalCanvas } from "./focused-scene";

export function FocusedMechanicalExperience() {
  return (
    <MechanicalShell
      label="Hypothesis A — Focused Mechanical Model"
      approachTag="focused-mechanical-model"
      note="Only the minimum linkage PL-1's wheel-leg needs — hip strut, knee link, axle, wheel, one chassis fragment — held in tight macro framing the entire time. No corridor, no full robot, no photograph: pure modeled geometry answering whether localized mechanism alone reads as real physical response to the step."
      variant="canvas"
      renderScene={(args) => <FocusedMechanicalCanvas {...args} />}
    />
  );
}
