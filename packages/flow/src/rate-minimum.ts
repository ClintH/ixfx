import type { Interval } from "@ixfx/core";
import { timeout } from "./timeout.js";

export type RateMinimumOptions<TInput> = Readonly<{
  whatToCall: (args: TInput) => void
  fallback: () => TInput
  interval: Interval
  abort?: AbortSignal
}>;

/**
 * Ensures that `whatToCall` is executed with a given tempo.
 * 
 * ```js
 * const rm = rateMinimum({
 *  fallback: () => {
 *    return Math.random();
 *  },
 *  whatToCall: (value:number) => {
 *    console.log(value);
 *  },
 *  interval: { secs: 10 }
 * });
 * 
 * // Invokes `whatToCall`, resetting timeout
 * rm(10);
 * 
 * // If we don't call rm() before 'interval' has elapsed,
 * // 'fallback' will be invoked
 * ``` 
 * 
 * A practical use for this is to update calculations based on firing of events
 * as well as when they don't fire. For example user input.
 * 
 * ```js
 * // Average distances
 * const average = movingAverageLight();
 * const rm = rateMinimum({
 *  interval: { secs: 1 },
 *  whatToCall: (distance: number) => {
 *    average(distance);
 *  },
 *  // If there are no pointermove events, distance is 0
 *  fallback() {
 *    return 0;
 *  }
 * })
 * 
 * // Report total movemeent
 * document.addEventListener(`pointermove`, event => {
 *  rm(event.movementX + event.movementY);
 * });
 * ```
 * 
 * @param options 
 * @returns 
 */
export const rateMinimum = <TInput>(options: RateMinimumOptions<TInput>) => {
  let disposed = false;

  const t = timeout(() => {
    if (disposed) return;
    t.start();
    options.whatToCall(options.fallback());
  }, options.interval);


  if (options.abort) {
    options.abort.addEventListener(`abort`, _ => {
      disposed = true;
      t.cancel();
    });
  }
  t.start();

  return (args: TInput) => {
    if (disposed) throw new Error(`AbortSignal has been fired`);
    t.start();
    options.whatToCall(args);
  }
}