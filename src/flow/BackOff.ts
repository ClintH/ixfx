import {sleep} from "./Sleep";
import { elapsedMs } from "../Util";
import {resolveLogOption} from "../Debug";

/**
 * Result of backoff
 */
export type RetryWithBackOffResult = {
  message?: string,
  success: boolean,
  attempts: number,
  elapsed: number
}

/**
 * Backoff options
 */
export type RetryWithBackOffOpts = Readonly<{
  /**
   * Number of attempts to make
   */
  count: number,
  /**
   * Starting milliseconds for sleeping after failure
   */
  startMs: number,
  /**
   * Optional abort signal
   */
  abort?: AbortSignal,
  /**
   * Log: true logs to console, pass a function for a custom logger
   */
  log?: boolean,
  /**
   * Math.pow factor. Defaults to 1.1
   */
  power?: number
}>

/**
 * Keeps calling `cb` until it returns _true_. If it throws an exception,
 * it will cancel the retry, bubbling the exception.
 * 
 * 
 * ```js
 * // A function that only works some of the time
 * const flakyFn = async () => {
 *  // do the thing
 *  if (Math.random() > 0.9) return true; // success
 *  return false; // 'failed'
 * };
 * 
 * // Retry it five times
 * const result = await retryWithBackOff(flakyFn, { 
 *  count: 5,
 *  startMs: 1000
 * });
 * 
 * if (result.success) {
 *  // Yay
 * } else {
 *  console.log(`Failed after ${result.attempts} attempts. Elapsed: ${result.elapsed}`);
 *  console.log(result.message);
 * }
 * ```
 * @param cb Function to run
 * @param opts Options
 * @returns 
 */
export const retryWithBackOff = async (cb: () => Promise<boolean>, opts: RetryWithBackOffOpts): Promise<RetryWithBackOffResult> => {
  const signal = opts.abort;
  const log = resolveLogOption(opts.log);
  const power = opts.power ?? 1.1;
  const startedAt = Date.now();
  let t = opts.startMs;
  let count = opts.count;
  let attempts = 0;

  while (attempts <= count) {
    attempts++;
    const ok = await cb();
    if (ok) return {success: true, attempts, elapsed: Date.now() - startedAt}

    log({msg:`retryWithBackOff attempts: ${attempts} t: ${elapsedMs(t)}`});

    // Did not succeed. Sleep
    try {
      await sleep(t, 0, signal);
    } catch (ex) {
      // Eg if abort signal fires
      return {success: false, attempts, message: 'Sleep failed, possibly due to abort signal', elapsed: Date.now() - startedAt}
    }

    // Increase sleep time for next fail
    t = Math.floor(Math.pow(t, power));
  }

  return {success: false, attempts, elapsed: Date.now() - startedAt}
}