/** Gate 05A shared math — clamp01/smoothstep reused as-is from Gate 04A's
 *  perception/constants.ts rather than redefined, plus the one addition
 *  every hypothesis needs: mapping a global progress value into a local
 *  0-1 window. */
import { clamp01, smoothstep } from "../perception/constants";

export { clamp01, smoothstep };

export function windowT(v: number, [start, end]: [number, number]): number {
  return clamp01((v - start) / (end - start));
}
