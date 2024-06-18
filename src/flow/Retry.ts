import { sleep } from './Sleep.js';
import { resolveLogOption } from '../debug/Logger.js';
import { since, toString as elapsedToString } from './Elapsed.js';
import { throwIntegerTest, throwNumberTest } from '../util/GuardNumbers.js';
import { getErrorMessage } from '../debug/GetErrorMessage.js';
import type { Result } from '../util/Results.js';
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

export type BackoffOptions = {
  /**
   * Initial value.
   * Default: 1
   */
  startAt: number,
  /**
   * Maximum times to run.
   * Default: continues forever
   */
  limitAttempts: number,
  /**
   * Stop retrying if this maximum is reached
   * Default: no limit
   */
  limitValue: number
  /**
   * Math power. 
   * Default: 1.1
   */
  power: number
};

/**
 * Generates an expoential backoff series of values
 * ```js
 * // Default: start at 1, power 1.1
 * for (const v of backoffGenerator()) {
 *  // v: numeric value
 * }
 * ```
 * 
 * By default the generator runs forever. Use either
 * `limitAttempts` or `limitValue` to stop it when it produces a
 * given quantity of values, or when the value itself reaches a threshold.
 * 
 * For example:
 * ```js
 * // `values` will have five values in it
 * const values = [...backoffGenerator({ limitAttempts: 5 })];
 * // Keep generating values until max is reached
 * const values = [...backoffGenerator({ limitValue: 1000 })];
 * ```
 * 
 * Options:
 * * startAt: start value
 * * limitAttempts: cap the number of values to generate
 * * limitValue: cap the maximum calculated value
 * * power: power value (default 1.1)
 * 
 * @param options 
 * @returns 
 */
export function* backoffGenerator(options: Partial<BackoffOptions> = {}) {
  const startAt = options.startAt ?? 1;
  let limitAttempts = options.limitAttempts ?? Number.MAX_SAFE_INTEGER;
  const limitValue = options.limitValue;
  const power = options.power ?? 1.1;
  let value = startAt;
  throwIntegerTest(limitAttempts, `aboveZero`, `limitAttempts`);
  throwNumberTest(startAt, ``, `startAt`);
  throwNumberTest(limitAttempts, ``, `limitAttempts`);
  if (limitValue !== undefined) throwNumberTest(limitValue, ``, `limitValue`);
  throwNumberTest(power, ``, `power`);

  while (limitAttempts > 0) {
    // Value has climbed to the limit
    if (limitValue && value >= limitValue) return;
    limitAttempts--;
    yield value;

    // Increase value for next iteration
    value += Math.pow(value, power);
  }
}

/**
 * Backoff options
 */
export type RetryOpts<T> = BackoffOptions & {
  /**
   * Initial waiting period before first attempt (optional)
   */
  readonly predelayMs: number;
  /**
   * Optional abort signal
   */
  readonly abort: AbortSignal;
  /**
   * Log: _true_ monitors the task execution by logging to console
   */
  readonly log: boolean;

  /***
   * Default task value to return if it fails
   */
  readonly taskValueFallback: T;
};

export type RetryTask<T> = {
  /**
   * If `probe` returns {success:true} task is considered
   * complete and retrying stops
   * @returns 
   */
  probe: (attempts: number) => Promise<Result<T>>
}

/**
 * Keeps calling `callback` until it returns something other than _undefined_. 
 * There is an exponentially-increasing delay between each retry attempt.
 * 
 * If `callback` throws an exception, the retry is cancelled, bubbling the exception.
 *
 * ```js
 * // A function that only works some of the time
 * const flakyFn = async () => {
 *  // do the thing
 *  if (Math.random() > 0.9) return true; // success
 *  return; // fake failure
 * };
 *
 * // Retry it up to five times,
 * // starting with 1000ms interval
 * const result = await retryFunction(flakyFn, {
 *  limitAttempts: 5
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
 * const result = await retryFunction(cb, { signal: abort.signal });
 *
 * // Somewhere else...
 * abort('Cancel!'); // Trigger abort
 * ```
 * @param callback Function to run
 * @param opts Options
 * @returns
 */
export const retryFunction = <T>(callback: () => Promise<T | undefined>, opts: Partial<RetryOpts<T>> = {}) => {
  const task: RetryTask<T> = {
    async probe() {
      try {
        const v = await callback();
        if (v === undefined) return { value: opts.taskValueFallback, success: false };
        return { value: v, success: true };
      } catch (error) {
        return { success: false, message: getErrorMessage(error) };
      }
    },
  }
  return retryTask(task, opts);
}

/**
 * Keeps trying to run `task`.
 * 
 * ```js
 * const task = (attempts) => {
 *  // attempts is number of times it has been retried
 *  
 *  if (Math.random() > 0.5) {
 *    // Return a succesful result
 *    return { success: true }
 *  } else {
 *  }
 * 
 * }
 * const t = await retryTask(task, opts);
 * ```
 * @param task 
 * @param opts 
 * @returns 
 */
export const retryTask = async <V>(
  task: RetryTask<V>,
  opts: Partial<RetryOpts<V>> = {}
): Promise<RetryResult<V>> => {
  const signal = opts.abort;
  const log = resolveLogOption(opts.log);
  const predelayMs = opts.predelayMs ?? 0;
  const startedAt = since();

  let attempts = 0;
  const initialValue = opts.startAt ?? 1000;
  const limitAttempts = opts.limitAttempts ?? Number.MAX_SAFE_INTEGER;
  const backoffGen = backoffGenerator({ ...opts, startAt: initialValue, limitAttempts });

  if (initialValue <= 0) throw new Error(`Param 'initialValue' must be above zero`);

  if (predelayMs > 0) {
    try {
      await sleep({ millis: predelayMs, signal: signal });
    } catch (error) {
      // Could happen due to abort signal
      return {
        success: false,
        attempts,
        value: opts.taskValueFallback,
        elapsed: startedAt(),
        message: getErrorMessage(error),
      };
    }
  }

  for (const t of backoffGen) {
    attempts++;

    // Run task
    const result = await task.probe(attempts);
    if (result.success) {
      return { success: result.success, value: result.value, attempts, elapsed: startedAt() };
    }
    log({
      msg: `retry attempts: ${ attempts } t: ${ elapsedToString(t) }`,
    });

    // Did not succeed.
    if (attempts >= limitAttempts) {
      break; // Out of attempts, no point sleeping again
    }
    // Sleep
    try {
      await sleep({ millis: t, signal });
    } catch (error) {
      // Eg if abort signal fires
      return {
        success: false,
        attempts,
        value: opts.taskValueFallback,
        message: getErrorMessage(error),
        elapsed: startedAt(),
      };
    }
  }

  return {
    message: `Giving up after ${ attempts } attempts.`,
    success: false,
    attempts,
    value: opts.taskValueFallback,
    elapsed: startedAt(),
  };
};
