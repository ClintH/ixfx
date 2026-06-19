import type { Result } from "./types.js";

/**
 * Throws an error if parameter is not an boolean
 * @param value
 * @param parameterName
 */
export function booleanTest(value: unknown, parameterName = `?`): Result<boolean, string> {
  if (typeof value !== `boolean`)
    return { success: false, error: `Param '${parameterName} is not type boolean. Got: ${typeof value}` };

  return { success: true, value };
}
