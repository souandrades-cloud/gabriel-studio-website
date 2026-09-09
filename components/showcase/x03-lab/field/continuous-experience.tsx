"use client";

import { FieldShell } from "./field-shell";
import { ContinuousFieldCanvas } from "./continuous-scene";

export function ContinuousFieldExperience() {
  return (
    <FieldShell
      label="Hypothesis A — Continuous Commitment"
      approachTag="continuous-commitment"
      note="THE CHOICE's corridor and chosen route continue unbroken: the camera keeps moving forward along the same line, the box-proxy geometry recolors from ink to industrial steel as it passes, and PL-1 fades into the route right at a real physical constraint — a cable trench it must step over. Maximum spatial continuity; the risk is reading as more Machine Space rather than a return to the body."
      renderScene={(args) => <ContinuousFieldCanvas {...args} />}
    />
  );
}
