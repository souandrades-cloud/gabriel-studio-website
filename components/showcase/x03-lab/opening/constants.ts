/**
 * X03 LAB — PROPRIO. Gate 07A — Opening Architecture Re-Discovery.
 * Shared numbers so Hypothesis A/B/C get an identical viewport, source
 * photo, duration, copy, and — critically — the same ENDING (see
 * `material-entry.tsx`): the discovery brief requires comparing the
 * OPENING architecture, not craft on the handoff into MATERIAL, so every
 * hypothesis converges on the exact same resting frame (scale 1, x 0, y 0,
 * objectPosition "center 40%" — Hero's own resolved composition) by
 * MATERIAL_WINDOW's start and hands off through one shared component.
 *
 * clamp01/smoothstep/windowT reused as-is from Gate 04A's perception/
 * constants.ts by way of Gate 05A's field/utils.ts, same discipline as
 * every later gate.
 */
import { clamp01, smoothstep, windowT } from "../field/utils";

export { clamp01, smoothstep, windowT };

export const A001_SRC = "/images/x03/x03-a001-pl1-master.png";
export const A002_SRC = "/images/x03/x03-a002-pl1-material-macro.png";

/** Autoplay cycle: 0 -> 1 -> 0, framerate-independent, ms per single leg.
 *  Deliberately much longer than every other gate's — the brief asks the
 *  opening to breathe, hold, and avoid optimizing for a fast hook. */
export const CYCLE_MS = 9000;

/** No new asset — the same "Material" chapter A-002 already used by
 *  production's MaterialMechanism, reused verbatim as the approved endpoint
 *  photography this gate hands off into. */

/** Same approximate information as production's Hero — kicker, wordmark,
 *  designation badge, subtitle, tagline. Identical across all three
 *  hypotheses (rendered through the one shared `IdentityMark`/
 *  `IdentityKicker` components) so copy cannot determine the winner. */
export const KICKER_LINES = ["Physical AI", "Field Robotics"];
export const WORDMARK = "Proprio";
export const DESIGNATION = "PL-1";
export const SUBTITLE = "Autonomous Field Unit";
export const TAGLINE = "A body that knows where it is.";
export const MATERIAL_LABEL = "Material";

/** Hero's own approved resolved composition — every hypothesis converges
 *  here before the shared material handoff. */
export const REST_OBJECT_POSITION = "center 40%";

/** Shared endpoint window (local 0-1 progress) — identical across all three
 *  hypotheses per the brief's "same endpoint" fairness requirement. */
export const MATERIAL_WINDOW: [number, number] = [0.8, 1];
