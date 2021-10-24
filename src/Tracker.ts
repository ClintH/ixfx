/**
 * Keeps track of the min, max and avg in a stream of values.
 * 
 * Usage:
 *  const t = tracker(); 
 *  t.seen(10)
 * 
 * t.avg() / t.min() / t.max() / t.getMinMax()
 * 
 * Use reset() to clear everything, or resetAvg() to just reset averaging calculation
 * @class Tracker
 */
export const tracker = function (id: string | null) {
  let samples = 0;
  let total = 0;
  let min = 0;
  let max = 0;

  const avg = () => total / samples;
  const resetAvg = (newId: string | null = null) => {
    if (newId !== null) id = newId;
    total = 0;
    samples = 0;
  };
  const reset = (newId: string | null = null) => {
    min = Number.MAX_SAFE_INTEGER;
    max = Number.MIN_SAFE_INTEGER;
    resetAvg(newId);
  }

  return {
    seen: (sample: number) => {
      if (Number.isNaN(sample)) throw Error('Cannot add NaN');
      samples++;
      total += sample;
      min = Math.min(sample, min);
      max = Math.max(sample, max);
    },
    avg: () => total / samples,
    min: () => min,
    max: () => max,
    getMinMaxAvg: () => {
      return {
        min: min,
        max: max,
        avg: avg(),
      }
    },
    resetAvg: resetAvg,
    reset: reset
  }
}
