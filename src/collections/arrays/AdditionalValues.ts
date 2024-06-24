import { isEqualDefault, type IsEqual } from "../../util/IsEqual.js";

/**
 * Yield values from an iterable not present in the other.
 *
 * Assuming that `input` array is unique values, this function
 * yields items from `values` which are not present in `input`.
 *
 * Duplicate items in `values` are ignored - only the first is yielded.
 *
 * If `eq` function is not provided, values are compared using the
 * default === semantics (via {@link isEqualDefault})
 *
 * ```js
 * const existing = [ 1, 2, 3 ];
 * const newValues = [ 3, 4, 5];
 * const v = [...additionalValues(existing, newValues)];
 * // [ 1, 2, 3, 4, 5]
 * ```
 *
 * ```js
 * const existing = [ 1, 2, 3 ];
 * const newValues = [ 3, 4, 5 ];
 * for (const v of additionalValues(existing, newValues)) {
 *  // 4, 5
 * }
 * To combine one or more iterables, keeping only unique items, use {@link unique}
 * @param input
 * @param values
 */
export function* additionalValues<V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  input: Array<V>,
  //eslint-disable-next-line functional/prefer-readonly-type
  values: Iterable<V>,
  eq: IsEqual<V> = isEqualDefault
): Iterable<V> {
  // Keep track of values already yielded
  const yielded: Array<V> = [];
  for (const v of values) {
    const found = input.find((index) => eq(index, v));
    if (!found) {
      const alreadyYielded = yielded.find((ii) => eq(ii, v));
      if (!alreadyYielded) {
        //eslint-disable-next-line functional/immutable-data
        yielded.push(v);
        yield v;
      }
    }
  }
}
