import { toStringAbbreviate } from "./Text.js";

/**
 * If input is a string, it is returned.
 * Otherwise, it returns the result of JSON.stringify().
 * 
 * @param itemToMakeStringFor 
 * @returns 
 */
export const toStringDefault = (itemToMakeStringFor: any): string =>
  typeof itemToMakeStringFor === `string`
    ? itemToMakeStringFor
    : JSON.stringify(itemToMakeStringFor);

/**
 * If input is a string, it is returned.
 * Otherwise, it returns the result of JSON.stringify() with fields ordered.
 * 
 * This allows for more consistent comparisons when object field orders are different but values the same.
 * @param itemToMakeStringFor 
 * @returns 
 */
export const toStringOrdered = (itemToMakeStringFor: any) => {
  if (typeof itemToMakeStringFor === `string`) return itemToMakeStringFor;
  const allKeys = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  JSON.stringify(itemToMakeStringFor, (key: string, value: any) => (allKeys.add(key), value));
  return JSON.stringify(itemToMakeStringFor, [ ...allKeys ].sort());
}

/**
 * Function that returns true if `a` and `b` are considered equal
 */
export type IsEqual<T> = (a: T, b: T) => boolean;

/**
 * Default comparer function is equiv to checking `a === b`
 */
export const isEqualDefault = <T>(a: T, b: T): boolean => a === b;

/**
 * Comparer returns true if string representation of `a` and `b` are equal.
 * Uses `toStringDefault` to generate a string representation (via `JSON.stringify`).
 * 
 * Returns _false_ if the ordering of fields is different, even though values are identical:
 * ```js
 * isEqualValueDefault({ a: 10, b: 20}, { b: 20, a: 10 }); // false
 * ```
 * 
 * Use {@link isEqualValueIgnoreOrder} to ignore order (with an overhead of additional processing).
 * ```js
 * isEqualValueIgnoreOrder({ a: 10, b: 20}, { b: 20, a: 10 }); // true
 * ```
 * @returns True if the contents of `a` and `b` are equal
 */
export const isEqualValueDefault = <T>(a: T, b: T): boolean => {
  // ✔ UNIT TESTED
  if (a === b) return true; // Object references are the same, or string values are the same
  return toStringDefault(a) === toStringDefault(b); // String representations are the same
};

/**
 * Wraps the `eq` function, tracing the input data result
 * ```js
 * // Init trace
 * const traceEq = isEqualTrace(isEqualValueDefault); 
 * // Use it in some function that takes IsEqual<T>
 * compare(a, b, eq);
 * ```
 * @param eq 
 * @returns 
 */
export const isEqualTrace = <T>(eq: IsEqual<T>): IsEqual<T> => {
  return (a, b) => {
    const result = eq(a, b);
    console.log(`isEqualTrace eq: ${ result } a: ${ toStringAbbreviate(a) } b: ${ toStringAbbreviate(b) }`);
    return result;
  }
}

/**
 * Comparer returns true if string representation of `a` and `b` are equal, regardless of field ordering.
 * Uses `toStringOrdered` to generate a string representation (via JSON.stringify`).
 * 
 * ```js
 * isEqualValueIgnoreOrder({ a: 10, b: 20}, { b: 20, a: 10 }); // true
 * isEqualValue({ a: 10, b: 20}, { b: 20, a: 10 }); // false, fields are different order
 * ```
 * 
 * There is an overhead to ordering fields. Use {@link isEqualValueDefault} if it's not possible that field ordering will change.
 * @returns True if the contents of `a` and `b` are equal
 */
export const isEqualValueIgnoreOrder = <T>(a: T, b: T): boolean => {
  // ✔ UNIT TESTED
  if (a === b) return true; // Object references are the same, or string values are the same
  return toStringOrdered(a) === toStringOrdered(b); // String representations are the same
};