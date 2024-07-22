/**
 * Work with bipolar values (-1...1)
 * 
 * Import:
 * ```js
 * import { Bipolar } from 'https://unpkg.com/ixfx/dist/data.js';
 * ```
 * 
 * Overview:
 * * {@link immutable}: Immutable wrapper around a value
 * * {@link clamp}: Clamp on -1..1 scale
 * * {@link scale}: Scale a value to -1..1
 * * {@link toScalar}: Convert -1..1 to 0..1
 * * {@link fromScalar}: Convert from 0..1 to -1..1
 * * {@link towardZero}: Nudge a bipolar value towards zero
 */
export * as Bipolar from './Bipolar.js';

export * from './Clamp.js';
export * from './Compare.js';
export * as Correlate from './Correlate.js';
export * from './Flip.js';
export * from './FrequencyMutable.js';
export * from './Interpolate.js';
export * from './IntervalTracker.js';
export * from './KeysToNumbers.js';
export * from './MapObject.js';
export * from './MovingAverage.js';
export * from './NumberTracker.js';
/**
 * Normalise module
 * * {@link array}: Normalises the contents of an array of known values.
 * * {@link stream}: Normalises a stream of unknown values.
 */
export * as Normalise from './Normalise.js';

/**
 * Means of accessing, creating and comparing objects
 * based on 'paths'. This is useful for serialisation.
 * 
 */
export * as Pathed from './Pathed.js'
//export * from './MonitorChanges.js';
export * from './PointTracker.js';
export * as Pool from './Pool.js';
export * from './PrimitiveTracker.js';
export * as Process from './Process.js';
export * from './Proportion.js';
export * from './Pull.js';
export * from './Resolve.js';
export * from './ResolveFields.js';
export * from './Scale.js';
export * from './Softmax.js';
export * from './Table.js';
export * from './TrackedValue.js';
export * from './TrackerBase.js';
export * from './TrackUnique.js';
export * from './Types.js';
export * from './Util.js';
export * from './Wrap.js';
export * as Graphs from './graphs/index.js'

export const piPi = Math.PI * 2;

/**
 * Arrays are a list of data. ixfx provides a number of functions for working with arrays in an immutable manner.
 * This means that the input array is not changed.
 *
 * Import example:
 * ```js
 * import { minMaxAvg } from 'https://unpkg.com/ixfx/dist/arrays.js';
 * ```
 * 
 * For arrays of numbers:
 * * {@link minMaxAvg}: Find smallest, largest and average
 * * See also {@link Numbers} module for working with numbers in general.
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
 *
 * Changing the shape
 * * {@link ensureLength}: Returns a copy of array with designated length, either padding it out or truncating as necessary
 * * {@link groupBy}: Groups data into a new Map
 * * {@link interleave}: Flattens several arrays into one, interleaving their values.
 * * {@link remove}: Remove an item by index
 * * {@link without}: Returns an array with specified value omitted
 * * {@link zip}: Groups together elements from several arrays based on their index
 */
export * as Arrays from './arrays/index.js';

/**
 * Maps associate keys with values. Several helper functions are provided
 * for working with the standard JS Map class.
 *
 * Import example
 * ```js
 * import { Maps } from 'https://unpkg.com/ixfx/dist/data.js';
 * ```
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
 * 
 * 
 * See also ixfx's Collections module for custom map implementations.
 */
export * as Maps from './maps/index.js'