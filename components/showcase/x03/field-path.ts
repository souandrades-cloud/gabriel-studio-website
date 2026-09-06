/** Arc-length interpolation along a polyline — `t` in 0..1 walks the full
 *  path length, not just the sample index, so travel speed reads as
 *  constant regardless of how unevenly the samples are spaced. Ported from
 *  the Gate 04A discovery's point-along-path.ts. */
export function pointAlongPath(points: ReadonlyArray<readonly [number, number]>, t: number): [number, number] {
  if (points.length === 0) return [0, 0];
  if (points.length === 1) return [points[0][0], points[0][1]];

  const segmentLengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dz = points[i][1] - points[i - 1][1];
    const len = Math.hypot(dx, dz);
    segmentLengths.push(len);
    total += len;
  }

  const target = Math.min(1, Math.max(0, t)) * total;
  let covered = 0;
  for (let i = 0; i < segmentLengths.length; i++) {
    const len = segmentLengths[i];
    if (covered + len >= target || i === segmentLengths.length - 1) {
      const localT = len > 0 ? (target - covered) / len : 0;
      const [ax, az] = points[i];
      const [bx, bz] = points[i + 1];
      return [ax + (bx - ax) * localT, az + (bz - az) * localT];
    }
    covered += len;
  }
  return [...points[points.length - 1]];
}
