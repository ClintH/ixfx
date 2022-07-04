import { randomIndex, randomElement } from "./collections/Arrays.js";
import {number as guardNumber} from './Guards.js';
import * as Easings from "./modulation/Easing.js";
import {clamp} from "./Util.js";
export {randomIndex as arrayIndex};
export {randomElement as arrayElement};

export {randomHue as hue} from './visual/Colour.js';

export const defaultRandom = Math.random;


/**
 * A random source.
 * 
 * Predefined sources: {@link defaultRandom}, {@link gaussianSkewed}, {@link weightedSkewed}
 */
export type RandomSource = () => number;

/***
 * Returns a random number, 0..1, weighted by a given easing function. 
 * Default easing is `quadIn`, which skews towards zero.
 * 
 * ```js
 * weighted();          // quadIn easing by default, which skews toward low values
 * weighted(`quadOut`); // quadOut favours high values
 * ```
 * 
 * Use {@link weightedSkewed} for a curried version that can be used as a {@link RandomSource}:
 * 
 * ```js
 * const w = weightedSkewed(`quadIn`);
 * w(); // Produce a random number
 * ```
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
 * Returns a curried version of {@link weighted}.
 * 
 * ```js
 * const w = weightedSkewed(`quadIn`);   // Returns a function
 * w(); // Produce a random number
 * ```
 * @param easingName 
 * @param rand 
 * @returns 
 */
export const weightedSkewed = (easingName:Easings.EasingName = `quadIn`, rand:RandomSource = defaultRandom):RandomSource => () => weighted(easingName, rand);

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

/**
 * Returns a random integer between `max` (exclusive) and `min` (inclusive)
 * If `min` is not specified, 0 is used.
 * 
 * ```js
 * integer(10);    // Random number 0-9
 * integer(5, 10); // Random number 5-9
 * integer(-5);       // Random number from -4 to 0
 * integer(-5, -10); // Random number from -10 to -6
 * ```
 * @param max 
 * @param min 
 * @returns 
 */
export const integer = (max:number, min?:number) => {
  //eslint-disable-next-line functional/no-let
  let reverse = false;
  if (min === undefined) {
    if (max < 0) {
      max = Math.abs(max);
      reverse = true;
    }
    min = 0;
  }
  const amt = max - min;
  const r = Math.floor(Math.random() * amt) + min;
  if (reverse) return -r;
  return r;
};

/**
 * Random a random float between `max` (exclusive) and `min` (inclusive).
 * If `min` is not specified, 0 is used.
 * @param max 
 * @param min 
 * @returns 
 */
export const float = (max:number, min:number = 0) => Math.random() * (max - min) + min;

/**
 * Returns a string of random letters and numbers of a given `length`.
 * 
 * ```js
 * string(4); // eg. `4afd`
 * ```
 * @param length Length of random string
 * @returns Random string
 */
export const string = (length:number) => Math.random().toString(36).substring(2, length+2);

export const shortGuid = () => {
  // Via Stackoverflow...
  const firstPart = (Math.random() * 46656) | 0;
  const secondPart = (Math.random() * 46656) | 0;
  const firstPartStr = `000${firstPart.toString(36)}`.slice(-3);
  const secondPartStr = `000${secondPart.toString(36)}`.slice(-3);
  return firstPartStr + secondPartStr;
};
