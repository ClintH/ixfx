import { CancelError } from "./cancel-error.js";

/**
/**
 * Calls a function if the input value is not undefined.
 * Return value from function is passed to next function in flow.
 * 
 * ```js
 * const flow = Process.flow(
 *  Process.max(),
 *  Process.seenLastToUndefined(),
 *  Process.ifNotUndefined(v => {
 *    console.log(`v:`, v);
 *  })
 * );
 * flow(100); // Prints 'v:100'
 * flow(90);  // Nothing happens max value has not changed
 * flow(110); // Prints 'v:110'
 * ```
 * @param fn 
 * @returns 
 */
export function ifNotUndefined<TIn, TOut>(fn: (value: Exclude<TIn, undefined>) => TOut) {
  return (value: TIn) => {
    if (value === undefined) return value;
    const v = fn(value as Exclude<TIn, undefined>);
    return v;
  }
}



/**
 * Cancels the remaining flow operations if _undefined_ is an input.
 * See also {@link ifUndefined} or {@link ifNotUndefined}.
 * 
 * ```js
 * const c3 = Process.flow(
 *  Basic.max(),
 *  Process.seenLastToUndefined(),
 *  Process.cancelIfUndefined(),
 *  (v => {
 *   console.log(v);
 *  })
 * );
 * c3(100); // Prints '100'
 * c3(90);  // Doesn't print anything since max does not change
 * c3(110); // Prints '110'
 * ```
 * @returns 
 */
export function cancelIfUndefined<TIn>() {
  return (value: TIn | undefined) => {
    if (value === undefined) throw new CancelError(`cancel`);
    return value as TIn;
  }
}
/**
 * Returns the output of `fn` if the input value is _undefined_.
 * See also: {@link ifNotUndefined} and {@link cancelIfUndefined}.
 * @param fn 
 * @returns 
 */
export function ifUndefined<TIn, TOut>(fn: () => TOut) {
  return (value: TIn) => {
    if (value === undefined) return fn();
    else return value;
  }
}