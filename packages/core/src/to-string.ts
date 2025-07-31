
// Via Vuejs

import { removeCircularReferences } from "./records/circular.js";

// eslint-disable-next-line @typescript-eslint/unbound-method
const objectToString = Object.prototype.toString
const toTypeString = (value: unknown): string =>
  objectToString.call(value)

/**
 * Returns _true_ if `value` is a Map type
 * @param value
 * @returns 
 */
export const isMap = (value: unknown): value is Map<any, any> =>
  toTypeString(value) === `[object Map]`

/**
 * Returns _true_ if `value` is a Set type
 * @param value 
 * @returns 
 */
export const isSet = (value: unknown): value is Set<any> =>
  toTypeString(value) === `[object Set]`

/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 */
export const toStringDefault = <V>(itemToMakeStringFor: V): string =>
  typeof itemToMakeStringFor === `string`
    ? itemToMakeStringFor
    : JSON.stringify(itemToMakeStringFor);


/**
 * Converts a value to string form.
 * For simple objects, .toString() is used, other JSON.stringify is used.
 * It is meant for creating debugging output or 'hash' versions of objects, and does
 * not necessarily maintain full fidelity of the input
 * @param value 
 * @returns 
 */
export const defaultToString = (value: null | boolean | string | object): string => {
  //ECMA specification: http://www.ecma-international.org/ecma-262/6.0/#sec-tostring
  if (value === null) return `null`;
  if (typeof value === `boolean` || typeof value === `number`) {
    return value.toString();
  }

  if (typeof value === `string`) return value;
  if (typeof value === `symbol`) throw new TypeError(`Symbol cannot be converted to string`);
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
};