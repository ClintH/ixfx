export * from  './Interfaces.js';

export {mapSet, mapCircular, mapArray} from './MapMultiMutable.js';
export {circularArray} from './CircularArray.js';
export {simpleMapArrayMutable} from './SimpleMapArray.js';
export {setMutable} from './Set.js';
export {stack, stackMutable} from './Stack.js';
export {queue, queueMutable} from './Queue.js';
export {map} from './MapImmutable.js';
export {mapMutable} from './MapMutable.js';
export {MapOfMutableImpl} from './MapMultiMutable.js';

/**
 * Stacks store items in order. 
 * 
 * Stacks and queues can be helpful when it's necessary to process data in order, but each one has slightly different behaviour.
 * 
 * Like a stack of plates, the newest item (on top) is removed
 * before the oldest items (at the bottom). {@link Queues} operate differently, with
 * the oldest items (at the front of the queue) removed before the newest items (at the end of the queue).
 * 
 * Create stacks with {@link stack} or {@link stackMutable}. These return a {@link Stack} or {@link StackMutable} respectively.
 * 
 * The ixfx implementation allow you to set a capacity limit with three {@link DiscardPolicy |policies} for
 * how items are evicted.
 * 
 */
export * as Stacks from './Stack.js';

/** 
 * Arrays are a list of data.
 * 
 * ixfx has several functions for working with arrays.
 * 
 * For arrays of numbers: {@link average}, {@link minMaxAvg}
 * 
 * Randomisation: {@link randomIndex}, {@link randomElement}, {@link shuffle}
 * 
 * Filtering: {@link without}
 * 
 * Changing the shape: {@link groupBy}
 */
export * as Arrays from './Arrays.js';

/**
 * Sets store unique items. 
 * 
 * ixfx's {@link SetMutable} compares items by value rather than reference, unlike the default JS implementation.
 * 
 * Create using {@link setMutable}
 */
export * as Sets from './Set.js';

/**
 * Queues store items in the order in which they are added.
 * 
 * Stacks and queues can be helpful when it's necessary to process data in order, but each one has slightly different behaviour.
 * 
 * Like lining up at a bakery, the oldest items (at the front of the queue) are removed 
 * before the newest items (at the end of the queue). This is different to {@link Stacks},
 * where the newest item (on top) is removed before the oldest items (at the bottom).
 * 
 * The ixfx implementations allow you to set a capacity limit with three {@link DiscardPolicy |policies} for
 * how items are evicted.
 * 
 * Create queues with {@link queue} or {@link queueMutable}. These return a {@link Queue} or {@link QueueMutable} respectively.
 */
export * as Queues from './Queue.js';

/**
 * Maps associate keys with values. Several helper functions are provided
 * for working with the standard JS Map class.
 * 
 * ixfx also includes {@link MapMutable}, {@link MapImmutable}
 */
export * as Maps from './Map.js';
