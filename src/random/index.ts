import { shuffle } from '../collections/arrays/index.js';
import { numberTest as guardNumberTest, integerTest as guardIntegerTest, throwFromResult } from '../Guards.js';

import { type RandomSource, defaultRandom, type RandomOptions } from './Types.js';
import { floatSource } from './FloatSource.js';
import { count } from '../numbers/Count.js';

export { randomElement as arrayElement } from '../collections/arrays/index.js';
export { randomHue as hue } from '../visual/Colour.js';

export * from './FloatSource.js';
export * from './String.js';
export * from './Types.js';
export * from './Weighted.js';
export * from './WeightedIndex.js';
export * from './WeightedInteger.js';

/**
 * Returns a random number with gaussian (ie. bell-curved) distribution
 * 
 * @example Random number between 0..1 with gaussian distribution
 * ```js
 * import * as Random from 'https://unpkg.com/ixfx/dist/random.js';
 * Random.gaussian();
 * ```
 * 
 * @example Distribution can be skewed
 * ```js
 * Random.gaussian(10);
 * ```
 * 

 * @param skew Skew factor. Defaults to 1, no skewing. Above 1 will skew to left, below 1 will skew to right
 * @returns 
 */
export const gaussian = (skew = 1) => gaussianSource(skew)();

/**
 * Returns a function that generates a gaussian-distributed random number
 *  * @example Random number between 0..1 with gaussian distribution
 * ```js
 * import * as Random from 'https://unpkg.com/ixfx/dist/random.js';
 *
 * // Create function
 * const r = Random.gaussianFn();
 *
 * // Generate random value
 * r();
 * ```
 *
 * @example Pass the random number generator elsewhere
 * ```js
 * import * as Random from 'https://unpkg.com/ixfx/dist/random.js';
 * import * as Arrays from 'https://unpkg.com/ixfx/dist/arrays.js';
 * const r = Random.gaussianFn(10);
 *
 * // Randomise array with gaussian distribution
 * Arrays.shuffle(r);
 * ```
 * @param skew
 * @returns
 */
export const gaussianSource = (skew = 1): RandomSource => {
  const min = 0;
  const max = 1;
  // Source: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve

  const compute = (): number => {
    const u = calculateNonZero();
    const v = calculateNonZero();
    //eslint-disable-next-line functional/no-let
    let result = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);

    result = result / 10 + 0.5; // Translate to 0 -> 1
    if (result > 1 || result < 0) {
      result = compute(); //;gaussian(skew); // resample between 0 and 1 if out of range
    } else {
      result = Math.pow(result, skew); // Skew
      result *= max - min; // Stretch to fill range
      result += min; // offset to min
    }
    return result;
  };
  return compute;
};

const calculateNonZero = (source: RandomSource = defaultRandom) => {
  let v = 0;
  while (v === 0) {
    //eslint-disable-next-line functional/no-expression-statements
    v = source();
  }
  return v;
}

/**
 * Returns a function that produces a random integer between `max` (exclusive) and 0 (inclusive)
 * Use {@link integer} if you want a random number directly.
 *
 * Invoke directly:
 * ```js
 * integerSource(10)();  // Random number 0-9
 * ```
 *
 * Or keep a reference to re-compute:
 * ```js
 * const r = integerSource(10);
 * r(); // Produce a random integer
 * ```
 *
 * If a negative value is given, this is assumed to be the
 * minimum (inclusive), with 0 as the max (inclusive)
 * ```js
 * integerSource(-5)();  // Random number from -5 to 0
 * ```
 *
 * Specify options for a custom minimum or source of random:
 * ```js
 * integerSource({ max: 5,  min: 10 })();  // Random number 4-10
 * integerSource({ max: -5, min: -10 })(); // Random number from -10 to -6
 * integerSource({ max: 10, source: Math.random })(); // Random number between 0-9, with custom source of random
 * ```
 *
 * Throws an error if max & min are equal
 * @param maxOrOptions Max value (exclusive), or set of options
 * @returns Random integer
 */
export const integerSource = (maxOrOptions: number | RandomOptions): RandomSource => {
  if (typeof maxOrOptions === `undefined`) {
    throw new TypeError(`maxOrOptions is undefined`);
  }
  const options = typeof maxOrOptions === `number` ? { max: maxOrOptions } : maxOrOptions;
  //eslint-disable-next-line functional/no-let
  let max = Math.floor(options.max);
  //eslint-disable-next-line functional/no-let
  let min = Math.floor(options.min ?? 0);

  // If we just get -5 as the max, invert so
  // max:1 and min: -5 instead for -5...0 range
  if (!options.min && max < 0) {
    max = 1;
    min = options.max;
  }
  const randomSource = options.source ?? defaultRandom;
  if (min > max) {
    throw new Error(`Min value is greater than max (min: ${ min } max: ${ max })`);
  }

  throwFromResult(guardNumberTest(min, ``, `min`));
  throwFromResult(guardNumberTest(max, ``, `max`));

  if (max === min) {
    throw new Error(`Max and min values cannot be the same (${ max })`);
  }

  // Distance
  const amt = Math.abs(max - min);
  return () => Math.floor(randomSource() * amt) + min;
};

/**
 * Returns a random integer between `max` (exclusive) and 0 (inclusive)
 * Use {@link integerSource} to return a function instead.
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
 * @param maxOrOptions Max value (exclusive), or set of options
 * @returns Random integer
 */
export const integer = (maxOrOptions: number | RandomOptions): number =>
  integerSource(maxOrOptions)();



/**
 * Returns a random float between `max` (exclusive) and 0 (inclusive). Max is 1 if unspecified.
 * Use {@link floatSource} to get a function that produces values. This is used internally.
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
 * @param maxOrOptions Maximum value (exclusive) or options
 * @returns Random number
 */
export const float = (maxOrOptions: number | RandomOptions = 1): number =>
  floatSource(maxOrOptions)();

/**
 * Generates a short roughly unique id
 * ```js
 * const id = shortGuid();
 * ```
 * @param opts Options.
 * @returns
 */
export const shortGuid = (options: Readonly<{ source?: RandomSource }> = {}) => {
  const source = options.source ?? defaultRandom;
  // Via Stackoverflow...
  const firstPart = Math.trunc(source() * 46_656);
  const secondPart = Math.trunc(source() * 46_656);
  const firstPartString = `000${ firstPart.toString(36) }`.slice(-3);
  const secondPartString = `000${ secondPart.toString(36) }`.slice(-3);
  return firstPartString + secondPartString;
};

/**
 * Returns a random number of minutes, with a unit of milliseconds.
 * Max value is exclusive.
 * Use {@link minutesMs} to get a value directly, or {@link minutesMsSource} to return a function.
 *
 * @example Random value from 0 to one milli less than 5 * 60 * 1000
 * ```js
 * // Create function that returns value
 * const f = minutesMsSource(5);
 *
 * f(); // Generate value
 * ```
 *
 * @example Specified options:
 * ```js
 * // Random time between one minute and 5 minutes
 * const f = minutesMsSource({ max: 5, min: 1 });
 * f();
 * ```
 *
 * @remarks
 * It's a very minor function, but can make
 * code a little more literate:
 * ```js
 * // Random timeout of up to 5 mins
 * setTimeout(() => { ... }, minutesMsSource(5));
 * ```
 * @param maxMinutesOrOpts
 * @see {@link minutesMs}
 * @returns Function that produces a random value
 */
export const minutesMsSource = (
  maxMinutesOrOptions: number | RandomOptions
): RandomSource => {
  const options =
    typeof maxMinutesOrOptions === `number`
      ? { max: maxMinutesOrOptions }
      : maxMinutesOrOptions;
  const min = (options.min ?? 0) * 60 * 1000;
  const max = options.max * 60 * 1000;
  return integerSource({ ...options, max, min });
};

/**
 * @example Random value from 0 to one milli less than 5 * 60 * 1000
 * ```js
 * // Random value from 0 to one milli less than 5*60*1000
 * minuteMs(5);
 * ```
 *
 * @example Specified options:
 * ```js
 * // Random time between one minute and 5 minutes
 * minuteMs({ max: 5, min: 1 });
 * ```
 * @inheritDoc minutesMsSource
 *
 * @param maxMinutesOrOpts
 * @see {@link minutesMsSource}
 * @returns Milliseconds
 */
export const minutesMs = (maxMinutesOrOptions: number | RandomOptions): number =>
  minutesMsSource(maxMinutesOrOptions)();

/**
 * Returns function which produces a random number of seconds, with a unit of milliseconds.
 * Maximum value is exclusive.
 * Use {@link secondsMs} to return a random value directly, or {@link secondsMsSource} to return a function.
 *
 * @example Random milliseconds between 0..4999
 * ```js
 * // Create function
 * const f = secondsMsSource(5000);
 * // Produce a value
 * const value = f();
 * ```
 *
 * @example Options can be provided
 * ```js
 * // Random milliseconds between 1000-4999
 * const value = secondsMsSource({ max:5, min:1 })();
 * // Note the extra () at the end to execute the function
 * ```
 *
 * @remarks
 * It's a very minor function, but can make
 * code a little more literate:
 * ```js
 * // Random timeout of up to 5 seconds
 * setTimeout(() => { ...}, secondsMsSource(5));
 * ```
 * @param maxSecondsOrOpts Maximum seconds, or options.
 * @returns Milliseconds
 */
export const secondsMsSource = (
  maxSecondsOrOptions: number | RandomOptions
): RandomSource => {
  const options =
    typeof maxSecondsOrOptions === `number`
      ? { max: maxSecondsOrOptions }
      : maxSecondsOrOptions;
  const min = (options.min ?? 0) * 1000;
  const max = options.max * 1000;
  return () => integer({ ...options, max, min });
};

/**
 * @example Random milliseconds between 0..4999
 * ```js
 * secondsMs(5000);
 * ```
 *
 * @example Options can be provided
 * ```js
 * // Random milliseconds between 1000-4999
 * secondsMs({ max:5, min:1 });
 * ```
 * @inheritDoc secondsMsSource
 * @param maxSecondsOrOpts
 * @returns
 */
export const secondsMs = (maxSecondsOrOptions: number | RandomOptions): number =>
  secondsMsSource(maxSecondsOrOptions)();

export type GenerateRandomOptions = RandomOptions & Readonly<{
  /**
   * If true, number range is looped
   */
  loop?: boolean;
}>;

/**
 * Returns a generator over random unique integers, up to
 * but not including the given max value.
 *
 * @example 0..9 range
 * ```js
 * const rand = [ ...integerUniqueGen(10) ];
 * // eg: [2, 9, 6, 0, 8, 7, 3, 4, 5, 1]
 * ```
 *
 * @example Options can be provided:
 * ```js
 * // 5..9 range
 * const rand = [ ...integerUniqueGen({ min: 5, max: 10 })];
 * ```
 *
 * Range can be looped. Once the initial random walk through the number
 * range completes, it starts again in a new random way.
 *
 * ```js
 * for (const r of integerUniqueGen({ max: 10, loop: true })) {
 *  // Warning: loops forever
 * }
 * ```
 *
 * Behind the scenes, an array of numbers is created that captures the range, this is then
 * shuffled on the first run, and again whenever the iterator loops, if that's allowed.
 *
 * As a consequence, large ranges will consume larger amounts of memory.
 * @param maxOrOptions
 * @returns
 */
export function* integerUniqueGen(
  maxOrOptions: number | GenerateRandomOptions
): IterableIterator<number> {
  const options = typeof maxOrOptions === `number` ? { max: maxOrOptions } : maxOrOptions;
  const min = options.min ?? 0;
  const max = options.max;
  const source = options.source ?? defaultRandom;
  const loop = options.loop ?? false;

  throwFromResult(guardIntegerTest(min, ``, `min`));
  throwFromResult(guardIntegerTest(max, ``, `max`));
  if (min > max) {
    throw new Error(`Min value is greater than max. Min: ${ min } Max: ${ max }`);
  }

  const origRange = [ ...count(max - min, min) ];
  let numberRange = shuffle(origRange);
  let index = 0;
  while (true) {
    if (index === numberRange.length) {
      if (loop) numberRange = shuffle(origRange, source);
      else return;
    }
    yield numberRange[ index++ ];
  }
}

export { randomIndex as arrayIndex } from '../collections/arrays/index.js';