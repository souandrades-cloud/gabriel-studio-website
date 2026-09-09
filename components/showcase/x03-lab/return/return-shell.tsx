"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useMounted } from "@/hooks/use-mounted";

import { useBridgeProgress } from "../bridge/use-bridge-progress";
import { useReducedMotionPref } from "../bridge/use-reduced-motion-pref";

interface ReturnShellProps {
  label: string;
  approachTag: string;
  note: string;
  renderDom: (progress: number) => ReactNode;
}

/**
 * Gate 06A comparison chrome. DOM/CSS only, no canvas variant at all — the
 * brief explicitly rules out another WebGL proof ("Do NOT create another
 * Field Operation"), and Gate 05C already established that compositing
 * approved stills under one progress driver is the right closing register.
 * Mirrors FieldActionShell's structure (same driver, same debug block)
 * rather than MechanicalShell's, since this gate needs no A/B selectors of
 * its own — the three hypotheses ARE the three routes.
 */
export function ReturnShell({ label, approachTag, note, renderDom }: ReturnShellProps) {
  const mounted = useMounted();
  const reducedMotion = useReducedMotionPref();
  const { progress, playing, setPlaying, setProgress } = useBridgeProgress(reducedMotion);
  const active = mounted && !reducedMotion;

  return (
    <main className="x03-bridge-page">
      <header className="x03-bridge-header">
        <p className="x03-caption-tag" style={{ position: "static" }}>
          Gate 06A — Return / Resolution Discovery
        </p>
        <h1>{label}</h1>
        <p className="x03-bridge-note">{note}</p>
        <Link href="/showcase/x03-lab/return" className="x03-bridge-back">
          &larr; back to comparison index
        </Link>
      </header>

      <div className="x03-bridge-stage x03-perception-stage x03-return-viewport">
        {active ? (
          renderDom(progress)
        ) : (
          <div className="x03-bridge-fallback x03-perception-fallback">
            <p className="x03-fallback" style={{ position: "absolute" }}>
              RETURN static — {!mounted ? "loading" : "reduced motion"}
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
            aria-label="Return progress"
          />
          <span>{progress.toFixed(2)}</span>
        </div>
      )}

      {active && (
        <pre className="x03-debug" style={{ position: "static" }} aria-hidden="true">
          {`hypothesis  ${approachTag}
progress    ${progress.toFixed(3)}`}
        </pre>
      )}
    </main>
  );
}
