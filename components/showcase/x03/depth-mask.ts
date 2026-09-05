import * as THREE from "three";

/**
 * Gate 03D — Perceptual Bridge Integration.
 *
 * SOURCE: /images/x03/A-005.png (1086x1448).
 *
 * PROCESS: coarse, HAND-AUTHORED depth approximation — not a computed or
 * ML depth estimate (the repo has no depth-estimation/segmentation
 * pipeline). Regions were placed by eye against the actual A-005
 * photograph: two heavily out-of-focus foreground struts (top diagonal
 * band, bottom-left diagonal band — nearest, heaviest blur), the in-focus
 * twin-lens/sensor module (center-left, sharpest region), the in-focus
 * heat-sink fin block (right), everything else receding to a flat
 * background value. Same "overlay comparison, anchor masses only"
 * calibration method the production SensorCavity proxy already uses
 * (machine-signal-scene.tsx), encoded as a texture instead of meshes.
 * Ported unchanged from the Gate 03C discovery microprototype
 * (components/showcase/x03-lab/bridge/depth-mask.ts) — same algorithm,
 * same authored regions, so Approach A/C stay calibrated to what the
 * Director already reviewed and passed.
 *
 * PURPOSE: shared depth signal driving both the structural bridge's vertex
 * displacement (Approach A — spatial acquisition) and its dissolution
 * order (Approach C — structural dissolution spreads outward from the
 * in-focus subject).
 *
 * RESOLUTION: 128x128.
 *
 * FORMAT: THREE.DataTexture, single red channel (RedFormat), 8-bit
 * unsigned. Convention: 0 = nearest, 1 = farthest.
 */
const SIZE = 128;

function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abx = bx - ax;
  const aby = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby)));
  const cx = ax + t * abx;
  const cy = ay + t * aby;
  return Math.hypot(px - cx, py - cy);
}

export function createDepthMaskTexture() {
  const data = new Uint8Array(SIZE * SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const u = x / (SIZE - 1);
      const v = y / (SIZE - 1); // v=0 top of photo, v=1 bottom (image-space)

      let depth = 1;

      // Twin-lens/sensor module — sharpest, center-left.
      const lensDist = Math.hypot((u - 0.4) / 0.22, (v - 0.52) / 0.18);
      depth = Math.min(depth, 0.42 + Math.max(0, lensDist - 0.6) * 0.5);

      // Heat-sink fin block — in focus, right of the lens module.
      const finDist = Math.hypot((u - 0.78) / 0.24, (v - 0.55) / 0.22);
      depth = Math.min(depth, 0.48 + Math.max(0, finDist - 0.6) * 0.5);

      // Foreground diagonal strut — top band.
      const topBand = distanceToSegment(u, v, 0, 0.06, 1, 0.34);
      depth = Math.min(depth, 0.06 + topBand * 1.4);

      // Foreground diagonal strut — bottom-left band.
      const lowBand = distanceToSegment(u, v, 0, 0.6, 0.68, 1.05);
      depth = Math.min(depth, 0.04 + lowBand * 1.3);

      depth = Math.max(0, Math.min(1, depth));
      // Row (SIZE-1-y): DataTexture.flipY=true below expects row 0 = bottom
      // of image, matching how TextureLoader's default flipY=true stores
      // the color map — keeps both textures on the same UV convention.
      data[(SIZE - 1 - y) * SIZE + x] = Math.round(depth * 255);
    }
  }

  const texture = new THREE.DataTexture(data, SIZE, SIZE, THREE.RedFormat, THREE.UnsignedByteType);
  texture.flipY = true;
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
