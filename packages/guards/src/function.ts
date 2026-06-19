import type { Result } from "./types.js";

export const isFunction = (object: unknown): object is (...args: any[]) => any => typeof object === `function`;

// eslint-disable-next-line ts/no-unsafe-function-type
export function functionTest(value: unknown, parameterName = `?`): Result<Function, string> {
  if (value === undefined)
    return { success: false, error: `Param '${parameterName}' is undefined. Expected: function.` };
  if (value === null)
    return { success: false, error: `Param '${parameterName}' is null. Expected: function.` };
  if (typeof value !== `function`)
    return { success: false, error: `Param '${parameterName}' is type '${typeof value}'. Expected: function` };
  return { success: true, value };
}
