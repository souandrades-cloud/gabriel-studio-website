"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { piecewiseLerp } from "@/lib/x03/piecewise-lerp";

import { A005_ASPECT, A005_HEIGHT, A005_SRC, A005_WIDTH } from "./bridge-constants";
import { createDepthMaskTexture } from "./depth-mask";
import { useColorTexture } from "./use-color-texture";

/**
 * Matched-proxy camera: three keyframes (not a curve) so the dolly's slope
 * never flattens to zero near the track end — a smoothstep/ease would go
 * dead-flat right where the wheel-tick QA checks for continued response.
 *
 * Gate 03D — Perceptual Bridge Integration: retimed to start at the same
 * point the structural bridge begins acquiring depth (DEPTH_TIMELINE[0])
 * instead of at the old direct photo->proxy crossfade — one continuous
 * dolly now spans the whole depth/dissolution/arrival transformation
 * instead of only its last third. Z/Y/FOV values are unchanged from Gate
 * 03B (the validated "amplitude máxima de movimento" baseline).
 */
const CAMERA_DOLLY_TIMELINE = [0.61, 0.86, 1];
const CAMERA_Z = [6.4, 4.75, 4.3];
const CAMERA_Y = [0, 0.14, 0.2];
const CAMERA_FOV = [34, 31, 29.5];

/**
 * Gate 03D — Perceptual Bridge Integration: SensorCavity's "structural
 * arrival" (edges lead, solid mass trails) now happens AFTER Approach C's
 * structural dissolution has already made A-005 read as computational
 * representation (DISSOLVE_TIMELINE below), not concurrent with the raw
 * photograph. The live WebGL structure is meant to emerge from the
 * dissolved 2D structural image, not race it — so edges begin only once
 * uDissolve is already dominant, coexist with the fading structural bridge
 * plane (BRIDGE_FADE_OUT), and solid mass only reaches full opacity once
 * the bridge plane has fully receded — nothing photographic left to
 * compare it against, same principle as Director Iteration 003, moved to
 * a later stage in the sequence.
 */
const EDGE_TIMELINE = [0.86, 0.9, 0.97];
const EDGE_OPACITY = [0, 0.82, 0.9];
const SOLID_TIMELINE = [0.9, 0.95, 1];
const SOLID_OPACITY = [0, 0.55, 1];

/**
 * Gate 03D — Perceptual Bridge Integration. Approach A (depth acquisition)
 * ramps first and holds; Approach C (structural dissolution) starts before
 * A finishes ramping so the two coexist (Phase 3) before dissolution
 * dominates alone (Phase 4). Values ported from the Gate 03C discovery
 * microprototypes (components/showcase/x03-lab/bridge/{depth,dissolution}-
 * scene.tsx), remapped onto this track's own timeline — same amplitude
 * ceiling (0.85 — higher produced tearing/stretching at the strut bands
 * per the discovery report) and the same dissolution math.
 */
const DEPTH_TIMELINE = [0.61, 0.72, 0.82];
const DEPTH_AMPLITUDE = [0, 0.55, 0.85];
const DISSOLVE_TIMELINE: [number, number] = [0.7, 0.86];
const DISSOLVE_SPREAD = 0.55;
// Structural bridge plane's own opacity — recedes once SensorCavity's
// solid mass has enough presence to carry the scene alone (Phase 6 -> 7).
const BRIDGE_FADE_OUT: [number, number] = [0.9, 0.97];
// World-space depth of the bridge plane, well behind SensorCavity's
// frontmost geometry (its nearest strut sits at z=1.2) so the live
// structure reads as emerging in front of the flattened structural image
// rather than intersecting it.
const BRIDGE_PLANE_Z = -4;

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

const BRIDGE_VERTEX_SHADER = /* glsl */ `
  uniform sampler2D depthMask;
  uniform float uAmplitude;
  uniform vec2 uCoverScale;
  varying vec2 vCoveredUv;

  void main() {
    vCoveredUv = (uv - 0.5) * uCoverScale + 0.5;
    float depth = texture2D(depthMask, vCoveredUv).r; // 0 near .. 1 far
    float displacement = (1.0 - depth) * uAmplitude;
    vec3 displaced = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

// lumaOf, not luminance() -- three.js's ShaderChunk.common already declares
// a luminance() function prepended to every ShaderMaterial fragment shader;
// redeclaring it with a different signature is a GLSL compile error (silent
// black canvas, no JS throw) — see 3ef9bda.
const BRIDGE_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D map;
  uniform sampler2D depthMask;
  uniform float uDissolve;
  uniform float uOpacity;
  uniform vec2 uTexel;
  varying vec2 vCoveredUv;

  float lumaOf(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vec2 uv = vCoveredUv;
    vec3 color = texture2D(map, uv).rgb;

    float tl = lumaOf(texture2D(map, uv + uTexel * vec2(-1.0, -1.0)).rgb);
    float t  = lumaOf(texture2D(map, uv + uTexel * vec2( 0.0, -1.0)).rgb);
    float tr = lumaOf(texture2D(map, uv + uTexel * vec2( 1.0, -1.0)).rgb);
    float l  = lumaOf(texture2D(map, uv + uTexel * vec2(-1.0,  0.0)).rgb);
    float r  = lumaOf(texture2D(map, uv + uTexel * vec2( 1.0,  0.0)).rgb);
    float bl = lumaOf(texture2D(map, uv + uTexel * vec2(-1.0,  1.0)).rgb);
    float b  = lumaOf(texture2D(map, uv + uTexel * vec2( 0.0,  1.0)).rgb);
    float br = lumaOf(texture2D(map, uv + uTexel * vec2( 1.0,  1.0)).rgb);
    float gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br;
    float gy = -tl - 2.0 * t - tr + bl + 2.0 * b + br;
    float edge = clamp(length(vec2(gx, gy)), 0.0, 1.0);

    float depth = texture2D(depthMask, uv).r;
    float order = smoothstep(0.0, ${DISSOLVE_SPREAD.toFixed(3)}, abs(depth - 0.48));
    float dissolve = clamp(uDissolve * 1.3 - order * 0.5, 0.0, 1.0);

    vec3 ink = vec3(0.851, 0.788, 0.651); // #d9c9a6 — Gate 03B's edge color
    vec3 desaturated = mix(color, vec3(lumaOf(color)), dissolve);
    vec3 structural = mix(desaturated, ink, edge * dissolve);
    vec3 finalColor = mix(structural, vec3(0.02, 0.018, 0.015), dissolve * 0.4);

    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

/**
 * Structural bridge — Approach A (depth/displacement) + Approach C
 * (structural dissolution) fused onto one plane, both driven off the same
 * shared depth mask so they stay in agreement about where the photo's
 * foreground/subject/background sit. The plane is sized every frame to
 * exactly fill the camera's frustum at its fixed world depth (BRIDGE_
 * PLANE_Z) using the camera's REST fov/z (CAMERA_FOV[0]/CAMERA_Z[0], before
 * the dolly in CAMERA_DOLLY_TIMELINE begins) — at progress 0 this makes the
 * plane pixel-identical to the DOM <Image object-cover> it hands off from
 * (machine-signal.tsx's CANVAS_FADE_IN), so the DOM->WebGL swap is
 * invisible. uCoverScale reproduces CSS object-fit:cover's UV cropping so
 * the source photo (portrait, A005_ASPECT) frames correctly regardless of
 * viewport aspect, exactly like the DOM layer's object-cover it replaces.
 */
function StructuralBridge({ mobile, scrollRef }: { mobile: boolean; scrollRef: RefObject<number> }) {
  const { size } = useThree();
  const colorMap = useColorTexture(A005_SRC);
  const depthMask = useMemo(() => createDepthMaskTexture(), []);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    return () => depthMask.dispose();
  }, [depthMask]);

  const segments = mobile ? { w: 60, h: 84 } : { w: 100, h: 140 };

  const coverScale = useMemo(() => {
    const viewportAspect = size.width / size.height;
    return A005_ASPECT > viewportAspect
      ? new THREE.Vector2(viewportAspect / A005_ASPECT, 1)
      : new THREE.Vector2(1, A005_ASPECT / viewportAspect);
  }, [size.width, size.height]);

  const geometry = useMemo(() => {
    const distance = CAMERA_Z[0] - BRIDGE_PLANE_Z;
    const vFov = (CAMERA_FOV[0] * Math.PI) / 180;
    const height = 2 * Math.tan(vFov / 2) * distance;
    const width = height * (size.width / size.height);
    return new THREE.PlaneGeometry(width, height, segments.w, segments.h);
  }, [size.width, size.height, segments.w, segments.h]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          map: { value: null },
          depthMask: { value: depthMask },
          uAmplitude: { value: 0 },
          uDissolve: { value: 0 },
          uOpacity: { value: 1 },
          uCoverScale: { value: coverScale.clone() },
          uTexel: { value: new THREE.Vector2(1 / A005_WIDTH, 1 / A005_HEIGHT) },
        },
        vertexShader: BRIDGE_VERTEX_SHADER,
        fragmentShader: BRIDGE_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [depthMask],
  );

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const mat = mesh.material as THREE.ShaderMaterial;
    if (mat.uniforms.map.value !== colorMap) mat.uniforms.map.value = colorMap;
    (mat.uniforms.uCoverScale.value as THREE.Vector2).copy(coverScale);

    const v = scrollRef.current ?? 0;
    mat.uniforms.uAmplitude.value = piecewiseLerp(v, DEPTH_TIMELINE, DEPTH_AMPLITUDE);
    mat.uniforms.uDissolve.value = piecewiseLerp(v, DISSOLVE_TIMELINE, [0, 1]);
    mat.uniforms.uOpacity.value = piecewiseLerp(v, BRIDGE_FADE_OUT, [1, 0]);
  });

  if (!colorMap) return null;

  return <mesh ref={meshRef} geometry={geometry} material={material} position={[0, 0, BRIDGE_PLANE_Z]} />;
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
      <StructuralBridge mobile={mobile} scrollRef={scrollRef} />
      <SensorCavity mobile={mobile} scrollRef={scrollRef} pointerRef={pointerRef} />
    </Canvas>
  );
}

export { MachineSignalScene };
