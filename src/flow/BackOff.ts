import { sleep } from './Sleep.js';
import { elapsedMs } from '../Util.js';
import { resolveLogOption } from '../Debug.js';

/**
 * Result of backoff
 */
export type RetryWithBackOffResult = {
  readonly message?: string;
  readonly success: boolean;
  readonly attempts: number;
  readonly elapsed: number;
};

/**
 * Backoff options
 */
export type RetryWithBackOffOpts = {
  /**
   * Number of attempts to make
   */
  readonly count: number;
  /**
   * Starting milliseconds for sleeping after failure
   */
  readonly startMs: number;
  /**
   * Optional abort signal
   */
  readonly abort?: AbortSignal;
  /**
   * Log: true logs to console, pass a function for a custom logger
   */
  readonly log?: boolean;
  /**
   * Math.pow factor. Defaults to 1.1
   */
  readonly power?: number;
};

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
export const retryWithBackOff = async (
  cb: () => Promise<boolean>,
  //eslint-disable-next-line functional/prefer-immutable-types
  opts: RetryWithBackOffOpts
): Promise<RetryWithBackOffResult> => {
  const signal = opts.abort;
  const log = resolveLogOption(opts.log);
  const power = opts.power ?? 1.1;
  const startedAt = Date.now();
  //eslint-disable-next-line functional/no-let
  let t = opts.startMs;
  const count = opts.count;
  //eslint-disable-next-line functional/no-let
  let attempts = 0;

  while (attempts <= count) {
    attempts++;
    const ok = await cb();
    if (ok) return { success: true, attempts, elapsed: Date.now() - startedAt };

    log({ msg: `retryWithBackOff attempts: ${attempts} t: ${elapsedMs(t)}` });

    // Did not succeed. Sleep
    try {
      await sleep({ millis: t, signal });
    } catch (ex) {
      // Eg if abort signal fires
      return {
        success: false,
        attempts,
        message: 'Sleep failed, possibly due to abort signal',
        elapsed: Date.now() - startedAt,
      };
    }

    // Increase sleep time for next fail
    t = Math.floor(Math.pow(t, power));
  }

  return { success: false, attempts, elapsed: Date.now() - startedAt };
};
