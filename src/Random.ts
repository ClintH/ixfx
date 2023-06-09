import { randomIndex, randomElement, randomPluck, shuffle } from "./collections/Arrays.js";
import { number as guardNumber, integer as guardInteger } from './Guards.js';
import { EasingName, get as EasingGet} from "./modulation/Easing.js";
import { clamp } from './data/Clamp.js';
import {range} from "./IterableSync.js";

export { randomIndex as arrayIndex };
export { randomElement as arrayElement };
export { randomHue as hue } from './visual/Colour.js';

export type RandomOpts = {
  max: number,
  min?: number,
  source?:RandomSource
}

/**
 * Default random number generator: `Math.random`.
 */
export const defaultRandom = Math.random;


/**
 * A random source.
 * 
 * Predefined sources: {@link defaultRandom}, {@link gaussianSkewed}, {@link weightedSkewed}
 */
export type RandomSource = ()=>number;

export type WeightedOpts = {
  easing?:EasingName
  source?:RandomSource
}
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
 * @param easingName Easing name or options `quadIn` by default.
 * @returns Random number (0-1)
 */
export const weighted = (easingNameOrOpts:EasingName|WeightedOpts = 'quadIn'):number => {
  const opts = typeof easingNameOrOpts === 'string' ? { easing:easingNameOrOpts} : easingNameOrOpts;
  const source = opts.source ?? defaultRandom;
  const easingName = opts.easing ?? 'quadIn';

  const r = source();
  const easingFn = EasingGet(easingName as EasingName);
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
 * 
 * If you want a random number directly, use {@link weighted}
 * ```js
 * weighted(`quadIn`); // Returns a random value
 * ```
 * @param easingName 
 * @param rand 
 * @returns 
 */
export const weightedSkewed = (easingNameOrOpts:EasingName|WeightedOpts = `quadIn`):RandomSource => () => weighted(easingNameOrOpts);

export type WeightedIntOpts = WeightedOpts & {
  min?:number
  max:number
}
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
 * @param maxOrOpts Maximum (exclusive)
 * @returns 
 */
export const weightedInteger = (maxOrOpts:number|WeightedIntOpts) => {
  const opts = typeof maxOrOpts === 'number' ? { max: maxOrOpts } : maxOrOpts;
  const source = opts.source ?? defaultRandom;
  let max = opts.max;
  let min = opts.min ?? 0;
  let easingName = opts.easing ?? `quadIn`;
  if (max === undefined) throw new Error(`max field is undefined`);
  if (typeof easingName !== 'string') throw new Error(`easing field expected to be string`);
  guardNumber(max);

  const easingFn = EasingGet(easingName as EasingName);
  if (easingFn === undefined) throw new Error(`Easing '${easingName}' not found`);

  guardNumber(min);
  if (max <= min) throw new Error(`Max should be greater than min`);
  const r = clamp(easingFn(source()));
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
 * @param skew Skew factor. Defaults to 1, no skewing. Above 1 will skew to left, below 1 will skew to right
 * @returns 
 */
export const gaussian = (skew = 1) => {
  const min = 0;
  const max = 1;
  // Source: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
  
  //eslint-disable-next-line functional/no-let
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
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
 * This 'curried' function is useful when passing to other functions
 * ```js
 * // Curry
 * const g = gaussianSkewed(10);
 * 
 * // Now it can be called without parameters
 * g(); // Returns skewed value
 * 
 * // Eg:
 * shuffle(gaussianSkewed(10));
 * ```
 * @param skew Skew factor. Defaults to 1, no skewing. Above 1 will skew to left, below 1 will skew to right
 * @returns 
 */
export const gaussianSkewed = (skew:number = 1) => () => gaussian(skew);


/**
 * Returns a random integer between `max` (exclusive) and 0 (inclusive)
 * 
 * ```js
 * integer(10);  // Random number 0-9
 * ```
 * 
 * If a negative value is given, this is assumed to be the
 * minimum (inclusive), with 0 as the max (inclusive)
 * ```js
 * integer(-5);  // Random number from -5 to 0
 * ```
 * 
 * Specify options for a custom minimum or source of random:
 * ```js
 * integer({ max: 5,  min: 10 });  // Random number 4-10
 * integer({ max: -5, min: -10 }); // Random number from -10 to -6
 * integer({ max: 10, source: Math.random }); // Random number between 0-9, with custom source of random
 * ```
 * 
 * Throws an error if max & min are equal
 * @param maxOrOpts Max value (exclusive), or set of options
 * @returns Random integer
 */
export const integer = (maxOrOpts:number|RandomOpts):number => {
  let reverse = false;
  if (typeof maxOrOpts === `undefined`) throw new Error(`maxOrOpts is undefined`);
  const opts =  (typeof maxOrOpts === 'number') ?  { max: maxOrOpts} : maxOrOpts;
  let max = Math.floor(opts.max);
  let min = Math.floor(opts.min ?? 0);

  // If we just get -5 as the max, invert so
  // max:1 and min: -5 instead for -5...0 range
  if (!opts.min && max < 0) { max = 1; min = opts.max }
  const randomSource = opts.source ?? defaultRandom;
  if (min > max) throw new Error(`Min value is greater than max (min: ${min} max: ${max})`);
  
  guardNumber(min, '', 'min');
  guardNumber(max, '', 'max');

  if (max === min) throw new Error(`Max and min values cannot be the same (${max})`);

  // Distance
  const amt = Math.abs(max - min);
  const r = Math.floor(randomSource() * amt) + min;
  return r;
};

/**
 * Random float between `max` (exclusive) and 0 (inclusive). Max is 1 if unspecified.
 * 
 * 
 * ```js
 * // Random number between 0..1 (but not including 1)
 * // (this would be identical to Math.random())
 * const v = float();
 * // Random float between 0..100 (but not including 100)
 * const v = float(100);
 * ```
 * 
 * Options can be used:
 * ```js
 * // Random float between 20..40 (possibly including 20, but always lower than 40)
 * const v = float({ min: 20, max: 40 });
 * ```
 * @param maxOrOpts Maximum value (exclusive) or options
 * @returns Random number
 */
export const float = (maxOrOpts:number|RandomOpts = 1):number => {
  const opts = typeof maxOrOpts === 'number' ? { max: maxOrOpts } : maxOrOpts;
  let max = opts.max;
  let min = opts.min ?? 0;
  const source = opts.source ?? defaultRandom;

  guardNumber(min, '', 'min');
  guardNumber(max, '', 'max');

  if (!opts.min && max < 0) {
    min = max;
    max = 0;
  }
  if (min > max) throw new Error(`Min is greater than max. Min: ${min} max: ${max}`);

  return source() * (max - min) + min;
}

export type StringOpts = {
  length:number,
  source?:RandomSource
}
/**
 * Returns a string of random letters and numbers of a given `length`.
 * 
 * ```js
 * string();  // Random string of length 5
 * string(4); // eg. `4afd`
 * ```
 * @param length Length of random string
 * @returns Random string
 */
export const string = (lengthOrOpts:number|StringOpts = 5) => {
  const opts = typeof lengthOrOpts === 'number' ? { length: lengthOrOpts } : lengthOrOpts;
  const source = opts.source ?? defaultRandom;
  source().toString(36).substring(2, length+2);
}

/**
 * Generates a short roughly unique id
 * @returns 
 */
export const shortGuid = () => {
  // Via Stackoverflow...
  const firstPart = (Math.random() * 46656) | 0;
  const secondPart = (Math.random() * 46656) | 0;
  const firstPartStr = `000${firstPart.toString(36)}`.slice(-3);
  const secondPartStr = `000${secondPart.toString(36)}`.slice(-3);
  return firstPartStr + secondPartStr;
};


/**
 * Returns a random number of minutes, with a unit of milliseconds.
 * Max value is exclusive
 * 
 * ```js
 * // Random value from 0 to one milli less than 5*60*1000
 * minuteMs(5);
 * ```
 * 
 * Options can be specified instead:
 * ```js
 * // Random time between one minute and 5 minutes
 * minuteMs({ max: 5, min: 1 });
 * ```
 * 
 * It's a very minor function, but can make
 * code a little more literate:
 * ```js
 * // Random timeout of up to 5 mins
 * setTimeout(() => { ... }, minuteMs(5));
 * ```
 * @param maxMinutesOrOpts
 * @returns Milliseconds
 */
export const minutesMs = (maxMinutesOrOpts:number|RandomOpts):number => {
  const opts = typeof maxMinutesOrOpts === 'number' ? { max: maxMinutesOrOpts } : maxMinutesOrOpts;
  const min = (opts.min ?? 0) * 60 * 1000;
  const max = opts.max * 60 * 1000;
  return integer({...opts, max, min});
}

/**
 * Returns a random number of seconds, with a unit of milliseconds.
 * Maximum value is exclusive.
 * 
 * ```js
 * // Random milliseconds between 0..4999
 * secondsMs(5000);
 * ```
 * 
 * Options can be provided:
 * ```js
 * // Random milliseconds between 1000-4999
 * secondsMs({ max:5, min:1 });
 * ```
 * It's a very minor function, but can make
 * code a little more literate:
 * ```js
 * // Random timeout of up to 5 seconds
 * setTimeout(() => { ...}, secondsMs(5));
 * ```
 * @param maxSecondsOrOpts Maximum seconds, or options.
 * @returns Milliseconds
 */
export const secondsMs = (maxSecondsOrOpts:number|RandomOpts):number => {
  const opts = typeof maxSecondsOrOpts === 'number' ? { max: maxSecondsOrOpts } : maxSecondsOrOpts;
  const min = (opts.min ?? 0) * 1000;
  const max = opts.max * 1000;
  return integer({...opts, max, min});
}

export type GenerateRandomOpts = RandomOpts & {
  /**
   * If true, number range is looped
   */
  loop?:boolean
}

/**
 * Returns a generator over random unique integers, up to
 * but not including the given max value.
 * 
 * ```js
 * // 0..9 range
 * const rand = [ ...generateIntegerUnique(10) ];
 * // eg: [2, 9, 6, 0, 8, 7, 3, 4, 5, 1]
 * ```
 * 
 * Options can be provided:
 * ```js
 * // 5..9 range
 * const rand = [ ...generateIntegerUnique({ min: 5, max: 10 })];
 * ```
 * 
 * Range can be looped. Once the initial random walk through the number
 * range completes, it starts again in a new random way.
 * 
 * ```js
 * for (const r of generateIntegerUnique({ max: 10, loop: true })) {
 *  // Warning: loops forever
 * }
 * ```
 * @param maxOrOpts 
 * @returns 
 */
export function* generateIntegerUnique(maxOrOpts:number|GenerateRandomOpts):IterableIterator<number>  {
  const opts = typeof maxOrOpts === 'number' ? { max: maxOrOpts } : maxOrOpts;
  let min = opts.min ?? 0;
  let max = opts.max;
  const source = opts.source ?? defaultRandom;
  const loop = opts.loop ?? false;

  guardInteger(min, '', 'min');
  guardInteger(max, '', 'max');
  if (min > max) throw new Error(`Min value is greater than max. Min: ${min} Max: ${max}`);

  const origRange = [...range(min, max-min)];
  
  let numberRange = shuffle(origRange);
  let index = 0;
  while (true) {
    if (index === numberRange.length) {
      if (loop) numberRange = shuffle(origRange, source);
      else return;
    }
    yield numberRange[index++];
  }
}
