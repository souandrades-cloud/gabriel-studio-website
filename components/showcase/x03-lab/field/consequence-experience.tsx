"use client";

import { FieldShell } from "./field-shell";
import { ConsequenceFieldCanvas } from "./consequence-scene";

export function ConsequenceFieldExperience() {
  return (
    <FieldShell
      label="Hypothesis C — Consequence First"
      approachTag="consequence-first"
      note="Opens already tight and low on the wheel-leg mechanism stepping over the trench — no corridor, no THE CHOICE visible yet. The camera pulls back and widens to reveal PL-1 and the substation, and only then does the chosen route reappear beneath it, retroactively closing the loop back to the decision."
      renderScene={(args) => <ConsequenceFieldCanvas {...args} />}
    />
  );
}
