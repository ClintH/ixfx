import type { ToString } from '@ixfx/core';
import { type IsEqual, isEqualDefault } from '@ixfx/core';
import { type IMapOfMutableExtended } from './imap-of-mutable-extended.js';
import { type MapMultiOpts, type MultiValue } from './map-multi.js';
import { MapOfMutableImpl } from './map-of-multi-impl.js';

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
  readonly convertToString?: ToString<V>;
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
 * * `toString`: Util.ToString
 *
 * A custom Util.ToString function can be provided as the `convertToString` opion. This is then used when checking value equality (`has`, `without`)
 * ```js
 * const map = ofArrayMutable({ convertToString:(v) => v.name}); // Compare values based on their `name` field;
 * ```
 *
 * Alternatively, a {@link IsEqual} function can be used:
 * ```js
 * const map = ofArrayMutable({comparer: (a, b) => a.name === b.name });
 * ```
 * @param options Optiosn for mutable array
 * @typeParam V - Data type of items
 * @returns {@link IMapOfMutableExtended}
 */
export const ofArrayMutable = <V>(
  options: MapArrayOpts<V> = {}
): IMapOfMutableExtended<V, readonly V[]> => {
  // const toStringFunction = opts.toString === undefined ?  
  // const comparer =
  //   opts.comparer === undefined
  //     ? (opts.toString === undefined
  //       ? (a: V, b: V) => opts.toString(a) === opts.toString(b)
  //       : isEqualDefault)
  //     : opts.comparer;
  // const convertToStringComparer = opts.convertToString === undefined ? undefined : (a: V, b: V) => {
  //   const r = opts.convertToString(a) === opts.convertToString(b)
  //   console.log(`ofArrayMutable toString comparer: r: ${ r } a: ${ a } b: ${ b }`);
  //   console.log(`ofArrayMutable toString comparer: a: ${ opts.toString(a) } b: ${ opts.toString(b) }`);
  //   return r;
  // };

  const convertToString = options.convertToString;
  const toStringFunction: IsEqual<V> = typeof convertToString === `undefined` ? isEqualDefault : (a: V, b: V) => convertToString(a) === convertToString(b)

  const comparer = options.comparer ?? toStringFunction;

  const t: MultiValue<V, readonly V[]> = {
    get name() {
      return `array`;
    },
    addKeyedValues: (destination, values) => {
      if (destination === undefined) return [ ...values ];
      return [ ...destination, ...values ];
    },
    iterable: (source) => source.values(),
    count: (source) => source.length,
    find: (source, predicate) => source.find(f => predicate(f)),
    filter: (source, predicate) => source.filter(f => predicate(f)),
    toArray: (source) => source,
    has: (source, value) => source.some((v) => comparer(v, value)),
    without: (source, value) => source.filter((v) => !comparer(v, value)),
    //[Symbol.iterator]: (source) => source[Symbol.iterator]()
  };
  const m = new MapOfMutableImpl<V, readonly V[]>(t, options);
  return m;
};
