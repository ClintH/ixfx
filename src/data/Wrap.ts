import { number as guardNumber, integer as guardInteger} from "../Guards.js";

/**
 * Wraps an integer number within a specified range, defaulting to degrees (0-360). Use {@link wrap} for floating-point wrapping.
 * 
 * This is useful for calculations involving degree angles and hue, which wrap from 0-360.
 * Eg: to add 200 to 200, we don't want 400, but 40.
 * 
 * ```js
 * const v = wrapInteger(200+200, 0, 360); // 40
 * ```
 * 
 * Or if we minus 100 from 10, we don't want -90 but 270
 * ```js
 * const v = wrapInteger(10-100, 0, 360); // 270
 * ```
 * 
 * `wrapInteger` uses 0-360 as a default range, so both of these
 * examples could just as well be:
 * 
 * ```js
 * wrapInteger(200+200);  // 40
 * wrapInteger(10-100);  // 270
 * ```
 * 
 * Non-zero starting points can be used. A range of 20-70: 
 * ```js
 * const v = wrapInteger(-20, 20, 70); // 50 
 * ```
 * 
 * Note that the minimum value is inclusive, while the maximum is _exclusive_.
 * So with the default range of 0-360, 360 is never reached:
 * 
 * ```js
 * wrapInteger(360); // 0
 * wrapInteger(361); // 1
 * ```
 * 
 * If you just want to lock values to a range without wrapping, consider {@link clamp}.
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
 * Wraps floating point numbers to be within a range (default: 0..1). Use {@link wrapInteger} if you want to wrap integer values.
 * 
 * This logic makes sense for some things like rotation angle.
 * 
 * If you just want to lock values to a range without wrapping, consider {@link clamp}.
 * 
 * ```js
 * wrap(1.2);   // 0.2
 * wrap(2);     // 1.0
 * wrap(-0.2); // 0.8
 * ```
 * 
 * A range can be provided too:
 * ```js
 * wrap(30, 20, 50);  	 // 30
 * wrap(60, 20, 50);    //  30 
 * ```
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
