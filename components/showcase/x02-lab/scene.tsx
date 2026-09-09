"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";

import { CameraRig } from "./camera-rig";
import { Interior } from "./interior";
import { Structure } from "./structure";

export type PerfMetrics = { fps: number; calls: number; triangles: number };

/**
 * Lê `gl.info` a cada frame e escreve num ref (throttlado a ~4x/s) — usado
 * só quando SHOW_DEBUG está ligado em experience.tsx (ver briefing,
 * "Debug"). Nunca dispara setState aqui dentro; o consumidor decide como/se
 * exibir.
 */
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

function X02LabScene({
  active,
  mobile,
  scrollRef,
  pointerRef,
  metricsRef,
  onContextLost,
}: {
  active: boolean;
  mobile: boolean;
  scrollRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  metricsRef?: RefObject<PerfMetrics>;
  onContextLost?: () => void;
}) {
  return (
    <Canvas
      dpr={[1, mobile ? 1 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ near: 0.1, far: 160 }}
      frameloop={active ? "always" : "demand"}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("aria-hidden", "true");
        if (!onContextLost) return;
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}
    >
      <color attach="background" args={["#050506"]} />
      {/* Névoa: única responsável por "fechar" o interior (sem teto/parede de
          fundo modelados) — ver briefing, "Impossible Interior". Near/far
          calibrados para a estrutura externa continuar legível em DISTANCE
          (~34 unidades da câmera) e o interior esmaecer aos poucos, não
          cortar de repente. */}
      <fog attach="fog" args={["#050506", 10, 130]} />

      {/* Iluminação arquitetônica neutra: ambient baixa, uma key raking que
          modela os chanfros das lajes, uma fill mínima do lado oposto. Sem
          rim colorido, sem neon (briefing, "Direção Visual Provisória"). */}
      <ambientLight intensity={0.42} color="#b7c0bc" />
      <directionalLight position={[-4, 10, 14]} intensity={2.4} color="#eef2f0" />
      <directionalLight position={[7, -3, -4]} intensity={0.3} color="#39423f" />
      {/* Luz zenital funcionando como "poço de luz" sobre o interior — realça
          as verticais que recuam na névoa sem virar decoração: um único
          feixe difuso, neutro, de cima (briefing permite "iluminação" como
          recurso provisório para o interior). */}
      <directionalLight position={[1, 30, -30]} intensity={1.5} color="#dfe6e3" />

      <CameraRig active={active} mobile={mobile} scrollRef={scrollRef} pointerRef={pointerRef} />
      <Structure />
      <Interior mobile={mobile} scrollRef={scrollRef} />
      {metricsRef && <PerfMonitor metricsRef={metricsRef} />}
    </Canvas>
  );
}

export { X02LabScene };
