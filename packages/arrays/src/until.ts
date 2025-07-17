/**
 * Yields all items in the input array, stopping when `predicate` returns _true_.
 * 
 * @example Yield values until we hit 3
 * ```js
 * const data = [ 1, 2, 3, 4, 5 ];
 * until(data, v => v === 3)
 * // [ 1, 2 ]
 * ```
 */
export function until<V>(
  data: readonly V[] | V[],
  predicate: (v: V) => boolean
): Generator<V>;

/**
 * Yields all items in the input array, stopping when `predicate` returns _true_.
 * This version allows a value to be 'accumulated' somehow
 * 
 * @example Yield values until a total of 4
 * ```js
 * const data = [ 1, 2, 3, 4, 5 ];
 * until(data, (v, accumulated) => [accumulated >= 6, accumulated + v ]);
 * // [ 1, 2, 3 ]
 * ```
 */
export function until<V, A>(
  data: readonly V[] | V[],
  predicate: (v: V, accumulator: A) => readonly [ stop: boolean, acc: A ],
  initial: A
): Generator<V>;

/**
 * Yields all items in the input array for as long as `predicate` returns true.
 *
 * `predicate` yields arrays of `[stop:boolean, acc:A]`. The first value
 * is _true_ when the iteration should stop, and the `acc` is the accumulated value.
 * This allows `until` to be used to carry over some state from item to item.
 *
 * @example Stop when we hit an item with value of 3
 * ```js
 * const v = [...until([1,2,3,4,5], v => v === 3];
 * // [ 1, 2 ]
 * ```
 *
 * @example Stop when we reach a total, using 0 as initial value
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
  predicate: (v: V, accumulator?: A) => boolean | (readonly [ stop: boolean, acc: A ]),
  initial?: A
): Generator<V> {
  let total = initial;
  for (const datum of data) {
    const r = predicate(datum, total);
    if (typeof r === `boolean`) {
      if (r) break;
    } else {
      const [ stop, accumulator ] = r;
      if (stop) break;
      total = accumulator;
    }
    yield datum;
  }
};