export function clamp(v: number, min = 0, max = 1): number {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}