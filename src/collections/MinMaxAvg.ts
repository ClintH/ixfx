import { slice } from '../IterableSync.js';
import { filterBetween } from './Arrays.js';

export type MinMaxAvgTotal = {
  /**
   * Smallest value in array
   */
  readonly min: number;
  /**
   * Total of all items
   */
  readonly total: number;
  /**
   * Largest value in array
   */
  readonly max: number;
  /**
   * Average value in array
   */
  readonly avg: number;
};

export type MinMaxAvgOpts = {
  /**
   * Start index, inclusive
   */
  readonly startIndex?: number;
  /**
   * End index, exclusive
   */
  readonly endIndex?: number;
};
/**
 * Returns the min, max, avg and total of the array or iterable.
 * Any values that are invalid are silently skipped over.
 *
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/collections.js';
 *
 * const v = [10, 2, 4.2, 99];
 * const mma = Arrays.minMaxAvg(v);
 * Yields: { min: 2, max: 99, total: 115.2, avg: 28.8 }
 * ```
 *
 * Use {@link average}, {@link max}, {@link min} or {@link total} if you only need one of these.
 *
 * A start and end range can be provided if the calculation should be restricted to a part
 * of the input array. By default the whole array is used.
 *
 * It's also possible to use an iterable as input.
 * ```js
 * Arrays.minMaxAvg(count(5,1)); // Averages 1,2,3,4,5
 * ```
 * @param data
 * @param opts Allows restriction of range that is examined
 * @returns `{min, max, avg, total}`
 */
export const minMaxAvg = (
  //eslint-disable-next-line functional/prefer-readonly-type
  data: readonly number[] | number[] | Iterable<number>,
  opts: MinMaxAvgOpts = {}
): MinMaxAvgTotal => {
  if (data === undefined) throw new Error(`'data' is undefined`);
  if (!Array.isArray(data)) {
    if (`next` in data) {
      if (opts.startIndex || opts.endIndex) {
        data = slice(data, opts.startIndex, opts.endIndex);
      }
      //eslint-disable-next-line functional/no-let
      let total = 0;
      //eslint-disable-next-line functional/no-let
      let min = Number.MAX_SAFE_INTEGER;
      //eslint-disable-next-line functional/no-let
      let max = Number.MIN_SAFE_INTEGER;
      //eslint-disable-next-line functional/no-let
      let samples = 0;
      for (const v of data) {
        if (typeof v !== `number`) {
          throw new Error(`Generator should yield numbers. Got: ${typeof v}`);
        }
        total += v;
        samples++;
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
      return {
        avg: total / samples,
        total,
        max,
        min,
      };
    } else {
      throw new Error(`'data' parameter is neither array or iterable`);
    }
  }

  if (data.length === 0) {
    return {
      total: 0,
      min: 0,
      max: 0,
      avg: 0,
    };
  }
  const startIndex = opts.startIndex ?? 0;
  const endIndex = opts.endIndex ?? data.length;

  const validNumbers = filterBetween<number>(
    data,
    (d) => typeof d === `number` && !Number.isNaN(d),
    startIndex,
    endIndex
  );
  const total = validNumbers.reduce((acc, v) => acc + v, 0);
  return {
    total: total,
    max: Math.max(...validNumbers),
    min: Math.min(...validNumbers),
    avg: total / validNumbers.length,
  };
};
