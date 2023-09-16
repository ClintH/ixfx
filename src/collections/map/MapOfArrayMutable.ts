import type { ToString } from 'src/Util.js';
import { type IsEqual, isEqualDefault } from '../../IsEqual.js';
import { type IMapOfMutableExtended } from './IMapOfMutableExtended.js';
import { type MapMultiOpts, type MultiValue } from './MapMulti.js';
import { MapOfMutableImpl } from './MapOfMultiImpl.js';

/**
 * Map of array options
 */
export type MapArrayOpts<V> = MapMultiOpts<V> & {
  /**
   * Comparer to use
   */
  readonly comparer?: IsEqual<V>;
  /**
   * Key function
   */
  readonly toString?: ToString<V>;
};

/**
 * Returns a {@link IMapOfMutableExtended} to allow storing multiple values under a key, unlike a regular Map.
 * @example
 * ```js
 * const map = ofArrayMutable();
 * map.addKeyedValues(`hello`, [1,2,3,4]); // Adds series of numbers under key `hello`
 *
 * const hello = map.get(`hello`); // Get back values
 * ```
 *
 * Takes options:
 * * `comparer`: {@link IsEqual}
 * * `toString`: {@link Util.ToString}
 *
 * A custom {@link Util.ToString} function can be provided which is used when checking value equality (`has`, `without`)
 * ```js
 * const map = ofArrayMutable({toString:(v) => v.name}); // Compare values based on their `name` field;
 * ```
 *
 * Alternatively, a {@link IsEqual} function can be used:
 * ```js
 * const map = ofArrayMutable({comparer: (a, b) => a.name === b.name });
 * ```
 * @param opts
 * @template V Data type of items
 * @returns {@link IMapOfMutableExtended}
 */
export const ofArrayMutable = <V>(
  opts: MapArrayOpts<V> = {}
): IMapOfMutableExtended<V, ReadonlyArray<V>> => {
  const comparer =
    opts.comparer === undefined
      ? (opts.toString === undefined
        ? (a: V, b: V) => opts.toString(a) === opts.toString(b)
        : isEqualDefault)
      : opts.comparer;

  const t: MultiValue<V, ReadonlyArray<V>> = {
    get name() {
      return `array`;
    },
    add: (destination, values) => {
      if (destination === undefined) return [ ...values ];
      return [ ...destination, ...values ];
    },
    iterable: (source) => source.values(),
    count: (source) => source.length,
    find: (source, predicate) => source.find(f => predicate(f)),
    filter: (source, predicate) => source.filter(f => predicate(f)),
    toArray: (source) => source,
    has: (source, value) =>
      source.some((v) => comparer(v, value)) !== undefined,
    without: (source, value) => source.filter((v) => !comparer(v, value)),
    //[Symbol.iterator]: (source) => source[Symbol.iterator]()
  };
  const m = new MapOfMutableImpl<V, ReadonlyArray<V>>(t, opts);
  return m;
};
