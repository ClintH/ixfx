import type { IsEqual } from '../../util/IsEqual.js';
export { ofArrayMutable } from './MapOfArrayMutable.js';
export {
  ofSimpleMutable as mapOfSimpleMutable
} from './MapOfSimpleMutable.js';
export * from './MapOfSimple.js';
export { MapOfMutableImpl } from './MapOfMultiImpl.js';
export type {
  IMapOfMutableExtended,
  MapArrayEvents,
} from './IMapOfMutableExtended.js';


export * from './MapMultiFns.js';

/**
 * @private
 */
export type MultiValue<V, M> = {
  get name(): string;
  has(source: M, value: V, eq: IsEqual<V>): boolean;
  add(destination: M | undefined, values: Iterable<V>): M;
  toArray(source: M): ReadonlyArray<V>;
  iterable(source: M): IterableIterator<V>;
  find(source: M, predicate: (v: V) => boolean): V | undefined;
  filter(source: M, predicate: (v: V) => boolean): Iterable<V>; // ReadonlyArray<V>
  without(source: M, value: V): ReadonlyArray<V>;
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
