import { number as guardNumber, integer as guardInteger} from "./Guards.js";
import {untilMatch} from "./Text.js";

/**
 * Clamps a value between min and max (both inclusive)
 * Defaults to a 0-1 range, useful for percentages.
 * 
 * @example Usage
 * ```js
 * // 0.5 - just fine, within default of 0 to 1
 * clamp(0.5);         
 * // 1 - above default max of 1
 * clamp(1.5);         
 * // 0 - below range
 * clamp(-50, 0, 100); 
 * // 50 - within range
 * clamp(50, 0, 50);   
 * ```
 * 
 * For clamping integer ranges, consider {@link clampIndex}
 * For clamping {x,y} points, consider {@link Points.clamp}.
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
 * Returns a field on object `o` by a dotted path.
 * ```
 * const d = {
 *  accel: {x: 1, y: 2, z: 3},
 *  gyro:  {x: 4, y: 5, z: 6}
 * };
 * getFieldByPath(d, `accel.x`); // 1
 * getFieldByPath(d, `gyro.z`);  // 6
 * getFieldByPath(d, `gyro`);    // {x:4, y:5, z:6}
 * getFieldByPath(d, ``);        // Returns original object
 * ```
 * 
 * If a field does not exist, `undefined` is returned.
 * Use {@link getFieldPaths} to get a list of paths.
 * @param o 
 * @param path 
 * @returns 
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldByPath = (o:any, path:string = ``):any|undefined => {
  if (path.length === 0) return o;
  if (path in o) {
    return o[path];
  } else {
    const start = untilMatch(path, `.`);
    if (start in o) {
      return getFieldByPath(o[start], path.substring(start.length+1));
    } else {
      return undefined;
    }
  }
};

/**
 * Returns a list of paths for all the fields on `o`
 * ```
 * const d = {
 *  accel: {x: 1, y: 2, z: 3},
 *  gyro:  {x: 4, y: 5, z: 6}
 * };
 * const paths = getFieldPaths(d); 
 * // Yields [ `accel.x`, `accel.y`,`accel.z`,`gyro.x`,`gyro.y`,`gyro.z` ]
 * ```
 * 
 * Use {@link getFieldByPath} to fetch data by this 'path' string.
 * @param o 
 * @returns 
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldPaths = (o:any):readonly string[] => {
  const paths:string[] = [];
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const probe = (o:any, prefix = ``) => {
    if (typeof o === `object`) {
      const keys = Object.keys(o);
      if (prefix.length > 0) prefix += `.`;
      keys.forEach(k => probe(o[k], prefix + k));
    } else {
      //eslint-disable-next-line functional/immutable-data
      paths.push(prefix);
    }
  };
  probe(o);
  return paths;
};

/**
 * Rounds `v` up to the nearest multiple of `multiple`
 * ```
 * roundMultiple(19, 20); // 20
 * roundMultiple(21, 20); // 40
 * ```
 * @param v 
 * @param multiple 
 * @returns 
 */
export const roundUpToMultiple = (v:number, multiple:number):number => {
  guardNumber(v, `nonZero`, `v`);
  guardNumber(multiple, `nonZero`, `muliple`);
  return Math.ceil(v/multiple)*multiple;
};

/**
 * Scales `v` from an input range to an output range (aka `map`)
 * 
 * For example, if a sensor's useful range is 100-500, scale it to a percentage:
 * ```js
 * scale(sensorReading, 100, 500, 0, 1);
 * ```
 * 
 * `scale` defaults to a percentage-range output, so you can get away with:
 * ```js
 * scale(sensorReading, 100, 500);
 * ```
 * 
 * If `v` is outside of the input range, it will likewise be outside of the output range.
 * Use {@clamp} to ensure output range is maintained.
 * 
 * If inMin and inMax are equal, outMax will be returned.
 * 
 * An easing function can be provided for non-linear scaling. In this case
 * the input value is 'pre scaled' using the function before it is applied to the
 * output range.
 * ```js
 * scale(sensorReading, 100, 500, 0, 1, Easings.gaussian());
 * ```
 * @param v Value to scale
 * @param inMin Input minimum
 * @param inMax Input maximum
 * @param outMin Output minimum. If not specified, 0
 * @param outMax Output maximum. If not specified, 1
 * @param easing Easing function
 * @returns Scaled value
 */
export const scale = (
  v:number, 
  inMin:number, inMax:number, 
  outMin?:number, outMax?:number,
  easing?:(v:number)=>number
):number => {
  if (outMax === undefined) outMax = 1;
  if (outMin === undefined) outMin = 0;
  if (inMin === inMax) return outMax;
  //console.log(`v: ${v} in: ${inMin}-${inMax} out: ${outMin}-${outMax}`);
  //eslint-disable-next-line functional/no-let
  let a = (v - inMin) / (inMax - inMin);
  if (easing !== undefined) a = easing(a);
  return a * (outMax - outMin) + outMin;
  //return (v - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

export type NumberFunction = () => number;
/**
 * Flips a percentage-scale number: `1 - v`.
 * 
 * The utility of this function is that it sanity-checks
 * that `v` is in 0..1 scale.
 * 
 * ```js
 * flip(1);   // 0
 * flip(0.5); // 0.5
 * flip(0);   // 1
 * ```
 * @param v 
 * @returns 
 */
export const flip = (v:number|NumberFunction) => {
  if (typeof v === `function`) v = v();
  guardNumber(v, `percentage`, `v`);
  return 1 - v;
};

/**
 * Returns `fallback` if `v` is NaN, otherwise returns `v`
 * @param v
 * @param fallback 
 * @returns 
 */
export const ifNaN = (v:number, fallback:number):number => {
  if (Number.isNaN(v)) return fallback;
  return v;
};

/**
 * Scales a percentage-scale number, ie: `v * t`.
 * The utility of this function is that it sanity-checks that
 *  both parameters are in the 0..1 scale.
 * @param v Value
 * @param t Scale amount
 * @returns Scaled value
 */
export const proportion = (v:number|NumberFunction, t:number|NumberFunction) => {
  if (typeof v === `function`) v = v();
  if (typeof t === `function`) t = t();
  
  guardNumber(v, `percentage`, `v`);
  guardNumber(t, `percentage`, `t`);
  return v * t;
};


/**
 * Scales an input percentage to a new percentage range.
 * 
 * If you have an input percentage (0-1), `scalePercentageOutput` maps it to an
 * _output_ percentage of `outMin`-`outMax`.
 * 
 * ```js
 * // Scales 50% to a range of 0-10%
 * scalePercentages(0.5, 0, 0.10); // 0.05 - 5%
 * ```
 * 
 * An error is thrown if any parameter is outside of percentage range. This added
 * safety is useful for catching bugs. Otherwise, you could just as well call
 * `scale(percentage, 0, 1, outMin, outMax)`.
 * 
 * If you want to scale some input range to percentage output range, just use `scale`:
 * ```js
 * // Yields 0.5
 * scale(2.5, 0, 5);
 * ```
 * @param percentage Input value, within percentage range
 * @param outMin Output minimum, between 0-1
 * @param outMax Output maximum, between 0-1
 * @returns Scaled value between outMin-outMax.
 */
export const scalePercentages = (percentage:number, outMin:number, outMax:number = 1):number => {
  guardNumber(percentage, `percentage`, `v`);
  guardNumber(outMin, `percentage`, `outMin`);
  guardNumber(outMax, `percentage`, `outMax`);
  return scale(percentage, 0, 1, outMin, outMax);
};

/**
 * Scales an input percentage value to an output range
 * If you have an input percentage (0-1), `scalePercent` maps it to an output range of `outMin`-`outMax`.
 * ```js
 * scalePercent(0.5, 10, 20); // 15
 * ```
 * 
 * @param v Value to scale
 * @param outMin Minimum for output
 * @param outMax Maximum for output
 * @returns 
 */
export const scalePercent = (v:number, outMin:number, outMax:number):number => {
  guardNumber(v, `percentage`, `v`);
  return scale(v, 0, 1, outMin, outMax);
};

/**
 * Clamps integer `v` between 0 (inclusive) and array length or length (exclusive).
 * Returns value then will always be at least zero, and a valid array index.
 * 
 * @example Usage
 * ```js
 * // Array of length 4
 * const myArray = [`a`, `b`, `c`, `d`];
 * clampIndex(0, myArray);    // 0
 * clampIndex(4, myArray);    // 3
 * clampIndex(-1, myArray);   // 0
 * 
 * clampIndex(5, 3); // 2
 * ```
 * 
 * Throws an error if `v` is not an integer.
 * @param v Value to clamp (must be an interger)
 * @param arrayOrLength Array, or length of bounds (must be an integer)
 * @returns Clamped value, minimum will be 0, maximum will be one less than `length`.
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const clampIndex = (v: number, arrayOrLength: number|readonly any[]):number => {
  // ✔ UNIT TESTED
  if (!Number.isInteger(v)) throw new Error(`v parameter must be an integer (${v})`);
  const length = (Array.isArray(arrayOrLength)) ?  arrayOrLength.length : arrayOrLength as number;

  if (!Number.isInteger(length)) throw new Error(`length parameter must be an integer (${length}, ${typeof length})`);
  v = Math.round(v);
  if (v < 0) return 0;
  if (v >= length) return length - 1;
  return v;
};

/**
 * Interpolates between `a` and `b` by `amount`. Aka `lerp`.
 * 
 * @example Get the halfway point between 30 and 60
 * ```js
 * interpolate(0.5, 30, 60);
 * ```
 * 
 * Interpolation is often used for animation. In that case, `amount`
 * would start at 0 and you would keep interpolating up to `1`
 * @example
 * ```js
 * // Go back and forth between 0 and 1 by 0.1
 * let pp = percentPingPong(0.1);
 * continuously(() => {
 *  // Get position in ping-pong
 *  const amt = pp.next().value;
 *  // interpolate between Math.PI and Math.PI*2
 *  const v = interpolate(amt, Math.PI, Math.PI*2); 
 *  // do something with v...
 * }).start();
 * ```
 * 
 * See also {@link Colour.interpolate}, {@link Points.interpolate}.
 * @param amount Interpolation amount, between 0 and 1 inclusive
 * @param a Start (ie when `amt` is 0)
 * @param b End (ie. when `amt` is 1)
 * @returns Interpolated value which will be between `a` and `b`.
 */
export const interpolate =(amount:number, a:number, b:number):number => {
  const v = (1-amount) * a + amount * b;
  return v;
};


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

/**
 * Wraps a number within a specified range, defaulting to degrees (0-360)
 * 
 * This is useful for calculations involving degree angles and hue, which wrap from 0-360.
 * Eg: to add 200 to 200, we don't want 400, but 40.
 * 
 * ```js
 * const v = wrap(200+200, 0, 360); // 40
 * ```
 * 
 * Or if we minus 100 from 10, we don't want -90 but 270
 * ```js
 * const v = wrap(10-100, 0, 360); // 270
 * ```
 * 
 * `wrap` uses 0-360 as a default range, so both of these
 * examples could just as well be:
 * 
 * ```js
 * wrap(200+200);  // 40
 * wrap(10-100);  // 270
 * ```
 * 
 * Non-zero starting points can be used. A range of 20-70: 
 * ```js
 * const v = wrap(-20, 20, 70); // 50 
 * ```
 * 
 * Note that the minimum value is inclusive, while the maximum is _exclusive_.
 * So with the default range of 0-360, 360 is never reached:
 * 
 * ```js
 * wrap(360); // 0
 * wrap(361); // 1
 * ```
 * 
 * @param v Value to wrap
 * @param min Integer minimum of range (default: 0). Inclusive
 * @param max Integer maximum of range (default: 360). Exlusive
 * @returns 
 */
export const wrapInteger = (v:number, min:number = 0, max:number = 360) => {
  guardInteger(v, undefined, `v`);
  guardInteger(min, undefined, `min`);
  guardInteger(max, undefined, `max`);

  if (v === min) return min;
  if (v === max) return min; // Wraps
  if (v > 0 && v < min) v += min;
  
  v -= min;
  max -= min;
  v = v%max;
  
  if (v < 0) v = max - Math.abs(v) + min;
  return v + min;
};

/**
 * Wraps floating point numbers. Defaults to a 0..1 scale.
 * @param v 
 * @param min 
 * @param max 
 * @returns 
 */
export const wrap = (v:number, min: number = 0, max:number = 1) => {
  guardNumber(v, ``, `min`);
  guardNumber(min, ``, `min`);
  guardNumber(max, ``, `max`);

  if (v === min) return min;
  if (v === max) return min; // Wraps

  //eslint-disable-next-line functional/no-loop-statement
  while (v <= min || v >= max) {
    if (v === max) break;
    if (v === min) break;
    if (v > max) {
      v = min + (v-max);
    } else if (v < min) {
      v = max - (min-v);
    }
  }
  return v;
};

/**
 * Performs a calculation within a wrapping number range. This is a lower-level function.
 * See also: {@link wrapInteger} for simple wrapping within a range.
 * 
 * `min` and `max` define the start and end of the valid range, inclusive. Eg for hue degrees it'd be 0, 360.
 * `a` and `b` is the range you want to work in. 
 * 
 * For example, let's say you want to get the middle point between a hue of 30 and a hue of 330 (ie warmer colours):
 * ```js
 * wrapRange(0,360, (distance) => {
 *  // for a:0 and b:330, distance would be 90 from 30 degrees to 330 (via zero)
 *  return distance * 0.5; // eg return middle point 
 * }, 30, 330);
 * ```
 * 
 * The return value of the callback should be in the range of 0-distance. `wrapRange` will subsequently
 * conform it to the `min` and `max` range before it's returned to the caller.
 * 
 * @param a Output start (eg. 60)
 * @param b Output end (eg 300)
 * @param min Range start (eg 0)
 * @param max Range end (eg 360)
 * @param fn Returns a computed value from 0 to `distance`.
 * @returns 
 */
export const wrapRange = (min:number, max:number, fn:(distance:number)=>number, a:number, b:number) => {
  //eslint-disable-next-line functional/no-let
  let r = 0;
  // No wrapping
  const distF = Math.abs(b - a);
  // When b is wrapped forwards
  const distFwrap = Math.abs(max-a + b);
  // When b is wrapped backwards (10, 300)
  const distBWrap = Math.abs(a + (360-b));
  
  const distMin = Math.min(distF, distFwrap, distBWrap);
  if (distMin === distBWrap) {
    // (10, 300) = 70
    r = a - fn(distMin);
  } else if (distMin === distFwrap) {
    // (300, 60) = 120
    r = a + fn(distMin);
  } else {
    // Forwards or backwards without wrapping
    if (a > b) {
      // (240,120) -- backwards
      r = a - fn(distMin);
    } else {
      // (120,240) -- forwards
      r = a + fn(distMin);
    }
  }
  return wrapInteger(r, min, max); 
};

/**
 * Returns true if `x` is a power of two
 * @param x 
 * @returns True if `x` is a power of two
 */
export const isPowerOfTwo = (x:number) => Math.log2(x) % 1 === 0;

/**
 * Returns the relative difference from the `initial` value
 * ```js
 * const rel = relativeDifference(100);
 * rel(100); // 1
 * rel(150); // 1.5
 * rel(50);  // 0.5
 * ```
 * 
 * The code for this is simple:
 * ```js
 * const relativeDifference = (initial) => (v) => v/initial
 * ```
 * @param {number} initial 
 * @returns 
 */
export const relativeDifference = (initial:number) => (v:number) => v/initial;


export const runningiOS = () => [
  `iPad Simulator`,
  `iPhone Simulator`,
  `iPod Simulator`,
  `iPad`,
  `iPhone`,
  `iPod`
].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes(`Mac`) && `ontouchend` in document);