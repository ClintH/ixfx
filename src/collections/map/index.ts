export type GetOrGenerate<K, V, Z> = (key: K, args?: Z) => Promise<V>;
export { create as expiringMap, ExpiringMap } from './ExpiringMap.js';
export type {
  ExpiringMapEvent,
  ExpiringMapEvents,
  Opts as ExpiringMapOpts,
} from './ExpiringMap.js';

export { map, type IMapImmutable } from './Map.js';
export { mapMutable, type MapMutable } from './MapMutable.js';
export * from './MapMulti.js';
export * from './MapOfCircularMutable.js';
export * from './MapFns.js';
