"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

/**
 * Matched-proxy camera: three keyframes (not a curve) so the dolly's slope
 * never flattens to zero near the track end — a smoothstep/ease would go
 * dead-flat right where the wheel-tick QA checks for continued response.
 */
const CAMERA_DOLLY_TIMELINE = [0.4, 0.7, 1];
const CAMERA_Z = [6.4, 4.75, 4.3];
const CAMERA_Y = [0, 0.14, 0.2];
const CAMERA_FOV = [34, 31, 29.5];

// Photograph → computational-language convergence (mirrors A-005's own
// language: solid mass fades toward line structure, never fully vanishes).
const WIREFRAME_TIMELINE = [0.56, 0.88];

interface SceneProps {
  mobile: boolean;
  scrollRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
}

/**
 * Minimal proxy for the A-004/A-005 sensor cavity — recognizable anchor
 * masses only (Gate 03B §05 priority list), not a reconstruction. Twin lens
 * modules + lower sensor + finned compute block + one upper brace + a cable
 * run + the near-camera diagonal strut that frames the shot in both photos.
 */
function SensorCavity({ mobile, scrollRef, pointerRef }: SceneProps) {
  const graphite = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#4a463d", roughness: 0.48, metalness: 0.35, transparent: true }),
    [],
  );
  const graphiteDark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2a2620", roughness: 0.55, metalness: 0.2, transparent: true }),
    [],
  );
  const lensGlass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#141210", roughness: 0.2, metalness: 0.25, transparent: true }),
    [],
  );
  const edgeMaterial = useMemo(
    () => new THREE.LineBasicMaterial({ color: "#d9c9a6", transparent: true, opacity: 0 }),
    [],
  );

  // One mesh ref per shared material, used only to reach `.material` inside
  // useFrame — mutating the useMemo'd material binding directly is what the
  // compiler's immutability check forbids (same pattern as interior.tsx).
  // Every other mesh below points at the same material object, so mutating
  // it through any one anchor updates all of them.
  const graphiteAnchorRef = useRef<THREE.Mesh>(null);
  const graphiteDarkAnchorRef = useRef<THREE.Mesh>(null);
  const lensAnchorRef = useRef<THREE.Mesh>(null);
  const edgeAnchorRef = useRef<THREE.LineSegments>(null);

  const mountBoxGeo = useMemo(() => new THREE.BoxGeometry(1.6, 1.1, 0.9), []);
  const lensGeo = useMemo(() => new THREE.CylinderGeometry(0.32, 0.32, 0.34, 24), []);
  const sensorBlockGeo = useMemo(() => new THREE.BoxGeometry(1.7, 0.55, 0.55), []);
  const finBodyGeo = useMemo(() => new THREE.BoxGeometry(1.3, 1.0, 1.0), []);
  const finGeo = useMemo(() => new THREE.BoxGeometry(0.045, 0.92, 0.92), []);
  const braceGeo = useMemo(() => new THREE.BoxGeometry(3.4, 0.18, 0.22), []);
  const strutGeo = useMemo(() => new THREE.BoxGeometry(4.2, 0.34, 0.22), []);
  const cableGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.8, 1.2, -0.3),
      new THREE.Vector3(2.3, 1.0, 0.2),
      new THREE.Vector3(2.1, 0.4, 0.6),
      new THREE.Vector3(1.65, 0.0, 0.5),
    ]);
    return new THREE.TubeGeometry(curve, 28, 0.055, 8, false);
  }, []);

  const solidGeometries = useMemo(
    () => [mountBoxGeo, lensGeo, sensorBlockGeo, finBodyGeo, finGeo, braceGeo, strutGeo, cableGeo],
    [mountBoxGeo, lensGeo, sensorBlockGeo, finBodyGeo, finGeo, braceGeo, strutGeo, cableGeo],
  );
  const edgeGeometries = useMemo(
    () => solidGeometries.map((g) => new THREE.EdgesGeometry(g, 16)),
    [solidGeometries],
  );

  useEffect(() => {
    return () => {
      solidGeometries.forEach((g) => g.dispose());
      edgeGeometries.forEach((g) => g.dispose());
      [graphite, graphiteDark, lensGlass, edgeMaterial].forEach((m) => m.dispose());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fins = useMemo(() => Array.from({ length: 7 }, (_, i) => -0.42 + i * 0.14), []);

  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const v = scrollRef.current ?? 0;

    const targetZ = piecewiseLerp(v, CAMERA_DOLLY_TIMELINE, CAMERA_Z);
    const targetY = piecewiseLerp(v, CAMERA_DOLLY_TIMELINE, CAMERA_Y);
    const targetFov = piecewiseLerp(v, CAMERA_DOLLY_TIMELINE, CAMERA_FOV);

    const k = Math.min(1, delta * 6);
    const px = mobile ? 0 : pointerRef.current.x;
    const py = mobile ? 0 : pointerRef.current.y;
    camera.position.z += (targetZ - camera.position.z) * k;
    camera.position.y += (targetY - py * 0.08 - camera.position.y) * k;
    camera.position.x += (px * 0.14 - camera.position.x) * k;
    camera.lookAt(0, 0.05, 0);

    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }

    const signal = piecewiseLerp(v, WIREFRAME_TIMELINE, [0, 1]);
    const edgeMesh = edgeAnchorRef.current;
    if (edgeMesh) (edgeMesh.material as THREE.LineBasicMaterial).opacity = signal * 0.85;
    const solidOpacity = 1 - signal * 0.68;
    [graphiteAnchorRef, graphiteDarkAnchorRef, lensAnchorRef].forEach((ref) => {
      const mesh = ref.current;
      if (mesh) (mesh.material as THREE.MeshStandardMaterial).opacity = solidOpacity;
    });
  });

  return (
    <>
      <ambientLight intensity={2.2} color="#c9c2b3" />
      <directionalLight position={[-3, 4, 5]} intensity={6.5} color="#f3e8cf" />
      <directionalLight position={[4, -2, -3]} intensity={1.2} color="#5a6560" />

      <mesh ref={graphiteAnchorRef} geometry={mountBoxGeo} material={graphite} position={[-0.6, 0.15, -0.1]} />
      <lineSegments ref={edgeAnchorRef} geometry={edgeGeometries[0]} material={edgeMaterial} position={[-0.6, 0.15, -0.1]} />

      <mesh ref={lensAnchorRef} geometry={lensGeo} material={lensGlass} position={[-0.95, 0.2, 0.6]} rotation={[Math.PI / 2, 0, 0]} />
      <lineSegments geometry={edgeGeometries[1]} material={edgeMaterial} position={[-0.95, 0.2, 0.6]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={lensGeo} material={lensGlass} position={[-0.25, 0.25, 0.6]} rotation={[Math.PI / 2, 0, 0]} />
      <lineSegments geometry={edgeGeometries[1]} material={edgeMaterial} position={[-0.25, 0.25, 0.6]} rotation={[Math.PI / 2, 0, 0]} />

      <mesh geometry={sensorBlockGeo} material={graphite} position={[-0.55, -0.75, 0.35]} />
      <lineSegments geometry={edgeGeometries[2]} material={edgeMaterial} position={[-0.55, -0.75, 0.35]} />

      <mesh ref={graphiteDarkAnchorRef} geometry={finBodyGeo} material={graphiteDark} position={[1.55, 0.05, -0.4]} />
      <lineSegments geometry={edgeGeometries[3]} material={edgeMaterial} position={[1.55, 0.05, -0.4]} />
      {fins.map((x, i) => (
        <group key={i}>
          <mesh geometry={finGeo} material={graphiteDark} position={[1.55 + x, 0.05, 0.16]} />
          <lineSegments geometry={edgeGeometries[4]} material={edgeMaterial} position={[1.55 + x, 0.05, 0.16]} />
        </group>
      ))}

      <mesh geometry={braceGeo} material={graphite} position={[0.2, 1.55, -0.4]} rotation={[0, 0, 0.2]} />
      <lineSegments geometry={edgeGeometries[5]} material={edgeMaterial} position={[0.2, 1.55, -0.4]} rotation={[0, 0, 0.2]} />

      {!mobile && (
        <>
          <mesh geometry={cableGeo} material={graphiteDark} />
          <lineSegments geometry={edgeGeometries[7]} material={edgeMaterial} />
        </>
      )}

      <mesh geometry={strutGeo} material={graphiteDark} position={[-2.6, 1.3, 1.2]} rotation={[0, 0, -0.32]} />
      <lineSegments geometry={edgeGeometries[6]} material={edgeMaterial} position={[-2.6, 1.3, 1.2]} rotation={[0, 0, -0.32]} />
    </>
  );
}

interface MachineSignalSceneProps extends SceneProps {
  active: boolean;
  onContextLost?: () => void;
}

function MachineSignalScene({ mobile, scrollRef, pointerRef, active, onContextLost }: MachineSignalSceneProps) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ fov: CAMERA_FOV[0], near: 0.1, far: 30, position: [0, 0, CAMERA_Z[0]] }}
      frameloop={active ? "always" : "demand"}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("aria-hidden", "true");
        if (!onContextLost) return;
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}
    >
      <SensorCavity mobile={mobile} scrollRef={scrollRef} pointerRef={pointerRef} />
    </Canvas>
  );
}

export { MachineSignalScene };
