import { isValid } from './Guard.js';
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
