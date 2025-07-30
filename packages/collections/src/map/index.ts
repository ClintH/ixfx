export { create as expiringMap } from './expiring-map.js';
export type {
  ExpiringMapEvent,
  ExpiringMapEvents,
  Opts as ExpiringMapOpts,
} from './expiring-map.js';

export type { IMapOf } from './imap-of.js';
export { immutable, type IMapImmutable } from './map.js';
export { mutable, type IMapMutable } from './map-mutable.js';
export { ofSetMutable } from './map-of-set-mutable.js';
export { ofCircularMutable } from './map-of-circular-mutable.js';
export type { MapCircularOpts } from './map-of-circular-mutable.js';
export type { IMapOfMutable } from './imap-of-mutable.js';
export type { IMapOfImmutable } from './imap-of-immutable.js';
export type { MapArrayOpts } from './map-of-array-mutable.js';
export { NumberMap } from './number-map.js';
export * from './map-multi.js';

// Re-export from core
export * from '@ixfx/core/maps';

//export type { IDictionary as IMappish, IWithEntries } from '../../data/maps/IMappish.js';

