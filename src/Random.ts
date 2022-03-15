import { randomIndex, randomElement } from "./collections/Arrays.js";
import {number as guardNumber} from './Guards.js';
import * as Easings from "./modulation/Easing.js";
import {clamp} from "./Util.js";
export {randomIndex as arrayIndex};
export {randomElement as arrayElement};

export const defaultRandom = Math.random;
export type RandomSource = () => number;

/**
 * Returns a random number between `min-max` weighted such that values closer to `min`
 * occur more frequently
 * @param min 
 * @param max 
 * @returns 
 */
// export const weighted2 = (min: number, max: number) => {
//   const r = Math.random() * max;// + min;
//   const x = Math.round(max/r);
//   if (x > max) {
//     console.log(`r: ${r} x: ${x} min: ${min} max: ${max}`);
//   }
//   return x;
// };

/***
 * Returns a random number, 0..1, weighted by a given easing function. 
 * Default easing is `quadIn`, which skews towards zero.
 * 
 * ```js
 * weighted();          // quadIn easing by default, which skews toward low values
 * weighted(`quadOut`); // quadOut favours high values
 * ```
 * 
 * @param easingName Easing name. `quadIn` by default.
 * @param rand Source random generator. `Math.random` by default.
 * @returns Random number (0-1)
 */
export const weighted = (easingName:Easings.EasingName = `quadIn`, rand:RandomSource = defaultRandom):number => {
  const r = rand();
  const easingFn = Easings.get(easingName as Easings.EasingName);
  if (easingFn === undefined) throw new Error(`Easing function '${easingName}' not found.`);
  return easingFn(r);
};

/**
 * Random integer, weighted according to an easing function.
 * Number will be inclusive of `min` and below `max`.
 * 
 * ```js
 * // If only one parameter is provided, it's assumed to be the max:
 * // Random number that might be 0 through to 99
 * const r = weightedInteger(100);
 * 
 * // If two numbers are given, it's assumed to be min, max
 * // Random number that might be 20 through to 29
 * const r = weightedInteger(20,30);
 * 
 * // One number and string. First param is assumed to be
 * // the max, second parameter the easing function
 * const r = weightedInteger(100, `quadIn`)
 * ```
 * 
 * Useful for accessing a random array element:
 * ```js
 * const list = [`mango`, `kiwi`, `grape`];
 * // Yields random item from list
 * list[weightedInteger(list.length)];
 * ```
 * 
 * Note: result from easing function will be clamped to
 * the min/max (by default 0-1);
 * 
 * @param max Maximum (exclusive)
 * @param min Minimum number (inclusive), 0 by default
 * @param rand Source random generator. `Math.random` by default.
 * @param easing Easing to use, uses `quadIn` by default
 * @returns 
 */
export const weightedInteger = (minOrMax:number, maxOrEasing?:number|Easings.EasingName, easing?:Easings.EasingName, rand:RandomSource = defaultRandom) => {
  // Unit tested - for ranges and params types. Haven't tested easing distribution

  guardNumber(minOrMax);
  //eslint-disable-next-line functional/no-let
  let min, max, easingName;
  easingName = `quadIn`;
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
  const r = clamp(easingFn(rand()));
  return Math.floor(r * (max-min)) + min;
};

/**
 * Returns a random number with gaussian (ie bell-curved) distribution
 * ```js
 * // Yields a random number between 0..1
 * // with a gaussian distribution
 * gaussian();
 * ```
 * 
 * Distribution can also be skewed:
 * ```js
 * // Yields a skewed random value
 * gaussian(10);
 * ```
 * 
 * Use the curried version in order to pass the random number generator elsewhere:
 * ```js
 * const g = gaussianSkewed(10);
 * // Now it can be called without parameters
 * g(); // Yields skewed random
 * 
 * // Eg:
 * shuffle(gaussianSkewed(10));
 * ```
 * @param skew 
 * @returns 
 */
export const gaussian = (skew = 1) => {
  const min = 0;
  const max = 1;
  // Source: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
  
  //eslint-disable-next-line functional/no-let
  let u = 0, v = 0;
  //eslint-disable-next-line functional/no-loop-statement
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  //eslint-disable-next-line functional/no-loop-statement
  while(v === 0) v = Math.random();
  //eslint-disable-next-line functional/no-let
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) {
    num = gaussian(skew);// resample between 0 and 1 if out of range
  } else{
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
  }
  return num;
};

/**
 * Returns a function of skewed gaussian values.
 * 
 * This 'curried' function is useful when be
 * ```js
 * const g = gaussianSkewed(10);
 * 
 * // Now it can be called without parameters
 * g(); // Returns skewed value
 * 
 * // Eg:
 * shuffle(gaussianSkewed(10));
 * ```
 * @param skew 
 * @returns 
 */
export const gaussianSkewed = (skew:number) => () => gaussian(skew);