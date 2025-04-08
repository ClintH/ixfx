import { throwFromResult, numberTest as guardNumberTest, integerTest as guardIntegerTest } from "@ixfxfun/guards";
import type { GenerateRandomOptions, RandomOptions, RandomSource } from "./types.js";
import { count } from "./util/count.js";
import { shuffle } from "./arrays.js";

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
  let max = Math.floor(options.max ?? 100);
  let min = Math.floor(options.min ?? 0);

  // If we just get -5 as the max, invert so
  // max:1 and min: -5 instead for -5...0 range
  if (!options.min && max < 0) {
    max = 1;
    min = options.max ?? 0;
  }
  const randomSource = options.source ?? Math.random;
  if (min > max) {
    throw new Error(`Min value is greater than max (min: ${ min.toString() } max: ${ max.toString() })`);
  }

  throwFromResult(guardNumberTest(min, ``, `min`));
  throwFromResult(guardNumberTest(max, ``, `max`));

  if (max === min) {
    throw new Error(`Max and min values cannot be the same (${ max.toString() })`);
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
 * integer(10);  // Random number 0,1..9
 * ```
 *
 * If a negative value is given, this is assumed to be the
 * minimum (inclusive), with 0 as the max (inclusive)
 * ```js
 * integer(-5);  // Random number -5,-4,...0
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
  const max = options.max ?? 100;
  const source = options.source ?? Math.random;
  const loop = options.loop ?? false;

  throwFromResult(guardIntegerTest(min, ``, `min`));
  throwFromResult(guardIntegerTest(max, ``, `max`));
  if (min > max) {
    throw new Error(`Min value is greater than max. Min: ${ min.toString() } Max: ${ max.toString() }`);
  }

  const origRange = [ ...count(max - min, min) ];
  let numberRange = shuffle(origRange);
  let index = 0;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    if (index === numberRange.length) {
      if (loop) numberRange = shuffle(origRange, source);
      else return;
    }
    yield numberRange[ index++ ];
  }
}
