import { isEqualDefault, type IsEqual } from "./util/is-equal.js";

/**
 * Returns the _intersection_ of two arrays: the elements that are in common.
 * 
 * ```js
 * intersection([1, 2, 3], [2, 4, 6]);
// returns [2]
 * ```
 * See also: 
 * * {@link unique}: Unique set of items amongst one or more arrays
 * @param arrayA 
 * @param arrayB 
 * @param equality 
 * @returns 
 */
export const intersection = <V>(
  arrayA: readonly V[] | V[],
  arrayB: readonly V[] | V[],
  equality: IsEqual<V> = isEqualDefault
) => arrayA.filter((valueFromA) => arrayB.some((valueFromB) => equality(valueFromA, valueFromB)));
