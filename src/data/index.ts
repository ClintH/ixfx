
export * from './Compare.js';
export * as Correlate from './Correlate.js';
export * from './CloneFromFields.js';
export * from './KeysToNumbers.js';
export * from './MapObject.js';
export * from './Filters.js';

/**
 * Means of accessing, creating and comparing objects
 * based on 'paths'. This is useful for serialisation.
 * 
 */
export * as Pathed from './Pathed.js'
export * as Pool from './Pool.js';
export * as Process from './Process.js';
export * from './Pull.js';
export * from './Resolve.js';
export * from './ResolveFields.js';
export * from './Types.js';
export * from './Util.js';
export * from './RecordMerge.js';
export const piPi = Math.PI * 2;

/**
 * These array functions do not change the input data, unless noted.
 * 
 * Import example:
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/data.js';
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
 * Comparing
 * * {@link contains}: compare overlap of arrays
 * * {@link isEqual}: _true_ if two arrays contain same values at same locations
 * * {@link unique}: Returns values from two arrays, without duplicates.
 * 
 * Iterating
 * * {@link pairwise}: loop in sets of two
 * 
 * Finding/accessing
 * * {@link cycle}: every time function is called, the next item from array is returned
 * * {@link filterBetween}: Same as `Array.filter` but only looks within a specified index range
 * * {@link filterAB}: Like array.filter, but returns two arrays. One containing values that the predicate gives _true_, another for _false.
 * * {@link sample}: Returns a new array with a random sampling of input
*  * {@link until}: Returns items from input until predicate returns _true_
* 
* Sort
* * {@link sortByNumericProperty}: Sort objects by a given numeric field
* * {@link sortByProperty}: Sort objects by a given field
* 
* Duplicates
* * {@link containsDuplicateValues}: _true_ if array has at least one value is repeated
 * * {@link containsDuplicateInstances}: _true_ if array has at least one object appears twice
 * * {@link isContentsTheSame}: _true_ if all values in array are the same
 * 
 * Changing the shape
 * * {@link chunks}: Chunk into sub-arrays
 * * {@link ensureLength}: Returns a copy of array with designated length, either padding it out or truncating as necessary
 * * {@link groupBy}: Groups data into a new Map
 * * {@link flatten}
 * * {@link filterBetween}: Like array.filter, but only checks within given range
 * * {@link interleave}: Flattens several arrays into one, interleaving their values.
 * * {@link remove}: Remove an item by index
 * * {@link pairwiseReduce}: Reducer that operates in pairwise fashion
 * * {@link mergeByKey}+: Merges two arrays left-to-right, using a reconcile function
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
 * Adding
 * * {@link addKeepingExisting} Adds items to a map only if their key does not exist already
 * * {@link addObject}: Adds an object, assuming each top-level property of an object is a key
 * * {@link getOrGenerate}: Solves a common scenario of wanting a value by a particular key, or generating it if it doesn't exist
 * 
 * Deleting
 * * {@link deleteByValue}
 * 
 * Finding/Iterating
 * * {@link filter}: Yield values that return _true_ for predicate
 * * {@link find}: Finds the first value that matches a predicate, or _undefined_ if nothing found
 * * {@link hasAnyValue}: Searches through all keys, returning true if any occurence of _value_ was found
 * * {@link hasKeyValue}: _true_ if value is stored under a key
 * * {@link firstEntryByPredicate}: Returns first entry which matches predicate
 * * {@link firstEntryByValue}: Returns first entry where value matches
 * * {@link getClosestIntegerKey}: Assuming numeric keys, find the closest to a target value
 * * {@link getFromKeys}: Given an iterable of keys, returns the first value where the key is present
 * * {@link some}: _true_ if predicate is true for any value in map
 * 
 * Transforming values
 * * {@link mapToArray}: Applies a function to convert a map's values to an array
 * * {@link mapToObjectTransform}: Converts a map to a plain object, but applying a function to values
 * * {@link transformMap}: Like `Array.map`, but for Maps. Useful for generating a map as a transform of an input map.
 * 
 * Creating
 * * {@link fromIterable}: Generates a map from an interable
 * * {@link fromObject}
 * * {@link zipKeyValue}: Given an array of keys and values, combines them together into a map
 * 
 * To some other data
 * * {@link toArray}: Returns the values of the map as an array
 * * {@link toObject}: Coverts a Map to a plain object, useful for JSON serialising.
 * 
 * Etc
 * * {@link sortByValue}: Returns a sorted set of entries
 * * {@link sortByValueProperty}: Returns a sorted set of entries
 * 
 * See also ixfx's Collections module for custom map implementations.
 */
export * as Maps from './maps/index.js'
