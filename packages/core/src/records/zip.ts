import { type Spread, mergeObjects } from "./merge.js";

/**
 * Merge corresponding objects from arrays. This is assuming objects at the same array indices are connected.
 * 
 * Arrays must be the same length. When merging objects, the properties of later objects override those of earlier objects.
 * 
 * ```js
 * const a = [ { name: `jane`, age: 30 }, { name: `bob`, age: 40 } ];
 * const b = [ { name: `fred`, colour: `red` }, { name: `johanne` } ];
 * const c = [...zipObjects(a, b)];
 * // Yields:
 * // [
 * //   { name: `fred`, age: 30, colour: `red` },
 * //   { name: `johanne`, age: 40 }
 * // ]
 * ```
 * @param toMerge Arrays to merge
 * @throws {TypeError} If either parameter is not an array
 * @throws {TypeError} If the arrays are not of the same length
 * @returns Generator of merged records 
 */
export function* zipObjects<T extends object[]>(
  ...toMerge: { [K in keyof T]: Array<T[K]> }
): Generator<Spread<T>, void, unknown> {

  let len = -1;
  for (let index = 0; index < toMerge.length; index++) {
    if (!Array.isArray(toMerge[index])) throw new TypeError(`Value at index ${index} is not an array as expected`);
    if (len === -1) {
      len = toMerge[index].length;
    } else {
      if (toMerge[index].length !== len) throw new TypeError(`Array length mismatch. Expected: ${ len } Actual: ${ toMerge[index].length } Array: ${index}`);
    }
  }

  for (let index = 0; index < len; index++) {
    const row = toMerge.map((arr) => arr[index]) as T;
    yield mergeObjects<T>(...row);
  }
}
