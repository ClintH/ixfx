// export type Result<T> = {
//   success: boolean
//   value?: T
//   error?: Error | string
// }

import { getErrorMessage } from "./debug/index.js"

export type ResultOk<T> = {
  success: true
  value: T
}

export type ResultError = {
  success: false
  error: Error | string
}

export type Result<T> = ResultOk<T> | ResultError;
/**
 * If `result` is an error, throws it, otherwise ignored.
 * @param result 
 * @returns 
 */
export function throwResult<T>(result: Result<T>): result is ResultOk<T> {
  if (result.success) return true;
  if (typeof result.error === `string`) throw new Error(result.error);
  throw result.error;
}

export function resultToError(result:ResultError):Error {
  if (typeof result.error === `string`) return new Error(result.error);
  else return result.error
}

export function resultToValue<T>(result:Result<T>):T {
  if (result.success) return result.value;
  else throw resultToError(result);
}

export function resultErrorToString(result:ResultError):string {
  if (typeof result.error === `string`) return result.error;
  else return getErrorMessage(result.error);
}