"use client";

import { ConsequenceHold } from "./consequence-hold";
import { EnvironmentalResolve } from "./environmental-resolve";
import { ProductResolve } from "./product-resolve";
import { ReturnShell } from "./return-shell";
import { smoothstep, windowT } from "./constants";

/**
 * Hypothesis C — HYBRID RETURN. Resolves WHERE briefly through A-008's
 * environment (Hypothesis B's move), then transitions into the same quiet
 * A-001 product resolution Hypothesis A ends on. Two beats, not two
 * chapters: the environment gets only enough time to answer WHERE before
 * handing off — the frame it hands off TO is what carries the weight.
 */
const HOLD_EXIT: [number, number] = [0.06, 0.3];
const ENV: [number, number] = [0.08, 0.42];
const ENV_CAPTION_WINDOW: [number, number] = [0.3, 0.95];
const TRANSITION: [number, number] = [0.36, 0.62];
const PRODUCT: [number, number] = [0.46, 1];

function HybridStage({ progress: v }: { progress: number }) {
  const holdExit = smoothstep(windowT(v, HOLD_EXIT));
  const envT = smoothstep(windowT(v, ENV));
  const transitionT = smoothstep(windowT(v, TRANSITION));
  const productT = smoothstep(windowT(v, PRODUCT));

  return (
    <div className="x03-return-dom">
      <div className="x03-return-bg-field" style={{ opacity: 1 - transitionT }} />
      <div className="x03-return-bg-studio" style={{ opacity: transitionT }} />
      <div style={{ opacity: 1 - transitionT }}>
        <EnvironmentalResolve
          t={envT}
          captionWindow={ENV_CAPTION_WINDOW}
          tag="WHERE"
          line="Live infrastructure — not a lab, not a demo floor."
        />
      </div>
      <ConsequenceHold exit={holdExit} />
      <ProductResolve t={productT} tagline="Perception, decided into motion." />
    </div>
  );
}

export function HybridReturnExperience() {
  return (
    <ReturnShell
      label="Hypothesis C — Hybrid Return"
      approachTag="hybrid-return"
      note="A-008's environment resolves WHERE just long enough to answer it, then hands off to the same quiet A-001 product resolution Hypothesis A ends on. Context first, identity last — one transition, not two chapters."
      renderDom={(progress) => <HybridStage progress={progress} />}
    />
  );
}
