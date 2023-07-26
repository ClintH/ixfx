import { sleep } from './Sleep.js';
import { resolveLogOption } from '../Debug.js';
import { since, toString as elapsedToString } from './Elapsed.js';

/**
 * Result of backoff
 */
export type RetryWithBackOffResult = {
  /**
   * Message describing outcome
   */
  readonly message?: string;
  /**
   * True if callback function was invoked once where it returned _true_
   */
  readonly success: boolean;
  /**
   * Number of times callback was attempted
   */
  readonly attempts: number;
  /**
   * Total elapsed time since beginning of call to `retryWithBackoff`
   */
  readonly elapsed: number;
};

/**
 * Backoff options
 */
export type RetryWithBackOffOpts = {
  /**
   * Maximum number of attempts to make
   */
  readonly count: number;
  /**
   * Starting milliseconds for sleeping after failure
   */
  readonly startMs: number;
  /**
   * Initial waiting period before first attempt (optional)
   */
  readonly predelayMs?: number;
  /**
   * Optional abort signal
   */
  readonly abort?: AbortSignal;
  /**
   * Log: _true_ logs to console
   */
  readonly log?: boolean;
  /**
   * Math.pow factor. Defaults to 1.1. How much slower to
   * get with each retry.
   */
  readonly power?: number;
};

/**
 * Keeps calling `cb` until it returns _true_. If it throws an exception,
 * it will cancel the retry, bubbling the exception.
 *
 * ```js
 * // A function that only works some of the time
 * const flakyFn = async () => {
 *  // do the thing
 *  if (Math.random() > 0.9) return true; // success
 *  return false; // 'failed'
 * };
 *
 * // Retry it up to five times
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
 * 
 * An `AbortSignal` can be used to cancel process.
 * ```js
 * const abort = new AbortController();
 * const result = await retryWithBackOff(cb, { startMs: 6000, count: 1000, signal: abort.signal });
 * 
 * // Somewhere else...
 * abort('Cancel!'); // Trigger abort
 * ```
 * @param cb Function to run
 * @param opts Options
 * @returns
 */
export const retryWithBackOff = async (
  cb: () => Promise<boolean>,
  //eslint-disable-next-line functional/prefer-immutable-types
  opts: RetryWithBackOffOpts
): Promise<RetryWithBackOffResult> => {
  const signal = opts.abort;
  const log = resolveLogOption(opts.log);
  const power = opts.power ?? 1.1;
  const predelayMs = opts.predelayMs ?? 0;
  const startedAt = since();
  
  //eslint-disable-next-line functional/no-let
  let t = opts.startMs;
  const count = opts.count;
  //eslint-disable-next-line functional/no-let
  let attempts = 0;

  if (predelayMs > 0) await sleep({ millis: predelayMs, signal: signal});
  if (signal?.aborted) {
    return {
      success: false,
      attempts,
      elapsed: startedAt(),
      message: `Aborted during predelay`
    }
  }
  while (attempts <= count) {
    attempts++;
    const ok = await cb();
    if (ok) return { success: true, attempts, elapsed: startedAt() };

    log({ msg: `retryWithBackOff attempts: ${attempts} t: ${elapsedToString(t)}` });

    // Did not succeed. Sleep
    try {
      await sleep({ millis: t, signal });
    } catch (ex) {
      // Eg if abort signal fires
      return {
        success: false,
        attempts,
        message: 'Sleep failed, possibly due to abort signal',
        elapsed: startedAt(),
      };
    }

    // Increase sleep time for next fail
    t = Math.floor(Math.pow(t, power));
  }

  return { success: false, attempts, elapsed: startedAt() };
};
