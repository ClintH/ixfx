import { isContentsTheSame } from "./equality.js";

/**
 * Zip combines the elements of two or more arrays based on their index.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const a = [1,2,3];
 * const b = [`red`, `blue`, `green`];
 *
 * const c = Arrays.zip(a, b);
 * // Yields:
 * // [
 * //   [1, `red`],
 * //   [2, `blue`],
 * //   [3, `green`]
 * // ]
 * ```
 *
 * Typically the arrays you zip together are all about the same logical item. Eg, in the above example
 * perhaps `a` is size and `b` is colour. So thing #1 (at array index 0) is a red thing of size 1. Before
 * zipping we'd access it by `a[0]` and `b[0]`. After zipping, we'd have c[0], which is array of [1, `red`].
 * @param arrays
 * @returns Zipped together array
 */
export const zip = (
  ...arrays: Array<Array<any>> | ReadonlyArray<Array<any>> | ReadonlyArray<ReadonlyArray<any>>
): Array<any> => {
  if (arrays.some((a) => !Array.isArray(a))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths = arrays.map((a) => a.length);
  if (!isContentsTheSame(lengths)) {
    throw new Error(`Arrays must be of same length`);
  }

  const returnValue: any[] = [];
  const length = lengths[ 0 ];

  for (let index = 0; index < length; index++) {
    returnValue.push(arrays.map((a) => a[ index ]));
  }
  return returnValue;
};