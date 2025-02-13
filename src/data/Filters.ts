
/**
 * Returns `v` if `predicate` returns _true_,
 * alternatively returning `skipValue`.
 * 
 * ```js
 * // Return true if value is less than 10
 * const p = v => v < 10;
 * 
 * filterValue(5, p, 0);   // 5
 * filterValue(20, p, 0);  // 0
 * ```
 * @param v Value to test
 * @param predicate Predicate
 * @param skipValue Value to return if predicate returns false
 * @returns Input value if predicate is _true_, or `skipValue` if not.
 */
export const filterValue = <V>(v: V, predicate: (v: V) => boolean, skipValue: V | undefined): V | undefined => {
  if (predicate(v)) return v;
  return skipValue;
};
