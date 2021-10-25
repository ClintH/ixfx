export const clamp = function (v: number, min= 0, max = 1) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
};