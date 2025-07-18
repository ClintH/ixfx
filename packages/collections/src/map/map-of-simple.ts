import type { ToString, IsEqual } from '@ixfx/core';
import type { IMapOf } from './imap-of.js';
import type { IMapOfImmutable } from './imap-of-immutable.js';
import { defaultKeyer, isEqualDefault } from '@ixfx/core';
import { MapOfSimpleBase } from './map-of-simple-base.js';

/**
 * Simple immutable MapOf
 */
export class MapOfSimple<V>
  extends MapOfSimpleBase<V>
  implements IMapOf<V>, IMapOfImmutable<V> {
  addKeyedValues(key: string, ...values: readonly V[]): IMapOfImmutable<V> {
    //const asEntries = values.map(v => [key, v]) as [string, V[]][];
    //return this.addBatch(asEntries);
    return this.addBatch([ [ key, values ] ]);
  }

  addValue(...values: readonly V[]): IMapOfImmutable<V> {
    const asEntries = values.map((v) => [ this.groupBy(v), v ]) as [
      string,
      V[]
    ][];
    return this.addBatch(asEntries);
  }

  //eslint-disable-next-line functional/prefer-immutable-types
  addBatch(entries: [ key: string, value: readonly V[] ][]): IMapOfImmutable<V> {
    // Deep copy Map
    const temporary = new Map<string, V[]>(
      [ ...this.map.entries() ].map((e) => [ e[ 0 ], [ ...e[ 1 ] ] ])
    );

    for (const [ key, list ] of entries) {
      // Does key exist already
      const existingList = temporary.get(key);
      if (typeof existingList === `undefined`) {
        // No, use the batch input as the data for this key
        // @ts-expect-error
        temporary.set(key, list);
      } else {
        // Yes
        existingList.push(...list);
      }
    }
    return new MapOfSimple<V>(this.groupBy, this.valueEq, [ ...temporary.entries() ]);
  }

  clear(): IMapOfImmutable<V> {
    return new MapOfSimple<V>(this.groupBy, this.valueEq);
  }

  deleteKeyValue(_key: string, _value: V): IMapOfImmutable<V> {
    throw new Error(`Method not implemented.`);
  }

  deleteByValue(value: V, eq?: IsEqual<V>): IMapOfImmutable<V> {
    const entries = [ ...this.map.entries() ];
    const eqFunction = eq ?? this.valueEq;
    const x = entries.map((entry) => {
      const key = entry[ 0 ];
      const values = entry[ 1 ].filter((vv) => !eqFunction(vv, value)) as readonly V[];
      return [ key, values ] as [ string, V[] ];
    });
    return new MapOfSimple<V>(this.groupBy, this.valueEq, x);
  }

  delete(key: string): IMapOfImmutable<V> {
    const entries = [ ...this.map.entries() ].filter((e) => e[ 0 ] !== key);
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
