"use client";

import { FieldShell } from "./field-shell";
import { ReentryFieldCanvas } from "./reentry-scene";

export function ReentryFieldExperience() {
  return (
    <FieldShell
      label="Hypothesis B — Body Reentry"
      approachTag="body-reentry"
      note="THE CHOICE holds, unmodified, then a short structural dissolution — opacity and a brief positional jitter, no camera travel across the distance — cuts to PL-1 already mid-commitment at the same constraint, legs already engaged rather than performing the step live. Tests whether MIND-to-BODY needs a felt transformation more than it needs distance covered."
      renderScene={(args) => <ReentryFieldCanvas {...args} />}
    />
  );
}
