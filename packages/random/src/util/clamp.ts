export function clamp(v:number, min:number = 0, max:number = 1) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}