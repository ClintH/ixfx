import { randomIndex, randomElement, shuffle } from './collections/Arrays.js';
import { number as guardNumber, integer as guardInteger } from './Guards.js';
import { type EasingName, get as EasingGet } from './modulation/Easing.js';
import { clamp } from './data/Clamp.js';
import { range } from './IterableSync.js';

export { randomIndex as arrayIndex };
export { randomElement as arrayElement };
export { randomHue as hue } from './visual/Colour.js';

export type RandomOpts = {
  readonly max: number;
  readonly min?: number;
  readonly source?: RandomSource;
};

/**
 * Default random number generator: `Math.random`.
 */
export const defaultRandom = Math.random;

/**
 * A random source.
 *
 * Predefined sources: {@link defaultRandom}, {@link gaussianFn}, {@link weightedFn}
 */
export type RandomSource = () => number;

/**
 * Options for producing weighted distribution
 */
export type WeightedOpts = {
  /**
   * Easing function to use (optional)
   */
  readonly easing?: EasingName;
  /**
   * Random source (optional)
   */
  readonly source?: RandomSource;
};

/***
 * Returns a random number, 0..1, weighted by a given easing function.
 * Default easing is `quadIn`, which skews towards zero.
 * Use {@link weighted} to get a value directly.
 *
 * ```js
 * import * as Random from 'https://unpkg.com/ixfx/dist/random.js';
 * const r1 = Random.weightedFn();          // quadIn easing by default, which skews toward low values
 * r1(); // Produce a value
 *
 * const r2 = Random.weightedFn(`quadOut`); // quadOut favours high values
 * r2(); // Produce a value
 * ```
 * @param easingName Easing name or options `quadIn` by default.
 * @see {@link weighted} Returns value instead of function
 * @returns Function which returns a weighted random value
 */
export const weightedFn = (
  easingNameOrOpts: EasingName | WeightedOpts = 'quadIn'
): RandomSource => {
  const opts =
    typeof easingNameOrOpts === 'string'
      ? { easing: easingNameOrOpts }
      : easingNameOrOpts;
  const source = opts.source ?? defaultRandom;
  const easingName = opts.easing ?? 'quadIn';
  const easingFn = EasingGet(easingName as EasingName);
  if (easingFn === undefined) {
    throw new Error(`Easing function '${easingName}' not found.`);
  }

  const compute = (): number => {
    const r = source();
    return easingFn(r);
  };
  return compute;
};

/***
 * Returns a random number, 0..1, weighted by a given easing function.
 * Default easing is `quadIn`, which skews towards zero.
 *
 * Use {@link weightedFn} to return a function instead.
 *
 * ```js
 * import * as Random from 'https://unpkg.com/ixfx/dist/random.js';
 * Random.weighted();          // quadIn easing by default, which skews toward low values
 * Random.weighted(`quadOut`); // quadOut favours high values
 * ```
 * @param easingNameOrOpts Options. Uses 'quadIn' by default.
 * @see {@link weightedFn} Returns a function rather than value
 * @returns Random number (0-1)
 */
export const weighted = (
  easingNameOrOpts: EasingName | WeightedOpts = 'quadIn'
): number => weightedFn(easingNameOrOpts)();

export type WeightedIntOpts = WeightedOpts & {
  readonly min?: number;
  readonly max: number;
};
/**
 * Random integer, weighted according to an easing function.
 * Number will be inclusive of `min` and below `max`.
 *
 * @example 0..99
 * ```js
 * import * as Random from 'https://unpkg.com/ixfx/dist/random.js';
 * const r = Random.weightedIntegerFn(100);
 * r(); // Produce value
 * ```
 *
 * @example 20..29
 * ```js
 * const r = Random.weightedIntegerFn({ min: 20, max: 30 });
 * r(); // Produce value
 * ```
 *
 * @example  0..99 with 'quadIn' easing
 * ```js
 * const r = Random.weightedInteger({ max: 100, easing: `quadIn` });
 * ```
 *
 * Note: result from easing function will be clamped to
 * the min/max (by default 0-1);
 *
 * @param maxOrOpts Maximum (exclusive)
 * @returns Function that produces a random weighted integer
 */
export const weightedIntegerFn = (
  maxOrOpts: number | WeightedIntOpts
): RandomSource => {
  const opts = typeof maxOrOpts === 'number' ? { max: maxOrOpts } : maxOrOpts;
  const source = opts.source ?? defaultRandom;
  const max = opts.max;
  const min = opts.min ?? 0;
  const easingName = opts.easing ?? `quadIn`;
  if (max === undefined) throw new Error(`max field is undefined`);
  if (typeof easingName !== 'string') {
    throw new Error(`easing field expected to be string`);
  }
  guardNumber(max);

  const easingFn = EasingGet(easingName as EasingName);
  if (easingFn === undefined) {
    throw new Error(`Easing '${easingName}' not found`);
  }

  guardNumber(min);
  if (max <= min) throw new Error(`Max should be greater than min`);

  const compute = (): number => {
    const r = clamp(easingFn(source()));
    return Math.floor(r * (max - min)) + min;
  };
  return compute;
};

/**
 * @example 0..99
 * ```js
 * import * as Random from 'https://unpkg.com/ixfx/dist/random.js';
 * Random.weightedInteger(100);
 * ```
 *
 * @example 20..29
 * ```js
 * Random.weightedInteger({ min: 20, max: 30 });
 * ```
 *
 * @example  0..99 with 'quadIn' easing
 * ```js
 * Random.weightedInteger({ max: 100, easing: `quadIn` })
 * ```
 * @inheritDoc {@link weightedIntegerFn}
 * @param maxOrOpts
 * @returns Random weighted integer
 */
export const weightedInteger = (maxOrOpts: number | WeightedIntOpts): number =>
  weightedIntegerFn(maxOrOpts)();

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
export const gaussian = (skew = 1) => gaussianFn(skew)();

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
export const gaussianFn = (skew = 1): RandomSource => {
  const min = 0;
  const max = 1;
  // Source: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve

  const compute = (): number => {
    //eslint-disable-next-line functional/no-let
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    //eslint-disable-next-line functional/no-let
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) {
      num = compute(); //;gaussian(skew); // resample between 0 and 1 if out of range
    } else {
      num = Math.pow(num, skew); // Skew
      num *= max - min; // Stretch to fill range
      num += min; // offset to min
    }
    return num;
  };
  return compute;
};

/**
 * Returns a function that produces a random integer between `max` (exclusive) and 0 (inclusive)
 * Use {@link integer} if you want a random number directly.
 *
 * Invoke directly:
 * ```js
 * integerFn(10)();  // Random number 0-9
 * ```
 *
 * Or keep a reference to re-compute:
 * ```js
 * const r = integerFn(10);
 * r(); // Produce a random integer
 * ```
 *
 * If a negative value is given, this is assumed to be the
 * minimum (inclusive), with 0 as the max (inclusive)
 * ```js
 * integerFn(-5)();  // Random number from -5 to 0
 * ```
 *
 * Specify options for a custom minimum or source of random:
 * ```js
 * integerFn({ max: 5,  min: 10 })();  // Random number 4-10
 * integerFn({ max: -5, min: -10 })(); // Random number from -10 to -6
 * integerFn({ max: 10, source: Math.random })(); // Random number between 0-9, with custom source of random
 * ```
 *
 * Throws an error if max & min are equal
 * @param maxOrOpts Max value (exclusive), or set of options
 * @returns Random integer
 */
export const integerFn = (maxOrOpts: number | RandomOpts): RandomSource => {
  if (typeof maxOrOpts === `undefined`) {
    throw new Error(`maxOrOpts is undefined`);
  }
  const opts = typeof maxOrOpts === 'number' ? { max: maxOrOpts } : maxOrOpts;
  //eslint-disable-next-line functional/no-let
  let max = Math.floor(opts.max);
  //eslint-disable-next-line functional/no-let
  let min = Math.floor(opts.min ?? 0);

  // If we just get -5 as the max, invert so
  // max:1 and min: -5 instead for -5...0 range
  if (!opts.min && max < 0) {
    max = 1;
    min = opts.max;
  }
  const randomSource = opts.source ?? defaultRandom;
  if (min > max) {
    throw new Error(`Min value is greater than max (min: ${min} max: ${max})`);
  }

  guardNumber(min, '', 'min');
  guardNumber(max, '', 'max');

  if (max === min) {
    throw new Error(`Max and min values cannot be the same (${max})`);
  }

  // Distance
  const amt = Math.abs(max - min);
  return () => Math.floor(randomSource() * amt) + min;
};

/**
 * Returns a random integer between `max` (exclusive) and 0 (inclusive)
 * Use {@link integerFn} to return a function instead.
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
export const integer = (maxOrOpts: number | RandomOpts): number =>
  integerFn(maxOrOpts)();

/**
 * Returns a function that produces random float values.
 * Use {@link float} to produce a valued directly.
 *
 * Random float between `max` (exclusive) and 0 (inclusive). Max is 1 if unspecified.
 *
 *
 * ```js
 * // Random number between 0..1 (but not including 1)
 * // (this would be identical to Math.random())
 * const r = floatFn();
 * r(); // Execute to produce random value
 *
 * // Random float between 0..100 (but not including 100)
 * const v = floatFn(100)();
 * ```
 *
 * Options can be used:
 * ```js
 * // Random float between 20..40 (possibly including 20, but always lower than 40)
 * const r = floatFn({ min: 20, max: 40 });
 * ```
 * @param maxOrOpts Maximum value (exclusive) or options
 * @returns Random number
 */
export const floatFn = (maxOrOpts: number | RandomOpts = 1): RandomSource => {
  const opts = typeof maxOrOpts === 'number' ? { max: maxOrOpts } : maxOrOpts;
  //eslint-disable-next-line functional/no-let
  let max = opts.max;
  //eslint-disable-next-line functional/no-let
  let min = opts.min ?? 0;
  const source = opts.source ?? defaultRandom;

  guardNumber(min, '', 'min');
  guardNumber(max, '', 'max');

  if (!opts.min && max < 0) {
    min = max;
    max = 0;
  }
  if (min > max) {
    throw new Error(`Min is greater than max. Min: ${min} max: ${max}`);
  }

  return () => source() * (max - min) + min;
};

/**
 * Returns a random float between `max` (exclusive) and 0 (inclusive). Max is 1 if unspecified.
 * Use {@link floatFn} to get a function that produces values. This is used internally.
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
export const float = (maxOrOpts: number | RandomOpts = 1): number =>
  floatFn(maxOrOpts)();

export type StringOpts = {
  readonly length: number;
  readonly source?: RandomSource;
};
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
export const string = (lengthOrOpts: number | StringOpts = 5) => {
  const opts =
    typeof lengthOrOpts === 'number' ? { length: lengthOrOpts } : lengthOrOpts;
  const source = opts.source ?? defaultRandom;
  source()
    .toString(36)
    .substring(2, length + 2);
};

/**
 * Generates a short roughly unique id
 * ```js
 * const id = shortGuid();
 * ```
 * @param opts Options.
 * @returns
 */
export const shortGuid = (opts: { readonly source?: RandomSource } = {}) => {
  const source = opts.source ?? defaultRandom;
  // Via Stackoverflow...
  const firstPart = (source() * 46656) | 0;
  const secondPart = (source() * 46656) | 0;
  const firstPartStr = `000${firstPart.toString(36)}`.slice(-3);
  const secondPartStr = `000${secondPart.toString(36)}`.slice(-3);
  return firstPartStr + secondPartStr;
};

/**
 * Returns a random number of minutes, with a unit of milliseconds.
 * Max value is exclusive.
 * Use {@link minutesMs} to get a value directly, or {@link minutesMsFn} to return a function.
 *
 * @example Random value from 0 to one milli less than 5 * 60 * 1000
 * ```js
 * // Create function that returns value
 * const f = minuteMsFn(5);
 *
 * f(); // Generate value
 * ```
 *
 * @example Specified options:
 * ```js
 * // Random time between one minute and 5 minutes
 * const f = minuteMsFn({ max: 5, min: 1 });
 * f();
 * ```
 *
 * @remarks
 * It's a very minor function, but can make
 * code a little more literate:
 * ```js
 * // Random timeout of up to 5 mins
 * setTimeout(() => { ... }, minuteMs(5));
 * ```
 * @param maxMinutesOrOpts
 * @see {@link minutesMs}
 * @returns Function that produces a random value
 */
export const minutesMsFn = (
  maxMinutesOrOpts: number | RandomOpts
): RandomSource => {
  const opts =
    typeof maxMinutesOrOpts === 'number'
      ? { max: maxMinutesOrOpts }
      : maxMinutesOrOpts;
  const min = (opts.min ?? 0) * 60 * 1000;
  const max = opts.max * 60 * 1000;
  return integerFn({ ...opts, max, min });
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
 * @inheritDoc minutesMsFn
 *
 * @param maxMinutesOrOpts
 * @see {@link minutesMsFn}
 * @returns Milliseconds
 */
export const minutesMs = (maxMinutesOrOpts: number | RandomOpts): number =>
  minutesMsFn(maxMinutesOrOpts)();

/**
 * Returns function which produces a random number of seconds, with a unit of milliseconds.
 * Maximum value is exclusive.
 * Use {@link secondsMs} to return a random value directly, or {@link secondsMsFn} to return a function.
 *
 * @example Random milliseconds between 0..4999
 * ```js
 * // Create function
 * const f = secondsMsFn(5000);
 * // Produce a value
 * const value = f();
 * ```
 *
 * @example Options can be provided
 * ```js
 * // Random milliseconds between 1000-4999
 * const value = secondsMsFn({ max:5, min:1 })();
 * // Note the extra () at the end to execute the function
 * ```
 *
 * @remarks
 * It's a very minor function, but can make
 * code a little more literate:
 * ```js
 * // Random timeout of up to 5 seconds
 * setTimeout(() => { ...}, secondsMs(5));
 * ```
 * @param maxSecondsOrOpts Maximum seconds, or options.
 * @returns Milliseconds
 */
export const secondsMsFn = (
  maxSecondsOrOpts: number | RandomOpts
): RandomSource => {
  const opts =
    typeof maxSecondsOrOpts === 'number'
      ? { max: maxSecondsOrOpts }
      : maxSecondsOrOpts;
  const min = (opts.min ?? 0) * 1000;
  const max = opts.max * 1000;
  return () => integer({ ...opts, max, min });
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
 * @inheritDoc secondsMsFn
 * @param maxSecondsOrOpts
 * @returns
 */
export const secondsMs = (maxSecondsOrOpts: number | RandomOpts): number =>
  secondsMsFn(maxSecondsOrOpts)();

export type GenerateRandomOpts = RandomOpts & {
  /**
   * If true, number range is looped
   */
  readonly loop?: boolean;
};

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
 * @param maxOrOpts
 * @returns
 */
export function* integerUniqueGen(
  maxOrOpts: number | GenerateRandomOpts
): IterableIterator<number> {
  const opts = typeof maxOrOpts === 'number' ? { max: maxOrOpts } : maxOrOpts;
  const min = opts.min ?? 0;
  const max = opts.max;
  const source = opts.source ?? defaultRandom;
  const loop = opts.loop ?? false;

  guardInteger(min, '', 'min');
  guardInteger(max, '', 'max');
  if (min > max) {
    throw new Error(`Min value is greater than max. Min: ${min} Max: ${max}`);
  }

  const origRange = [...range(min, max - min)];
  //eslint-disable-next-line functional/no-let
  let numberRange = shuffle(origRange);
  //eslint-disable-next-line functional/no-let
  let index = 0;
  while (true) {
    if (index === numberRange.length) {
      if (loop) numberRange = shuffle(origRange, source);
      else return;
    }
    yield numberRange[index++];
  }
}
