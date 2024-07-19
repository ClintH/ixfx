export type Result<T> = {
  success: boolean
  value?: T
  error?: Error | string
}

export type ResultOk<T> = {
  success: true
  value: T
}

export type ResultError = {
  success: false
  error: Error | string
}

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