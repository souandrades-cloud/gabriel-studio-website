"use client";

import { PerceptionShell } from "./perception-shell";
import { WorldReductionCanvas } from "./world-reduction-scene";

export function WorldReductionExperience() {
  return (
    <PerceptionShell
      label="Hypothesis A — World Reduction"
      approachTag="world-reduction"
      note="The same corridor FIELD as x03-lab's Perception Rig. Presence redistributes by operational relevance as you scrub: the ground, obstacles and doorway hold; decorative structure and overhead beams thin toward near-transparent. The route only appears once the world has already reduced to its residue."
      renderScene={(args) => <WorldReductionCanvas {...args} />}
    />
  );
}
