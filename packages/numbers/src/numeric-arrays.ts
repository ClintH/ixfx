/**
 * Applies a function `fn` to the elements of an array, weighting them based on their relative position.
 *
 * ```js
 * // Six items
 * weight([1,1,1,1,1,1], Modulation.gaussian());
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
 * Throws TypeError if `data` is not an array or for any element not a number.
 * @param data Array of numbers
 * @param fn Returns a weighting based on the given relative position. If unspecified, `(x) => x` is used.
 */
export const weight = (
  data: number[] | readonly number[],
  fn?: (relativePos: number) => number
): number[] => {
  if (!Array.isArray(data)) throw new TypeError(`Param 'data' is expected to be an array. Got type: ${ typeof data }`);
  const weightingFunction = fn ?? ((x: number) => x);
  return data.map(
    (value: number, index: number) => {
      if (typeof value !== `number`) throw new TypeError(`Param 'data' contains non-number at index: '${ index }'. Type: '${ typeof value }' value: '${ value }'`);
      const relativePos = index / (data.length - 1);
      const weightForPosition = weightingFunction(relativePos);
      if (typeof weightForPosition !== `number`) throw new TypeError(`Weighting function returned type '${ typeof weightForPosition }' rather than number for input: '${ relativePos }'`);
      const finalResult = value * weightForPosition;
      //console.log(`finalResult: ${ finalResult.toFixed(2) } rel: ${ relativePos.toFixed(2) } weightForPosition: ${ weightForPosition.toFixed(2) } input: ${ value } index: ${ index }`);
      return finalResult;
    }
  );
};

/**
 * Returns an array of all valid numbers from `data`
 *
 * @param data
 * @returns
 */
export const validNumbers = (data: readonly number[]): number[] =>
  data.filter((d) => typeof d === `number` && !Number.isNaN(d));

/**
 * Returns the dot product of arbitrary-sized arrays. Assumed they are of the same length.
 * @param values
 * @param nonNumber What to do if array contains an invalid number. Error: throw an exception, 'treat-as-zero' use as 0 instead, 'ignore', let math run with invalid number
 * @returns
 */
export const dotProduct = (
  values: readonly (readonly number[])[],
  nonNumber: `error` | `treat-as-zero` | `ignore` = `ignore`
): number => {
  let r = 0;
  const length = values[ 0 ].length;

  for (let index = 0; index < length; index++) {
    let t = 0;
    for (const [ p, value ] of values.entries()) {
      let v = value[ index ];
      if (Number.isNaN(v) || !Number.isFinite(v)) {
        if (nonNumber === `treat-as-zero`) {
          v = 0;
        } else if (nonNumber === `error`) {
          throw new TypeError(`Invalid number at index ${ index },${ p }`)
        }
      }
      if (p === 0) t = v;
      else {
        t *= v;
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
 * Use {@link numberArrayCompute} if you want min, max and total as well.
 *
 * @example
 * ```js
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
export const average = (data: readonly number[]): number => {
  if (typeof data !== `object`) throw new Error(`Param 'data' should be an array. Got: ${ typeof data }`);
  if (!Array.isArray(data)) throw new TypeError(`Param 'data' is not an array`);
  const valid = validNumbers(data);
  const total = valid.reduce((accumulator, v) => accumulator + v, 0);
  return total / valid.length;
};

/**
 * Returns the minimum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * Numbers.min([10, 20, 0]); // Yields 0
 * ```
 * @param data
 * @returns Minimum number
 */
export const min = (data: readonly number[]): number =>
  Math.min(...validNumbers(data));

/**
 * Returns the index of the largest value.
 * ```js
 * const v = [ 10, 40, 5 ];
 * Numbers.maxIndex(v); // Yields 1
 * ```
 * @param data Array of numbers
 * @returns Index of largest value
 */
export const maxIndex = (data: readonly number[]): number =>

  data.reduce(
    (bestIndex, value, index, array) =>
      value > array[ bestIndex ] ? index : bestIndex,
    0
  );

/**
 * Returns the index of the smallest value.
 *
 * ```js
 * const v = [ 10, 40, 5 ];
 * Numbers.minIndex(v); // Yields 2
 * ```
 * @param data Array of numbers
 * @returns Index of smallest value
 */
export const minIndex = (data: readonly number[]): number =>

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
 * Numbers.max(100, 200, 50); // 200
 * ```
 * @param data List of numbers
 * @returns Maximum number
 */
export const max = (data: readonly number[]): number =>
  Math.max(...validNumbers(data));

/**
 * Returns the total of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * Numbers.total([1, 2, 3]); // 6
 * ```
 * @param data Array of numbers
 * @returns Total
 */
export const total = (data: readonly number[]): number =>
  data.reduce((previous, current) => {
    if (typeof current !== `number`) return previous;
    if (Number.isNaN(current)) return previous;
    if (!Number.isFinite(current)) return previous;
    return previous + current;
  }, 0);

/**
 * Returns the maximum out of `data` without pre-filtering for speed.
 *
 * For most uses, {@link max} should suffice.
 *
 * ```js
 * Numbers.maxFast([ 10, 0, 4 ]); // 10
 * ```
 * @param data
 * @returns Maximum
 */
export const maxFast = (data: readonly number[] | Float32Array): number => {
  let m = Number.MIN_SAFE_INTEGER;
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
 * Numbers.totalFast([ 10, 0, 4 ]); // 14
 * ```
 * @param data
 * @returns Maximum
 */
export const totalFast = (data: readonly number[] | Float32Array): number => {
  let m = 0;
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
 * Numbers.minFast([ 10, 0, 100 ]); // 0
 * ```
 * @param data
 * @returns Maximum
 */
export const minFast = (data: readonly number[] | Float32Array): number => {
  let m = Number.MAX_SAFE_INTEGER;
  for (const datum of data) {
    m = Math.min(m, datum);
  }
  return m;
};
