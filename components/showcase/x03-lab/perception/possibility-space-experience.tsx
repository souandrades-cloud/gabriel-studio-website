"use client";

import { PerceptionShell } from "./perception-shell";
import { PossibilitySpaceCanvas } from "./possibility-space-scene";

export function PossibilitySpaceExperience() {
  return (
    <PerceptionShell
      label="Hypothesis C — Possibility Space"
      approachTag="possibility-space"
      note="Understand settles early (the Perception Rig's own affordance material, reused as-is) so the timeline belongs to Decide: three real A*-solved candidate routes through the same obstacle field fade in as equal possibilities, then two recede while one brightens and sweeps in. The choice is a consequence of evaluation, not a line drawing itself."
      renderScene={(args) => <PossibilitySpaceCanvas {...args} />}
    />
  );
}
