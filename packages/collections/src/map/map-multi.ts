import type { IsEqual } from '@ixfx/core';
export { ofArrayMutable } from './map-of-array-mutable.js';
export {
  ofSimpleMutable as mapOfSimpleMutable
} from './map-of-simple-mutable.js';
export * from './map-of-simple.js';
export { MapOfMutableImpl } from './map-of-multi-impl.js';
export type {
  IMapOfMutableExtended,
  MapArrayEvents,
} from './imap-of-mutable-extended.js';


export * from './map-multi-fns.js';

/**
 * @private
 */
export type MultiValue<V, M> = {
  get name(): string;
  has(source: M, value: V, eq: IsEqual<V>): boolean;
  addKeyedValues(destination: M | undefined, values: Iterable<V>): M;
  toArray(source: M): readonly V[];
  iterable(source: M): IterableIterator<V>;
  find(source: M, predicate: (v: V) => boolean): V | undefined;
  filter(source: M, predicate: (v: V) => boolean): Iterable<V>; // ReadonlyArray<V>
  without(source: M, value: V): readonly V[];
  count(source: M): number;
  //[Symbol.iterator](source:M, key:string):IterableIterator<V>;//[source:M, value:V]>
};

export type MapMultiOpts<V> = {
  /**
   * Returns a group for values added via `addValue`. Eg. maybe you want to
   * group values in the shape `{name: 'Samantha' city: 'Copenhagen'}` by city:
   *
   * ```
   * const opts = {
   *  groupBy: (v) => v.city
   * }
   * ```
   *
   * @type {(ToString<V>|undefined)}
   */
  readonly groupBy?: ((value: V) => string) | undefined;
};

export type MapSetOpts<V> = MapMultiOpts<V> & {
  readonly hash: (value: V) => string;
};
