"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode, type RefObject } from "react";

import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { useWebglSupport } from "@/hooks/use-webgl-support";

import { A005_SRC } from "./constants";
import { useBridgeProgress } from "./use-bridge-progress";
import { usePointerParallax } from "./use-pointer-parallax";
import { useBridgeStatsReadout } from "./bridge-stats";
import { useReducedMotionPref } from "./use-reduced-motion-pref";

export interface BridgeSceneArgs {
  progressRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  mobile: boolean;
}

interface BridgeShellProps {
  label: string;
  approachTag: string;
  note: string;
  renderScene: (args: BridgeSceneArgs) => ReactNode;
}

/**
 * Gate 03C comparison chrome, shared by the three microprototypes so the
 * only thing that differs between them is the technique in `renderScene`:
 * same stage aspect, same progress driver, same pointer parallax, same
 * fallbacks, same stats readout. Not styled beyond x03-lab.css's existing
 * plain/dark lab look — per the brief, no polish budget spent on debug UI.
 */
export function BridgeShell({ label, approachTag, note, renderScene }: BridgeShellProps) {
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

  return (
    <main className="x03-bridge-page">
      <header className="x03-bridge-header">
        <p className="x03-caption-tag" style={{ position: "static" }}>
          Gate 03C — Perceptual Bridge Discovery
        </p>
        <h1>{label}</h1>
        <p className="x03-bridge-note">{note}</p>
        <Link href="/showcase/x03-lab/bridge" className="x03-bridge-back">
          &larr; back to comparison index
        </Link>
      </header>

      <div ref={containerRef} className="x03-bridge-stage">
        {active ? (
          <CanvasErrorBoundary fallback={<StaticFallback reason="webgl context lost" />}>
            {renderScene({ progressRef, pointerRef, mobile: isMobile })}
          </CanvasErrorBoundary>
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
            aria-label="Bridge progress"
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
    <div className="x03-bridge-fallback">
      <Image src={A005_SRC} alt="" aria-hidden="true" fill sizes="(min-width: 768px) 640px, 100vw" className="object-cover" />
      <p className="x03-fallback" style={{ position: "absolute" }}>
        A-005 static — {reason}
      </p>
    </div>
  );
}
