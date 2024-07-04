export {
  circularArray,
  type ICircularArray as CircularArray,
} from './CircularArray.js';
export * as Trees from './tree/index.js';
export type * from './Types.js';

/**
 * Stacks store items in order.
 *
 * Stacks and queues can be helpful for processing data in order. They each have slightly different behaviour.
 *
 * Like a stack of plates, the newest item (on top) is removed
 * before the oldest items (at the bottom). {@link Queues} operate differently, with
 * the oldest items (at the front of the queue) removed before the newest items (at the end of the queue).
 *
 * Create stacks with {@link Stacks.immutable} or {@link Stacks.mutable}. These return a {@link IStackImmutable} or {@link IStackMutable} respectively.
 *
 * The ixfx implementation allow you to set a capacity limit with three {@link StackDiscardPolicy |policies} for
 * how items are evicted.
 *
 */
export * as Stacks from './stack/index.js';

export { StackMutable } from './stack/StackMutable.js';
export { StackImmutable } from './stack/StackImmutable.js';

/**
 * Sets store unique items.
 *
 * ixfx's {@link ISetImmutable} (or {@link ISetMutable}) compares items by value rather than reference, unlike the default JS implementation.
 *
 * Create using {@link Sets.immutable} or {@link Sets.mutable}
 */
export * as Sets from './set/index.js';


export { SetStringMutable } from './set/SetMutable.js';
export { SetStringImmutable } from './set/SetImmutable.js';


/**
 * Queues store items in the order in which they are added.
 *
 * Stacks and queues can be helpful when it's necessary to process data in order, but each one has slightly different behaviour.
 *
 * Like lining up at a bakery, the oldest items (at the front of the queue) are removed
 * before the newest items (at the end of the queue). This is different to {@link Stacks},
 * where the newest item (on top) is removed before the oldest items (at the bottom).
 *
 * The ixfx implementations allow you to set a capacity limit with three {@link QueueDiscardPolicy | policies} for
 * how items are evicted.
 *
 * Create queues with {@link Queues.immutable} or {@link Queues.mutable}. These return a {@link IQueueImmutable} or {@link IQueueMutable} respectively.
 */
export * as Queues from './queue/index.js';

export { QueueMutable } from './queue/QueueMutable.js';
export { QueueImmutable } from './queue/QueueImmutable.js';

/**
 * Maps associate keys with values. Several helper functions are provided
 * for working with the standard JS Map class.
 *
 * Import example
 * ```js
 * import { Maps } from 'https://unpkg.com/ixfx/dist/collections.js';
 * ```
 * 
 * ixfx also includes {@link Maps.IMapMutable}, {@link Maps.IMapImmutable}
 *
 * Overview:
 * * {@link getOrGenerate}: Solves a common scenario of wanting a value by a particular key, or generating it if it doesn't exist
 * * {@link filter}: Yields values in map that match a predicate
 * * {@link find}: Finds the first value that matches a predicate, or _undefined_ if nothing found
 * * {@link hasAnyValue}: Searches through all keys, returning true if any occurence of _value_ was found
 *
 * Transformations:
 * * {@link toArray}: Returns the values of the map as an array
 * * {@link mapToArray}: Applies a function to convert a map's values to an array
 * * {@link toObject}: Coverts a Map to a plain object, useful for JSON serialising.
 * * {@link mapToObjectTransform}: Converts a map to a plain object, but applying a function to values
 * * {@link transformMap}: Like `Array.map`, but for Maps. Useful for generating a map as a transform of an input map.
 * * {@link zipKeyValue}: Given an array of keys and values, combines them together into a map
 */
export * as Maps from './map/index.js';


