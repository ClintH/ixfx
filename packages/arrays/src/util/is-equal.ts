import { toStringDefault } from "./to-string.js";

/**
 * Function that returns true if `a` and `b` are considered equal
 */
export type IsEqual<T> = (a: T, b: T) => boolean;

/**
 * If input is a string, it is returned.
 * Otherwise, it returns the result of JSON.stringify() with fields ordered.
 * 
 * This allows for more consistent comparisons when object field orders are different but values the same.
 * @param itemToMakeStringFor 
 * @returns 
 */
// export const toStringOrdered = (itemToMakeStringFor: unknown) => {
//   if (typeof itemToMakeStringFor === `string`) return itemToMakeStringFor;
//   const allKeys = new Set<string>();

//   JSON.stringify(itemToMakeStringFor, (key: string, value: unknown) => (allKeys.add(key), value));
//   return JSON.stringify(itemToMakeStringFor, [ ...allKeys ].sort());
// }


/**
 * Default comparer function is equiv to checking `a === b`.
 * Use {@link isEqualValueDefault} to compare by value, via comparing JSON string representation.
 */
export const isEqualDefault = <T>(a: T, b: T): boolean => a === b;

/**
 * Comparer returns true if string representation of `a` and `b` are equal.
 * Use {@link isEqualDefault} to compare using === semantics
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
 * 
 * Use {@link isEqualValuePartial} to partially match `b` against `a`.
 * @returns True if the contents of `a` and `b` are equal
 */
export const isEqualValueDefault = <T>(a: T, b: T): boolean => {
  // ✔ UNIT TESTED
  if (a === b) return true; // Object references are the same, or string values are the same
  return toStringDefault(a) === toStringDefault(b); // String representations are the same
};

/**
 * Returns _true_ if `a` contains the values of `b`. `a` may contain other values, but we
 * only check against what is in `b`. `a` and `b` must both be simple objects.
 * 
 * ```js
 * const obj = {
 *  name: `Elle`,
 *  size: 100,
 *  colour: {
 *    red: 0.5,
 *    green: 0.1,
 *    blue: 0.2
 *  }
 * }
 * 
 * isEqualValuePartial(obj, { name: `Elle` }); // true
 * isEqualValuePartial(obj, { name: { colour: red: { 0.5, green: 0.1  }} }); // true
 * 
 * isEqualValuePartial(obj, { name: `Ellen` });     // false
 * isEqualValuePartial(obj, { lastname: `Elle` });  // false
 * ```
 * @param a 
 * @param b 
 * @param fieldComparer 
 * @returns 
 */
export const isEqualValuePartial = (a: Record<string, unknown>, b: Record<string, unknown>, fieldComparer?: IsEqual<unknown>): boolean => {
  if (typeof a !== `object`) throw new Error(`Param 'a' expected to be object`);
  if (typeof b !== `object`) throw new Error(`Param 'b' expected to be object`);

  if (Object.is(a, b)) return true;
  const comparer = fieldComparer ?? isEqualValuePartial;
  for (const entryB of Object.entries(b)) {
    const valueOnAKeyFromB = a[ entryB[ 0 ] ];
    const valueB = entryB[ 1 ];
    if (typeof valueOnAKeyFromB === `object` && typeof valueB === `object`) {
      if (!comparer(valueOnAKeyFromB as Record<string, unknown>, valueB as Record<string, unknown>)) {
        return false;
      }
    } else {
      if (valueOnAKeyFromB !== valueB) {
        return false;
      }
    }
  }
  return true;
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
 * @typeParam T - Type of objects being compared
 */
// export const isEqualValueIgnoreOrder = <T>(a: T, b: T): boolean => {
//   // ✔ UNIT TESTED
//   if (a === b) return true; // Object references are the same, or string values are the same
//   return toStringOrdered(a) === toStringOrdered(b); // String representations are the same
// };

/**
 * Returns _true_ if Object.entries() is empty for `value`
 * @param value 
 * @returns 
 */
export const isEmptyEntries = (value: object) => [ ...Object.entries(value) ].length === 0;

/**
 * Return _true_ if `a` and `b` ought to be considered equal
 * at a given path
 */
export type IsEqualContext<V> = (a: V, b: V | undefined, path: string) => boolean

/**
 * Returns _true_ if `a` and `b` are equal based on their JSON representations.
 * `path` parameter is ignored.
 * @param a 
 * @param b 
 * @param path 
 * @returns 
 */
export const isEqualContextString: IsEqualContext<unknown> = (a: unknown, b: unknown, _path: string): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
}