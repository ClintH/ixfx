import * as NumericArrays from './collections/NumericArrays.js';
import { numberTracker } from './data/NumberTracker.js';
import { type TrackedValueOpts as TrackedValueOptions } from './data/TrackedValue.js';
import { Easings } from './modulation/index.js';
import { numberTest, integerTest, throwFromResult } from './Guards.js';

/**
 * Calculates the average of all numbers in an array.
 * Array items which aren't a valid number are ignored and do not factor into averaging.

 * @example
 * ```
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * 
 * // Average of a list
 * const avg = Numbers.average(1, 1.4, 0.9, 0.1);
 * 
 * // Average of a variable
 * let data = [100,200];
 * Numbers.average(...data);
 * ```
 * 
 * See also: [Arrays.average](Collections.Arrays.average.html) which takes an array.
 * @param data Data to average.
 * @returns Average of array
 */
export const average = (...numbers: ReadonlyArray<number>) =>
  NumericArrays.average(numbers);

/**
 * See [Arrays.averageWeighted](Collections.Arrays.averageWeighted.html)
 * @param weightings
 * @param numbers
 * @returns
 */
export const averageWeighted = (
  weightings: ReadonlyArray<number> | Easings.EasingFn,
  ...numbers: ReadonlyArray<number>
): number => NumericArrays.averageWeighted(numbers, weightings);

/**
 * Apples `fn` to every key of `obj` which is numeric.
 * ```js
 * const o = {
 *  name: 'john',
 *  x: 10,
 *  y: 20
 * };
 * const o2 = applyToValues(o, (v) => v * 2);
 * 
 * // Yields: { name: 'john', x: 20, y: 40 }
 * ```
 * @param obj 
 * @param apply 
 * @returns 
 */
export const applyToValues = <T extends Record<string, any>>(object: T, apply: (v: number) => number): T => {
  const o: T = { ...object };
  for (const [ key, value ] of Object.entries(object)) {
    if (typeof value === `number`) {
      // Run number through function
      //eslint-disable-next-line functional/immutable-data
      (o as any)[ key ] = apply(value);
    } else {
      // Copy value
      //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-unsafe-assignment
      (o as any)[ key ] = value;
    }
  }
  return o;
}

/**
 * Returns the minimum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.min(10, 20, 0); // Yields 0
 * ```
 * @param data
 * @returns Minimum number
 */
export const min = (...data: ReadonlyArray<number>): number =>
  NumericArrays.min(data);

/**
 * Returns the maximum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.max(10, 20, 0); // Yields 20
 * ```
 * @param data
 * @returns Maximum number
 */
export const max = (...data: ReadonlyArray<number>): number =>
  NumericArrays.max(data);

/**
 * Returns the total of `data`.
 * Undefined and non-numbers are silently ignored.
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.total(10, 20, 0); // Yields 30
 * ```
 * @param data
 * @returns Total
 */
export const total = (...data: ReadonlyArray<number>): number =>
  NumericArrays.total(data);

/**
 * Returns true if `possibleNumber` is a number and not NaN
 * @param possibleNumber
 * @returns
 */
export const isValid = (possibleNumber: unknown) => {
  if (typeof possibleNumber !== `number`) return false;
  if (Number.isNaN(possibleNumber)) return false;
  return true;
};

/**
 * Alias for [Data.numberTracker](Data.numberTracker.html)
 */
export const tracker = (options?: TrackedValueOptions) => numberTracker(options);

/**
 * Filters an iterator of values, only yielding
 * those that are valid numbers
 *
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 *
 * const data = [true, 10, '5', { x: 5 }];
 * for (const n of Numbers.filter(data)) {
 *  // 5
 * }
 * ```
 * @param it
 */
//eslint-disable-next-line func-style
export function* filter(it: Iterable<unknown>) {
  for (const v of it) {
    if (isValid(v)) yield v;
  }
}

/**
 * Rounds `v` by `every`. Middle values are rounded up by default.
 *
 * ```js
 * quantiseEvery(11, 10);  // 10
 * quantiseEvery(25, 10);  // 30
 * quantiseEvery(0, 10);   // 0
 * quantiseEvery(4, 10);   // 0
 * quantiseEvery(100, 10); // 100
 * ```
 *
 * @param v
 * @param every
 * @param middleRoundsUp
 * @returns
 */
export const quantiseEvery = (
  v: number,
  every: number,
  middleRoundsUp = true
) => {
  // Unit tested!
  throwFromResult(numberTest(v, ``, `v`));
  throwFromResult(integerTest(every, ``, `every`));

  //eslint-disable-next-line functional/no-let
  let div = v / every;
  const divModule = div % 1;
  div = Math.floor(div);
  if ((divModule === 0.5 && middleRoundsUp) || divModule > 0.5) div++;
  return every * div;
};

/**
 * Generates a `step`-length series of values between `start` and `end` (inclusive).
 * Each value will be equally spaced.
 *
 * ```js
 * for (const v of linearSpace(1, 5, 6)) {
 *  // Yields: [ 1, 1.8, 2.6, 3.4, 4.2, 5 ]
 * }
 * ```
 *
 * Numbers can be produced from large to small as well
 * ```js
 * const values = [...linearSpace(10, 5, 3)];
 * // Yields: [10, 7.5, 5]
 * ```
 * @param start Start number (inclusive)
 * @param end  End number (inclusive)
 * @param steps How many steps to make from start -> end
 * @param precision Number of decimal points to round to
 */
export function* linearSpace(
  start: number,
  end: number,
  steps: number,
  precision?: number
): IterableIterator<number> {
  throwFromResult(numberTest(start, ``, `start`));
  throwFromResult(numberTest(end, ``, `end`));

  throwFromResult(numberTest(steps, ``, `steps`));

  const r = precision ? round(precision) : (v: number) => v;
  const step = (end - start) / (steps - 1);

  throwFromResult(numberTest(step, ``, `step`));
  if (!Number.isFinite(step)) {
    throw new TypeError(`Calculated step value is infinite`);
  }

  //eslint-disable-next-line functional/no-let
  for (let index = 0; index < steps; index++) {
    const v = start + step * index;
    yield r(v);
  }
}

export function round(decimalPlaces: number, v: number): number;
export function round(decimalPlaces: number): (v: number) => number;

/**
 * Rounds a number.
 *
 * If one parameter is given, it's the decimal places,
 * and a rounding function is returned:
 * ```js
 * const r = round(2);
 * r(10.12355); // 10.12
 * ```
 *
 * If two parameters are given, the first is decimal places,
 * the second the value to round.
 * ```js
 * round(2, 10.12355); // 10.12
 * ```
 * @param decimalPlaces
 * @returns
 */
export function round(a: number, b?: number) {
  throwFromResult(integerTest(a, `positive`, `decimalPlaces`));

  //eslint-disable-next-line functional/no-let
  let rounder;
  if (a === 0) rounder = Math.round;
  else {
    const p = Math.pow(10, a);
    rounder = (v: number) => Math.floor(v * p) / p;
  }

  return b === undefined ? rounder : rounder(b);
}

export function isApproximately(
  baseValue: number,
  rangePercent: number
): (v: number) => boolean;

export function isApproximately(
  baseValue: number,
  rangePercent: number,
  v: number
): boolean;

/**
 * Returns a function that yields _true_ if a value is within
 * a percentage range of a base value.
 *
 * ```js
 * // Allow 10% above or below
 * const closeTo100 = isApproximately(100, 0.1); // returns a function
 * closeTo100(100); // true
 * closeTo100(101); // true;
 * closeTo100(90); // true;
 * closeTo100(80); // false;
 * ```
 *
 * `isApproximately` returns a function, but if a third value is provided,
 * it returns true/false, testing the value:
 * ```js
 * isApproximately(100, 0.1, 101); // True
 * ```
 * If the tested value is not a number, _false_ is returned
 * (because it is not, in fact approximately `baseValue`).
 *
 * For baseValues between -2 and 2, the calculated difference is rounded down
 * to 5 decimal places to avoid weird JS floating point math.
 * @param baseValue
 * @param rangePercent
 * @returns
 */
export function isApproximately(
  baseValue: number,
  rangePercent: number,
  v?: number
) {
  throwFromResult(numberTest(rangePercent, `percentage`, `rangePercent`));
  throwFromResult(numberTest(baseValue, ``, `baseValue`));

  const diff = baseValue * rangePercent;
  const test = (v: number): boolean => {
    try {
      throwFromResult(numberTest(v, ``, `v`));

      //eslint-disable-next-line functional/no-let
      let diffV = Math.abs(v - baseValue);
      if (Math.abs(baseValue) <= 2) {
        diffV = round(5, diffV);
      }
      return diffV <= diff;
    } catch {
      return false;
    }
  };

  return v === undefined ? test : test(v);
}
