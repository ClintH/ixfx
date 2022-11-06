import * as NumericArrays from './collections/NumericArrays.js';
import { numberTracker } from './data/NumberTracker.js';
import { TrackedValueOpts } from './data/TrackedValue.js';
import { Easings } from './modulation/index.js';
import { number as guard, integer as guardInteger } from './Guards.js';

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
export const average = (...numbers:readonly number[]) => NumericArrays.average(numbers);

/**
 * See [Arrays.averageWeighted](Collections.Arrays.averageWeighted.html)
 * @param weightings 
 * @param numbers 
 * @returns 
 */
export const averageWeighted = (weightings:(readonly number[])|Easings.EasingFn, ...numbers:readonly number[]):number => NumericArrays.averageWeighted(numbers, weightings);

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
export const min = (...data:readonly number[]):number => NumericArrays.min(data);


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
export const max = (...data:readonly number[]):number => NumericArrays.max(data);


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
export const total = (...data:readonly number[]):number => NumericArrays.total(data);

/**
 * Returns true if `possibleNumber` is a number and not NaN
 * @param possibleNumber 
 * @returns 
 */
export const isValid = (possibleNumber:number|unknown) => {
  if (typeof possibleNumber !== `number`) return false;
  if (Number.isNaN(possibleNumber)) return false;
  return true;
}; 

/**
 * Alias for [Data.numberTracker](Data.numberTracker.html) 
 */
export const tracker = (opts?:TrackedValueOpts) => numberTracker(opts);

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
export function* filter(it:Iterable<unknown>) {
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
export const quantiseEvery = (v:number, every:number, middleRoundsUp = true) => {
  // Unit tested!
  guard(v, ``, `v`);
  guardInteger(every, ``, `every`);

  //eslint-disable-next-line functional/no-let
  let div = v / every;
  const divMod = div % 1;
  div = Math.floor(div);
  if (divMod === 0.5 && middleRoundsUp || divMod > 0.5) div++;
  return every * div;
};

/**
 * Generates a `step`-length series of values between `start` and `end` (inclusive).
 * Each value will be equally spaced.
 * 
 * ```js
 * for (const v of linearSpace(1, 5, 6)) {
 *  // Yields: 1, 2, 3, 4, 5, 6
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
export function* linearSpace(start:number, end:number, steps:number, precision?:number):IterableIterator<number> {
  guard(start, ``, `start`);
  guard(end, ``, `end`);

  guard(steps, ``, `steps`);

  const r = precision ? rounder(precision) : (v:number) => v;
  const step = (end-start) / (steps -1);

  guard(step, ``, `step`);
  if (!Number.isFinite(step)) throw new Error(`Calculated step value is infinite`);

  //eslint-disable-next-line functional/no-let
  for (let i=0;i<steps;i++) {
    const v = (start + (step * i));
    yield r(v);
  }
}

/**
 * Rounds a number to given number of decimal places.
 * 
 * If you are reusing the same rounding, consider {@link rounder}.
 * ```js
 * round(10.12345, 2); // 10.12
 * round(10.12345, 1); // 10.1
 * round(10.12345);    // 10         
 * ```
 * @param v 
 * @param decimalPlaces 
 */
export const round = (v:number, decimalPlaces:number = 0) => {
  guard(v, ``, `v`);
  return rounder(decimalPlaces)(v);
};

/**
 * Returns a number rounding function
 * ```js
 * const r = rounder(2);
 * r(10.12355); // 10.12
 * ```
 * @param decimalPlaces
 * @returns 
 */
export const rounder = (decimalPlaces:number = 0) => {
  guardInteger(decimalPlaces, `positive`, `decimalPlaces`);

  if (decimalPlaces === 0) return Math.round;
  const p = Math.pow(10, decimalPlaces);

  return (v:number) => Math.floor(v*p) / p;
};