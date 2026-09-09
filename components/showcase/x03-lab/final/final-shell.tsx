"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useMounted } from "@/hooks/use-mounted";

import { useReducedMotionPref } from "../bridge/use-reduced-motion-pref";
import { useFinalProgress } from "./use-final-progress";

interface FinalShellProps {
  label: string;
  hypothesisTag: string;
  note: string;
  renderDom: (progress: number) => ReactNode;
}

/**
 * Gate 08A comparison chrome. DOM/CSS only, no canvas — mirrors
 * OpeningShell/ReturnShell exactly (same driver shape, same debug block);
 * this gate needs no A/B selectors of its own since the three hypotheses
 * ARE the three routes.
 */
export function FinalShell({ label, hypothesisTag, note, renderDom }: FinalShellProps) {
  const mounted = useMounted();
  const reducedMotion = useReducedMotionPref();
  const { progress, playing, setPlaying, setProgress } = useFinalProgress(reducedMotion);
  const active = mounted && !reducedMotion;

  return (
    <main className="x03-bridge-page">
      <header className="x03-bridge-header">
        <p className="x03-caption-tag" style={{ position: "static" }}>
          Gate 08A — Final Signature Re-Discovery
        </p>
        <h1>{label}</h1>
        <p className="x03-bridge-note">{note}</p>
        <Link href="/showcase/x03-lab/final" className="x03-bridge-back">
          &larr; back to comparison index
        </Link>
      </header>

      <div className="x03-bridge-stage x03-final-stage">
        {active ? (
          renderDom(progress)
        ) : (
          <div className="x03-bridge-fallback">
            <p className="x03-fallback" style={{ position: "absolute" }}>
              FINAL static — {!mounted ? "loading" : "reduced motion"}
            </p>
          </div>
        )}
      </div>

      {active && (
        <div className="x03-bridge-controls">
          <button type="button" onClick={() => setPlaying((value) => !value)}>
            {playing ? "Pause" : "Play"}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
            aria-label="Final progress"
          />
          <span>{progress.toFixed(2)}</span>
        </div>
      )}

      {active && (
        <pre className="x03-debug" style={{ position: "static" }} aria-hidden="true">
          {`hypothesis  ${hypothesisTag}
progress    ${progress.toFixed(3)}`}
        </pre>
      )}
    </main>
  );
}
