import { containsIdenticalValues } from "./equality.js";

/**
 * Zip combines the elements of two or more arrays based on their index.
 *
 * ```js
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
  ...arrays: any[][] | readonly any[][] | readonly (readonly any[])[]
): any[] => {
  if (arrays.some((a) => !Array.isArray(a))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths = arrays.map((a) => (a as any[]).length);
  if (!containsIdenticalValues(lengths)) {
    throw new Error(`Arrays must be of same length`);
  }

  const returnValue: any[] = [];
  const length = lengths[ 0 ];

  for (let index = 0; index < length; index++) {

    returnValue.push(arrays.map((a) => a[ index ]));
  }
  return returnValue;
};