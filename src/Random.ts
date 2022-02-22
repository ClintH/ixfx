import { randomIndex, randomElement } from "./collections/Arrays.js";
import {number as guardNumber} from './Guards.js';
import * as Easings from "./modulation/Easing.js";
import {clamp} from "./Util.js";
export {randomIndex as arrayIndex};
export {randomElement as arrayElement};

/**
 * Returns a random number between `min-max` weighted such that values closer to `min`
 * occur more frequently
 * @param min 
 * @param max 
 * @returns 
 */
export const weighted2 = (min: number, max: number) => {
  const r = Math.random() * max;// + min;
  const x = Math.round(max/r);
  if (x > max) {
    console.log(`r: ${r} x: ${x} min: ${min} max: ${max}`);
  }
  return x;
  //Math.round(max / (Math.random() * max + min));
};

/**
 * Random integer, weighted according to an easing function.
 * Number will be inclusive of `min` and below `max`.
 * ```js
 * // If only one parameter is provided, it's assumed to be the max:
 * // Random number that might be 0 through to 99
 * const r = weightedInteger(100);
 * 
 * // If two numbers are given, it's assumed to be min, max
 * // Random number that might be 20 through to 29
 * const r = weightedInteger(30,20);
 * 
 * // One number, 
 * // Random number with `easeInExpo` function
 * const r = weightedInteger(100, `minOrMax`)
 * ```
 * 
 * Result from easing function will be capped between
 * 0-1 to ensure `min` and `max` are respected.
 * 
 * @param max Maximum (exclusive)
 * @param min Minimum number (inclusive), 0 by default
 * @param easing Easing to use, uses `easeInQuad` by default
 * @returns 
 */
export const weightedInteger = (minOrMax:number, maxOrEasing?:number|Easings.EasingName, easing?:Easings.EasingName) => {
  // Unit tested - for ranges and params types. Haven't tested easing distribution

  guardNumber(minOrMax);
  //eslint-disable-next-line functional/no-let
  let min, max, easingName;
  easingName = `easeInQuad`;
  min = 0;

  if (maxOrEasing === undefined) {
    // No second parameter
    max = minOrMax;
  } else {
    // There is a second parameter
    if (typeof maxOrEasing === `number`) {
      min = minOrMax;
      max = maxOrEasing;
      if (easing !== undefined) easingName = easing;
    } else if (typeof maxOrEasing === `string`) {
      max = minOrMax;
      easingName = maxOrEasing;
    } else {
      throw new Error(`Unexpected value type for maxOrEasing: ${maxOrEasing}`);
    }
  }
  
  if (easing !== undefined) easingName = easing;

  const easingFn = Easings.get(easingName as Easings.EasingName);
  if (easingFn === undefined) throw new Error(`Easing '${easingName}' not found`);

  guardNumber(min);
  if (max <= min) throw new Error(`Max should be greater than min`);
  const r = clamp(easingFn(Math.random()));
  return Math.floor(r * (max-min)) + min;
};
