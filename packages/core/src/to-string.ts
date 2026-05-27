// Via Vuejs

import { removeCircularReferences } from "./records/circular.js";

const objectToString = Object.prototype.toString;
function toTypeString(value: unknown): string {
  return objectToString.call(value);
}

/**
 * Returns _true_ if `value` is a Map type
 * @param value
 * @returns
 */
export function isMap(value: unknown): value is Map<any, any> {
  return toTypeString(value) === `[object Map]`;
}

/**
 * Returns _true_ if `value` is a Set type
 * @param value
 * @returns
 */
export function isSet(value: unknown): value is Set<any> {
  return toTypeString(value) === `[object Set]`;
}

/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */
export function toStringDefault<V>(itemToMakeStringFor: V): string {
  return typeof itemToMakeStringFor === `string`
    ? itemToMakeStringFor
    : JSON.stringify(itemToMakeStringFor);
}

/**
 * Converts a value to string form.
 * For simple objects, .toString() is used, other JSON.stringify is used.
 * It is meant for creating debugging output or 'hash' versions of objects, and does
 * not necessarily maintain full fidelity of the input
 * @param value
 * @returns
 */
export function defaultToString(value: null | boolean | string | object): string {
  // ECMA specification: http://www.ecma-international.org/ecma-262/6.0/#sec-tostring
  if (value === null)
    return `null`;
  if (typeof value === `boolean` || typeof value === `number`) {
    return value.toString();
  }

  if (typeof value === `string`)
    return value;
  if (typeof value === `symbol`)
    throw new TypeError(`Symbol cannot be converted to string`);
  try {
    const s = JSON.stringify(value);
    return s;
  } catch (error) {
    // Circular maybe
    if (typeof value === `object`) {
      return JSON.stringify(removeCircularReferences(value, `(circular)`));
    } else {
      throw error;
    }
  }
}

/**
 * If input is a string, it is returned.
 * Otherwise, it returns the result of JSON.stringify() with fields ordered.
 *
 * This allows for more consistent comparisons when object field orders are different but values the same.
 * @param itemToMakeStringFor
 */
export function toStringOrdered(itemToMakeStringFor: unknown): string {
  if (typeof itemToMakeStringFor === `string`)
    return itemToMakeStringFor;
  // const allKeys = new Set<string>();
  const replacer = (key: string, value: unknown) =>
    value instanceof Object && !(Array.isArray(value))
      ? Object.keys(value)
          .sort()
          .reduce((sorted, key) => {
            (sorted as any)[key] = (value as any)[key];
            return sorted;
          }, {})
      : value;

  return JSON.stringify(itemToMakeStringFor, replacer);// (key: string, value: unknown) => (allKeys.add(key), value));
  // return JSON.stringify(itemToMakeStringFor, [...allKeys.values()].toSorted());
}