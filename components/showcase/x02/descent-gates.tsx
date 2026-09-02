"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { beveledBoxGeometry } from "./geometry-v3";
import { dressingStoneMaterial, frameStoneMaterial, metalAccentMaterial } from "./materials-v3";

/**
 * SPATIAL WORLD V2 — THRESHOLD/DESCENT. Substitui a leitura de "câmera
 * passando por blocos" por um único landmark reconhecível (o FRAME) que o
 * visitante atravessa fisicamente, mais duas massas WALL/SLAB e uma LEDGE
 * que dão paralaxe e mudança de elevação durante a queda — nenhuma delas
 * depende de campo aleatório ou só de fog para comunicar profundidade
 * (briefing, "Descent").
 *
 * Posições verificadas por simulação da câmera real (mesma técnica da
 * CHAMBER GAP FIX 003): script Node replicando KEYFRAMES/SEGMENT_EASES/
 * scrollToCurveU de camera-rig.tsx confirmou que o FRAME em [0,6,34] fica
 * inteiro em quadro do início de SURFACE até quase o fim de DESCENT
 * (t=0–0.16), abre naturalmente conforme a câmera se aproxima (t=0.19) e é
 * atravessado exatamente na virada DESCENT→CHAMBER (t≈0.22, distância à
 * frente da câmera cai para ~4 unidades) — a travessia acontece sozinha,
 * sem exigir nenhuma mecânica nova.
 *
 * QA visual desta sprint: WALL/LEDGE renderizadas sempre visíveis (mesmo
 * material do FRAME) ficavam todas em quadro já em SURFACE/THRESHOLD —
 * como as duas amostras (t=0 e t=0.22) enxergam praticamente a mesma
 * direção, tudo aparecia de uma vez, competindo com o FRAME em vez de se
 * revelar progressivamente durante a queda. Fix: FRAME continua sempre
 * opaco (é o landmark que precisa estar lá desde THRESHOLD); WALL/LEDGE
 * ganham opacity gating por scroll, revelando só durante DESCENT de verdade.
 */
const FRAME = {
  center: [0, 6, 34] as const,
  width: 8.2,
  height: 13,
  thickness: 3,
};

/** Janela de revelação das massas de paralaxe — depois que a cortina DOM
 *  termina de abrir (THRESHOLD_END=0.1 em experience.tsx), dentro do trecho
 *  em que a câmera de fato se move (ver camera-rig.tsx). */
const DRESSING_REVEAL_START = 0.08;
const DRESSING_REVEAL_END = 0.18;

const UP = new THREE.Vector3(0, 1, 0);
/** Mesma técnica de chamber.tsx: nasce relativo a uma amostra real da
 *  câmera (posição + look), nunca em x/z do mundo cru — garante que o
 *  objeto exista relativo ao que a câmera está de fato olhando. */
function sampleBasis(pos: THREE.Vector3, look: THREE.Vector3) {
  const forward = look.clone().sub(pos).normalize();
  const right = new THREE.Vector3().crossVectors(forward, UP).normalize();
  return { pos, forward, right };
}
function placeFromSample(
  pos: readonly [number, number, number],
  look: readonly [number, number, number],
  depth: number,
  lateral: number,
  heightOffset: number,
) {
  const {
    pos: p,
    forward,
    right,
  } = sampleBasis(new THREE.Vector3(...pos), new THREE.Vector3(...look));
  const world = p.clone().add(forward.multiplyScalar(depth)).add(right.multiplyScalar(lateral));
  world.y += heightOffset;
  return world;
}

/**
 * Três amostras: "a"/"b" são poses exatas de camera-rig.tsx (t=0 pose
 * estática de SURFACE/THRESHOLD; t=0.22 fim de DESCENT/início de CHAMBER),
 * não interpoladas. "c" é um ponto REAL da curva em t=0.19 (calculado com o
 * mesmo script Node que replica KEYFRAMES/SEGMENT_EASES/scrollToCurveU de
 * camera-rig.tsx — mesma técnica da CHAMBER GAP FIX 003).
 *
 * COMPOSITION + COLOR PASS 002 — achado do "Black Void Problem": entre
 * t≈0.16 e t=0.22 a câmera acelera muito rápido (easeInCubic — a maior
 * parte do trecho THRESHOLD->DESCENT é quase estática, depois "cai" de
 * uma vez, ver comentário de SEGMENT_EASES em camera-rig.tsx). As duas
 * amostras "a"/"b" cobriam só o início e o fim dessa queda — durante a
 * própria queda rápida não havia nenhuma massa PRÓXIMA da câmera, só o
 * FRAME distante e o CHAMBER ainda quase transparente (REVEAL_START da
 * época só começava depois do fim da queda) — resultado: tela quase preta
 * bem no meio do trecho de maior movimento, com o vazio/fog dominando o
 * quadro. "c" ancora uma SLAB extra exatamente nesse ponto da queda.
 */
const SAMPLES = {
  desktop: {
    a: { pos: [4.5, 9, 62], look: [0, 7, 20] } as const,
    b: { pos: [1.5, 6, 38], look: [0, 4, 15] } as const,
    c: { pos: [3.42, 7.87, 52.95], look: [0.46, 5.74, 18.04] } as const,
  },
  mobile: {
    a: { pos: [3.2, 9.2, 66], look: [0, 7, 20] } as const,
    b: { pos: [1.2, 6.4, 42], look: [0, 4, 15] } as const,
    c: { pos: [2.5, 8.15, 57.0], look: [0.46, 5.74, 17.93] } as const,
  },
};

/**
 * Profundidade/lateral dentro do orçamento angular seguro validado na
 * CHAMBER GAP FIX 003. heightOffset negativo pequeno (não 0): QA visual
 * mostrou que height/2 sem offset empurrava o topo da parede acima do
 * próprio FRAME, lendo como uma caixa solta flutuando sobre a verga em vez
 * de uma massa flanqueando por baixo — mesma família de erro vertical já
 * documentada (offset grande empurra para fora do enquadramento esperado,
 * aqui na direção oposta: para dentro do enquadramento do FRAME).
 */
const WALLS = [
  { anchor: "a" as const, depth: 14, lateral: -5.5, height: 10, boxDepth: 7, groove: true }, // esquerda, flanqueando o FRAME
  { anchor: "a" as const, depth: 10, lateral: 5, height: 9, boxDepth: 6, groove: true }, // direita, mais próxima
  // Ponte da queda rápida (ver comentário de SAMPLES acima) — mantém uma
  // massa PRÓXIMA e lateral durante o trecho t≈0.16-0.22, onde antes não
  // havia nada além do FRAME distante e do CHAMBER ainda transparente.
  { anchor: "c" as const, depth: 9, lateral: -6, height: 8, boxDepth: 5, groove: false },
  // MATERIAL WORLD V3 INTEGRATION 001 — FRAME V3, "segunda camada/recess":
  // reaproveita a mesma matemática de placement já validada (anchor "b" =
  // pose exata da travessia DESCENT→CHAMBER, t=0.22) em vez de inventar uma
  // geometria centrada no vão (risco: o vão é exatamente por onde a câmera
  // voa — um backer ali poderia ficar perto demais da trajetória). Massa
  // extra de profundidade logo depois da travessia reforça "existe mais
  // arquitetura além deste limiar", a mesma leitura perceptiva pedida.
  { anchor: "b" as const, depth: 5, lateral: 1.4, height: 7, boxDepth: 4, groove: false },
];

/** Ledge: laje quase horizontal um pouco abaixo do olhar — reforça
 *  "descendo para dentro" sem depender de corredor ou de fog sozinho. */
const LEDGE = { anchor: "b" as const, depth: 7, lateral: -3.5, heightOffset: -3.5 };

function DescentGates({ mobile, scrollRef }: { mobile: boolean; scrollRef: RefObject<number> }) {
  const samples = mobile ? SAMPLES.mobile : SAMPLES.desktop;

  const frameBoxes = useMemo(() => {
    // outerHalfWidth/outerHalfHeight precisam bater exatamente com o W/H
    // usados na verificação de frustum (frustum-check.js, FW=8.2/FH=13
    // como largura/altura TOTAIS do objeto, não metades) — usar FRAME.width
    // como metade aqui construiria um landmark 2x mais largo do que o
    // testado.
    const outerHalfWidth = FRAME.width / 2;
    const openingWidth = FRAME.width * 0.42;
    const openingTop = FRAME.height * 0.08;
    const outerHalfHeight = FRAME.height / 2;
    const totalJambWidth = FRAME.width - openingWidth;
    // COMPOSITION + COLOR PASS 002 — "não três BoxGeometry formando uma
    // porta": jambas assimétricas (pilar esquerdo mais maciço) em vez do
    // par idêntico anterior — o mesmo vão, mas lendo como um elemento
    // arquitetônico autorado, não uma abertura genérica centralizada.
    const leftJambWidth = totalJambWidth * 0.58;
    const rightJambWidth = totalJambWidth * 0.42;
    const headerH = outerHalfHeight - openingTop;
    const [cx, cy, cz] = FRAME.center;
    // Overhang: lip fina projetada à frente do header (+z, na direção de
    // onde a câmera vem) — dá espessura/profundidade ao FRAME em vez de uma
    // fachada plana de 3 caixas (briefing: "recess; thickness; overhang").
    const lipThickness = 0.6;
    // Centro real do vão, dado o par de jambas assimétrico (não é mais `cx`).
    const openingCenterX = cx + (leftJambWidth - rightJambWidth) / 2;
    // MATERIAL WORLD V3 INTEGRATION 001 — chanfro real por peça (não um
    // valor global): a lip tem a menor dimensão do conjunto (lipThickness=
    // 0.6), um bevel fixo maior que suas próprias metades quebraria a
    // geometria (beveledBoxGeometry já clampa, mas o resultado ficaria
    // quase todo chanfro, sem face plana). Jambas/header (thickness=3) usam
    // um chanfro mais generoso — são as arestas que definem a silhueta do
    // primeiro landmark da jornada.
    const jambBevel = 0.22;
    const lipBevel = 0.08;
    return [
      {
        size: [leftJambWidth, outerHalfHeight * 2, FRAME.thickness],
        position: [cx - outerHalfWidth + leftJambWidth / 2, cy, cz],
        bevel: jambBevel,
        material: "stone" as const,
      },
      {
        size: [rightJambWidth, outerHalfHeight * 2, FRAME.thickness],
        position: [cx + outerHalfWidth - rightJambWidth / 2, cy, cz],
        bevel: jambBevel,
        material: "stone" as const,
      },
      {
        size: [openingWidth, headerH, FRAME.thickness],
        position: [openingCenterX, cy + openingTop + headerH / 2, cz],
        bevel: jambBevel,
        material: "stone" as const,
      },
      {
        // Soleira: era parte do mesmo material de pedra do resto do FRAME;
        // agora o único traço de metal escovado deste elemento (briefing
        // FRAME V3: "apenas em detalhes") — reforça que a peça foi
        // construída, não modelada como um bloco só.
        size: [openingWidth * 1.2, lipThickness, lipThickness],
        position: [
          openingCenterX,
          cy + openingTop + headerH - lipThickness / 2,
          cz + FRAME.thickness / 2 + lipThickness / 2,
        ],
        bevel: lipBevel,
        material: "metal" as const,
      },
    ] as {
      size: [number, number, number];
      position: [number, number, number];
      bevel: number;
      material: "stone" | "metal";
    }[];
  }, []);

  const wallBoxes = useMemo(() => {
    return WALLS.map((w) => {
      const s = samples[w.anchor];
      const position = placeFromSample(s.pos, s.look, w.depth, w.lateral, -w.height * 0.15);
      return { position, height: w.height, boxDepth: w.boxDepth, groove: w.groove };
    });
  }, [samples]);

  const ledgePosition = useMemo(() => {
    const s = samples[LEDGE.anchor];
    return placeFromSample(s.pos, s.look, LEDGE.depth, LEDGE.lateral, LEDGE.heightOffset);
  }, [samples]);

  // MATERIAL WORLD V3 INTEGRATION 001 — FRAME/DESCENT V3: BoxGeometry cru
  // trocado por beveledBoxGeometry (chanfro real nas arestas, mesma técnica
  // validada em x02-lab/material-world-v3) — silhuetas/posições intocadas,
  // só a resposta à luz rasante muda.
  const frameGeometries = useMemo(
    () => frameBoxes.map((b) => beveledBoxGeometry(...b.size, b.bevel)),
    [frameBoxes],
  );
  const WALL_BEVEL = 0.14;
  const wallGeometries = useMemo(
    () => wallBoxes.map((w) => beveledBoxGeometry(2.6, w.height, w.boxDepth, WALL_BEVEL)),
    [wallBoxes],
  );
  const ledgeGeometry = useMemo(() => beveledBoxGeometry(7, 0.6, 11, 0.08), []);
  // DESCENT V3 — "joints/grooves" (briefing): não entalha a geometria
  // principal (custo desnecessário para o que a profundidade já entrega);
  // uma faixa fina de `stoneDark` recuada da face frontal lê como junta sob
  // luz rasante, mesmo princípio físico de uma junta construtiva real.
  // Só nas duas paredes-herói mais próximas do FRAME (`groove: true`) —
  // "seletivos", não em toda superfície (briefing: "não adicionar dezenas
  // de objetos").
  const grooveGeometries = useMemo(
    () =>
      wallBoxes.map((w) => (w.groove ? new THREE.BoxGeometry(0.16, w.height * 0.82, 0.05) : null)),
    [wallBoxes],
  );

  const frameMaterial = useMemo(() => frameStoneMaterial(), []);
  const sillMaterial = useMemo(() => metalAccentMaterial(), []);
  const dressingMaterial = useMemo(() => dressingStoneMaterial(), []);
  const grooveMaterial = useMemo(() => dressingStoneMaterial(), []);

  const dressingGroupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = scrollRef.current ?? 0;
    const opacity = THREE.MathUtils.smoothstep(t, DRESSING_REVEAL_START, DRESSING_REVEAL_END);
    const group = dressingGroupRef.current;
    if (!group) return;
    // LIGHT FOUNDATION 001: castShadow segue a mesma janela de opacidade —
    // sem isso, a malha projeta sombra opaca mesmo com opacity=0 (o shadow
    // depth pass do three.js não lê opacity de material transparente por
    // padrão), uma sombra visível ANTES do objeto existir para o olho.
    // Grooves ficam de fora: já SÃO uma sombra falsa (recesso raso lendo
    // como reentrância sob luz rasante) — uma sombra real de uma caixa de
    // 0.05 de espessura seria ruído, não ganho.
    const visible = opacity > 0.05;
    group.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshStandardMaterial).opacity = opacity;
        child.castShadow = child.material !== grooveMaterial && visible;
      }
    });
  });

  useEffect(() => {
    return () => {
      frameGeometries.forEach((g) => g.dispose());
      wallGeometries.forEach((g) => g.dispose());
      grooveGeometries.forEach((g) => g?.dispose());
      ledgeGeometry.dispose();
      frameMaterial.dispose();
      sillMaterial.dispose();
      dressingMaterial.dispose();
      grooveMaterial.dispose();
    };
  }, [
    frameGeometries,
    wallGeometries,
    grooveGeometries,
    ledgeGeometry,
    frameMaterial,
    sillMaterial,
    dressingMaterial,
    grooveMaterial,
  ]);

  return (
    <group>
      {/* LIGHT FOUNDATION 001: frame stone (sempre opaco) recebe cast+receive
          estático; a soleira em metal (peça pequena, "apenas em detalhes")
          fica de fora dos dois — sob VSMShadowMap todo mesh com
          receiveShadow=true também entra no depth pass como pseudo-caster
          (`WebGLShadowMap.js`: `object.castShadow || (object.receiveShadow
          && type === VSMShadowMap)`), então peças pequenas/finas custam o
          mesmo que uma massa grande sem contribuir shadow nenhuma visível —
          exatamente o "ativar indiscriminadamente" que o briefing pede pra
          evitar. */}
      {frameBoxes.map((b, i) => (
        <mesh
          key={`frame-${i}`}
          geometry={frameGeometries[i]}
          material={b.material === "metal" ? sillMaterial : frameMaterial}
          position={b.position}
          castShadow={b.material !== "metal"}
          receiveShadow={b.material !== "metal"}
        />
      ))}
      <group ref={dressingGroupRef}>
        {wallBoxes.map((w, i) => (
          <mesh
            key={`wall-${i}`}
            geometry={wallGeometries[i]}
            material={dressingMaterial}
            position={w.position}
            receiveShadow
          />
        ))}
        {/* Grooves: já SÃO uma sombra falsa (recesso raso lendo como
            reentrância sob luz rasante) — sob VSM, receiveShadow=true viraria
            pseudo-caster de uma caixa de 0.05 de espessura contra a própria
            parede atrás dela (risco de self-shadow acne), sem nenhum ganho:
            fora do cast E do receive. */}
        {wallBoxes.map((w, i) =>
          grooveGeometries[i] ? (
            <mesh
              key={`groove-${i}`}
              geometry={grooveGeometries[i]!}
              material={grooveMaterial}
              position={[w.position.x, w.position.y, w.position.z + w.boxDepth / 2 - 0.03]}
            />
          ) : null,
        )}
        <mesh
          geometry={ledgeGeometry}
          material={dressingMaterial}
          position={ledgePosition}
          receiveShadow
        />
      </group>
    </group>
  );
}

export { DescentGates };
