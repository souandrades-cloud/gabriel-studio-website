"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

/**
 * Matched-proxy camera: three keyframes (not a curve) so the dolly's slope
 * never flattens to zero near the track end — a smoothstep/ease would go
 * dead-flat right where the wheel-tick QA checks for continued response.
 * Cinematic Pacing Correction: starts with canvas fade-in (0.45) so depth
 * is already reading by the time the model is visible, middle keyframe at
 * 0.74 lines up with the new "model takes over, solid hold" beat — camera
 * keeps drifting through that hold instead of parking dead still.
 */
const CAMERA_DOLLY_TIMELINE = [0.45, 0.74, 1];
const CAMERA_Z = [6.4, 4.75, 4.3];
const CAMERA_Y = [0, 0.14, 0.2];
const CAMERA_FOV = [34, 31, 29.5];

/**
 * Director Iteration 003 — representation convergence, not position: the
 * previous version had solid mass at full opacity the instant the canvas
 * layer started fading in, so the DOM crossfade was blending "detailed
 * photo" with "opaque 3D primitives" — a representation jump, independent
 * of how well the geometry was placed. Edges lead now (A-005 is already a
 * line drawing over the photo — this keeps that vocabulary alive instead
 * of replacing it), solid mass trails and stays translucent through the
 * whole photo/canvas coexistence window (CANVAS_FADE_IN, frozen at
 * [0.45, 0.74] in machine-signal.tsx), only reaching full opacity well
 * after A-005 has already receded — nothing left to compare it against.
 */
const EDGE_TIMELINE = [0.45, 0.62, 0.96];
const EDGE_OPACITY = [0, 0.82, 0.9];
const SOLID_TIMELINE = [0.5, 0.74, 0.92];
const SOLID_OPACITY = [0, 0.55, 1];

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
  // openEnded: the barrel has no front/back cap, so the recessed iris
  // (lensFaceGeo) behind it is visible through the ring rather than hidden
  // by a solid disc.
  const lensGeo = useMemo(() => new THREE.CylinderGeometry(0.25, 0.25, 0.16, 20, 1, true), []);
  const sensorBlockGeo = useMemo(() => new THREE.BoxGeometry(1.7, 0.32, 0.55), []);
  const finBodyGeo = useMemo(() => new THREE.BoxGeometry(1.3, 1.0, 1.0), []);
  const finGeo = useMemo(() => new THREE.BoxGeometry(0.045, 0.92, 0.92), []);

  // Director Iteration 005 — structural fidelity: the previous "plate + two
  // circles" reading of the optical module is replaced with a raised bezel
  // (rounded, not sharp-cornered, matching A-005's housing) carrying two
  // protruding lens barrels (lensGeo, above) each with a recessed dark iris
  // in front of them — same footprint/position as before, more legible shape.
  const opticalBezelGeo = useMemo(() => {
    const w = 1.62;
    const h = 1.02;
    const r = 0.13;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false, curveSegments: 6 });
  }, []);
  const lensFaceGeo = useMemo(() => new THREE.CylinderGeometry(0.17, 0.17, 0.08, 20), []);

  // Lower sensor module: a recessed inset panel breaks up the plain slab so
  // it reads as a paneled housing rather than a flat rectangle.
  const sensorInsetGeo = useMemo(() => new THREE.BoxGeometry(1.32, 0.15, 0.04), []);

  // Heat sink: a thin frame/lip around the fin array's front rim, matching
  // the visible edge bezel A-005 shows wrapping the compute block.
  const finFrameHGeo = useMemo(() => new THREE.BoxGeometry(1.0, 0.055, 0.055), []);
  const finFrameVGeo = useMemo(() => new THREE.BoxGeometry(0.055, 1.0, 0.055), []);
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

  // Director Iteration 004 — spatial identity preservation: once A-005 fully
  // recedes, only sensor + heat sink survived, floating on empty black. These
  // four masses restore the room A-004/A-005 establish (opening, rear depth,
  // floor) at the same "architectural proxy" complexity as the rest of the
  // scene — no new detail, just enough silhouette that the interior reads as
  // the same cavity rather than isolated components on a void.
  const upperOpeningGeo = useMemo(() => new THREE.BoxGeometry(2.6, 0.26, 0.2), []);
  const railGeo = useMemo(() => new THREE.BoxGeometry(0.18, 2.0, 0.18), []);
  const baseFrameGeo = useMemo(() => new THREE.BoxGeometry(3.2, 0.22, 1.4), []);

  const solidGeometries = useMemo(
    () => [
      mountBoxGeo,
      lensGeo,
      sensorBlockGeo,
      finBodyGeo,
      finGeo,
      braceGeo,
      strutGeo,
      cableGeo,
      upperOpeningGeo,
      railGeo,
      baseFrameGeo,
      opticalBezelGeo,
      lensFaceGeo,
      sensorInsetGeo,
      finFrameHGeo,
      finFrameVGeo,
    ],
    [
      mountBoxGeo,
      lensGeo,
      sensorBlockGeo,
      finBodyGeo,
      finGeo,
      braceGeo,
      strutGeo,
      cableGeo,
      upperOpeningGeo,
      railGeo,
      baseFrameGeo,
      opticalBezelGeo,
      lensFaceGeo,
      sensorInsetGeo,
      finFrameHGeo,
      finFrameVGeo,
    ],
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

  const fins = useMemo(() => Array.from({ length: 11 }, (_, i) => -0.46 + i * 0.092), []);

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

    const edgeOpacity = piecewiseLerp(v, EDGE_TIMELINE, EDGE_OPACITY);
    const edgeMesh = edgeAnchorRef.current;
    if (edgeMesh) (edgeMesh.material as THREE.LineBasicMaterial).opacity = edgeOpacity;
    const solidOpacity = piecewiseLerp(v, SOLID_TIMELINE, SOLID_OPACITY);
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

      {/* Lens/sensor module as one adjustable group — calibrated against A-004/
          A-005 via overlay comparison (Gate 03B Director Iteration 002): the
          per-mesh local coordinates below are unchanged from the original
          authoring, this group transform is what brings the assembly's
          screen position/scale in line with the photograph. */}
      <group position={[0.05, 0.42, 0]} scale={0.82}>
        <mesh ref={graphiteAnchorRef} geometry={mountBoxGeo} material={graphite} position={[-0.6, 0.15, -0.1]} />
        <lineSegments ref={edgeAnchorRef} geometry={edgeGeometries[0]} material={edgeMaterial} position={[-0.6, 0.15, -0.1]} />

        {/* Optical bezel — rounded raised plate on the housing's front face,
            replacing the flat box front with the chamfered edge A-005 shows. */}
        <mesh geometry={opticalBezelGeo} material={graphite} position={[-0.6, 0.15, 0.35]} />
        <lineSegments geometry={edgeGeometries[11]} material={edgeMaterial} position={[-0.6, 0.15, 0.35]} />

        {/* Twin lens barrels — protruding rims (lensGeo, lit metal) each with
            a recessed dark iris (lensFaceGeo) set slightly behind the rim's
            front face, so the lens reads as sunken glass, not a flush disc. */}
        <mesh geometry={lensGeo} material={graphite} position={[-0.86, 0.2, 0.57]} rotation={[Math.PI / 2, 0, 0]} />
        <lineSegments geometry={edgeGeometries[1]} material={edgeMaterial} position={[-0.86, 0.2, 0.57]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh ref={lensAnchorRef} geometry={lensFaceGeo} material={lensGlass} position={[-0.86, 0.2, 0.52]} rotation={[Math.PI / 2, 0, 0]} />
        <lineSegments geometry={edgeGeometries[12]} material={edgeMaterial} position={[-0.86, 0.2, 0.52]} rotation={[Math.PI / 2, 0, 0]} />

        <mesh geometry={lensGeo} material={graphite} position={[-0.3, 0.22, 0.57]} rotation={[Math.PI / 2, 0, 0]} />
        <lineSegments geometry={edgeGeometries[1]} material={edgeMaterial} position={[-0.3, 0.22, 0.57]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh geometry={lensFaceGeo} material={lensGlass} position={[-0.3, 0.22, 0.52]} rotation={[Math.PI / 2, 0, 0]} />
        <lineSegments geometry={edgeGeometries[12]} material={edgeMaterial} position={[-0.3, 0.22, 0.52]} rotation={[Math.PI / 2, 0, 0]} />

        <mesh geometry={sensorBlockGeo} material={graphite} position={[-0.55, -0.62, 0.35]} />
        <lineSegments geometry={edgeGeometries[2]} material={edgeMaterial} position={[-0.55, -0.62, 0.35]} />
        {/* Applied inset panel — sits proud of the sensor slab's front face,
            breaking it into a paneled housing rather than a plain rectangle
            (a solid box has no cavity for a true recess to show through). */}
        <mesh geometry={sensorInsetGeo} material={lensGlass} position={[-0.55, -0.62, 0.65]} />
        <lineSegments geometry={edgeGeometries[13]} material={edgeMaterial} position={[-0.55, -0.62, 0.65]} />
      </group>

      <mesh ref={graphiteDarkAnchorRef} geometry={finBodyGeo} material={graphiteDark} position={[1.55, 0.2, -0.4]} />
      <lineSegments geometry={edgeGeometries[3]} material={edgeMaterial} position={[1.55, 0.2, -0.4]} />
      {fins.map((x, i) => (
        <group key={i}>
          <mesh geometry={finGeo} material={graphiteDark} position={[1.55 + x, 0.2, 0.16]} />
          <lineSegments geometry={edgeGeometries[4]} material={edgeMaterial} position={[1.55 + x, 0.2, 0.16]} />
        </group>
      ))}

      {/* Heat sink frame — a lip wrapping the fin array's front rim, the
          edge bezel visible around the compute block in A-004/A-005. */}
      <mesh geometry={finFrameHGeo} material={graphiteDark} position={[1.55, 0.66, 0.16]} />
      <lineSegments geometry={edgeGeometries[14]} material={edgeMaterial} position={[1.55, 0.66, 0.16]} />
      <mesh geometry={finFrameHGeo} material={graphiteDark} position={[1.55, -0.26, 0.16]} />
      <lineSegments geometry={edgeGeometries[14]} material={edgeMaterial} position={[1.55, -0.26, 0.16]} />
      <mesh geometry={finFrameVGeo} material={graphiteDark} position={[1.06, 0.2, 0.16]} />
      <lineSegments geometry={edgeGeometries[15]} material={edgeMaterial} position={[1.06, 0.2, 0.16]} />
      <mesh geometry={finFrameVGeo} material={graphiteDark} position={[2.04, 0.2, 0.16]} />
      <lineSegments geometry={edgeGeometries[15]} material={edgeMaterial} position={[2.04, 0.2, 0.16]} />

      <mesh geometry={braceGeo} material={graphite} position={[0.2, 0.98, -0.55]} rotation={[0, 0, 0.2]} />
      <lineSegments geometry={edgeGeometries[5]} material={edgeMaterial} position={[0.2, 0.98, -0.55]} rotation={[0, 0, 0.2]} />

      {!mobile && (
        <>
          <mesh geometry={cableGeo} material={graphiteDark} />
          <lineSegments geometry={edgeGeometries[7]} material={edgeMaterial} />
        </>
      )}

      <mesh geometry={strutGeo} material={graphiteDark} position={[-2.6, 1.3, 1.2]} rotation={[0, 0, -0.32]} />
      <lineSegments geometry={edgeGeometries[6]} material={edgeMaterial} position={[-2.6, 1.3, 1.2]} rotation={[0, 0, -0.32]} />

      {/* Upper opening frame — the foreground chassis edge above the beam,
          establishing "looking through an opening" per A-005's top framing. */}
      <mesh geometry={upperOpeningGeo} material={graphite} position={[-0.8, 2.7, -0.9]} rotation={[0, 0, -0.12]} />
      <lineSegments geometry={edgeGeometries[8]} material={edgeMaterial} position={[-0.8, 2.7, -0.9]} rotation={[0, 0, -0.12]} />

      {/* Rear vertical supports — simple posts behind the sensor group and
          heat sink, giving the cavity depth instead of a flat backdrop. */}
      <mesh geometry={railGeo} material={graphiteDark} position={[-0.9, 0.3, -1.3]} />
      <lineSegments geometry={edgeGeometries[9]} material={edgeMaterial} position={[-0.9, 0.3, -1.3]} />
      <mesh geometry={railGeo} material={graphiteDark} position={[0.9, 0.3, -1.6]} />
      <lineSegments geometry={edgeGeometries[9]} material={edgeMaterial} position={[0.9, 0.3, -1.6]} />

      {/* Lower structural frame — the floor the assembly sits on, so it no
          longer floats in empty space once the photograph recedes. */}
      <mesh geometry={baseFrameGeo} material={graphiteDark} position={[0.1, -0.95, -0.1]} />
      <lineSegments geometry={edgeGeometries[10]} material={edgeMaterial} position={[0.1, -0.95, -0.1]} />
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
