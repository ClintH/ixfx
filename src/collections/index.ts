export * from  './Interfaces.js';

export {mapSet, mapCircularMutable, mapArray} from './MapMultiMutable.js';
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
 * Arrays are a list of data. ixfx provides a number of functions for working with arrays in an immutable manner.
 * This means that the input array is not changed.
 * 
 * For arrays of numbers:
 * * {@link average}, {@link max}, {@link min}, {@link total}: Calculate average/max/min/total
 * * {@link averageWeighted}: Calculate average, but applies a weighting function, eg to favour items at beginning of array
 * * {@link minMaxAvg}: Find smallest, largest and average
 * * {@link maxIndex}, {@link minIndex}: Return index of largest/smallest value
 * * {@link dotProduct}: Returns the dot-product between two arrays
 * * {@link weight}: Applies a weighting function to all values based on their index
 * 
 * Randomisation
 * * {@link randomIndex}: Return a random array index
 * * {@link randomElement}: Return a random value
 * * {@link randomPluck}: Remove a random element from an array, returning it and the new array
 * * {@link shuffle}: Returns a randomly-sorted copy of arra
 * 
 * Finding/accessing
 * * {@link filterBetween}: Same as `Array.filter` but only looks within a specified index range
 * * {@link sample}: Returns a new array with a random sampling of input
 * * {@link areValuesIdentical}: Returns true if all the values in the array are identical
 * 
 * Changing the shape
 * * {@link ensureLength}: Returns a copy of array with designated length, either padding it out or truncating as necessary
 * * {@link groupBy}: Groups data into a new Map
 * * {@link remove}: Remove an item by index
 * * {@link without}: Returns an array with specified value omitted
 * * {@link zip}: Groups together elements from several arrays based on their index
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
 * * {@link mapToObj}: Coverts a Map to a plain object, useful for JSON serialising.
 * * {@link mapToObjTransform}: Converts a map to a plain object, but applying a function to values
 * * {@link transformMap}: Like `Array.map`, but for Maps. Useful for generating a map as a transform of an input map.
 * * {@link zipKeyValue}: Given an array of keys and values, combines them together into a map
 */
export * as Maps from './Map.js';
