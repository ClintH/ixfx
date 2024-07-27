import type { GuardResult } from "./GuardTypes.js";

export const isFunction = (object: unknown): object is (...args: Array<any>) => any => object instanceof Function;

export const functionTest = (value: unknown, parameterName = `?`): GuardResult => {
  if (value === undefined) return [ false, `Param '${ parameterName }' is undefined. Expected: function.` ];
  if (value === null) return [ false, `Param '${ parameterName }' is null. Expected: function.` ];
  if (typeof value !== `function`) return [ false, `Param '${ parameterName }' is type '${ typeof value }'. Expected: function` ];
  return [ true ];
}

export const throwFunctionTest = (value: unknown, parameterName = `?`) => {
  const [ ok, msg ] = functionTest(value, parameterName);
  if (ok) return;
  throw new TypeError(msg);
}