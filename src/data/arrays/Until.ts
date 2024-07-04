/**
 * Returns all items in `data` for as long as `predicate` returns true.
 *
 * `predicate` returns an array of `[stop:boolean, acc:A]`. The first value
 * is _true_ when the iteration should stop, and the `acc` is the accumulated value.
 * This allows `until` to be used to carry over some state from item to item.
 *
 * @example Stop when we hit an item with value of 3
 * ```js
 * const v = Arrays.until([1,2,3,4,5], v => [v === 3, 0]);
 * // [ 1, 2 ]
 * ```
 *
 * @example Stop when we reach a total
 * ```js
 * // Stop when accumulated value reaches 6
 * const v = Arrays.until[1,2,3,4,5], (v, acc) => [acc >= 7, v+acc], 0);
 * // [1, 2, 3]
 * ```
 * @param data
 * @param predicate
 * @returns
 */
export const until = <V, A>(
  //eslint-disable-next-line functional/prefer-readonly-type
  data: ReadonlyArray<V> | Array<V>,
  predicate: (v: V, accumulator: A) => readonly [ stop: boolean, acc: A ],
  initial: A
): Array<V> => {
  const returnValue = [];
  //eslint-disable-next-line functional/no-let
  let total = initial;
  //eslint-disable-next-line functional/no-let
  for (const datum of data) {
    const [ stop, accumulator ] = predicate(datum, total);
    if (stop) break;

    total = accumulator;

    //eslint-disable-next-line functional/immutable-data
    returnValue.push(datum);
  }
  return returnValue;
};