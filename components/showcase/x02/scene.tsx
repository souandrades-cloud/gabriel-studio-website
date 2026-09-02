"use client";

import { Canvas } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { applyProceduralEnvironment } from "./environment-map";
import { ACTIVE_PALETTE } from "./palette";

import { AtmosphereRig } from "./atmosphere-rig";
import { CameraRig, ReducedCameraRig } from "./camera-rig";
import { Chamber } from "./chamber";
import { Interior as CoreInterior } from "./core-interior";
import { Shell as CoreShell } from "./core-shell";
import { DescentGates } from "./descent-gates";
import { FractureFragments } from "./fracture-fragments";
import { SHADOW_EXTENT, LIGHT_DISTANCE, ShadowRig } from "./shadow-rig";

/**
 * LIGHT FOUNDATION 001 — RAKING LIGHT. Elevação ~11,6° (mesma proporção já
 * validada em `x02-lab/material-world-v3/lighting-rig.tsx`, dentro da
 * faixa 8-14° pedida): é ela que acende os chanfros de `beveledBoxGeometry`
 * e as grooves de `descent-gates.tsx` — luz frontal/zenital não pega
 * aresta nenhuma. Cor vem de `ACTIVE_PALETTE.stoneHighlight` (não um tom
 * novo fora da paleta, como o `#c9cfd2` hardcoded do laboratório) — o
 * próprio token já existe para "acentos/rim que precisam se destacar de
 * uma superfície já clara". Estática (posição/cor/intensidade fixas nesta
 * sprint) — variar por estado é direção de arte (Sprint 7), fora do escopo
 * de LIGHT FOUNDATION. Não projeta sombra (pedido explícito do briefing).
 */
const RAKING_POSITION: readonly [number, number, number] = [-11, 2.4, 4];
const RAKING_INTENSITY = 1.5;

/**
 * UM Canvas só para os 8 estados — é a continuidade espacial em si que
 * está sendo testada nesta sprint (briefing, "Princípio de Integração"):
 * nenhum estado troca de cena, todos compartilham fog/luz/mundo.
 */
function X02Scene({
  active,
  mobile,
  scrollRef,
  pointerRef,
  onContextLost,
}: {
  active: boolean;
  mobile: boolean;
  scrollRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  onContextLost?: () => void;
}) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const zenithRef = useRef<THREE.DirectionalLight>(null);
  const fogRef = useRef<THREE.Fog>(null);
  // LIGHT FOUNDATION 001 — target da key light, movido junto da câmera por
  // ShadowRig (ver shadow-rig.tsx). Precisa ser um Object3D real na scene
  // graph (`<primitive>` abaixo) para o three.js recalcular sua
  // matrixWorld a cada frame — passar só a posição não bastaria.
  const keyTarget = useMemo(() => new THREE.Object3D(), []);
  const shadowMapSize = mobile ? 1024 : 2048;

  return (
    <Canvas
      dpr={[1, mobile ? 1 : 1.5]}
      // LIGHT FOUNDATION 001 — "low-power" forçava GPU integrada em
      // notebooks com GPU dupla; para uma peça de portfólio o hint correto
      // é "high-performance". DPR NÃO sobe nesta sprint: um shadow pass já
      // é custo novo real, e subir DPR ao mesmo tempo empilharia duas
      // mudanças de performance sem medição de FPS real disponível nesta
      // sessão (sem ferramenta de browser) — exatamente o que o briefing
      // pede para evitar ("não assumir que DPR 2 é automaticamente melhor").
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ near: 0.1, far: 170 }}
      // "always", mesmo em reduced-motion: a cena lê scrollRef diretamente
      // dentro de useFrame (Chamber, CoreShell, CoreInterior,
      // ReducedCameraRig) — sob
      // "demand" nada dispara um novo frame quando o usuário rola a
      // página (scroll é um evento DOM, não uma prop React), então a
      // câmera reduzida nunca acompanharia o scroll. Cena leve o bastante
      // (~8 draw calls) para o custo ser desprezível.
      frameloop="always"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl, scene }) => {
        gl.domElement.setAttribute("aria-hidden", "true");
        // LIGHT FOUNDATION 001 — SHADOW MAP: o briefing pede PCFSoftShadowMap,
        // mas o three@0.185.1 REALMENTE instalado neste projeto deprecou esse
        // tipo — `WebGLShadowMap.render()` detecta `type === PCFSoftShadowMap`
        // e faz downgrade silencioso para PCFShadowMap (duro), emitindo um
        // console.warn (confirmado empiricamente: warning capturado em QA
        // visual real desta sprint, não suposição — ver
        // node_modules/three/src/renderers/webgl/WebGLShadowMap.js:99-104).
        // Pedir PCFSoftShadowMap literalmente resultaria em sombra dura +
        // warning permanente no console — o oposto de "não trocar
        // silenciosamente" E reprova o próprio critério de QA desta sprint
        // ("console warnings"). VSMShadowMap é o caminho atual, não-deprecado,
        // para sombra suave nesta versão — `shadow-radius`/`shadow-blurSamples`
        // no key light (abaixo) controlam a suavidade.
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.VSMShadowMap;
        // LIGHT FOUNDATION 001 — TONE MAPPING: comparação numérica real
        // (não visual — sem ferramenta de browser nesta sessão) usando as
        // fórmulas exatas de three@0.185.1
        // (node_modules/three/src/renderers/shaders/ShaderChunk/
        // tonemapping_pars_fragment.glsl.js), avaliadas contra a radiância
        // real desta cena (ACTIVE_PALETTE.stone sob key/ambient de
        // atmosphere-rig.tsx, exposure=1.6). Resultado: ACES separa o
        // degradê médio-para-highlight (o range onde vivem os bevels e a
        // raking light) com ~1,3-2x mais contraste por passo de NdotL que
        // AgX, e mantém mais "punch" nos highlights do CORE — exatamente o
        // que esta sprint precisa para "bevel readability". AgX preserva
        // melhor o piso de sombra (ambient puro não crava tão perto do
        // preto), um ganho real, mas menor que a perda de contraste no
        // range que mais importa agora. Decisão: MANTER ACES (já era o
        // default implícito do R3F — agora explícito e documentado, não
        // silencioso). AgX permanece um toggle de uma linha para
        // reavaliação quando houver QA visual real em browser.
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.6;
        // MATERIAL WORLD V3 INTEGRATION 001: sem isto, o par metal de
        // structure.tsx/descent-gates.tsx/chamber.tsx (metalness alto)
        // renderiza quase preto — ver environment-map.ts.
        applyProceduralEnvironment(gl, scene);
        if (!onContextLost) return;
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}
    >
      {/* COMPOSITION + COLOR PASS 002 — Black Level: abandona #000000/quase-preto
          puro como base predominante (briefing, "Black Level"). */}
      <color attach="background" args={[ACTIVE_PALETTE.background]} />
      {/* LIGHT FOUNDATION 001: fog deixou de copiar `background` 1:1 (eram o
          MESMO valor sempre — zero profundidade atmosférica, achado do
          diagnóstico visual). `fogColor` é levemente mais claro/frio,
          calibrado dentro da mesma família — ver palette.ts. */}
      <fog ref={fogRef} attach="fog" args={[ACTIVE_PALETTE.fogColor, 12, 150]} />

      {/* VISUAL CONTINUITY FIX 003: valores iniciais só existem para o
          primeiro paint antes do primeiro useFrame de AtmosphereRig (que
          sobrescreve intensity/color todo frame) — hardcoded fora da
          paleta, agora referenciam o stop t=0 para o primeiro frame já
          nascer coerente. */}
      <ambientLight
        ref={ambientRef}
        intensity={0.42}
        color={ACTIVE_PALETTE.atmosphere.entry.ambient}
      />
      {/* LIGHT FOUNDATION 001 — única luz com shadow casting (briefing:
          "UMA única directional light"). position aqui só serve de valor
          inicial para o primeiro paint: ShadowRig sobrescreve position (e
          keyTarget.position) todo frame, mantendo o frustum ortográfico
          pequeno e centrado na câmera ao longo da jornada inteira (ver
          shadow-rig.tsx) — a DIREÇÃO da luz continua exatamente [-4,10,14]
          normalizada, intocada. */}
      <directionalLight
        ref={keyRef}
        castShadow
        target={keyTarget}
        position={[-4, 10, 14]}
        intensity={2.4}
        color={ACTIVE_PALETTE.atmosphere.entry.key}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-near={1}
        shadow-camera-far={LIGHT_DISTANCE + SHADOW_EXTENT * 1.8}
        shadow-bias={-0.0015}
        shadow-normalBias={0.02}
        // VSMShadowMap: `radius`/`blurSamples` (não `bias`) controlam a
        // suavidade — leve o bastante para ler como sombra arquitetônica,
        // não a mancha larga default de outras cenas VSM.
        shadow-radius={2.2}
        shadow-blurSamples={8}
      />
      <primitive object={keyTarget} />
      <directionalLight
        ref={fillRef}
        position={[7, -3, -4]}
        intensity={0.3}
        color={ACTIVE_PALETTE.atmosphere.entry.fill}
      />
      {/* Poço de luz zenital — realça as verticais do CORE e do campo de
          FRACTURE recuando na névoa, mesma receita validada no Prototype 001. */}
      <directionalLight
        ref={zenithRef}
        position={[1, 30, -30]}
        intensity={1.5}
        color={ACTIVE_PALETTE.atmosphere.entry.zenith}
      />
      {/* LIGHT FOUNDATION 001 — RAKING LIGHT, ver comentário no topo do
          arquivo. Sem shadow (pedido explícito do briefing). */}
      <directionalLight
        position={RAKING_POSITION}
        intensity={RAKING_INTENSITY}
        color={ACTIVE_PALETTE.stoneHighlight}
      />

      {/* Luz e fog espacialmente motivadas por estado (Art Direction 001,
          "Light") — sempre montado, motion e reduced-motion leem o mesmo
          scrollRef (ver atmosphere-rig.tsx). */}
      <AtmosphereRig
        ambientRef={ambientRef}
        keyRef={keyRef}
        fillRef={fillRef}
        zenithRef={zenithRef}
        fogRef={fogRef}
        scrollRef={scrollRef}
      />
      {/* LIGHT FOUNDATION 001 — segue a câmera para manter o shadow frustum
          apertado; sempre montado (não lê scrollRef, só camera.position —
          funciona igual em motion e reduced-motion). */}
      <ShadowRig keyRef={keyRef} target={keyTarget} />

      {active ? (
        <CameraRig mobile={mobile} scrollRef={scrollRef} pointerRef={pointerRef} />
      ) : (
        <ReducedCameraRig mobile={mobile} scrollRef={scrollRef} />
      )}

      <DescentGates mobile={mobile} scrollRef={scrollRef} />
      <Chamber mobile={mobile} scrollRef={scrollRef} />
      <FractureFragments mobile={mobile} scrollRef={scrollRef} />
      {/* CORE V2 PRODUCTION INTEGRATION — substitui structure.tsx/interior.tsx
          (removidos, ver relatório "arquivos removidos/alterados"). */}
      <CoreShell scrollRef={scrollRef} />
      <CoreInterior mobile={mobile} scrollRef={scrollRef} />
    </Canvas>
  );
}

export { X02Scene };
