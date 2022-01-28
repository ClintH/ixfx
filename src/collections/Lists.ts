import {stack, stackMutable,  OverflowPolicy as StackOverflowPolicy} from './Stack.js';
import {queue, queueMutable, OverflowPolicy as QueueOverflowPolicy} from './Queue.js';
import {IsEqual, isEqualDefault} from '../util.js';

export {stack, stackMutable, StackOverflowPolicy};
export {queue, queueMutable, QueueOverflowPolicy};

export const randomElement = <V>(array: ArrayLike<V>): V => array[Math.floor(Math.random() * array.length)];
export const shuffle = (dataToShuffle:ReadonlyArray<unknown>): ReadonlyArray<unknown> => {
  const array = [...dataToShuffle];
  // eslint-disable-next-line functional/no-loop-statement, functional/no-let
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Returns an array with a value omitted.
 * Value checking is completed via the provided `comparer` function, or by default checking whether `a === b`.
 *
 * @template V
 * @param {ReadonlyArray<V>} data
 * @param {V} value
 * @param {IsEqual<V>} [comparer=isEqualDefault]
 * @return {*}  {ReadonlyArray<V>}
 */
export const without = <V>(data:ReadonlyArray<V>, value:V, comparer:IsEqual<V> = isEqualDefault):ReadonlyArray<V> => data.filter(v => !comparer(v, value));

