import { number as guardNumber} from "./Guards.js";

export const startsEnds = (v:string, start:string, end:string):boolean => v.startsWith(start) && v.endsWith(end);

/**
 * Clamps a value between min and max (both inclusive)
 * Defaults to a 0-1 range, useful for percentages.
 * 
 * @example Usage
 * ```js
 *  clamp(0.5);         // 0.5 - just fine, within default of 0 to 1
 *  clamp(1.5);         // 1 - above default max of 1
 *  clamp(-50, 0, 100); // 0 - below range
 *  clamp(50, 0, 50);   // 50 - within range
 * ```
 * 
 * For clamping integer ranges, consider `clampZeroBounds`
 * 
 * @param v Value to clamp
 * @param Minimum value (inclusive)
 * @param Maximum value (inclusive)
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
 * Scales `v` from an input range to an output range.
 * For example, if a sensor's useful range is 100-500, you could
 * easily scale it to a percentage:
 * ```js
 * scale(sensorReading, 100, 500, 0, 1);
 * ```
 * @param v Value to scale
 * @param inMin Input minimum
 * @param inMax Input maximum
 * @param outMin Output minimum
 * @param outMax Output maximum
 * @returns Scaled value
 */
export const scale = (
  v:number, 
  inMin:number, inMax:number, 
  outMin:number, outMax:number
) => (v - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

/**
 * Scales a full input percentage range to a diminished percentage output range.
 * 
 * Essentially the same as {@link scalePercent}, however it throws an error if output range is not within 0-1.
 * 
 * @param v 
 * @param outMin Output minimum, between 0-1
 * @param outMax Output maximum, between 0-1
 * @returns 
 */
export const scalePercentOutput = (v:number, outMin:number, outMax:number = 1) => {
  guardNumber(v, `percentage`, `v`);
  guardNumber(outMin, `percentage`, `outMin`);
  guardNumber(outMax, `percentage`, `outMax`);
  return scale(v, 0, 1, outMin, outMax);
};

/**
 * Scales an input percentage value (0-1) to the output range of `outMin`-`outMax`.
 * 
 * Use {@link scalePercentOutput} if the output range is meant to be a percentage. It will
 * enforce safety of the out range.
 * 
 * @param v Value to scale
 * @param outMin Minimum for output
 * @param outMax Maximum for output
 * @returns 
 */
export const scalePercent = (v:number, outMin:number, outMax:number) => {
  guardNumber(v, `percentage`, `v`);
  return scale(v, 0, 1, outMin, outMax);
};

/**
 * Clamps integer `v` between 0 (inclusive) and length (exclusive). This is useful
 * for clamping an array range, because the largest allowed number will
 * be one less than length.
 * 
 * @example Usage
 * ```js
 * const myArray = [`a`, `b`, `c`, `d`];
 * clampZeroBounds(0, myArray.length);    // 0
 * clampZeroBounds(1.2, myArray.length);  // 1
 * clampZeroBounds(4, myArray.length);    // 4
 * clampZeroBounds(5, myArray.length);    // 4
 * clampZeroBounds(-1, myArray.length);   // 0 
 * ```
 * 
 * Throws an error if `v` or `length` are not integers.
 * @param v Value to clamp (must be an interger)
 * @param length Length of bounds (must be an integer)
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

/**
 * Lerp calculates a relative value of `amt` between `a` and `b`. 
 * 
 * @example Get the halfway point between 30 and 60
 * ```js
 * lerp(0.5, 30, 60);
 * ````
 * 
 * Lerp is commonly used to interpolate between numbers for animation.
 * In that case, `amt` would start at 0 and you would keep `lerp`ing up to `1`
 * @example
 * ```
 * let pp = percentPingPong(0.1); // Go back and forth between 0 and 1 by 0.1
 * continuously(() => {
 *   const amt = pp.next().value;     // Get position in ping-pong
 *   let v = lerp(amt, xStart, xEnd); // Lerp between xStart and xEnd
 *  // do something with v...
 * }).start();
 * ```
 * @param amt Lerp amount, between 0 and 1 inclusive
 * @param a Start (ie when `amt` is 0)
 * @param b End (ie. when `amt` is 1)
 * @returns Lerped value which will be betewen `a` and `b`.
 */
export const lerp =(amt:number, a:number, b:number) => (1-amt) * a + amt * b;

/**
 * @private
 */
export type ToString<V> = (itemToMakeStringFor: V) => string;

/**
 * @private
 */
export type IsEqual<V> = (a:V, b:V) => boolean;

/**
 * Default comparer function is equiv to checking `a === b`
 * @private
 * @template V
 * @param {V} a
 * @param {V} b
 * @return {*}  {boolean}
 */
export const isEqualDefault = <V>(a:V, b:V):boolean => a === b;

/**
 * Comparer returns true if string representation of `a` and `b` are equal.
 * Uses `toStringDefault` to generate a string representation (`JSON.stringify`)
 * @private
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
 * @private
 * @template V
 * @param {V} itemToMakeStringFor
 * @returns {string}
 */
export const toStringDefault = <V>(itemToMakeStringFor:V):string => ((typeof itemToMakeStringFor === `string`) ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor));

