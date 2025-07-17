import { isEqualDefault, type IsEqual } from "./util/is-equal.js";

/**
 * Returns a copy of an input array with _undefined_ values removed.
 * @param data 
 * @returns 
 */
export const withoutUndefined = <V>(data: readonly V[] | V[]): V[] => {
  return data.filter(v => v !== undefined);
}

/**
 * Returns an array with value(s) omitted. 
 * 
 * If value is not found, result will be a copy of input.
 * Value checking is completed via the provided `comparer` function.
 * By default checking whether `a === b`. To compare based on value, use the `isEqualValueDefault` comparer.
 *
 * @example
 * ```js
 * const data = [100, 20, 40];
 * const filtered = without(data, 20); // [100, 40]
 * ```
 *
 * @example Using value-based comparison
 * ```js
 * const data = [{ name: `Alice` }, { name:`Sam` }];
 *
 * // This wouldn't work as expected, because the default comparer uses instance,
 * // not value:
 * without(data, { name: `Alice` });
 *
 * // So instead we can use a value comparer:
 * without(data, { name:`Alice` }, isEqualValueDefault);
 * ```
 *
 * @example Use a function
 * ```js
 * const data = [ { name: `Alice` }, { name:`Sam` }];
 * without(data, { name:`ALICE` }, (a, b) => {
 *  return (a.name.toLowerCase() === b.name.toLowerCase());
 * });
 * ```
 *
 * Consider {@link remove} to remove an item by index.
 *
 * @typeParam V - Type of array items
 * @param sourceArray Source array
 * @param toRemove Value(s) to remove
 * @param comparer Comparison function. If not provided `isEqualDefault` is used, which compares using `===`
 * @return Copy of array without value.
 */
export const without = <V>(
  sourceArray: readonly V[] | V[],
  toRemove: V | V[],
  comparer: IsEqual<V> = isEqualDefault
): V[] => {
  if (Array.isArray(toRemove)) {
    const returnArray: V[] = []
    for (const source of sourceArray) {
      if (!toRemove.some(v => comparer(source, v))) {
        returnArray.push(source);
      }
    }
    return returnArray;
  } else {
    return sourceArray.filter((v) => !comparer(v, toRemove));
  }
}