export * from './Count.js';
export * from './Generate.js';
export * from './Ranges.js';
export * from './Round.js';
export * from './IsApproximately.js';
export * from './LinearSpace.js';
export * from './Guard.js';
export * from './Quantise.js';

export * from '../modulation/PingPong.js';
export * from '../modulation/Jitter.js';
export { integer as randomUniqueInteger } from '../random/index.js';

import { numberTracker } from '../data/NumberTracker.js';
import { type TrackedValueOpts as TrackedValueOptions } from '../data/TrackedValue.js';
import { isValid } from './Guard.js';



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
 * Alias for [Data.numberTracker](https://clinth.github.io/ixfx/classes/Data.numberTracker-1.html)
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
