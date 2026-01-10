
import type { Interval } from "@ixfx/core";
import { movingAverageLight } from "@ixfx/numbers";
import { rateMinimum } from "@ixfx/flow";

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
export const movingAverageTimed = (options: MovingAverageTimedOptions): (v: number) => number => {
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
