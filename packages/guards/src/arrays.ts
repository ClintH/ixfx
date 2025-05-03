import type { Result } from "./types.js";
import { integerTest } from "./numbers.js";
import { resultsCollate, resultThrow } from "./result.js";

/**
 * Throws an error if parameter is not an array
 * @param value
 * @param parameterName
 */
export const arrayTest = (value: unknown, parameterName = `?`): Result<any[], string> => {
  if (!Array.isArray(value)) {
    return { success: false, error: `Parameter '${ parameterName }' is expected to be an array'` };
  }
  return { success: true, value }
};

// export const throwArrayTest = (value: unknown, parameterName = `?`) => {
//   resultThrow(arrayTest(value, parameterName));
// }

/**
 * Throws if `index` is an invalid array index for `array`, and if
 * `array` itself is not a valid array.
 * @param array
 * @param index
 */
export const arrayIndexTest = <V>(
  array: ArrayLike<V>,
  index: number,
  name = `index`
): Result<ArrayLike<V>, string> => {
  return resultsCollate(
    arrayTest(array),
    integerTest(index, `positive`, name),
  )
  // const t = ;
  // if (!t.success) return t;

  // throwIntegerTest(index, `positive`, name);
  // if (index > array.length - 1) {
  //   throw new Error(
  //     `'${ name }' ${ index } beyond array max of ${ array.length - 1 }`
  //   );
  // }
};

/**
 * Returns true if parameter is an array of strings
 * @param value
 * @returns
 */
export const arrayStringsTest = (value: unknown): Result<string[], string> => {
  if (!Array.isArray(value)) return { success: false, error: `Value is not an array` };
  if (!value.some((v) => typeof v !== `string`)) {
    return { success: false, error: `Contains something not a string` };
  }
  return { success: true, value };
};


// export const guardArray = <V>(array: ArrayLike<V>, name = `?`) => {
//   if (array === undefined) {
//     throw new TypeError(`Param '${ name }' is undefined. Expected array.`);
//   }
//   if (array === null) {
//     throw new TypeError(`Param '${ name }' is null. Expected array.`);
//   }
//   if (!Array.isArray(array)) {
//     throw new TypeError(`Param '${ name }' not an array as expected`);
//   }
// };

