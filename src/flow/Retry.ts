import { integer as guardInteger } from '../Guards.js';
import { sleep } from './Sleep.js';

export type CancelToken = {
  readonly cancel: boolean;
};

/**
 * Keeps executing `calback` until it runs without an exception being thrown.
 *
 * ```
 * // Retry up to five times, starting at 200ms delay
 * await retry(async () => {
 *  // Do something, sometimes throwing an error
 * }, 5, 200);
 * ```
 *
 * Each loop will run at twice the duration of the last, beginning at `startingTimeoutMs`.
 *
 * @param callback Async code to run
 * @param attempts Number of times to try
 * @param startingTimeoutMs Time to sleep for first iteration
 * @param cancelToken If provided, this is checked before and after each sleep to see if retry should continue. If cancelled, promise will be rejected
 * @returns
 */
export const retry = async <V>(
  callback: () => Promise<V>,
  attempts: number = 5,
  startingTimeoutMs: number = 200,
  cancelToken?: CancelToken
): Promise<V> => {
  guardInteger(attempts, `positive`, `attempts`);
  guardInteger(startingTimeoutMs, `positive`, `startingTimeoutMs`);

  //eslint-disable-next-line functional/no-let
  let timeout = startingTimeoutMs;
  //eslint-disable-next-line functional/no-let
  let totalSlept = 0;
  while (attempts > 0) {
    try {
      return await callback();
    } catch (ex) {
      attempts--;
    }
    totalSlept += timeout;

    if (cancelToken && cancelToken.cancel) throw new Error(`Cancelled`);
    await sleep(timeout);
    if (cancelToken && cancelToken.cancel) throw new Error(`Cancelled`);

    timeout *= 2;
  }
  throw new Error(
    `Retry failed after ${attempts} attempts over ${totalSlept} ms.`
  );
};
