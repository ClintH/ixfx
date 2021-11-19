export const clamp = (v: number, min = 0, max = 1) => {
  if (v < min) return min;
  if (v > max) return max;
  return v;
};

export const getMinMaxAvg = (data: Array<any>): {min: number; max: number; avg: number;} => {
  let min = Number.MAX_SAFE_INTEGER;
  let total = 0;
  let samples = 0;
  let max = Number.MIN_SAFE_INTEGER;
  for (let i = 0; i < data.length; i++) {
    if (Number.isNaN(data[i])) continue;
    min = Math.min(data[i], min);
    max = Math.max(data[i], max);
    total += data[i];
    samples++;
  }
  return {min: min, max: max, avg: total / samples};
};