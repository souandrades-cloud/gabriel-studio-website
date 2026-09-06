"use client";

import { PerceptionShell } from "./perception-shell";
import { ActivePerceptionCanvas } from "./active-perception-scene";

export function ActivePerceptionExperience() {
  return (
    <PerceptionShell
      label="Hypothesis B — Active Perception"
      approachTag="active-perception"
      note="No scanner, no scan line, no HUD. Acquisition is an invisible point traveling the machine's intended route; nearby geometry brightens, gains edges, then settles into its classified read as the point passes. Unvisited FIELD stays a near-black silhouette — sensed, not yet understood. The route draws itself in behind the leading edge."
      renderScene={(args) => <ActivePerceptionCanvas {...args} />}
    />
  );
}
