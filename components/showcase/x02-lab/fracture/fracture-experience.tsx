"use client";

import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import dynamic from "next/dynamic";
import { useRef } from "react";

import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { useWebglSupport } from "@/hooks/use-webgl-support";

const FractureScene = dynamic(() => import("./fracture-scene").then((m) => m.FractureScene), {
  ssr: false,
});

function StaticFallback() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "rgba(201,208,204,0.45)",
      }}
      aria-hidden="true"
    >
      X02 Lab — WebGL indisponível
    </div>
  );
}

function FractureExperience() {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobileViewport();
  const webglSupported = useWebglSupport();

  const motionActive = mounted && !prefersReducedMotion;

  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  // Pointer DESLIGADO por completo neste experimento (briefing): a
  // composição depende de uma câmera precisa, sem ruído de cursor.
  const scrollRef = useRef(0.5);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // Reduced-motion: pose "aligned" (u=0.5 na curva), não o fim da faixa —
    // é o único frame que importa aqui (ver fracture-scene.tsx).
    scrollRef.current = motionActive ? v : 0.5;
  });

  const showScene = mounted && webglSupported;

  return (
    <div className="x02-fracture-root">
      <h1 className="sr-only">
        X02 Lab — Experimento B: Fracture. Role a página para observar os fragmentos se alinharem.
      </h1>

      <div className="x02-fracture-canvas-layer">
        {showScene ? (
          <CanvasErrorBoundary fallback={<StaticFallback />}>
            <FractureScene mobile={isMobile} scrollRef={scrollRef} />
          </CanvasErrorBoundary>
        ) : (
          mounted && <StaticFallback />
        )}
      </div>

      <div className="x02-lab-caption" aria-hidden="true">
        <span className="x02-lab-caption-tag">X02 — Lab 002 / B</span>
      </div>

      <div ref={trackRef} aria-hidden="true" style={{ height: motionActive ? "320vh" : "100vh" }} />
    </div>
  );
}

export { FractureExperience };
