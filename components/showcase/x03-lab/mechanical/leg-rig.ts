/**
 * X03 LAB — PROPRIO. Gate 05B — Mechanical Action Representation Discovery.
 * Hypothesis A/C's focused mechanical model: NOT full PL-1 -- only the
 * minimum linkage needed to sell one wheel-leg crossing a constraint --
 * a hip strut, a knee link, an axle, a wheel, and the small chassis-corner
 * fragment it hangs from. Colors and joint language are derived from
 * A-001/A-003 (dark gunmetal linkage arms, steel-gray joints, black wheel,
 * silver-gray chassis panel) -- no redesign of PL-1.
 *
 * ASSUMPTION (per the brief: "quando A-001 não fornecer evidência
 * suficiente: simplify + mark assumption"): A-003 shows a true multi-bar
 * parallelogram linkage; this rig simplifies that to a 2-link hip/knee
 * chain. That loses the parallelogram's self-leveling geometry but keeps
 * the same silhouette and joint count legible at macro framing, which is
 * what this gate needs proven, not exact kinematics.
 *
 * A factory, not a module-scope singleton -- same discipline as Gate 05A's
 * pl1-rig.ts, so Hypothesis A and Hypothesis C's macro insert never share
 * mutable THREE objects across routes.
 */
import * as THREE from "three";

export const WHEEL_RADIUS = 0.32;
export const STRUT_LEN = 0.72;
export const LINK_LEN = 0.56;
// At rest (hip/knee rotation = 0, leg straight down) the wheel must sit ON
// the ground, tangent at y=0 -- not float or sink through it.
export const HIP_LOCAL_Y = STRUT_LEN + LINK_LEN + WHEEL_RADIUS;
export const CHASSIS_OFFSET_Y = 0.42;

export const KNEE_LOCAL: [number, number, number] = [0, -STRUT_LEN, 0];
export const AXLE_LOCAL: [number, number, number] = [0, -LINK_LEN, 0];

const GRAPHITE = "#211f1c";
const STEEL = "#8a8d90";
const RUBBER = "#141312";
const HUB = "#5c5e60";

export interface LegRig {
  chassisGeo: THREE.BoxGeometry;
  chassisMat: THREE.MeshBasicMaterial;
  hipJointGeo: THREE.CylinderGeometry;
  hipJointMat: THREE.MeshBasicMaterial;
  strutGeo: THREE.BoxGeometry;
  strutMat: THREE.MeshBasicMaterial;
  kneeJointGeo: THREE.CylinderGeometry;
  kneeJointMat: THREE.MeshBasicMaterial;
  linkGeo: THREE.BoxGeometry;
  linkMat: THREE.MeshBasicMaterial;
  axleGeo: THREE.CylinderGeometry;
  axleMat: THREE.MeshBasicMaterial;
  wheelGeo: THREE.CylinderGeometry;
  wheelMat: THREE.MeshBasicMaterial;
  hubGeo: THREE.CylinderGeometry;
  hubMat: THREE.MeshBasicMaterial;
}

export function createLegRig(): LegRig {
  return {
    chassisGeo: new THREE.BoxGeometry(0.95, 0.5, 0.75),
    chassisMat: new THREE.MeshBasicMaterial({ color: STEEL }),
    hipJointGeo: new THREE.CylinderGeometry(0.09, 0.09, 0.34, 14),
    hipJointMat: new THREE.MeshBasicMaterial({ color: GRAPHITE }),
    strutGeo: new THREE.BoxGeometry(0.16, STRUT_LEN, 0.22),
    strutMat: new THREE.MeshBasicMaterial({ color: GRAPHITE }),
    kneeJointGeo: new THREE.CylinderGeometry(0.08, 0.08, 0.3, 14),
    kneeJointMat: new THREE.MeshBasicMaterial({ color: STEEL }),
    linkGeo: new THREE.BoxGeometry(0.14, LINK_LEN, 0.2),
    linkMat: new THREE.MeshBasicMaterial({ color: GRAPHITE }),
    axleGeo: new THREE.CylinderGeometry(0.07, 0.07, 0.32, 14),
    axleMat: new THREE.MeshBasicMaterial({ color: STEEL }),
    wheelGeo: new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, 0.24, 22),
    wheelMat: new THREE.MeshBasicMaterial({ color: RUBBER }),
    hubGeo: new THREE.CylinderGeometry(0.1, 0.1, 0.26, 14),
    hubMat: new THREE.MeshBasicMaterial({ color: HUB }),
  };
}
