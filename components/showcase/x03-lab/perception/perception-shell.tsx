"use client";

import Link from "next/link";
import { useRef, type ReactNode, type RefObject } from "react";

import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { useWebglSupport } from "@/hooks/use-webgl-support";

import { useBridgeProgress } from "../bridge/use-bridge-progress";
import { usePointerParallax } from "../bridge/use-pointer-parallax";
import { useBridgeStatsReadout } from "../bridge/bridge-stats";
import { useReducedMotionPref } from "../bridge/use-reduced-motion-pref";
import { INFO_STAGES } from "./constants";

export interface PerceptionSceneArgs {
  progressRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  mobile: boolean;
}

interface PerceptionShellProps {
  label: string;
  approachTag: string;
  note: string;
  renderScene: (args: PerceptionSceneArgs) => ReactNode;
}

/**
 * Gate 04A comparison chrome — same reuse discipline as Gate 03C's
 * BridgeShell (components/showcase/x03-lab/bridge/bridge-shell.tsx), whose
 * progress/pointer/reduced-motion/stats hooks this shell reuses directly
 * rather than re-implementing: the only thing that should differ between
 * the three microprototypes is the technique in `renderScene`. Adds one
 * thing BridgeShell didn't need — the SENSE/UNDERSTAND/DECIDE readout that
 * is this gate's "information integration test".
 */
export function PerceptionShell({ label, approachTag, note, renderScene }: PerceptionShellProps) {
  const mounted = useMounted();
  const reducedMotion = useReducedMotionPref();
  const isMobile = useIsMobileViewport();
  const webglSupported = useWebglSupport();
  const { progressRef, progress, playing, setPlaying, setProgress } = useBridgeProgress(reducedMotion);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = usePointerParallax(containerRef);
  const stats = useBridgeStatsReadout();

  const active = mounted && !reducedMotion && webglSupported;
  const fallbackReason = !mounted ? "loading" : reducedMotion ? "reduced motion" : "webgl unsupported";

  const activeStage = INFO_STAGES.find((stage) => progress >= stage.range[0] && progress < stage.range[1]) ?? INFO_STAGES[INFO_STAGES.length - 1];

  return (
    <main className="x03-bridge-page">
      <header className="x03-bridge-header">
        <p className="x03-caption-tag" style={{ position: "static" }}>
          Gate 04A — Machine Perception Narrative Discovery
        </p>
        <h1>{label}</h1>
        <p className="x03-bridge-note">{note}</p>
        <Link href="/showcase/x03-lab/perception" className="x03-bridge-back">
          &larr; back to comparison index
        </Link>
      </header>

      <div ref={containerRef} className="x03-bridge-stage x03-perception-stage">
        {active ? (
          <CanvasErrorBoundary fallback={<StaticFallback reason="webgl context lost" />}>
            {renderScene({ progressRef, pointerRef, mobile: isMobile })}
          </CanvasErrorBoundary>
        ) : (
          <StaticFallback reason={fallbackReason} />
        )}

        {active && (
          <div className="x03-perception-info" aria-hidden="true">
            {INFO_STAGES.map((stage) => (
              <div key={stage.key} className={stage.key === activeStage.key ? "x03-perception-info-item is-active" : "x03-perception-info-item"}>
                <span className="x03-perception-info-tag">{stage.tag}</span>
                {stage.key === activeStage.key && <span className="x03-perception-info-copy">{stage.copy}</span>}
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
            aria-label="Perception progress"
          />
          <span>{progress.toFixed(2)}</span>
        </div>
      )}

      {active && (
        <pre className="x03-debug" style={{ position: "static" }} aria-hidden="true">
          {`approach    ${approachTag}
fps         ${stats.fps}
draw calls  ${stats.drawCalls}
triangles   ${stats.triangles}
dpr         ${stats.dpr.toFixed(2)}`}
        </pre>
      )}
    </main>
  );
}

function StaticFallback({ reason }: { reason: string }) {
  return (
    <div className="x03-bridge-fallback x03-perception-fallback">
      <p className="x03-fallback" style={{ position: "absolute" }}>
        FIELD static — {reason}
      </p>
    </div>
  );
}
