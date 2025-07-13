import { isEqualDefault, type IsEqual } from "@ixfx/core";

/**
 * Yield additional values from `values` which are not in `source`.
 *
 * Assuming that `source` is a set of unique values, this function
 * yields items from `values` which are not present in `source`.
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
 * @param source
 * @param values
 */
export function* additionalValues<V>(
  source: Iterable<V>,
  values: Iterable<V>,
  eq: IsEqual<V> = isEqualDefault
): Iterable<V> {
  const sourceArray = Array.isArray(source) ? source : [ ...source ];
  const yielded: V[] = [];
  for (const v of values) {
    const found = sourceArray.find((index) => eq(index, v));
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
