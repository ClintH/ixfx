import { isEqualDefault } from '@ixfx/core';
import { CircularArray, type ICircularArray } from '../circular-array.js';
import type { MapMultiOpts, MultiValue } from './map-multi.js';
import { MapOfMutableImpl } from './map-of-multi-impl.js';
import type { IMapOfMutableExtended } from './imap-of-mutable-extended.js';

export type MapCircularOpts<V> = MapMultiOpts<V> & {
  readonly capacity: number;
};

/**
 * Returns a {@link IMapOfMutableExtended} that uses a {@link ICircularArray} to hold values. Mutable.
 * This means that the number of values stored under each key will be limited to the defined
 * capacity.
 *
 * Required option:
 * * `capacity`: how many items to hold
 *
 * @example Only store the most recent three items per key
 * ```js
 * const map = ofCircularMutable({capacity: 3});
 * map.add(`hello`, 1, 2, 3, 4, 5);
 * const hello = [...map.get(`hello`)]; // [3, 4, 5]
 * ```
 * @param options
 * @returns
 */
export const ofCircularMutable = <V>(
  options: MapCircularOpts<V>
): IMapOfMutableExtended<V, ICircularArray<V>> => {
  const comparer = isEqualDefault;

  const t: MultiValue<V, ICircularArray<V>> = {
    get name() {
      return `circular`;
    },
    addKeyedValues: (destination, values) => {
      let ca: ICircularArray<V> = destination ?? new CircularArray<V>(options.capacity);
      for (const v of values) {
        ca = ca.add(v);
      }
      return ca;
    },
    count: (source) => source.length,
    find: (source, predicate) => source.find(predicate),
    filter: (source, predicate) => source.filter(predicate),
    toArrayCopy: (source) => [ ...source ],
    iterable: (source) => source.values(),
    has: (source, value) =>
      source.find((v) => comparer(v, value)) !== undefined,
    without: (source, value) => source.filter((v) => !comparer(v, value)),
  };
  return new MapOfMutableImpl<V, ICircularArray<V>>(t, options);
};
