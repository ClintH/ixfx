/**
 * Applies a function `fn` to the elements of an array, weighting them based on their relative position.
 *
 * ```js
 * import { weight } from 'https://unpkg.com/ixfx/dist/numbers.js';
 * import { gaussian } from 'https://unpkg.com/ixfx/dist/modulation.js';
 * // Six items
 * weight([1,1,1,1,1,1], gaussian());
 *
 * // Yields:
 * // [0.02, 0.244, 0.85, 0.85, 0.244, 0.02]
 * ```
 *
 * `fn` is expected to map (0..1) => (0..1), such as an easing function. The input to the
 * `fn` is the relative position of an element. Thus the first element will be 0, the middle 0.5 and so on.
 * The output of `fn` is then multiplied by the original value.
 *
 * In the below example (which is also the default if `fn` is not specified), the relative position is
 * how values are weighted:
 *
 * ```js
 * weight([1,1,1,1,1,1], (relativePos) => relativePos);
 * // Yields:
 * // [0, 0.2, 0.4, 0.6, 0.8, 1]
 * ```
 *
 * Non-numbers in `data` will be silently ignored (this filtering happens first, so relative index values are sane still).
 *
 * @param data Array of numbers
 * @param fn Returns a weighting based on the given relative position. If unspecified, `(x) => x` is used.
 */
export const weight = (
  data: Array<number> | ReadonlyArray<number>,
  fn?: (relativePos: number) => number
): Array<number> => {
  const f = fn ?? ((x: number) => x);
  const valid = validNumbers(data);
  return valid.map(
    (v: number, index: number) => {
      const x = v * f(index / (valid.length - 1));
      return x;
    }
  );
};

/**
 * Returns an array of all valid numbers from `data`
 *
 * @param data
 * @returns
 */
export const validNumbers = (data: ReadonlyArray<number>) =>
  data.filter((d) => typeof d === `number` && !Number.isNaN(d));

/**
 * Returns the dot product of arbitrary-sized arrays. Assumed they are of the same length.
 * @param values
 * @returns
 */
export const dotProduct = (
  values: ReadonlyArray<ReadonlyArray<number>>
): number => {
  let r = 0;
  const length = values[ 0 ].length;

  for (let index = 0; index < length; index++) {
    let t = 0;
    for (const [ p, value ] of values.entries()) {
      if (p === 0) t = value[ index ];
      else {
        t *= value[ index ];
      }
    }
    r += t;
  }
  return r;
};

/**
 * Calculates the average of all numbers in an array.
 * Array items which aren't a valid number are ignored and do not factor into averaging.
 *
 * Use {@link minMaxAvg} if you want min, max and total as well.
 *
 * @example
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 *
 * // Average of a list
 * const avg = Numbers.average([1, 1.4, 0.9, 0.1]);
 *
 * // Average of a variable
 * const data = [100,200];
 * Numbers.average(data);
 * ```
 *
 * @see {@link averageWeighted} To weight items based on position in array
 * @param data Data to average.
 * @returns Average of array
 */
export const average = (data: ReadonlyArray<number>): number => {
  // ✔ UNIT TESTED
  if (data === undefined) throw new Error(`data parameter is undefined`);
  const valid = validNumbers(data);
  const total = valid.reduce((accumulator, v) => accumulator + v, 0);
  return total / valid.length;
};

/**
 * Returns the minimum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import { Numbers } from 'https://unpkg.com/ixfx/dist/Numbers.js';
 * Numbers.min([10, 20, 0]); // Yields 0
 * ```
 * @param data
 * @returns Minimum number
 */
export const min = (data: ReadonlyArray<number>): number =>
  Math.min(...validNumbers(data));

/**
 * Returns the index of the largest value.
 * ```js
 * import { Numbers } from 'https://unpkg.com/ixfx/dist/Numbers.js';
 * const v = [ 10, 40, 5 ];
 * Numbers.maxIndex(v); // Yields 1
 * ```
 * @param data Array of numbers
 * @returns Index of largest value
 */
export const maxIndex = (data: ReadonlyArray<number>): number =>
  // eslint-disable-next-line unicorn/no-array-reduce
  data.reduce(
    (bestIndex, value, index, array) =>
      value > array[ bestIndex ] ? index : bestIndex,
    0
  );

/**
 * Returns the index of the smallest value.
 *
 * ```js
 * import { Numbers } from 'https://unpkg.com/ixfx/dist/Numbers.js';
 * const v = [ 10, 40, 5 ];
 * Numbers.minIndex(v); // Yields 2
 * ```
 * @param data Array of numbers
 * @returns Index of smallest value
 */
export const minIndex = (...data: ReadonlyArray<number>): number =>
  // eslint-disable-next-line unicorn/no-array-reduce
  data.reduce(
    (bestIndex, value, index, array) =>
      value < array[ bestIndex ] ? index : bestIndex,
    0
  );

/**
 * Returns the maximum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import { Numbers } from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.max(100, 200, 50); // 200
 * ```
 * @param data List of numbers
 * @returns Maximum number
 */
export const max = (data: ReadonlyArray<number>): number =>
  Math.max(...validNumbers(data));

/**
 * Returns the total of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import { Numbers } from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.total([1, 2, 3]); // 6
 * ```
 * @param data Array of numbers
 * @returns Total
 */
export const total = (data: ReadonlyArray<number>): number =>
  // eslint-disable-next-line unicorn/no-array-reduce
  data.reduce((previous, current) => {
    if (typeof current !== `number`) return previous;
    if (Number.isNaN(current)) return previous;
    if (Number.isFinite(current)) return previous;
    return previous + current;
  }, 0);

/**
 * Returns the maximum out of `data` without pre-filtering for speed.
 *
 * For most uses, {@link max} should suffice.
 *
 * ```js
 * import { Numbers } from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.maxFast([ 10, 0, 4 ]); // 10
 * ```
 * @param data
 * @returns Maximum
 */
//eslint-disable-next-line functional/prefer-immutable-types
export const maxFast = (data: ReadonlyArray<number> | Float32Array): number => {
  //eslint-disable-next-line functional/no-let
  let m = Number.MIN_SAFE_INTEGER;
  //eslint-disable-next-line functional/no-let
  for (const datum of data) {
    m = Math.max(m, datum);
  }
  return m;
};

/**
 * Returns the total of `data` without pre-filtering for speed.
 *
 * For most uses, {@link total} should suffice.
 *
 * ```js
 * import { Numbers } from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.totalFast([ 10, 0, 4 ]); // 14
 * ```
 * @param data
 * @returns Maximum
 */
//eslint-disable-next-line functional/prefer-immutable-types
export const totalFast = (data: ReadonlyArray<number> | Float32Array): number => {
  //eslint-disable-next-line functional/no-let
  let m = 0;
  //eslint-disable-next-line functional/no-let
  for (const datum of data) {
    m += datum;
  }
  return m;
};

/**
 * Returns the maximum out of `data` without pre-filtering for speed.
 *
 * For most uses, {@link max} should suffice.
 *
 * ```js
 * import { Numbers } from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.minFast([ 10, 0, 100 ]); // 0
 * ```
 * @param data
 * @returns Maximum
 */
//eslint-disable-next-line functional/prefer-immutable-types
export const minFast = (data: ReadonlyArray<number> | Float32Array): number => {
  //eslint-disable-next-line functional/no-let
  let m = Number.MIN_SAFE_INTEGER;
  //eslint-disable-next-line functional/no-let
  for (const datum of data) {
    m = Math.min(m, datum);
  }
  return m;
};
