export {
  circularArray,
  type ICircularArray as CircularArray,
} from './circular-array.js';
export * as Trees from './tree/index.js';
export * from './tree/types.js';

export type * from './types.js';


/**
 * Stacks store items in order, like a stack of plates.
 */
export * as Stacks from './stack/index.js';
export { StackMutable } from './stack/StackMutable.js';
export { StackImmutable } from './stack/StackImmutable.js';

/**
 * Sets store unique items.
 */
export * as Sets from './set/index.js';
export * from './set/Types.js';
export { SetStringMutable } from './set/set-mutable.js';
export { SetStringImmutable } from './set/SetImmutable.js';
export type { ISetImmutable } from './set/ISetImmutable.js';
export * from './set/ISetMutable.js';


/**
 * Queues store items in the order in which they are added.
 */
export * as Queues from './queue/index.js';
export { QueueMutable } from './queue/queue-mutable.js';
export { QueueImmutable } from './queue/queue-immutable.js';
export type * from './queue/queue-types.js';

/**
 * Maps associate keys with values.
 *
 * Import example
 * ```js
 * import { Maps } from 'https://unpkg.com/ixfx/dist/collections.js';
 * ```
 */
export * as Maps from './map/index.js';
export { ExpiringMap } from './map/expiring-map.js';
export { MapOfSimpleMutable } from './map/map-of-simple-mutable.js';

export * as Graphs from './graph/index.js';

export { Table } from './table.js';