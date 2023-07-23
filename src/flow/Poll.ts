import { sleep } from './Sleep.js';

/**
 * Polls a function, returning values as an iterator. When the
 * function returns _undefined_, iterator ends.
 *
 * @example Iterate over an envelope's values with a 100ms rate
 * ```js
 * const env = adsr(opts);
 * env.trigger();
 *
 * const iter = iterableFromPoll(100, () => {
 *  if (env.isDone) return; // Exit
 *  const v = env.value;
 *  return v;
 * });
 *
 * for await (const v of iter) {
 *  // iterate over envelope values, sampling every 100ms
 * }
 * ```
 * @param opts
 * @returns
 */
export async function* iterableFromPoll<V>(
  sampleRateMs: number,
  poll: () => V | undefined
) {
  while (true) {
    const v = poll();
    if (typeof v === 'undefined') return;
    yield v;
    await sleep(sampleRateMs);
  }
}
