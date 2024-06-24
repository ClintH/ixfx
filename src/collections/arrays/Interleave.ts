import { isContentsTheSame } from "./Equality.js";

/**
 * Returns an interleaving of two or more arrays. All arrays must be the same length.
 *
 * ```js
 * import { interleave } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const a = [`a`, `b`, `c`];
 * const b = [`1`, `2`, `3`];
 * const c = interleave(a, b);
 * // Yields:
 * // [`a`, `1`, `b`, `2`, `c`, `3`]
 * ```
 * @param arrays
 * @returns
 */
export const interleave = <V>(
  ...arrays: ReadonlyArray<ReadonlyArray<V>> | Array<Array<V>>
): Array<V> => {
  if (arrays.some((a) => !Array.isArray(a))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths = arrays.map((a) => a.length);
  if (!isContentsTheSame(lengths)) {
    throw new Error(`Arrays must be of same length`);
  }

  const returnValue = [];
  const length = lengths[ 0 ];
  for (let index = 0; index < length; index++) {
    for (const array of arrays) {
      returnValue.push(array[ index ]);
    }
  }
  return returnValue;
};
