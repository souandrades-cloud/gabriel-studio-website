/** Clamped piecewise-linear interpolation — `input` must be ascending. */
export function piecewiseLerp(value: number, input: number[], output: number[]): number {
  if (value <= input[0]) return output[0];
  const last = input.length - 1;
  if (value >= input[last]) return output[last];
  for (let i = 1; i <= last; i++) {
    if (value <= input[i]) {
      const t = (value - input[i - 1]) / (input[i] - input[i - 1]);
      return output[i - 1] + t * (output[i] - output[i - 1]);
    }
  }
  return output[last];
}
