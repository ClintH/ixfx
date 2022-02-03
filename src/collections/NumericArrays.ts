/**
 * Calculates the average of all numbers in an array.
 * Array items which aren't a valid number are ignored and do not factor into averaging.
 *
 * Usage
 * ```
 * average(1, 1.4, 0.9, 0.1);
 * 
 * let data = [100,200];
 * average(...data);
 * ```
 * @param {...number[]} data Data to average.
 * @returns {number}
 */
export const average = (...data: readonly number[]): number => {
  // ✔ UNIT TESTED
  if (data === undefined) throw new Error(`data parameter is undefined`);

  //const total = data.reduce((acc, v) => acc+v, 0);
  const validNumbers = data.filter(d => typeof d === `number` && !Number.isNaN(d));
  const total = validNumbers.reduce((acc, v) => acc + v, 0);
  return total / validNumbers.length;
};

export const getMinMaxAvg = (data: readonly number[]): {readonly min: number; readonly total: number; readonly max: number; readonly avg: number;} => {
  const validNumbers = data.filter(d => typeof d === `number` && !Number.isNaN(d));
  const total = validNumbers.reduce((acc, v) => acc + v, 0);
  return {
    total: total,
    max: Math.max(...validNumbers),
    min: Math.min(...validNumbers),
    avg: total / validNumbers.length
  };
};