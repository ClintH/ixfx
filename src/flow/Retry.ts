import { sleep } from './Sleep.js';
import { getErrorMessage, resolveLogOption } from '../Debug.js';
import { since, toString as elapsedToString } from './Elapsed.js';
import { throwIntegerTest } from '../Guards.js';
/**
 * Result of backoff
 */
export type RetryResult<V> = {
  /**
   * Message describing outcome.
   *
   * If retry was aborted, message will be abort reason.
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
   * Total elapsed time since beginning of call to `retry`
   */
  readonly elapsed: number;

  /**
   * Value returned by succeeding function,
   * or _undefined_ if it failed
   */
  readonly value: V | undefined;
};

/**
 * Backoff options
 */
export type RetryOpts<V> = {
  /**
   * Maximum number of attempts to make
   */
  readonly count: number;
  /**
   * Starting milliseconds for sleeping after failure
   * Defaults to 1000.
   * Must be above zero.
   */
  readonly startMs?: number;
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

  /***
   * Default value to return if it fails
   */
  readonly defaultValue?: V;
};

/**
 * Keeps calling `cb` until it returns something other than _undefined_. If it throws an exception,
 * it will cancel the retry, bubbling the exception and cancelling the retry.
 *
 * ```js
 * // A function that only works some of the time
 * const flakyFn = async () => {
 *  // do the thing
 *  if (Math.random() > 0.9) return true; // success
 *  return; // 'failed'
 * };
 *
 * // Retry it up to five times,
 * // starting with 1000ms interval
 * const result = await retry(flakyFn, {
 *  count: 5
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
 * const result = await retry(cb, { startMs: 6000, count: 1000, signal: abort.signal });
 *
 * // Somewhere else...
 * abort('Cancel!'); // Trigger abort
 * ```
 * @param cb Function to run
 * @param opts Options
 * @returns
 */
export const retry = async <V>(
  cb: () => Promise<V | undefined>,
  //eslint-disable-next-line functional/prefer-immutable-types
  opts: RetryOpts<V>
): Promise<RetryResult<V>> => {
  const signal = opts.abort;
  const log = resolveLogOption(opts.log);
  const power = opts.power ?? 1.1;
  const predelayMs = opts.predelayMs ?? 0;
  const startedAt = since();

  //eslint-disable-next-line functional/no-let
  let t = opts.startMs ?? 1000;
  const count = opts.count;
  //eslint-disable-next-line functional/no-let
  let attempts = 0;

  throwIntegerTest(count, 'aboveZero', 'count');
  if (t <= 0) throw new Error(`startMs must be above zero`);

  if (predelayMs > 0) await sleep({ millis: predelayMs, signal: signal });
  if (signal?.aborted) {
    return {
      success: false,
      attempts,
      value: opts.defaultValue,
      elapsed: startedAt(),
      message: `Aborted during predelay`,
    };
  }
  while (attempts < count) {
    attempts++;
    const cbResult = await cb();
    if (cbResult !== undefined) {
      return { value: cbResult, success: true, attempts, elapsed: startedAt() };
    }
    log({
      msg: `retry attempts: ${ attempts } t: ${ elapsedToString(t) }`,
    });

    // Did not succeed.
    if (attempts >= count) {
      break; // Out of attempts, no point sleeping again
    }
    // Sleep
    try {
      await sleep({ millis: t, signal });
    } catch (ex) {
      // Eg if abort signal fires
      return {
        success: false,
        attempts,
        value: opts.defaultValue,
        message: getErrorMessage(ex),
        elapsed: startedAt(),
      };
    }

    // Increase sleep time for next fail
    t = Math.floor(Math.pow(t, power));
  }

  return {
    message: `Giving up after ${ attempts } attempts.`,
    success: false,
    attempts,
    value: opts.defaultValue,
    elapsed: startedAt(),
  };
};
