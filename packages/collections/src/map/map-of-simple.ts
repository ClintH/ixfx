import type { ToString, IsEqual } from '@ixfx/core';
import type { IMapOf } from './imap-of.js';
import type { IMapOfImmutable } from './imap-of-immutable.js';
import { defaultKeyer, isEqualDefault } from '@ixfx/core';
import { MapOfSimpleBase } from './map-of-simple-base.js';
import { groupBy } from '@ixfx/arrays';
import { MapOfSimpleMutable } from './map-of-simple-mutable.js';

/**
 * Simple immutable MapOf
 */
export class MapOfSimple<V>
  extends MapOfSimpleBase<V>
  implements IMapOf<V>, IMapOfImmutable<V> {

  addKeyedValues(key: string, ...values: V[]): MapOfSimple<V> {
    //const asEntries = values.map(v => [key, v]) as [string, V[]][];
    //return this.addBatch(asEntries);
    return this.addBatch([ [ key, values ] ]);
  }

  addValue(...values: readonly V[]): MapOfSimple<V> {
    const temporary = new MapOfSimpleMutable<V>(this.groupBy, this.valueEq, this.getRawMapUnsafe);
    temporary.addValue(...values);
    return new MapOfSimple<V>(this.groupBy, this.valueEq, [ ...temporary.entries() ]);
  }

  addBatch(batch: [ key: string, value: V[] ][]): MapOfSimple<V> {
    const temporary = new MapOfSimpleMutable<V>(this.groupBy, this.valueEq, this.getRawMapUnsafe);
    for (const b of batch) {
      temporary.addKeyedValues(b[ 0 ], ...b[ 1 ]);
    }
    return new MapOfSimple<V>(this.groupBy, this.valueEq, [ ...temporary.entries() ]);

    // // Deep copy Map
    // const temporary = new Map<string, V[]>(
    //   [ ...this.map.entries() ].map((entry) => [ entry[ 0 ], [ ...entry[ 1 ] ] ])
    // );

    // for (const [ key, list ] of batch) {
    //   // Does key exist already?
    //   const existingList = temporary.get(key);
    //   if (typeof existingList === `undefined`) {
    //     // No, use the batch input as the data for this key
    //     temporary.set(key, list);
    //   } else {
    //     // Yes
    //     existingList.push(...list);
    //   }
    // }
    // return new MapOfSimple<V>(this.groupBy, this.valueEq, [ ...temporary.entries() ]);
  }

  clear(): MapOfSimple<V> {
    return new MapOfSimple<V>(this.groupBy, this.valueEq);
  }

  deleteKeyValue(_key: string, _value: V, eq?: IsEqual<V>): MapOfSimple<V> {
    const eqFunction = eq ?? this.valueEq;
    const entries = [ ...this.map.entries() ];
    const x = entries
      .map((entry): [ key: string, values: readonly V[] ] => {
        const k = entry[ 0 ];
        if (k !== _key) return entry;
        const values: readonly V[] = entry[ 1 ].filter(v => !eqFunction(v, _value));
        return [ k, values ]
      })
      .filter(entry => entry[ 1 ].length > 0)

    return new MapOfSimple<V>(this.groupBy, this.valueEq, x);
  }

  deleteByValue(value: V, eq?: IsEqual<V>): MapOfSimple<V> {
    const entries = [ ...this.map.entries() ];
    const eqFunction = eq ?? this.valueEq;
    const x = entries
      .map((entry) => {
        const key = entry[ 0 ];
        const values = entry[ 1 ].filter((vv) => !eqFunction(vv, value)) as readonly V[];
        return [ key, values ] as [ string, V[] ];
      })
      .filter(entry => entry[ 1 ].length > 0)

    return new MapOfSimple<V>(this.groupBy, this.valueEq, x);
  }

  delete(key: string): MapOfSimple<V> {
    const entries = [ ...this.map.entries() ].filter((entry) => entry[ 0 ] !== key);
    return new MapOfSimple<V>(this.groupBy, this.valueEq, entries);
  }
}

/**
 * A simple immutable map of arrays, without events. It can store multiple values
 * under the same key.
 *
 * For a fancier approaches, consider {@link ofArrayMutable}, {@link ofCircularMutable} or {@link ofSetMutable}.
 *
 * @example
 * ```js
 * let m = mapSimple();
 * m = m.add(`hello`, 1, 2, 3); // Adds numbers under key `hello`
 * m = m.delete(`hello`);       // Deletes everything under `hello`
 *
 * const hellos = m.get(`hello`); // Get list of items under `hello`
 * ```
 *
 * @typeParam V - Type of items
 * @returns New instance
 */
export const ofSimple = <V>(
  groupBy: ToString<V> = defaultKeyer,
  valueEq: IsEqual<V> = isEqualDefault<V>
): IMapOfImmutable<V> => new MapOfSimple<V>(groupBy, valueEq);
