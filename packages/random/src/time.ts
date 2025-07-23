import { integer, integerSource } from "./integer.js";
import type { RandomNumberOptions, RandomSource } from "./types.js";

/**
 * Returns a random number of minutes, with a unit of milliseconds.
 * 
 * Max value is exclusive, defaulting to 5.
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
 * @param maxMinutesOrOptions
 * @see {@link minutesMs}
 * @returns Function that produces a random value
 */
export const minutesMsSource = (
  maxMinutesOrOptions: number | RandomNumberOptions
): RandomSource => {
  const options =
    typeof maxMinutesOrOptions === `number`
      ? { max: maxMinutesOrOptions }
      : maxMinutesOrOptions;
  const min = (options.min ?? 0) * 60 * 1000;
  const max = (options.max ?? 5) * 60 * 1000;
  return integerSource({ ...options, max, min });
};


/**
 * Return a random time value in milliseconds, using minute values to set range.
 * 
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
 * @param maxMinutesOrOptions
 * @see {@link minutesMsSource}
 * @returns Milliseconds
 */
export const minutesMs = (maxMinutesOrOptions: number | RandomNumberOptions): number =>
  minutesMsSource(maxMinutesOrOptions)();


/**
 * Returns function which produces a random number of seconds, with a unit of milliseconds.
 * 
 * Maximum value is exclusive, defaulting to 5
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
 * @param maxSecondsOrOptions Maximum seconds, or options.
 * @returns Milliseconds
 */
export const secondsMsSource = (
  maxSecondsOrOptions: number | RandomNumberOptions
): RandomSource => {
  const options =
    typeof maxSecondsOrOptions === `number`
      ? { max: maxSecondsOrOptions }
      : maxSecondsOrOptions;
  const min = (options.min ?? 0) * 1000;
  const max = (options.max ?? 5) * 1000;
  return () => integer({ ...options, max, min });
};

/**
 * Generate random time in milliseconds, using seconds to set the bounds
 * 
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
 * @param maxSecondsOrOptions
 * @returns
 */
export const secondsMs = (maxSecondsOrOptions: number | RandomNumberOptions): number =>
  secondsMsSource(maxSecondsOrOptions)();