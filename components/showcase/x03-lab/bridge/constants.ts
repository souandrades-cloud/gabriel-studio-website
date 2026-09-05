/**
 * Gate 03C — Perceptual Bridge Discovery. Shared numbers so Approach A/B/C
 * get an identical viewport, source photo, camera amplitude, and pointer
 * parallax — the only variable between the three microprototypes is the
 * representation technique itself (displacement vs. projection vs.
 * dissolution), per the discovery brief's "fair comparison" requirement.
 *
 * CAMERA_Z/CAMERA_FOV reuse Gate 03B's own opening/closing keyframes
 * (machine-signal-scene.tsx CAMERA_Z/CAMERA_FOV, first and last values only
 * — this lab drives progress via a slider/autoplay loop, not scroll, so the
 * production's 3-keyframe curve is simplified to a straight two-point dolly)
 * so "amplitude máxima de movimento" matches the shipped baseline exactly.
 */
export const A005_SRC = "/images/x03/A-005.png";
export const A005_WIDTH = 1086;
export const A005_HEIGHT = 1448;
export const A005_ASPECT = A005_WIDTH / A005_HEIGHT;

export const CAMERA_Z: [number, number] = [6.4, 4.3];
export const CAMERA_FOV: [number, number] = [34, 29.5];

export const POINTER_X_AMPLITUDE = 0.14;
export const POINTER_Y_AMPLITUDE = 0.08;

export const PLANE_HEIGHT = 4;

/** Autoplay cycle: 0 -> 1 -> 0, framerate-independent, ms per single leg. */
export const CYCLE_MS = 5200;
