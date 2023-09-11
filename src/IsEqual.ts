
const toStringDefault = <V>(itemToMakeStringFor: V): string =>
  typeof itemToMakeStringFor === `string`
    ? itemToMakeStringFor
    : JSON.stringify(itemToMakeStringFor);


/**
 * Function that returns true if `a` and `b` are considered equal
 */
export type IsEqual<V> = (a: V, b: V) => boolean;

/**
 * Default comparer function is equiv to checking `a === b`
 */
export const isEqualDefault = <V>(a: V, b: V): boolean => a === b;

/**
 * Comparer returns true if string representation of `a` and `b` are equal.
 * Uses `toStringDefault` to generate a string representation (`JSON.stringify`)
 * @returns True if the contents of `a` and `b` are equal
 */
export const isEqualValueDefault = <V>(a: V, b: V): boolean => {
  // ✔ UNIT TESTED
  if (a === b) return true; // Object references are the same, or string values are the same
  return toStringDefault(a) === toStringDefault(b); // String representations are the same
};
