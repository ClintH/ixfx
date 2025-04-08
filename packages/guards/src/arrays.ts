import type { GuardResult } from "./types.js";
import { throwFromResult } from "./throw-from-result.js";
import { throwIntegerTest } from "./numbers.js";

/**
 * Throws an error if parameter is not an array
 * @param value
 * @param parameterName
 */
export const arrayTest = (value: unknown, parameterName = `?`): GuardResult => {
  if (!Array.isArray(value)) {
    return [ false, `Parameter '${ parameterName }' is expected to be an array'` ];
  }
  return [ true ];
};

export const throwArrayTest = (value: unknown, parameterName = `?`) => {
  throwFromResult(arrayTest(value, parameterName));
}

/**
 * Returns true if parameter is an array of strings
 * @param value
 * @returns
 */
export const isStringArray = (value: unknown): boolean => {
  if (!Array.isArray(value)) return false;
  return !value.some((v) => typeof v !== `string`);
};

/**
 * Throws an error if `array` parameter is not a valid array
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/data.js';
 * Arrays.guardArray(someVariable);
 * ```
 * @private
 * @param array
 * @param name
 */
export const guardArray = <V>(array: ArrayLike<V>, name = `?`) => {
  if (array === undefined) {
    throw new TypeError(`Param '${ name }' is undefined. Expected array.`);
  }
  if (array === null) {
    throw new TypeError(`Param '${ name }' is null. Expected array.`);
  }
  if (!Array.isArray(array)) {
    throw new TypeError(`Param '${ name }' not an array as expected`);
  }
};

/**
 * Throws if `index` is an invalid array index for `array`, and if
 * `array` itself is not a valid array.
 * @param array
 * @param index
 */
export const guardIndex = <V>(
  array: ArrayLike<V>,
  index: number,
  name = `index`
) => {
  guardArray(array);
  throwIntegerTest(index, `positive`, name);
  if (index > array.length - 1) {
    throw new Error(
      `'${ name }' ${ index } beyond array max of ${ array.length - 1 }`
    );
  }
};