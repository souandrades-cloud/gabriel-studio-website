/**
 * X03 LAB — PROPRIO. Gate 05A — Field Operation Signature Discovery.
 * PL-1's body in the FIELD extension: a photo-textured plane using the
 * approved A-001 master reference (no redesign, per CLAUDE.md's PL-1
 * preservation requirement) plus four small box "leg" proxies at its base
 * that animate independently — enough to demonstrate the wheel-leg
 * architecture doing mechanical work (lift/plant over the constraint)
 * without inventing a rigged 3D model, per the gate brief's "proxy
 * geometry, minimal asset production" constraint.
 *
 * A factory, not a module-scope singleton: each hypothesis scene file
 * calls `createPL1Rig()` once at its own module scope, so the three
 * comparison routes never share mutable THREE objects across route changes.
 */
import * as THREE from "three";

export const PL1_SRC = "/images/x03/x03-a001-pl1-master.png";

const PL1_ASPECT = 1086 / 1448;
export const PL1_PLANE_HEIGHT = 3.2;
export const PL1_PLANE_WIDTH = PL1_PLANE_HEIGHT * PL1_ASPECT;

/** Where PL-1 commits — exactly at the cable-trench constraint (see
 *  environment-rig.ts's GAP_Z, derived from this same point). */
export const PL1_STANCE: [number, number, number] = [0, 0, -33];

/** front-left, front-right, back-left, back-right, relative to the group origin. */
export const LEG_OFFSETS: Array<[number, number]> = [
  [-0.62, 0.42],
  [0.62, 0.42],
  [-0.62, -0.42],
  [0.62, -0.42],
];
export const LEG_BASE_Y = 0.25;
const LEG_COLOR = "#2c2a26";

export interface PL1Rig {
  planeGeometry: THREE.PlaneGeometry;
  planeMaterial: THREE.MeshBasicMaterial;
  legGeometry: THREE.BoxGeometry;
  legMaterials: THREE.MeshBasicMaterial[];
}

export function createPL1Rig(): PL1Rig {
  return {
    planeGeometry: new THREE.PlaneGeometry(PL1_PLANE_WIDTH, PL1_PLANE_HEIGHT),
    // depthWrite: false -- A-001's cutout background is fully transparent;
    // without this the plane's transparent pixels would still occlude the
    // route line/dots and industrial pieces behind it.
    planeMaterial: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    legGeometry: new THREE.BoxGeometry(0.22, 0.5, 0.22),
    legMaterials: LEG_OFFSETS.map(() => new THREE.MeshBasicMaterial({ color: LEG_COLOR, transparent: true, opacity: 0 })),
  };
}
