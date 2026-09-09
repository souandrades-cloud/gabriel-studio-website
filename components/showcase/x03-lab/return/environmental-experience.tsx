"use client";

import { ConsequenceHold } from "./consequence-hold";
import { EnvironmentalResolve } from "./environmental-resolve";
import { ReturnShell } from "./return-shell";
import { smoothstep, windowT } from "./constants";

/**
 * Hypothesis B — ENVIRONMENTAL RETURN. Holds Gate 05C's CONSEQUENCE frame,
 * then pulls back into A-008's full substation context — resolving WHERE
 * (live infrastructure, not a lab) and WHY (spatial intelligence doing
 * physical work there) through the world PL-1 is actually standing in,
 * never returning to a staged studio frame. Identity closes minimally,
 * in place, over the environment.
 */
const HOLD_EXIT: [number, number] = [0.14, 0.5];
const ENV: [number, number] = [0.16, 1];
const CAPTION_WINDOW: [number, number] = [0.42, 0.86];
const IDENTITY: [number, number] = [0.8, 1];

function EnvironmentalStage({ progress: v }: { progress: number }) {
  const holdExit = smoothstep(windowT(v, HOLD_EXIT));
  const envT = smoothstep(windowT(v, ENV));
  const identityT = smoothstep(windowT(v, IDENTITY));

  return (
    <div className="x03-return-dom">
      <EnvironmentalResolve
        t={envT}
        captionWindow={CAPTION_WINDOW}
        tag="WHERE"
        line="Substations, transmission yards — infrastructure built for machines, not people."
      />
      <ConsequenceHold exit={holdExit} />
      <div className="x03-return-identity" style={{ opacity: identityT }} aria-hidden="true">
        PROPRIO
      </div>
    </div>
  );
}

export function EnvironmentalReturnExperience() {
  return (
    <ReturnShell
      label="Hypothesis B — Environmental Return"
      approachTag="environmental-return"
      note="Pulls back from Gate 05C's CONSEQUENCE frame into A-008's full substation context instead of a studio frame — WHERE and WHY resolve through the real environment PL-1 is standing in. Identity settles in place, minimally, without ever returning to the product frame."
      renderDom={(progress) => <EnvironmentalStage progress={progress} />}
    />
  );
}
