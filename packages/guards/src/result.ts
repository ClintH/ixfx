import type { Result, ResultError, ResultOk, ResultOrFunction } from "./types.js";

export function getErrorMessage(ex: unknown): string {
  if (typeof ex === `string`)
    return ex;
  if (ex instanceof Error) {
    return ex.message;
  }
  return String(ex);
}

/**
 * Throws an error if any result is a failure.
 * Error message will be the combined from all errors.
 * @param results
 */
export function throwIfFailed(...results: Array<Result<any, any>>): void {
  const failed = results.filter(r => resultIsError(r));// as ResultError<any>[];
  if (failed.length === 0)
    return;

  const messages = failed.map(f => resultErrorToString(f));
  throw new Error(messages.join(`, `));
}

/**
 * If any of `results` is an error, throws it, otherwise ignored.
 * @param results
 * @returns _true_ or throws
 */
export function resultThrow(...results: ResultOrFunction[]): boolean {
  for (const r of results) {
    if (r === undefined)
      continue;
    if (typeof r === `boolean`) {
      if (!r)
        throw IxfxError.fromString(`Guard failed: false result`);
      else continue;
    }
    const rr = typeof r === `object` ? r : r();
    if (rr === undefined)
      continue;
    if (rr.success)
      continue;
    throw resultToError(rr as any as ResultError<any>);
  }
  return true;
}

export function resultThrowSingle<TValue>(result: Result<TValue, any>): result is ResultOk<TValue> {
  if (result.success)
    return true;
  throw resultToError(result as any as ResultError<any>);
}

/**
 * Returns the first failed result, or _undefined_ if there are no fails
 * @param results
 */
export function resultFirstFail_<TError>(...results: ResultOrFunction[]): ResultError<TError> | undefined {
  for (const r of results) {
    if (typeof r === `boolean`) {
      if (r)
        continue;
      return { success: false, error: `Guard failed: false result` as TError };
    }
    const rr = (typeof r === `object` ? r : r()) as ResultError<TError> | undefined;
    if (rr === undefined)
      continue;
    if (!rr.success)
      return rr;
  }
}

/**
 * Returns _true_ if `result` is an error
 * @param result
 */
export function resultIsError<TValue, TError>(result: Result<TValue, TError>): result is ResultError<TError> {
  if (typeof result !== `object` || result === null)
    return false;
  return !result.success;
}

/**
 * Returns _true_ if `result` is OK and has a value
 * @param result
 */
export function resultIsOk<TValue, TError>(result: Result<TValue, TError>): result is ResultOk<TValue> {
  if (typeof result !== `object` || result === null)
    return false;
  return result.success;
}

export class IxfxError extends Error {
  cause: string | undefined;
  constructor(message: string, cause?: string) {
    super(message);
    this.cause = cause;
  }

  static fromError(error: Error, cause?: string): IxfxError {
    const message = error.message;
    const stack = error.stack;
    const name = error.name;
    const newError = new IxfxError(message, cause);
    newError.stack = stack;
    newError.name = `IxfxError(${name})`;
    return newError;
  }

  static fromString(message: string, cause?: string): IxfxError {
    const newError = new IxfxError(message, cause);
    newError.name = `IxfxError`;
    return newError;
  }
}
/**
 * Gets the result as an Error
 * @param result
 */
export function resultToError(result: ResultError<any>): Error {
  if (typeof result.error === `string`) {
    return IxfxError.fromString(result.error, result.info);
  }
  if (result.error instanceof Error)
    return IxfxError.fromError(result.error, result.info);
  return IxfxError.fromString(JSON.stringify(result.error), result.info);
}

/**
 * Unwraps the result, returning its value if OK.
 * If not, an exception is thrown.
 * @param result
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
 */
export function resultErrorToString(result: ResultError<any>): string {
  if (result.error instanceof Error)
    return getErrorMessage(result.error);
  if (typeof result.error === `string`)
    return result.error;
  return JSON.stringify(result.error);
}

/**
 * Returns a {@link ResultError} using 'error' as the message.
 * @param error
 * @param info
 */
export function errorResult(error: string, info?: string): ResultError<string> {
  return {
    success: false,
    error,
    info,
  };
}

/**
 * Returns first failed result or final value.
 * @param results
 */
export function resultsCollate<TValue, TError>(...results: ResultOrFunction[]): Result<TValue, TError> {
  let rr: Result<TValue, TError> | undefined;
  for (const r of results) {
    if (typeof r === `boolean`) {
      if (r)
        continue;
      return { success: false, error: `Guard failed: false result` as TError };
    }
    rr = typeof r === `object` ? r : r();
    if (rr === undefined)
      continue;
    if (!rr.success)
      return rr;
  }
  if (!rr)
    throw new Error(`No results`);
  return rr;
}

/**
 * If `result` is an error, calls `callback`, passing the error.
 * Otherwise does nothing
 * @param result
 * @param callback
 */
export function resultWithFail<TError>(result: Result<any, TError>, callback: (r: ResultError<TError>) => void): void {
  if (resultIsError(result)) {
    callback(result);
  }
}