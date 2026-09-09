"use client";

import { ConsequenceHold } from "./consequence-hold";
import { ProductResolve } from "./product-resolve";
import { ReturnShell } from "./return-shell";
import { smoothstep, windowT } from "./constants";

/**
 * Hypothesis A — PRODUCT BOOKEND. Holds Gate 05C's CONSEQUENCE frame
 * briefly, dissolves it away, and lets A-001 — the same master reference
 * that opens PL-1's identity everywhere else in X03 — become the whole
 * frame again. No environment, no new context: the return is entirely
 * about the body meaning more the second time it's seen.
 */
const HOLD_EXIT: [number, number] = [0.1, 0.42];
const PRODUCT: [number, number] = [0.22, 1];
const BG_SHIFT: [number, number] = [0.15, 0.55];

function BookendStage({ progress: v }: { progress: number }) {
  const holdExit = smoothstep(windowT(v, HOLD_EXIT));
  const productT = smoothstep(windowT(v, PRODUCT));
  const bgT = smoothstep(windowT(v, BG_SHIFT));

  return (
    <div className="x03-return-dom">
      <div className="x03-return-bg-field" style={{ opacity: 1 - bgT }} />
      <div className="x03-return-bg-studio" style={{ opacity: bgT }} />
      <ConsequenceHold exit={holdExit} />
      <ProductResolve
        t={productT}
        tagline="Spatial intelligence, resolved into motion."
        showNav
      />
    </div>
  );
}

export function BookendReturnExperience() {
  return (
    <ReturnShell
      label="Hypothesis A — Product Bookend"
      approachTag="product-bookend"
      note="A-001 becomes the whole frame again, exactly as it opens PL-1's identity everywhere else in X03. No new context, no environment — the return leans entirely on the body meaning more the second time it's seen. Minimal editorial line plus a restrained nav test, no CTA block."
      renderDom={(progress) => <BookendStage progress={progress} />}
    />
  );
}
