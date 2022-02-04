/**
 * Calculates the average of all numbers in an array.
 * Array items which aren't a valid number are ignored and do not factor into averaging.
 *
 * Use {@link minMaxAvg} if you want min, max and total as well.
 * 
 * @example
 * ```
 * // Average of a list
 * const avg = average(1, 1.4, 0.9, 0.1);
 * 
 * // Average of a variable
 * let data = [100,200];
 * average(...data);
 * ```
 * @param data Data to average.
 * @returns Average of array
 */
export const average = (...data: readonly number[]): number => {
  // ✔ UNIT TESTED
  if (data === undefined) throw new Error(`data parameter is undefined`);

  //const total = data.reduce((acc, v) => acc+v, 0);
  const validNumbers = data.filter(d => typeof d === `number` && !Number.isNaN(d));
  const total = validNumbers.reduce((acc, v) => acc + v, 0);
  return total / validNumbers.length;
};

/**
 * Returns the min, max, avg and total of the array.
 * Any values that are invalid are silently skipped over.
 * 
 * Use {@link average} if you only need average
 * 
 * @param data 
 * @returns `{min, max, avg, total}`
 */
export const minMaxAvg = (data: readonly number[]): {
  /**
   * Smallest value in array
   */
  readonly min: number; 
  /**
   * Total of all items
   */
  readonly total: number; 
  /**
   * Largest value in array
   */
  readonly max: number; 
  /**
   * Average value in array
   */
  readonly avg: number;} => {
  const validNumbers = data.filter(d => typeof d === `number` && !Number.isNaN(d));
  const total = validNumbers.reduce((acc, v) => acc + v, 0);
  return {
    total: total,
    max: Math.max(...validNumbers),
    min: Math.min(...validNumbers),
    avg: total / validNumbers.length
  };
};