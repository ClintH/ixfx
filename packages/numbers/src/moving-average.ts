import { throwNumberTest, numberTest } from "@ixfxfun/guards";
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