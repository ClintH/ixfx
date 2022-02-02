
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

/**
 * Clamps integer `v` between 0 (inclusive) and length (exclusive)
 * This is useful for clamping an array range, because the largest allowed number will
 * be one less than length
 * 
 * ```js
 * const myArray = [`a`, `b`, `c`, `d`];
 * clampZeroBounds(0, myArray.length); // 0
 * clampZeroBounds(1.2, myArray.length); // 1
 * clampZeroBounds(4, myArray.length); // 4
 * clampZeroBounds(5, myArray.length); // 4
 * clampZeroBounds(-1, myArray.length); // 0 
 * ```
 * @param {number} v Integer value to clamp
 * @param {number} length Length of bounds
 * @returns Clamped value, minimum will be 0, maximum will be one less than `length`.
 */
export const clampZeroBounds = (v: number, length: number) => {
  // ✔ UNIT TESTED
  if (!Number.isInteger(v)) throw new Error(`v parameter must be an integer (${v})`);
  if (!Number.isInteger(length)) throw new Error(`length parameter must be an integer (${length}, ${typeof length})`);
  v = Math.round(v);
  if (v < 0) return 0;
  if (v >= length) return length - 1;
  return v;
};

export const lerp =(amt:number, a:number, b:number) => (1-amt) * a + amt * b;

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
export const average = (...data:readonly number[]):number => {
  // ✔ UNIT TESTED
  if (data === undefined) throw new Error(`data parameter is undefined`);
  
  //const total = data.reduce((acc, v) => acc+v, 0);
  const validNumbers = data.filter(d => typeof d === `number` && !Number.isNaN(d));
  const total = validNumbers.reduce((acc, v) => acc+v, 0);
  return total / validNumbers.length;
};

export const getMinMaxAvg = (data: readonly number[]): {readonly min: number; readonly total: number; readonly max: number; readonly avg: number;} => {
  const validNumbers = data.filter(d => typeof d === `number` && !Number.isNaN(d));
  const total = validNumbers.reduce((acc, v) => acc+v, 0);
  return {
    total: total,
    max: Math.max(...validNumbers),
    min: Math.min(...validNumbers),
    avg: total /  validNumbers.length
  };
};


/**
 * Pauses execution
 * ```js
 * console.log(`Hello`);
 * await sleep(1000);
 * console.log(`There`); // Prints one second after
 * ```
 *
 * @param {number} milliseconds
 * @return {*}  {Promise<any>}
 */
export const sleep = (milliseconds: number): Promise<any> => new Promise(resolve => setTimeout(resolve, milliseconds));

/**
 * Calls provided function after a delay
 *
 * ```js
 * const result = await delay(async () => Math.random(), 1000);
 * console.log(result); // Prints out result after one second
 * ```
 * @template V
 * @param {() => Promise<V>} call
 * @param {number} milliseconds
 * @return {*}  {Promise<any>}
 */
export const delay = async <V>(call:() => Promise<V>, milliseconds: number): Promise<any> =>  {
  await sleep(milliseconds);
  return Promise.resolve(await call());
};

export type ToString<V> = (itemToMakeStringFor: V) => string;
export type IsEqual<V> = (a:V, b:V) => boolean;

/**
 * Default comparer function is equiv to checking `a === b`
 * ✔ UNIT TESTED
 * @template V
 * @param {V} a
 * @param {V} b
 * @return {*}  {boolean}
 */
export const isEqualDefault = <V>(a:V, b:V):boolean => a === b;

/**
 * Comparer returns true if string representation of `a` and `b` are equal.
 * Uses `toStringDefault` to generate a string representation (`JSON.stringify`)
 *
 * @template V
 * @param {V} a
 * @param {V} b
 * @return {*}  {boolean} True if the contents of `a` and `b` are equal
 */
export const isEqualValueDefault = <V>(a:V, b:V):boolean => {
  // ✔ UNIT TESTED
  if (a === b) return true; // Object references are the same, or string values are the same
  return toStringDefault(a) === toStringDefault(b); // String representations are the same
};

/**
 * A default converter to string that uses JSON.stringify if its an object, or the thing itself if it's a string
 * ✔ UNIT TESTED
 * @template V
 * @param {V} itemToMakeStringFor
 * @returns {string}
 */
export const toStringDefault = <V>(itemToMakeStringFor:V):string => ((typeof itemToMakeStringFor === `string`) ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor));

