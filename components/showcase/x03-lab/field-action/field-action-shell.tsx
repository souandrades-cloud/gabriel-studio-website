"use client";

import { useState } from "react";

import { useMounted } from "@/hooks/use-mounted";

import { useBridgeProgress } from "../bridge/use-bridge-progress";
import { useReducedMotionPref } from "../bridge/use-reduced-motion-pref";
import {
  FIELD_ACTION_PHASES,
  TIMING_PRESETS,
  TRANSITION_GRAMMARS,
  activePhaseAt,
} from "./constants";
import { SequenceStage } from "./sequence-stage";

/**
 * Gate 05C chrome. Deliberately NOT another A/B/C discovery index like
 * Gate 05A/05B — the representation technique is already frozen (controlled
 * rendered sequence, no WebGL for PL-1's body). What THIS gate needs the
 * Human Director to A/B is timing and cut technique, so both are exposed as
 * live selectors over the SAME sequence rather than as separate routes.
 * Reuses useBridgeProgress verbatim (identical autoplay cadence to every
 * other x03-lab gate) — only the phase *boundaries* inside that 0-1 sweep
 * change per timing preset, not the driver itself.
 */
export function FieldActionShell() {
  const mounted = useMounted();
  const reducedMotion = useReducedMotionPref();
  const { progress, playing, setPlaying, setProgress } = useBridgeProgress(reducedMotion);
  const [presetIndex, setPresetIndex] = useState(0);
  const [grammarIndex, setGrammarIndex] = useState(0);

  const preset = TIMING_PRESETS[presetIndex];
  const grammar = TRANSITION_GRAMMARS[grammarIndex];
  const active = mounted && !reducedMotion;
  const activePhase = activePhaseAt(progress, preset.ranges).key;

  return (
    <main className="x03-bridge-page">
      <header className="x03-bridge-header">
        <p className="x03-caption-tag" style={{ position: "static" }}>
          Gate 05C — Field Action Sequence Design
        </p>
        <h1>THE CHOICE → THE BODY COMMITS</h1>
        <p className="x03-bridge-note">
          Cheap animatic, not final imagery. One stable photographic crop on A-001&apos;s front
          wheel-leg carries CONTACT / LOAD / COMMIT; a schematic overlay — not the photograph —
          carries the mechanical-response information a single studio still can&apos;t. Scrub or
          play through HANDOFF → CONTACT → LOAD → COMMIT → CONSEQUENCE, then use the two selectors
          below to A/B rhythm and cut technique independently.
        </p>
      </header>

      <div className="x03-bridge-stage x03-perception-stage x03-field-action-viewport">
        {active ? (
          <SequenceStage progress={progress} ranges={preset.ranges} grammar={grammar.key} />
        ) : (
          <div className="x03-bridge-fallback x03-perception-fallback">
            <p className="x03-fallback" style={{ position: "absolute" }}>
              FIELD ACTION static — {!mounted ? "loading" : "reduced motion"}
            </p>
          </div>
        )}

        {active && (
          <div className="x03-perception-info x03-field-action-rail" aria-hidden="true">
            {FIELD_ACTION_PHASES.map((phase) => (
              <div
                key={phase.key}
                className={
                  phase.key === activePhase
                    ? "x03-perception-info-item is-active"
                    : "x03-perception-info-item"
                }
              >
                <span className="x03-perception-info-tag">{phase.label}</span>
                {phase.key === activePhase && (
                  <span className="x03-perception-info-copy">{phase.copy}</span>
                )}
              </div>
            ))}
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
            aria-label="Field action progress"
          />
          <span>{progress.toFixed(2)}</span>
        </div>
      )}

      {active && (
        <div className="x03-field-action-selectors">
          <fieldset>
            <legend>Timing preset</legend>
            {TIMING_PRESETS.map((option, i) => (
              <label key={option.key} className={i === presetIndex ? "is-active" : undefined}>
                <input
                  type="radio"
                  name="timing"
                  checked={i === presetIndex}
                  onChange={() => setPresetIndex(i)}
                />
                {option.label}
              </label>
            ))}
            <p className="x03-field-action-selector-note">{preset.note}</p>
          </fieldset>

          <fieldset>
            <legend>Transition grammar</legend>
            {TRANSITION_GRAMMARS.map((option, i) => (
              <label key={option.key} className={i === grammarIndex ? "is-active" : undefined}>
                <input
                  type="radio"
                  name="grammar"
                  checked={i === grammarIndex}
                  onChange={() => setGrammarIndex(i)}
                />
                {option.label}
              </label>
            ))}
            <p className="x03-field-action-selector-note">{grammar.note}</p>
          </fieldset>
        </div>
      )}

      {active && (
        <pre className="x03-debug" style={{ position: "static" }} aria-hidden="true">
          {`phase       ${activePhase}
progress    ${progress.toFixed(3)}
timing      ${preset.key}
grammar     ${grammar.key}`}
        </pre>
      )}

      <FieldActionAnnotations />
    </main>
  );
}

/**
 * Director-facing notes OUTSIDE the cinematic viewport (brief: "annotations
 * OUTSIDE the cinematic viewport if useful for evaluation") — everything
 * the frame itself must NOT say out loud (per the brief's Primary Signature
 * Test: judged without explanatory text) lives here instead.
 */
function FieldActionAnnotations() {
  return (
    <section className="x03-field-action-annotations">
      <h2>Director notes</h2>
      <ul>
        <li>
          <strong>What&apos;s real:</strong> the A-001 photograph, the chosen-route accent color
          (#d9c9a6, identical to the production Perception Rig&apos;s CHOSEN_ROUTE), the
          timing/grammar structure itself.
        </li>
        <li>
          <strong>What&apos;s placeholder:</strong> the edge-line / load / advance cues are a
          schematic overlay, not photographed mechanical states — no true CONTACT/LOAD/COMMIT
          keyframe photography of PL-1 exists yet. The CONSEQUENCE environment (structure, cable
          channel, ground) is CSS silhouette, not a modeled substation. The HANDOFF frame is a
          graphic stand-in for THE CHOICE&apos;s final frame, not that scene rebuilt.
        </li>
        <li>
          <strong>Judge:</strong> sequence design (readability, causal continuity, framing, rhythm,
          state progression, transition grammar) — not visual fidelity, which belongs to later asset
          production.
        </li>
      </ul>
    </section>
  );
}
