
/**
 * Clamps a value between min and max (both inclusive)
 * Defaults to a 0-1 range, useful for percentages.
 * 
 * Usage:
 *  clamp(0.5);         // 0.5 - just fine, within default of 0 to 1
 *  clamp(1.5);         // 1 - above default max of 1
 *  clamp(-50, 0, 100); // 0 - below range
 *  clamp(50, 0, 50);   // 50 - within range
 * 
 * For clamping integer ranges, consider `clampZeroBounds`
 * @param {number} v Value to clamp
 * @param {number} [min=0] Minimum value (inclusive)
 * @param {number} [max=1] Maximum value (inclusive)
 * @returns Clamped value
 */
export const clamp = (v: number, min = 0, max = 1) => {
  // ✔ UNIT TESTED
  if (Number.isNaN(v)) throw new Error(`v parameter is NaN`);
  if (Number.isNaN(min)) throw new Error(`min parameter is NaN`);
  if (Number.isNaN(max)) throw new Error(`max parameter is NaN`);

  if (v < min) return min;
  if (v > max) return max;
  return v;
};


export const lerp =(amt:number, a:number, b:number) => (1-amt) * a + amt * b;

/**
 * Clamps integer `v` between 0 and length (exclusive)
 * This is useful for clamping an array range, because the largest allowed number will
 * be one less than length
 * @param {number} v Integer value to clamp
 * @param {number} length Length of bounds
 * @returns Clamped value
 */
export const clampZeroBounds = (v: number, length: number) => {
  // ✔ UNIT TESTED
  if (!Number.isInteger(v)) throw new Error(`v parameter must be an integer`);
  if (!Number.isInteger(length)) throw new Error(`length parameter must be an integer`);

  if (v < 0) return 0;
  if (v >= length) return length - 1;
  return v;
};

export const randomElement = <V>(array: ArrayLike<V>): V => array[Math.floor(Math.random() * array.length)];


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
export const average = (...data:number[]):number => {
  // ✔ UNIT TESTED
  if (data === undefined) throw new Error(`data parameter is undefined`);
  
  //const total = data.reduce((acc, v) => acc+v, 0);
  let counted = 0;
  let total =0;
  for (let i=0;i<data.length;i++) {
    if (typeof data[i] !== `number` || Number.isNaN(data[i])) continue;
    total += data[i];
    counted++;
  }
  return total / counted; 
};

export const getMinMaxAvg = (data: number[]): {min: number; max: number; avg: number;} => {
  let min = Number.MAX_SAFE_INTEGER;
  let total = 0;
  let samples = 0;
  let max = Number.MIN_SAFE_INTEGER;
  for (let i = 0; i < data.length; i++) {
    if (Number.isNaN(data[i])) continue;
    min = Math.min(data[i], min);
    max = Math.max(data[i], max);
    total += data[i];
    samples++;
  }
  return {min: min, max: max, avg: total / samples};
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const sleep = (milliseconds: number): Promise<any> => new Promise(resolve => setTimeout(resolve, milliseconds));

export type KeyString<V> = (itemToMakeKeyFor: V) => string;