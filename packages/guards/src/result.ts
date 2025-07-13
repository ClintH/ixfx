import type { Result, ResultError, ResultOk, ResultOrFunction } from "./types.js";

export const getErrorMessage = (ex: unknown): string => {
  if (typeof ex === `string`) return ex;
  if (ex instanceof Error) {
    return ex.message;
  }
  return ex as string;
};

/**
 * Throws an error if any result is a failure.
 * Error message will be the combined from all errors.
 * @param results 
 * @returns 
 */
export const throwIfFailed = (...results: Result<any, any>[]) => {
  const failed = results.filter(r => resultIsError(r));// as ResultError<any>[];
  if (failed.length === 0) return;

  const messages = failed.map(f => resultErrorToString(f));
  throw new Error(messages.join(`, `));
}


/**
 * If `result` is an error, throws it, otherwise ignored.
 * @param result 
 * @returns 
 */
export function resultThrow(...results: ResultOrFunction[]) {
  for (const r of results) {
    const rr = typeof r === `object` ? r : r();
    if (rr === undefined) continue;
    if (rr.success) continue;
    throw resultToError(rr);
  }
  return true;

  // // if (result.success) return true;
  // // if (typeof result.error === `string`) throw new Error(result.error);
  // // throw result.error;
  // if (resultIsError(result)) {
  //   // if (typeof result.error === `string`) throw new Error(result.error);
  //   // if (result.error instanceof Error) throw result.error;
  //   // throw new Error(JSON.stringify(result.error));
  //   throw resultToError(result);
  // }
  // return true;
}

export function resultThrowSingle<TValue>(result: Result<TValue, any>): result is ResultOk<TValue> {
  if (result.success) return true;
  throw resultToError(result);
}

/**
 * Returns the first failed result, or _undefined_ if there are no fails
 * @param results 
 * @returns 
 */
export const resultFirstFail_ = <TError>(...results: ResultOrFunction[]): ResultError<TError> | undefined => {
  for (const r of results) {
    const rr = typeof r === `object` ? r : r();
    if (rr === undefined) continue;
    if (!rr.success) return rr;
  }
}

/**
 * Returns _true_ if `result` is an error
 * @param result 
 * @returns 
 */
export function resultIsError<TValue, TError>(result: Result<TValue, TError>): result is ResultError<TError> {
  if (typeof result !== `object`) return false;
  return !result.success;
}

/**
 * Returns _true_ if `result` is OK and has a value
 * @param result 
 * @returns 
 */
export function resultIsOk<TValue, TError>(result: Result<TValue, TError>): result is ResultOk<TValue> {
  if (typeof result !== `object`) return false;
  return result.success;
}

/**
 * Gets the result as an Error
 * @param result 
 * @returns 
 */
export function resultToError(result: ResultError<any>): Error {
  if (typeof result.error === `string`) throw new Error(result.error);
  if (result.error instanceof Error) throw result.error;
  return new Error(JSON.stringify(result.error));

}

/**
 * Unwraps the result, returning its value if OK.
 * If not, an exception is thrown.
 * @param result 
 * @returns 
 */
export function resultToValue<TValue, TError>(result: Result<TValue, TError>): TValue {
  if (resultIsOk(result)) {
    return result.value;
  }
  throw resultToError(result);
}

/**
 * Returns the error as a string.
 * @param result 
 * @returns 
 */
export function resultErrorToString(result: ResultError<any>): string {
  if (result.error instanceof Error) return getErrorMessage(result.error);
  if (typeof result.error === `string`) return result.error;
  return JSON.stringify(result.error);
}





/**
 * Returns first failed result or final value.
 * @param results 
 * @returns 
 */
export const resultsCollate = <TValue, TError>(...results: ResultOrFunction[]): Result<TValue, TError> => {
  let rr: Result<TValue, TError> | undefined;
  for (const r of results) {
    rr = typeof r === `object` ? r : r();
    if (rr === undefined) continue;
    if (!rr.success) return rr;
  }
  if (!rr) throw new Error(`No results`);
  return rr;
}


/**
 * If `result` is an error, calls `callback`, passing the error.
 * Otherwise does nothing
 * @param result 
 * @param callback 
 */
export const resultWithFail = <TError>(result: Result<any, TError>, callback: (r: ResultError<TError>) => void) => {
  if (resultIsError(result)) {
    callback(result);
  }
};