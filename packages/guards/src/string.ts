import type { Result } from "./types.js";

export type StringGuardRange = `` | `non-empty`;

/**
 * Throws an error if parameter is not an string
 * @param value Value to check
 * @param range Range conditions, if any
 * @param parameterName Name of parameter, for customising error message
 */
export function stringTest(value: unknown, range: StringGuardRange = ``, parameterName = `?`): Result<string, string> {
  if (typeof value !== `string`)
    return { success: false, error: `Param '${parameterName} is not type string. Got: ${typeof value}` };
  switch (range) {
    case `non-empty`:
      if (value.length === 0)
        return { success: false, error: `Param '${parameterName} is empty` };
      break;
  }
  return { success: true, value };
}

// export const throwStringTest = (value: unknown, range: StringGuardRange = ``, parameterName = `?`) => {
//   throwFromResult(stringTest(value, range, parameterName));
// }
