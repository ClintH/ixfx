import type { Result } from "./types.js";

export const nullUndefTest = <TValue>(value: TValue, parameterName = `?`): Result<TValue, string> => {
  if (typeof value === `undefined`) {
    return { success: false, error: `${ parameterName } param is undefined` };
  }
  if (value === null) return { success: false, error: `${ parameterName } param is null` };
  return { success: true, value };
};

// export const throwNullUndef = (value: any, parameterName = `?`) => {
//   const r = nullUndef(value, parameterName);
//   if (r[ 0 ]) return;
//   throw new Error(r[ 1 ]);
// }

export const isDefined = <T>(argument: T | undefined): argument is T =>
  argument !== undefined;
