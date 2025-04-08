import { QueueMutable } from "@ixfxfun/collections";
import type { Interval } from "@ixfxfun/core";
import { average, averageWeighted, movingAverageLight } from "@ixfxfun/numbers";
import { rateMinimum } from "@ixfxfun/flow";
import { numberTest } from "@ixfxfun/guards";

/**
 * Creates a moving average for a set number of `samples`.
 * It returns a function which in turn yields an average value.
 * 
 * Moving average are useful for computing the average over a recent set of numbers.
 * A lower number of samples produces a computed value that is lower-latency yet more jittery.
 * A higher number of samples produces a smoother computed value which takes longer to respond to
 * changes in data.
 *
 * Sample size is considered with respect to the level of latency/smoothness trade-off, and also
 * the rate at which new data is added to the moving average.
 *
 *
 * ```js
 * const ma = movingAverage(10);
 * ma(10); // 10
 * ma(5);  // 7.5
 * ```
 *
 * A weighting function can be provided to shape how the average is
 * calculated - eg privileging the most recent data over older data.
 * It uses `Arrays.averageWeighted` under the hood.
 *
 * ```js
 * import { movingAverage } from 'https://unpkg.com/ixfx/dist/data.js';
 * import { gaussian } from 'https://unpkg.com/ixfx/dist/modulation.js';
 * 
 * // Give more weight to data in middle of sampling window
 * const ma = movingAverage(100, gaussian());
 * ```
 *
 * Because it keeps track of `samples` previous data, there is a memory impact. A lighter version is {@link movingAverageLight} which does not keep a buffer of prior data, but can't be as easily fine-tuned.
 * @param samples Number of samples to compute average from
 * @param weighter Optional weighting function
 * @returns
 */
export const movingAverage = (
  samples = 100,
  weighter?: (v: number) => number
): (value?: number) => number => {
  const q = new QueueMutable<number>({
    capacity: samples,
    discardPolicy: `older`,
  });

  return (v?: number | undefined) => {
    const r = numberTest(v);
    if (r[ 0 ] && v !== undefined) {
      q.enqueue(v);
    }
    return weighter === undefined ? average(q.data) : averageWeighted(q.data, weighter);
  }
};

export type MovingAverageTimedOptions = Readonly<{
  interval: Interval
  default?: number
  abort?: AbortSignal
}>

/**
 * Uses the same algorithm as {@link movingAverageLight}, but adds values automatically if
 * nothing has been manually added.
 *
 * ```js
 * // By default, 0 is added if interval elapses
 * const mat = movingAverageTimed({ interval: 1000 });
 * mat(10); // Add value of 10, returns latest average
 * 
 * mat(); // Get current average
 * ```
 * 
 * This is useful if you are averaging something based on events. For example calculating the
 * average speed of the pointer. If there is no speed, there is no pointer move event. Using
 * this function, `value` is added at a rate of `updateRateMs`. This timer is reset
 * every time a value is added, a bit like the `debounce` function.
 * 
 * Use an AbortSignal to cancel the timer associated with the `movingAverageTimed` function.
 * @param options
 * @returns
 */
export const movingAverageTimed = (options: MovingAverageTimedOptions) => {
  const average = movingAverageLight();
  const rm = rateMinimum({
    ...options,
    whatToCall: (distance: number) => {
      average(distance);
    },
    fallback() {
      return options.default ?? 0;
    }
  })

  return (v: number) => {
    rm(v);
    return average();
  }
};
