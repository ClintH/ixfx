/**
 * Yields all items in `data` for as long as `predicate` returns true.
 *
 * `predicate` yields arrays of `[stop:boolean, acc:A]`. The first value
 * is _true_ when the iteration should stop, and the `acc` is the accumulated value.
 * This allows `until` to be used to carry over some state from item to item.
 *
 * @example Stop when we hit an item with value of 3
 * ```js
 * const v = [...until([1,2,3,4,5], v => [v === 3, 0])];
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
export function* until<V, A>(
  data: readonly V[] | V[],
  predicate: (v: V, accumulator: A) => readonly [ stop: boolean, acc: A ],
  initial: A
): Generator<V> {
  let total = initial;
  for (const datum of data) {
    const [ stop, accumulator ] = predicate(datum, total);
    if (stop) break;

    total = accumulator;
    yield datum;

  }
};