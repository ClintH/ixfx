import {Arrays, queueMutable} from '../collections';


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
      return Arrays.average(...q.data);
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

export type MovingAverage = {
  clear():void
  compute():number
  add(v:number):number
}