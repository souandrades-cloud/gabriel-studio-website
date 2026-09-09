"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * EXPERIMENTO B — FRACTURE. Fragmentos permanecem fisicamente estáticos
 * (briefing, "a geometria NÃO precisa se transformar"): é a câmera que
 * produz CAOS → ALINHAMENTO → CAOS ao percorrer uma curva autorada.
 *
 * Construção do alinhamento (anamorfismo puro, sem shader): os fragmentos
 * são posicionados ao longo do RAIO de visão da pose "aligned" — cada um a
 * uma profundidade diferente nesse raio, com um pequeno desvio perpendicular
 * PROPORCIONAL à profundidade (mantém o desvio ANGULAR constante visto de
 * `aligned`). Vistos exatamente de `aligned`, todos colapsam perto do centro
 * da tela — formando um eixo vertical (cada fragmento é uma lasca alta e
 * fina). Vistos de qualquer outro ângulo da curva, a mesma profundidade que
 * os alinha os espalha pela tela — é geometria de perspectiva pura, zero
 * transformação por frame.
 */
type Keyframe = { pos: readonly [number, number, number]; look: readonly [number, number, number] };

const ALIGNED_EYE: readonly [number, number, number] = [0, 3, 14];
const ALIGNED_LOOK: readonly [number, number, number] = [0, 3, -6];

const KEYFRAMES: Record<"desktop" | "mobile", Keyframe[]> = {
  desktop: [
    { pos: [7, 4.4, 18], look: [-1, 2.4, 2] },
    { pos: [3, 3.6, 15.5], look: [-0.3, 2.8, -1] },
    { pos: ALIGNED_EYE, look: ALIGNED_LOOK },
    { pos: [-2.6, 3.4, 10], look: [-0.2, 2.8, -6] },
    { pos: [-6, 2, -2], look: [0, 3, -9] },
  ],
  mobile: [
    { pos: [7.5, 5, 21], look: [-1, 2.4, 3] },
    { pos: [3, 4, 18.5], look: [-0.3, 2.8, -1] },
    { pos: [0, 3, 17], look: [0, 3, -3] },
    { pos: [-2.6, 3.6, 12], look: [-0.2, 2.8, -6] },
    { pos: [-6, 2, -2], look: [0, 3, -9] },
  ],
};

const SCROLL_BOUNDS = [0, 0.4, 0.5, 0.6, 1];
const CURVE_BOUNDS = [0, 0.25, 0.5, 0.75, 1];

function easeInCubic(t: number) {
  return t * t * t;
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

// Aproximação (lenta→rápida) / glide até o alinhamento (derivada zero na
// junção) / glide para fora (derivada zero na junção) / afastamento
// (rápida→lenta) — a derivada nula dos dois trechos centrais na fronteira
// u=0.5 é o que produz o "beat" perceptível exatamente no alinhamento.
const SEGMENT_EASES = [easeInCubic, easeInOutSine, easeInOutSine, easeOutCubic];

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function scrollToCurveU(t: number) {
  const clamped = clamp01(t);
  let i = SCROLL_BOUNDS.length - 2;
  for (let s = 0; s < SCROLL_BOUNDS.length - 1; s++) {
    if (clamped <= SCROLL_BOUNDS[s + 1]) {
      i = s;
      break;
    }
  }
  const span = SCROLL_BOUNDS[i + 1] - SCROLL_BOUNDS[i];
  const local = span > 0 ? (clamped - SCROLL_BOUNDS[i]) / span : 1;
  const eased = SEGMENT_EASES[i](clamp01(local));
  return CURVE_BOUNDS[i] + eased * (CURVE_BOUNDS[i + 1] - CURVE_BOUNDS[i]);
}

function FractureCamera({ mobile, scrollRef }: { mobile: boolean; scrollRef: RefObject<number> }) {
  const keyframes = mobile ? KEYFRAMES.mobile : KEYFRAMES.desktop;
  const posCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        keyframes.map((k) => new THREE.Vector3(...k.pos)),
        false,
        "catmullrom",
        0.5,
      ),
    [keyframes],
  );
  const lookCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        keyframes.map((k) => new THREE.Vector3(...k.look)),
        false,
        "catmullrom",
        0.5,
      ),
    [keyframes],
  );

  useFrame(({ camera }) => {
    const t = scrollRef.current ?? 0;
    const u = scrollToCurveU(t);
    const pos = posCurve.getPoint(u);
    const look = lookCurve.getPoint(u);
    camera.position.copy(pos);
    camera.lookAt(look);
  });

  return null;
}

/** Semente fixa — mesmo racional do protótipo 001: layout estável entre reloads, sem custo de mismatch (Canvas é client-only). */
function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Fragment = {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotationY: number;
  tiltX: number;
  tiltZ: number;
};

/** Ângulo de desvio (rad) visto do ponto `aligned` — pequeno o bastante para colapsar, grande o bastante para não virar linha matemática perfeita (leitura geológica, não digital). */
const ANGULAR_JITTER = 0.045;

function generateFragments(count: number): Fragment[] {
  const rand = mulberry32(20260901);
  const eye = new THREE.Vector3(...ALIGNED_EYE);
  const look = new THREE.Vector3(...ALIGNED_LOOK);
  const dir = look.clone().sub(eye).normalize();
  // Base ortonormal perpendicular a `dir`, para espalhar o desvio no plano perpendicular ao raio de visão.
  const up = Math.abs(dir.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(dir, up).normalize();
  const trueUp = new THREE.Vector3().crossVectors(right, dir).normalize();

  const fragments: Fragment[] = [];
  for (let i = 0; i < count; i++) {
    const depth = 3 + rand() * 15;
    const angle = rand() * Math.PI * 2;
    const jitterMag = depth * ANGULAR_JITTER * (0.4 + rand() * 0.9);
    const offset = right
      .clone()
      .multiplyScalar(Math.cos(angle) * jitterMag)
      .add(trueUp.clone().multiplyScalar(Math.sin(angle) * jitterMag));

    const position = eye.clone().add(dir.clone().multiplyScalar(depth)).add(offset);
    const h = 0.9 + rand() * 1.1;
    fragments.push({
      position,
      scale: new THREE.Vector3(0.1 + rand() * 0.08, h, 0.1 + rand() * 0.08),
      rotationY: rand() * Math.PI * 2,
      tiltX: (rand() - 0.5) * 0.12,
      tiltZ: (rand() - 0.5) * 0.12,
    });
  }
  return fragments;
}

function Fragments({ count }: { count: number }) {
  const fragments = useMemo(() => generateFragments(count), [count]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2b3134", roughness: 0.8, metalness: 0.1 }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    fragments.forEach((f, i) => {
      q.setFromEuler(new THREE.Euler(f.tiltX, f.rotationY, f.tiltZ));
      m.compose(f.position, q, f.scale);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [fragments]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />;
}

function FractureScene({ mobile, scrollRef }: { mobile: boolean; scrollRef: RefObject<number> }) {
  const count = mobile ? 22 : 34;
  return (
    <Canvas
      dpr={[1, mobile ? 1 : 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      camera={{ near: 0.1, far: 60, fov: mobile ? 46 : 40 }}
      frameloop="always"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => gl.domElement.setAttribute("aria-hidden", "true")}
    >
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 6, 40]} />
      <ambientLight intensity={0.28} color="#aab4b0" />
      <directionalLight position={[-3, 9, 8]} intensity={2.1} color="#eef2f0" />
      <directionalLight position={[4, -2, -3]} intensity={0.25} color="#39423f" />
      <FractureCamera mobile={mobile} scrollRef={scrollRef} />
      <Fragments count={count} />
    </Canvas>
  );
}

export { FractureScene };
