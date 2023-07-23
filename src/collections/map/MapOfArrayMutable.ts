import { type IsEqual, type ToString, isEqualDefault } from '../../Util.js';
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
 * Returns a {@link MapOfMutable} to allow storing multiple values under a key, unlike a regular Map.
 * @example
 * ```js
 * const map = mapOfArrayMutable();
 * map.addKeyedValues(`hello`, [1,2,3,4]); // Adds series of numbers under key `hello`
 *
 * const hello = map.get(`hello`); // Get back values
 * ```
 *
 * Takes options:
 * * `comparer`: {@link Util.IsEqual}
 * * `toString`: {@link Util.ToString}
 *
 * A custom {@link Util.ToString} function can be provided which is used when checking value equality (`has`, `without`)
 * ```js
 * const map = mapOfArrayMutable({toString:(v) => v.name}); // Compare values based on their `name` field;
 * ```
 *
 * Alternatively, a {@link Util.IsEqual} function can be used:
 * ```js
 * const map = mapOfArrayMutable({comparer: (a, b) => a.name === b.name });
 * ```
 * @param opts
 * @template V Data type of items
 * @returns {@link MapOfMutable}
 */
export const mapOfArrayMutable = <V>(
  opts: MapArrayOpts<V> = {}
): IMapOfMutableExtended<V, ReadonlyArray<V>> => {
  const comparer =
    opts.comparer === undefined
      ? opts.toString === undefined
        ? (a: V, b: V) => opts.toString(a) === opts.toString(b)
        : isEqualDefault
      : opts.comparer;

  const t: MultiValue<V, ReadonlyArray<V>> = {
    get name() {
      return `array`;
    },
    add: (dest, values) => {
      if (dest === undefined) return [...values];
      return [...dest, ...values];
    },
    iterable: (source) => source.values(),
    count: (source) => source.length,
    find: (source, predicate) => source.find(predicate),
    filter: (source, predicate) => source.filter(predicate),
    toArray: (source) => source,
    has: (source, value) =>
      source.find((v) => comparer(v, value)) !== undefined,
    without: (source, value) => source.filter((v) => !comparer(v, value)),
    //[Symbol.iterator]: (source) => source[Symbol.iterator]()
  };
  const m = new MapOfMutableImpl<V, ReadonlyArray<V>>(t, opts);
  return m;
};
