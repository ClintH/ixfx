import { isIterable, numbersCompute as numbersIterableCompute} from '@ixfxfun/iterables';
import { numberArrayCompute, type NumbersComputeOptions, type NumbersComputeResult } from '@ixfxfun/numbers';


/**
 * Returns the min, max, avg and total of the array or iterable.
 * Any values that are invalid are silently skipped over.
 *
 * ```js
 * const v = [ 10, 2, 4.2, 99 ];
 * const mma = numbersCompute(v);
 * // Yields: { min: 2, max: 99, total: 115.2, avg: 28.8 }
 * ```
 *
 * Use {@link Numbers.average}, {@link Numbers.max}, {@link Numbers.min} or {@link Numbers.total} if you only need one of these.
 *
 * A start and end range can be provided if the calculation should be restricted to a part
 * of the input array. By default the whole array is used.
 *
 * It's also possible to use an iterable as input.
 * ```js
 * numbersCompute(count(5,1)); // Averages 1,2,3,4,5
 * ```
 * 
 * Returns `NaN` if the input data is empty.
 * @param data
 * @param options Allows restriction of range that is examined
 * @returns `{min, max, avg, total}`
 */
export const numbersCompute = (
  data: readonly number[] | number[] | Iterable<number>,
  options: NumbersComputeOptions = {}
): NumbersComputeResult => {
  if (typeof data === `undefined`) throw new Error(`Param 'data' is undefined`);
  if (Array.isArray(data)) {
    return numberArrayCompute(data, options);
  }
  if (isIterable(data)) {
    return numbersIterableCompute(data,options);
  }
  throw new Error(`Param 'data' is neither an array nor iterable`);
};

