export { create as expiringMap, ExpiringMap } from './ExpiringMap.js';
export type {
  ExpiringMapEvent,
  ExpiringMapEvents,
  Opts as ExpiringMapOpts,
} from './ExpiringMap.js';

export type { IMapOf } from './IMapOf.js';
export { immutable, type IMapImmutable } from './Map.js';
export { mutable, type IMapMutable } from './MapMutable.js';
export { ofSetMutable } from './MapOfSetMutable.js';
export { ofCircularMutable } from './MapOfCircularMutable.js';
export type { MapCircularOpts } from './MapOfCircularMutable.js';
export type { IMapOfMutable } from './IMapOfMutable.js';
export type { MapArrayOpts } from './MapOfArrayMutable.js';
export { NumberMap } from './NumberMap.js';
export * from './MapMulti.js';

export type { IDictionary as IMappish, IWithEntries } from '../../data/maps/IMappish.js';
export * from '../../data/maps/MapFns.js';
export * from '../../data/maps/GetOrGenerate.js';