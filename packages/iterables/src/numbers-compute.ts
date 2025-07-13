import { numberArrayCompute, type NumbersComputeOptions, type NumbersComputeResult } from "@ixfx/numbers";
import { isIterable } from "./guard.js";


/**
 * Returns the min, max, avg and total of the array or iterable.
 * Any values that are invalid are silently skipped over.
 *
 * ```js
 * const v = [ 10, 2, 4.2, 99 ];
 * const mma = numbersCompute(v);
 * // Yields: { min: 2, max: 99, total: 115.2, avg: 28.8 }
 * ```
 *
 * Use {@link Numbers.average}, {@link Numbers.max}, {@link Numbers.min} or {@link Numbers.total} if you only need one of these.
 *
 * A start and end range can be provided if the calculation should be restricted to a part
 * of the input array. By default the whole array is used.
 *
 * It's also possible to use an iterable as input.
 * ```js
 * numbersCompute(count(5,1)); // Averages 1,2,3,4,5
 * ```
 * 
 * Returns `NaN` if the input data is empty.
 * @param data
 * @param options Allows restriction of range that is examined
 * @returns `{min, max, avg, total}`
 */
export const numbersCompute = (
  data: readonly number[] | number[] | Iterable<number>,
  options: NumbersComputeOptions = {}
): NumbersComputeResult => {
  if (typeof data === `undefined`) throw new Error(`Param 'data' is undefined`);
  if (Array.isArray(data)) {
    return numberArrayCompute(data, options);
  }
  if (isIterable(data)) {
    return numbersComputeIterable(data, options);
  }
  throw new Error(`Param 'data' is neither an array nor iterable`);
};


function numbersComputeIterable(data: Iterable<number>, options: NumbersComputeOptions = {}): NumbersComputeResult {
  // if (typeof options.startIndex !== `undefined` || typeof options.endIndex !== `undefined`) {
  //   data = slice(data, options.startIndex, options.endIndex);
  // }
  let total = 0;
  const nonNumbers = options.nonNumbers ?? `ignore`;

  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let count = 0;
  for (let v of data) {
    if (typeof v !== `number` || Number.isNaN(v)) {
      if (nonNumbers === `throw`) throw new TypeError(`Data contains something not a number. Got type '${ typeof v }'`);
      if (nonNumbers === `nan`) v = Number.NaN;
      if (nonNumbers === `ignore`) continue;
    }

    total += v;
    count++;
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  return {
    avg: total / count,
    total, max, min, count
  };
}

export function computeAverage(data: Iterable<number>, options: NumbersComputeOptions = {}): number {
  let count = 0;
  let total = 0;
  const nonNumbers = options.nonNumbers ?? `ignore`;

  for (let d of data) {
    if (typeof d !== `number` || Number.isNaN(d)) {
      if (nonNumbers === `throw`) throw new TypeError(`Data contains something not a number. Got type '${ typeof d }'`);
      if (nonNumbers === `nan`) d = Number.NaN;
      if (nonNumbers === `ignore`) continue;
    }
    total += d;
    count++;
  }
  return total / count;
}