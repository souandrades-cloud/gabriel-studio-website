"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";

import { CameraRig } from "./camera-rig";
import { Interior } from "./interior";
import { Shell } from "./shell";

export type PerfMetrics = { fps: number; calls: number; triangles: number };

/** Mesmo PerfMonitor do Prototype 001 (scene.tsx) — só ligado quando
 *  SHOW_DEBUG está true em core-v2-experience.tsx. */
function PerfMonitor({ metricsRef }: { metricsRef: RefObject<PerfMetrics> }) {
  const acc = useRef(0);
  const frames = useRef(0);
  useFrame((state, delta) => {
    frames.current += 1;
    acc.current += delta;
    if (acc.current < 0.25) return;
    metricsRef.current = {
      fps: Math.round(frames.current / acc.current),
      calls: state.gl.info.render.calls,
      triangles: state.gl.info.render.triangles,
    };
    frames.current = 0;
    acc.current = 0;
  });
  return null;
}

function CoreV2Scene({
  mobile,
  scrollRef,
  metricsRef,
  onContextLost,
}: {
  mobile: boolean;
  scrollRef: RefObject<number>;
  metricsRef?: RefObject<PerfMetrics>;
  onContextLost?: () => void;
}) {
  return (
    <Canvas
      dpr={[1, mobile ? 1 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ near: 0.1, far: 160 }}
      frameloop="always"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("aria-hidden", "true");
        gl.toneMappingExposure = 1.6;
        if (!onContextLost) return;
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}
    >
      <color attach="background" args={["#050506"]} />
      {/* Perto o bastante para o SHELL continuar legível em DISTANCE (~47u
          da câmera), longe o bastante para a FAR WALL (Z=-72) ainda ser
          percebida — hazy, não invisível — em IMPOSSIBLE REVEAL. Teste
          visual: com far=105 a FAR WALL ficava indistinguível do void por
          trás do eco do FRAME; 125 mantém uma leitura de plano, não só
          escuridão. */}
      <fog attach="fog" args={["#050506", 10, 125]} />

      <ambientLight intensity={0.48} color="#b7c0bc" />
      {/* Key raking, baixa e lateral — modela a espessura das jambas do
          FRAME (briefing, "Lighting": FRAME legível por luz, não por
          textura/emissive/shader). */}
      <directionalLight position={[-6, 6, 16]} intensity={2.2} color="#eef2f0" />
      <directionalLight position={[7, -3, -4]} intensity={0.34} color="#39423f" />
      {/* Zenith — poço de luz sobre o COLUMN ROW e o eco do FRAME; primeiro
          teste visual saiu escuro demais lá dentro (ver interior.tsx),
          intensidade subida junto com a cor-base dos materiais. */}
      <directionalLight position={[1, 30, -40]} intensity={1.9} color="#dfe6e3" />

      <CameraRig mobile={mobile} scrollRef={scrollRef} />
      <Shell />
      <Interior mobile={mobile} scrollRef={scrollRef} />
      {metricsRef && <PerfMonitor metricsRef={metricsRef} />}
    </Canvas>
  );
}

export { CoreV2Scene };
