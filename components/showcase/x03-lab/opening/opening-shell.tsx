"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useMounted } from "@/hooks/use-mounted";

import { useReducedMotionPref } from "../bridge/use-reduced-motion-pref";
import { useOpeningProgress } from "./use-opening-progress";

interface OpeningShellProps {
  label: string;
  hypothesisTag: string;
  note: string;
  renderDom: (progress: number) => ReactNode;
}

/**
 * Gate 07A comparison chrome. DOM/CSS only, no canvas — the brief asks for
 * CONFIDENCE BEFORE COMPLEXITY and rules out treating this as a technology
 * demo. Mirrors ReturnShell's structure (Gate 06A): same driver shape, same
 * debug block, `useOpeningProgress` in place of the shared bridge hook only
 * because this gate's cycle is deliberately much slower.
 */
export function OpeningShell({ label, hypothesisTag, note, renderDom }: OpeningShellProps) {
  const mounted = useMounted();
  const reducedMotion = useReducedMotionPref();
  const { progress, playing, setPlaying, setProgress } = useOpeningProgress(reducedMotion);
  const active = mounted && !reducedMotion;

  return (
    <main className="x03-bridge-page">
      <header className="x03-bridge-header">
        <p className="x03-caption-tag" style={{ position: "static" }}>
          Gate 07A — Opening Architecture Re-Discovery
        </p>
        <h1>{label}</h1>
        <p className="x03-bridge-note">{note}</p>
        <Link href="/showcase/x03-lab/opening" className="x03-bridge-back">
          &larr; back to comparison index
        </Link>
      </header>

      <div className="x03-bridge-stage x03-opening-stage">
        {active ? (
          renderDom(progress)
        ) : (
          <div className="x03-bridge-fallback">
            <p className="x03-fallback" style={{ position: "absolute" }}>
              OPENING static — {!mounted ? "loading" : "reduced motion"}
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
            aria-label="Opening progress"
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
