import type { GuardResult } from "./GuardTypes.js";
/**
 * Throws if `value` is _undefined_ or _null_.
 * @param value
 * @param parameterName
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nullUndef = (value: any, parameterName = `?`): GuardResult => {
  if (typeof value === `undefined`) {
    return [ false, `${ parameterName } param is undefined` ];
  }
  if (value === null) return [ false, `${ parameterName } param is null` ];
  return [ true ];
};

export const throwNullUndef = (value: any, parameterName = `?`) => {
  const r = nullUndef(value, parameterName);
  if (r[ 0 ]) return;
  throw new Error(r[ 1 ]);
}

/** Throws an error if parameter is not defined */
export const defined = <T>(argument: T | undefined): argument is T =>
  argument !== undefined;
