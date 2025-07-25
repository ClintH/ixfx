import { containsIdenticalValues } from "./equality.js";

/**
 * Returns an interleaving of two or more arrays. All arrays must be the same length.
 *
 * ```js
 * const a = [`a`, `b`, `c`];
 * const b = [`1`, `2`, `3`];
 * const c = Arrays.interleave(a, b);
 * // Yields:
 * // [`a`, `1`, `b`, `2`, `c`, `3`]
 * ```
 * @param arrays
 * @returns
 */
export const interleave = <V>(
  ...arrays: readonly (readonly V[])[] | V[][]
): V[] => {
  if (arrays.some((a) => !Array.isArray(a))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths = arrays.map(a => (a as V[]).length);
  if (!containsIdenticalValues(lengths)) {
    throw new Error(`Arrays must be of same length`);
  }

  const returnValue: V[] = [];
  const length = lengths[ 0 ];
  for (let index = 0; index < length; index++) {
    for (const array of arrays) {
      returnValue.push(array[ index ]);
    }
  }
  return returnValue;
};
