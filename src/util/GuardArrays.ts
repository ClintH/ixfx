import type { GuardResult } from "./GuardTypes.js";
import { throwFromResult } from "./GuardThrowFromResult.js";

/**
 * Throws an error if parameter is not an array
 * @param value
 * @param paramName
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
