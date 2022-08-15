import {Arrays, queueMutable} from '../collections/index.js';
import {integer as guardInteger} from '../Guards.js';

/**
 * A moving average calculator (exponential weighted moving average) which does not keep track of
 * previous samples. Less accurate, but uses less system resources.
 * 
 * The `scaling` parameter determines smoothing. A value of `1` means that
 * the latest value is used as the average - that is, no smoothing. Higher numbers
 * introduce progressively more smoothing by weighting the accumulated prior average more heavily.
 * 
 * `add()` adds a new value and returns the calculated average.
 * 
 * ```
 * const ma = movingAverageLight(); // default scaling of 3
 * ma.add(50);  // 50
 * ma.add(100); // 75
 * ma.add(75);  // 75
 * ma.add(0);   // 50
 * ```
 * 
 * Note that the final average of 50 is pretty far from the last value of 0. To make it more responsive,
 * we could use a lower scaling factor: `movingAverageLight(2)`. This yields a final average of `37.5` instead.
 * 
 * Use `clear()` to reset the moving average, or `compute()` to get the current value without adding.
 * @param scaling Scaling factor. 1 is no smoothing. Default: 3
 * @returns {@link MovingAverage} 
 */
export const movingAverageLight = (scaling:number = 3):MovingAverage => {
  guardInteger(scaling, `aboveZero`, `scaling`);
  //eslint-disable-next-line functional/no-let
  let average = 0;
  //eslint-disable-next-line functional/no-let
  let count = 0;

  const ma:MovingAverage = {
    add(v:number) {
      count++;
      average = average + (v - average) / Math.min(count, scaling);
      return average;
    },
    clear() {
      average = 0;
      count = 0;
    },
    compute() {
      return average;
    }
  };
  return ma;
};

/**
 * Creates a moving average for a set number of `samples`.
 * 
 * Moving average are useful for computing the average over a recent set of numbers.
 * A lower number of samples produces a computed value that is lower-latency yet more jittery.
 * A higher number of samples produces a smoother computed value which takes longer to respond to
 * changes in data.
 * 
 * Sample size is considered with respect to the level of latency/smoothness trade-off, and also
 * the rate at which new data is added to the moving average.
 * 
* `add` adds a number and returns the computed average. Call `compute` to 
 * get the average without adding a new value.
 * 
 * ```js
 * const ma = movingAverage(10);
 * ma.add(10); // 10
 * ma.add(5);  // 7.5
 * ```
 * 
 * `clear` clears the average.
 * 
 * A weighting function can be provided to shape how the average is
 * calculated - eg privileging the most recent data over older data.
 * It uses `Arrays.averageWeighted` under the hood.
 * 
 * ```js
 * // Give more weight to data in middle of sampling window
 * const ma = movingAverage(100, Easings.gaussian());
 * ```
 * 
 * Because it keeps track of `samples` previous data, there is a memory impact. A lighter version is {@link movingAverageLight} which does not keep a buffer of prior data, but can't be as easily fine-tuned.
 * @param samples Number of samples to compute average from
 * @param weightingFn Optional weighting function
 * @returns 
 */
export const movingAverage = (samples = 100, weightingFn?:(v:number)=>number):MovingAverage => {
  
  //eslint-disable-next-line functional/no-let
  let q = queueMutable<number>({
    capacity: samples,
    discardPolicy: `older`
  });
  
  const clear = () => {
    q = queueMutable<number>({
      capacity: samples,
      discardPolicy: `older`
    });
  };

  const compute = () => {
    if (weightingFn === undefined) {
      return Arrays.average(q.data);
    } else {
      return Arrays.averageWeighted(q.data, weightingFn);
    }
  };

  const add = (v:number) => {
    q.enqueue(v);
    return compute();
  };

  return { add, compute, clear };
};

/**
 * Moving average.
 * Create via {@link movingAverage} or {@link movingAverageLight}.
 */
export type MovingAverage = {
  /**
   * Clear data
   */
  clear():void
  /**
   * Returns current average
   */
  compute():number
  /**
   * Adds a value, returning new average
   * @param v Value to add
   */
  add(v:number):number
}
