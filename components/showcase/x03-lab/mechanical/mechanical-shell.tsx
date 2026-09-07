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

export interface MechanicalSceneArgs {
  progressRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  mobile: boolean;
}

interface MechanicalShellProps {
  label: string;
  approachTag: string;
  note: string;
  /** "canvas" gates on WebGL support like every other x03-lab route;
   *  "dom" (Hypothesis B) renders plain CSS and never needs WebGL at all. */
  variant: "canvas" | "dom";
  /** Extra dev-only debug line(s), e.g. Hypothesis B's asset-dependency note. */
  debugExtra?: string;
  renderScene?: (args: MechanicalSceneArgs) => ReactNode;
  renderDom?: (progress: number) => ReactNode;
}

/**
 * Gate 05B comparison chrome. Deliberately NOT Gate 05A's FieldShell: no
 * SENSE/UNDERSTAND/DECIDE-style info-card overlay, because this gate's
 * brief puts information architecture out of the primary test ("Não
 * adicionar specifications. Não criar cards."). The only on-screen readout
 * is the same dev-only `.x03-debug` block every other x03-lab route
 * already uses. `variant` lets Hypothesis B render a plain DOM/CSS
 * sequence instead of a WebGL canvas while reusing the identical
 * header/controls/debug chrome and the same shared progress driver
 * (`useBridgeProgress`), so all three hypotheses stay comparable on
 * timing even though B's technique differs from A/C's.
 */
export function MechanicalShell({ label, approachTag, note, variant, debugExtra, renderScene, renderDom }: MechanicalShellProps) {
  const mounted = useMounted();
  const reducedMotion = useReducedMotionPref();
  const isMobile = useIsMobileViewport();
  const webglSupported = useWebglSupport();
  const { progressRef, progress, playing, setPlaying, setProgress } = useBridgeProgress(reducedMotion);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = usePointerParallax(containerRef);
  const stats = useBridgeStatsReadout();

  const needsWebgl = variant === "canvas";
  const active = mounted && !reducedMotion && (!needsWebgl || webglSupported);
  const fallbackReason = !mounted ? "loading" : reducedMotion ? "reduced motion" : "webgl unsupported";

  return (
    <main className="x03-bridge-page">
      <header className="x03-bridge-header">
        <p className="x03-caption-tag" style={{ position: "static" }}>
          Gate 05B — Mechanical Action Representation Discovery
        </p>
        <h1>{label}</h1>
        <p className="x03-bridge-note">{note}</p>
        <Link href="/showcase/x03-lab/mechanical" className="x03-bridge-back">
          &larr; back to comparison index
        </Link>
      </header>

      <div ref={containerRef} className="x03-bridge-stage x03-perception-stage">
        {active ? (
          needsWebgl ? (
            <CanvasErrorBoundary fallback={<StaticFallback reason="webgl context lost" />}>
              {renderScene?.({ progressRef, pointerRef, mobile: isMobile })}
            </CanvasErrorBoundary>
          ) : (
            renderDom?.(progress)
          )
        ) : (
          <StaticFallback reason={fallbackReason} />
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
            aria-label="Mechanical action progress"
          />
          <span>{progress.toFixed(2)}</span>
        </div>
      )}

      {active && (
        <pre className="x03-debug" style={{ position: "static" }} aria-hidden="true">
          {[
            `hypothesis  ${approachTag}`,
            ...(needsWebgl
              ? [
                  `fps         ${stats.fps}`,
                  `draw calls  ${stats.drawCalls}`,
                  `triangles   ${stats.triangles}`,
                  `dpr         ${stats.dpr.toFixed(2)}`,
                ]
              : []),
            ...(debugExtra ? [debugExtra] : []),
          ].join("\n")}
        </pre>
      )}
    </main>
  );
}

function StaticFallback({ reason }: { reason: string }) {
  return (
    <div className="x03-bridge-fallback x03-perception-fallback">
      <p className="x03-fallback" style={{ position: "absolute" }}>
        MECHANICAL static — {reason}
      </p>
    </div>
  );
}
