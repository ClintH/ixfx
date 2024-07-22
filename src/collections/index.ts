export {
  circularArray,
  type ICircularArray as CircularArray,
} from './CircularArray.js';
export * as Trees from './tree/index.js';
export type * from './Types.js';

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


export { SetStringMutable } from './set/SetMutable.js';
export { SetStringImmutable } from './set/SetImmutable.js';


/**
 * Queues store items in the order in which they are added.
 */
export * as Queues from './queue/index.js';

export { QueueMutable } from './queue/QueueMutable.js';
export { QueueImmutable } from './queue/QueueImmutable.js';

/**
 * Maps associate keys with values.
 *
 * Import example
 * ```js
 * import { Maps } from 'https://unpkg.com/ixfx/dist/collections.js';
 * ```
 */
export * as Maps from './map/index.js';


export * as Graphs from './graphs/index.js';

export { Table } from './Table.js';