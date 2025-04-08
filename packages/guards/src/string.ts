import type { GuardResult } from "./types.js";
import { throwFromResult } from "./throw-from-result.js";

export type StringGuardRange = `` | `non-empty`

/**
 * Throws an error if parameter is not an string
 * @param value
 * @param parameterName
 */
export const stringTest = (value: unknown, range: StringGuardRange = ``, parameterName = `?`): GuardResult => {
  if (typeof value !== `string`) return [ false, `Param '${ parameterName } is not type string. Got: ${ typeof value }` ];
  switch (range) {
    case `non-empty`:
      if (value.length === 0) return [ false, `Param '${ parameterName } is empty` ];
      break;
  }
  return [ true ];
};

export const throwStringTest = (value: unknown, range: StringGuardRange = ``, parameterName = `?`) => {
  throwFromResult(stringTest(value, range, parameterName));
}

