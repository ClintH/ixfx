import type { NumbersComputeOptions, NumbersComputeResult } from "./types.js";

/**
 * Calculate the min, max, total, average and count of input array `data`.
 * ```js
 * const { total, min, max, avg, count } = numberArrayCompute([ 1, 2, 3 ]);
 * ```
 * @param data 
 * @param opts 
 * @returns 
 */
export const numberArrayCompute = (data: number[], opts: NumbersComputeOptions = {}): NumbersComputeResult => {
  if (data.length === 0) {
    return {
      total: Number.NaN,
      min: Number.NaN,
      max: Number.NaN,
      avg: Number.NaN,
      count: Number.NaN
    };
  }
  const nonNumbers = opts.nonNumbers ?? `throw`;

  let total = 0;
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let count = 0;
  for (let index = 0; index < data.length; index++) {
    let value = data[ index ];
    if (typeof value !== `number`) {
      if (nonNumbers === `ignore`) continue;
      if (nonNumbers === `throw`) throw new Error(`Param 'data' contains a non-number at index: ${ index.toString() }`);
      if (nonNumbers === `nan`) value = Number.NaN;
    }
    if (Number.isNaN(value)) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
    total += value;
    count++;
  }
  return {
    total, max, min, count,
    avg: total / count
  }
}