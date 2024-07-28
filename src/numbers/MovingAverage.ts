import type { Interval } from '../flow/IntervalType.js';
import { averageWeighted } from '../numbers/AverageWeighted.js';
import { average } from '../numbers/NumericArrays.js';
import { QueueMutable } from '../collections/queue/QueueMutable.js';
import { throwNumberTest, numberTest } from "../util/GuardNumbers.js";
import { rateMinimum } from '../flow/RateMinimum.js';
const PiPi = Math.PI * 2;

/**
 * A moving average calculator (exponential weighted moving average) which does not keep track of
 * previous samples. Less accurate, but uses less system resources.
 *
 * The `scaling` parameter determines smoothing. A value of `1` means that
 * the latest value is used as the average - that is, no smoothing. Higher numbers
 * introduce progressively more smoothing by weighting the accumulated prior average more heavily.
 *
 * ```
 * const ma = movingAverageLight(); // default scaling of 3
 * ma(50);  // 50
 * ma(100); // 75
 * ma(75);  // 75
 * ma(0);   // 50
 * ```
 *
 * Note that the final average of 50 is pretty far from the last value of 0. To make it more responsive,
 * we could use a lower scaling factor: `movingAverageLight(2)`. This yields a final average of `37.5` instead.
 *
 * @param scaling Scaling factor. 1 is no smoothing. Default: 3
 * @returns Function that adds to average.
 */
export const movingAverageLight = (scaling = 3): (value?: number) => number => {
  throwNumberTest(scaling, `aboveZero`, `scaling`);
  let average = 0;
  let count = 0;

  return (v?: number) => {
    const r = numberTest(v, ``, `v`);
    if (r[ 0 ] && v !== undefined) {
      // Valid number
      count++;
      average = average + (v - average) / Math.min(count, scaling);
    }
    return average;
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

// export const movingAverageTimed = (
//   updateRateMs = 200,
//   value = 0,
//   scaling = 3
// ): MovingAverage => {
//   throwNumberTest(scaling, `aboveZero`, `scaling`);
//   throwNumberTest(updateRateMs, `aboveZero`, `decayRateMs`);

//   const mal = movingAverageLight(scaling);

//   //eslint-disable-next-line functional/no-let
//   let timer = 0;

//   const reschedule = () => {
//     if (timer !== 0) clearTimeout(timer);
//     // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
//     // @ts-ignore
//     timer = setTimeout(decay, updateRateMs) as number;
//   };

//   const decay = () => {
//     mal.add(value);
//     if (!mal.isDisposed) setTimeout(decay, updateRateMs);
//   };

//   const ma: MovingAverage = {
//     add(v: number) {
//       reschedule();
//       return mal.add(v);
//     },

//     dispose() {
//       mal.dispose();
//     },
//     clear: function (): void {
//       mal.clear();
//     },
//     compute: function (): number {
//       return mal.compute();
//     },
//     isDisposed: false,
//   };

//   return ma;
// };

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
 * import { movingAverage } from 'https://unpkg.com/ixfx/dist/data.js';
 *
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


const smoothingFactor = (timeDelta: number, cutoff: number): number => {
  const r = PiPi * cutoff * timeDelta;
  return r / (r + 1);
}

const exponentialSmoothing = (smoothingFactor: number, value: number, previous: number): number => {
  return smoothingFactor * value + (1 - smoothingFactor) * previous
}

/**
 * Noise filtering
 * 
 * Algorithm: https://gery.casiez.net/1euro/
 * 
 * Based on [Jaan Tollander de Balsch's implementation](https://jaantollander.com/post/noise-filtering-using-one-euro-filter/)
 * @param cutoffMin Default: 1
 * @param speedCoefficient Default: 0
 * @param cutoffDefault Default: 1
 */
export const noiseFilter = (cutoffMin = 1, speedCoefficient = 0, cutoffDefault = 1) => {
  let previousValue = 0;
  let derivativeLast = 0;
  let timestampLast = 0;

  const compute = (value: number, timestamp?: number) => {
    if (timestamp === undefined) timestamp = performance.now();
    const timeDelta = timestamp - timestampLast;

    // Filtered derivative
    const s = smoothingFactor(timeDelta, cutoffDefault);
    const valueDelta = (value - previousValue) / timeDelta;
    const derivative = exponentialSmoothing(s, valueDelta, derivativeLast);

    // Filtered signal
    const cutoff = cutoffMin + speedCoefficient * Math.abs(derivative);
    const a = smoothingFactor(timeDelta, cutoff);
    const smoothed = exponentialSmoothing(a, value, previousValue);

    previousValue = smoothed;
    derivativeLast = derivative;
    timestampLast = timestamp;

    return smoothed;
  }
  return compute;
}