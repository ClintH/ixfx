import {stack, stackMutable,  OverflowPolicy as StackOverflowPolicy} from './Stack.js';
import {queue, queueMutable, OverflowPolicy as QueueOverflowPolicy} from './Queue.js';
import {IsEqual, isEqualDefault} from '../util.js';

export {stack, stackMutable, StackOverflowPolicy};
export {queue, queueMutable, QueueOverflowPolicy};

export const randomIndex = <V>(array: ArrayLike<V>): number => Math.floor(Math.random() * array.length);

export const randomElement = <V>(array: ArrayLike<V>): V => array[Math.floor(Math.random() * array.length)];

/**
 * Removes a random item from an array, returning both the item and the new array as a result.
 * Does not modify the original array unless `mutate` parameter is true
 *
 * @template V
 * @param {readonly} array Array to pluck item from
 * @param {*} V 
 * @param {*} []
 * @return {*}  {({readonly value:V|undefined, readonly array:ReadonlyArray<V> })}
 */
//eslint-disable-next-line functional/prefer-readonly-type
export const randomPluck = <V>(array:readonly V[], mutate = false):{readonly value:V|undefined, readonly array:Array<V> } => {
  if (array === undefined) throw new Error(`array is undefined`);
  if (!Array.isArray(array)) throw new Error(`'array' param is not an array`);
  if (array.length === 0) return {value: undefined, array: []};
  const index = randomIndex(array);
  if (mutate) {
    return {
      value: array[index],
      //eslint-disable-next-line functional/immutable-data
      array: array.splice(index, 1)
    };
  } else {
    // Copy array, remove item from that
    const t = [...array];
    //eslint-disable-next-line functional/immutable-data
    t.splice(index, 1);
    return {
      value: array[index],
      array: t
    };
  }
};

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

