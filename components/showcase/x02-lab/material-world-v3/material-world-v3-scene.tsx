"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { ACTIVE_PALETTE } from "@/components/showcase/x02/palette";

import { CameraRigV3 } from "./camera-rig";
import { ColumnV3 } from "./column-v3";
import { EnvironmentV3 } from "./environment-v3";
import { FrameV3, type FormVariant } from "./frame-v3";
import { LightingRigV3 } from "./lighting-rig";

export type PerfMetrics = { fps: number; calls: number; triangles: number };

/**
 * `MeshStandardMaterial` com `metalness` alto e SEM `scene.environment`
 * renderiza quase preto — metais só refletem, não têm albedo difuso; sem
 * um mapa de ambiente para refletir, não sobra luz nenhuma (achado desta
 * sprint, visível no primeiro teste visual do capitel/soleira em metal).
 * Em vez de baixar `metalness` (perderia a resposta especular pedida no
 * briefing), gera um mapa de ambiente PROCEDURAL leve — um gradiente
 * equiretangular de 2 cores (não uma cena 3D, não um HDRI baixado) via
 * `PMREMGenerator`, o mesmo recurso nativo do three.js usado por
 * `<Environment>` do drei, sem adicionar a dependência. Montado dentro de
 * `onCreated` (callback puro do Canvas, não um valor de hook) — mutar
 * `scene.environment` fora daqui viola a mesma regra de imutabilidade do
 * React Compiler documentada em todo o resto do projeto (só refs/callbacks
 * de objetos three.js montados podem ser mutados, nunca o binding
 * retornado por um hook).
 */
function applyProceduralEnvironment(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(gl);
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size * 2;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#4a5257");
  grad.addColorStop(0.55, "#1c1f22");
  grad.addColorStop(1, "#0a0c10");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size * 2, size);
  const source = new THREE.CanvasTexture(canvas);
  source.mapping = THREE.EquirectangularReflectionMapping;
  source.colorSpace = THREE.SRGBColorSpace;
  const rt = pmrem.fromEquirectangular(source);
  scene.environment = rt.texture;
  scene.environmentIntensity = 0.85;
  source.dispose();
  pmrem.dispose();
}

/** Mesmo PerfMonitor do CORE V2 lab — só ligado via SHOW_DEBUG na experience. */
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

const COLUMNS: { position: readonly [number, number, number]; height: number }[] = [
  { position: [-4.2, 0, 6], height: 8.6 },
  { position: [4.6, 0, 5], height: 8.2 },
  { position: [-5.6, 0, -3], height: 9.4 },
  { position: [5.8, 0, -4], height: 9.0 },
];

function MaterialWorldV3Scene({
  variant,
  mobile,
  scrollRef,
  metricsRef,
  onContextLost,
}: {
  variant: FormVariant;
  mobile: boolean;
  scrollRef: RefObject<number>;
  metricsRef?: RefObject<PerfMetrics>;
  onContextLost?: () => void;
}) {
  return (
    <Canvas
      dpr={[1, mobile ? 1 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ near: 0.1, far: 140 }}
      frameloop="always"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl, scene }) => {
        gl.domElement.setAttribute("aria-hidden", "true");
        gl.toneMappingExposure = 1.45;
        applyProceduralEnvironment(gl, scene);
        if (!onContextLost) return;
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}
    >
      <color attach="background" args={[ACTIVE_PALETTE.background]} />
      <fog attach="fog" args={[ACTIVE_PALETTE.background, 9, 60]} />

      <LightingRigV3 />
      <CameraRigV3 mobile={mobile} scrollRef={scrollRef} />

      <FrameV3 variant={variant} position={[0, 0, 10]} />
      {COLUMNS.map((c, i) => (
        <ColumnV3 key={i} position={c.position} height={c.height} />
      ))}
      <EnvironmentV3 wallPosition={[0, 4.5, -9]} />

      {metricsRef && <PerfMonitor metricsRef={metricsRef} />}
    </Canvas>
  );
}

export { MaterialWorldV3Scene };
