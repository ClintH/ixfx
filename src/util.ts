
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
 * Returns a bezier interpolated value, using the given ranges
 * @param {number} value  Value to be interpolated
 * @param {number} s1 Source range start
 * @param {number} s2  Source range end
 * @param {number} t1  Target range start
 * @param {number} t2  Target range end
 * @param {number} [slope]  Weight of the curve (0.5 = linear, 0.1 = weighted near target start, 0.9 = weighted near target end)
 * @returns {number} Interpolated value
 */
//      var interpolate = function (value, s1, s2, t1, t2, slope) {
// //https://stackoverflow.com/questions/25752572/non-linear-interpolation-of-a-range-to-another-range

//       //Default to linear interpolation
//       slope = slope || 0.5;
  
//       //If the value is out of the source range, floor to min/max target values
//       if(value < Math.min(s1, s2)) {
//           return Math.min(s1, s2) === s1 ? t1 : t2;
//       }
  
//       if(value > Math.max(s1, s2)) {
//           return Math.max(s1, s2) === s1 ? t1 : t2;
//       }
  
//       //Reverse the value, to make it correspond to the target range (this is a side-effect of the bezier calculation)
//       value = s2-value;
  
//       var C1 = {x: s1, y:t1}; //Start of bezier curve
//       var C3 = {x: s2, y:t2}; //End of bezier curve
//       var C2 = {              //Control point
//           x: C3.x,
//           y: C1.y + Math.abs(slope) * (C3.y - C1.y)
//       };
  
//       //Find out how far the value is on the curve
//       var percent = value / (C3.x-C1.x);
  
//       return C1.y*b1(percent) + C2.y*b2(percent) + C3.y*b3(percent);
  
//       function b1(t) { return t*t }
//       function b2(t) { return 2*t*(1 - t)  }
//       function b3(t) { return (1 - t)*(1 - t) }
//   };

/**
 * Maps `v` from an input range to an output range.
 * For example, if a sensor's useful range is 100-500, you could
 * easily map it to a percentage:
 * ```js
 * map(sensorReading, 100, 500, 0, 1);
 * ```
 * @param v Value to map
 * @param inMin Input minimum
 * @param inMax Input maximum
 * @param outMin Output minimum
 * @param outMax Output maximum
 * @returns Mapped value
 */
export const map = (
  v:number, 
  inMin:number, inMax:number, 
  outMin:number, outMax:number
) => (v - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

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
 * @template V
 * @param {V} itemToMakeStringFor
 * @returns {string}
 */
export const toStringDefault = <V>(itemToMakeStringFor:V):string => ((typeof itemToMakeStringFor === `string`) ? itemToMakeStringFor : JSON.stringify(itemToMakeStringFor));

