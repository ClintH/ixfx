import { containsIdenticalValues } from "./equality.js";
export type ZippedTuple<T extends readonly (readonly unknown[])[]> = {
  [K in keyof T]: T[K] extends readonly (infer U)[] ? U : never;
};

/**
 * Zip combines the elements of two or more arrays based on their index.
 *
 * ```js
 * const a = [ 1, 2, 3 ];
 * const b = [ `red`, `blue`, `green` ];
 *
 * const c = Arrays.zip(a, b);
 * // Yields:
 * // [
 * //   [ 1, `red` ],
 * //   [ 2, `blue` ],
 * //   [ 3, `green` ]
 * // ]
 * ```
 *
 * Typically the arrays you zip together are all about the same logical item. Eg, in the above example
 * perhaps `a` is size and `b` is colour. So thing #1 (at array index 0) is a red thing of size 1. Before
 * zipping we'd access it by `a[0]` and `b[0]`. After zipping, we'd have c[0], which is array of [1, `red`].
 * @param arrays
 * @returns Zipped together array
 * @throws {TypeError} If any of the parameters are not arrays
 * @throws {Error} If the arrays are not all of the same length
 */
export const zip = <T extends readonly (readonly unknown[])[]>(
  ...arrays: T
): Array<ZippedTuple<T>> => {
  if (arrays.some((a) => !Array.isArray(a))) {
    throw new TypeError(`All parameters must be an array`);
  }
  const lengths = arrays.map((a) => a.length);
  if (!containsIdenticalValues(lengths)) {
    throw new Error(`Arrays must be of same length`);
  }

  const returnValue: Array<ZippedTuple<T>> = [];
  const length = lengths[ 0 ];

  for (let index = 0; index < length; index++) {
    returnValue.push(arrays.map((a) => a[ index ]) as ZippedTuple<T>);
  }
  return returnValue;
};
