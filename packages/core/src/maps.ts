import { defaultComparer } from './comparers.js';
import { isEqualDefault, type IsEqual } from './is-equal.js';
import {
  toStringDefault,
} from './to-string.js';
import type { IDictionary, IWithEntries, ToString } from './types.js';

/**
 * Gets the closest integer key to `target` in `data`.
 * * Requires map to have numbers as keys, not strings
 * * Math.round is used for rounding `target`.
 *
 * Examples:
 * ```js
 * // Assuming numeric keys 1, 2, 3, 4 exist:
 * getClosestIntegerKey(map, 3);    // 3
 * getClosestIntegerKey(map, 3.1);  // 3
 * getClosestIntegerKey(map, 3.5);  // 4
 * getClosestIntegerKey(map, 3.6);  // 4
 * getClosestIntegerKey(map, 100);  // 4
 * getClosestIntegerKey(map, -100); // 1
 * ```
 * @param data Map
 * @param target Target value
 * @returns
 */
export const getClosestIntegerKey = (
  data: ReadonlyMap<number, unknown>,
  target: number
): number => {
  target = Math.round(target);
  if (data.has(target)) {
    return target;
  } else {
    let offset = 1;
    while (offset < 1000) {
      if (data.has(target - offset)) return target - offset;
      else if (data.has(target + offset)) return target + offset;
      offset++;
    }
    throw new Error(`Could not find target ${ target.toString() }`);
  }
};

/**
 * Returns the first value in `data` that matches a key from `keys`.
 * ```js
 * // Iterate, yielding: `a.b.c.d`, `b.c.d`, `c.d`, `d`
 * const keys = Text.segmentsFromEnd(`a.b.c.d`);
 * // Gets first value that matches a key (starting from most precise)
 * const value = findBySomeKey(data, keys);
 * ```
 * @param data 
 * @param keys 
 * @returns 
 */
export const findBySomeKey = <T>(data: ReadonlyMap<string, T>, keys: Iterable<string>): T | undefined => {
  for (const key of keys) {
    if (data.has(key)) return data.get(key);
  }
}

/**
 * Returns true if map contains `value` under `key`, using `comparer` function. Use {@link hasAnyValue} if you don't care
 * what key value might be under.
 *
 * Having a comparer function is useful to check by value rather than object reference.
 *
 * @example Find key value based on string equality
 * ```js
 * hasKeyValue(map,`hello`, `samantha`, (a, b) => a === b);
 * ```
 * @param map Map to search
 * @param key Key to search
 * @param value Value to search
 * @param comparer Function to determine match. By default uses === comparison.
 * @returns True if key is found
 */
export const hasKeyValue = <K, V>(
  map: ReadonlyMap<K, V>,
  key: K,
  value: V,
  comparer: IsEqual<V> = isEqualDefault
): boolean => {
  if (!map.has(key)) return false;
  const values = [ ...map.values() ];
  return values.some((v) => comparer(v, value));
};

/**
 * Deletes all key/values from map where value matches `value`,
 * with optional comparer. Mutates map.
 *
 * ```js
 * // Compare fruits based on their colour property
 * const colourComparer = (a, b) => a.colour === b.colour;
 *
 * // Deletes all values where .colour = `red`
 * deleteByValueCompareMutate(map, { colour: `red` }, colourComparer);
 * ```
 * @param map
 * @param value
 * @param comparer Uses === equality by default. Use isEqualValueDefault to compare by value
 */
export const deleteByValueCompareMutate = <K, V>(
  map: Map<K, V>,
  value: V,
  comparer: IsEqual<V> = isEqualDefault
) => {
  for (const entry of map.entries()) {
    if (comparer(entry[ 1 ], value)) {
      map.delete(entry[ 0 ]);
    }
  }
};

/**
 * Finds first entry by iterable value. Expects a map with an iterable as values.
 *
 * ```js
 * const map = new Map();
 * map.set('hello', 'a');
 * map.set('there', 'b');
 *
 * const entry = findEntryByPredicate(map, (value, key) => {
 *  return (value === 'b');
 * });
 * // Entry is: ['there', 'b']
 * ```
 *
 * An alternative is {@link findEntryByValue} to search by value.
 * @param map Map to search
 * @param predicate Filter function returns true when there is a match of value
 * @returns Entry, or _undefined_ if `filter` function never returns _true_
 */
export const findEntryByPredicate = <K, V>(
  map: IWithEntries<K, V>,
  predicate: (value: V, key: K) => boolean
): readonly [ key: K, value: V ] | undefined => {
  for (const entry of map.entries()) {
    if (predicate(entry[ 1 ], entry[ 0 ])) return entry;
  }
};

/**
 * Finds first entry by value.
 *
 * ```js
 * const map = new Map();
 * map.set('hello', 'a');
 * map.set('there', 'b');
 *
 * const entry = findEntryByValue(map, 'b');
 * // Entry is: ['there', 'b']
 * ```
 *
 * Uses JS's === comparison by default. Consider using {@link isEqualValueDefault} to match by value.
 * An alternative is {@link findEntryByValue} to search by predicate function.
 * @param map Map to search
 * @param value Value to seek
 * @param isEqual Filter function which checks equality. Uses JS comparer by default.
 * @returns Entry, or _undefined_ if `value` not found.
 */
export const findEntryByValue = <K, V>(
  map: IWithEntries<K, V>,
  value: V,
  isEqual: IsEqual<V> = isEqualDefault
): readonly [ key: K, value: V ] | undefined => {
  for (const entry of map.entries()) {
    if (isEqual(entry[ 1 ], value)) return entry;
  }
};



/**
 * Adds items to a map only if their key doesn't already exist
 *
 * Uses provided {@link ToString} function to create keys for items. Item is only added if it doesn't already exist.
 * Thus the older item wins out, versus normal `Map.set` where the newest wins.
 *
 * Returns a copy of the input map.
 * @example
 * ```js
 * const map = new Map();
 * const peopleArray = [ _some people objects..._];
 * addKeepingExisting(map, p => p.name, ...peopleArray);
 * ```
 * @param set
 * @param hasher
 * @param values
 * @returns
 */
// export const addKeepingExisting = <V>(
//   set: ReadonlyMap<string, V> | undefined,
//   hasher: ToString<V>,
//   ...values: readonly V[]
// ) => {
//   const s = set === undefined ? new Map() : new Map(set);
//   for (const v of values) {
//     const hashResult = hasher(v);
//     if (s.has(hashResult)) continue;
//     s.set(hashResult, v);
//   }
//   return s;
// };

/**
 * Mutates `map`, adding each value to it using a
 * function to produce a key. Use {@link addValue} for an immutable version.
 * ```
 * const map = new Map();
 * addValueMutate(map, v=>v.name, { name:`Jane`, size:10 }, { name:`Bob`, size: 9 });
 * // Map consists of entries:
 * // [ `Jane`, { name:`Jane`, size:10 } ],
 * // [ `Bob` { name:`Bob`, size: 9 } ]
 * ```
 * 
 * Uses {@link addValueMutator} under the hood.
 * @param map Map to modify. If _undefined_, a new map is created
 * @param hasher Function to generate a string key for a given object value
 * @param values Values to add
 * @param collisionPolicy What to do if the key already exists
 * @returns Map instance
 */
export const addValueMutate = <V>(
  map: Map<string, V> | undefined,
  hasher: ToString<V>,
  collisionPolicy: `overwrite` | `skip` | `throw`,
  ...values: readonly V[]
) => {
  const m = map ?? new Map<string, V>();
  const f = addValueMutator(m, hasher, collisionPolicy);
  f(...values);
  return m;
};

/**
 * Adds values to a map, returning a new, modified copy and leaving the original
 * intact.
 * 
 * Use {@link addValueMutate} for a mutable 
 * @param map Map to start with, or _undefined_ to automatically create a map 
 * @param hasher Function to create keys for values
 * @param collisionPolicy What to do if a key already exists
 * @param values Values to add
 * @returns A new map containing values
 */
export const addValue = <V>(
  map: Map<string, V> | ReadonlyMap<string, V> | undefined,
  hasher: ToString<V>,
  collisionPolicy: `overwrite` | `skip` | `throw`,
  ...values: readonly V[]
) => {
  const m = map === undefined ? new Map<string, V>() : new Map<string, V>(map);
  for (const v of values) {
    const hashResult = hasher(v);
    if (collisionPolicy !== `overwrite`) {
      if (m.has(hashResult)) {
        if (collisionPolicy === `throw`) throw new Error(`Key '${ hashResult }' already in map`);
        if (collisionPolicy === `skip`) continue;
      }
    }
    m.set(hashResult, v);
  }
  return m;
};

/**
 * Returns a function that adds values to a map, using a hashing function to produce a key.
 * Use {@link addValueMutate} if you don't need a reusable function.
 * 
 * ```js
 * const map = new Map(); // Create map
 * const mutate = addValueMutator(map, v=>v.name); // Create a mutator using default 'overwrite' policy
 * mutate( { name:`Bob`, size:10 }, { name: `Alice`, size: 2 }); // Add values to map
 * mutate( {name: `Bob`, size: 11 }); // Change the value stored under key `Bob`.
 * map.get(`Bob`); // { name: `Bob`, size: 11 }
 * ```
 * 
 * The 'collision policy' determines what to do if the key already exists. The default behaviour
 * is to overwrite the key, just as Map.set would.
 * ```js
 * const map = new Map();
 * const mutate = addValueMutator(map, v=>v.name, `skip`);
 * mutate( { name:`Bob`,size:10 }, { name: `Alice`, size: 2 }); // Add values to map
 * mutate( { name:`Bob`, size: 20 }); // This value would be skipped because map already contains 'Bob'
 * map.get(`Bob`); // { name: `Bob`, size: 10 }
 * ``` 
 *
 * @param map Map to modify
 * @param hasher Hashing function to make a key for a value
 * @param collisionPolicy What to do if a value is already stored under a key
 * @returns Function
 */
export const addValueMutator = <V>(
  map: Map<string, V>,
  hasher: ToString<V>,
  collisionPolicy: `overwrite` | `skip` | `throw` = `overwrite`
) => {
  return (...values: readonly V[]) => {
    for (const v of values) {
      const hashResult = hasher(v);
      if (collisionPolicy !== `overwrite`) {
        if (map.has(hashResult)) {
          if (collisionPolicy === `throw`) throw new Error(`Key '${ hashResult }' already in map`);
          if (collisionPolicy === `skip`) continue;
        }
      }
      map.set(hashResult, v);
    }
    return map;
  }
};


/**
 * Returns a array of entries from a map, sorted by value.
 *
 * ```js
 * const m = new Map();
 * m.set(`4491`, { name: `Bob` });
 * m.set(`2319`, { name: `Alice` });
 *
 * // Compare by name
 * const comparer = (a, b) => defaultComparer(a.name, b.name);
 *
 * // Get sorted values
 * const sorted = Maps.sortByValue(m, comparer);
 * ```
 *
 * `sortByValue` takes a comparison function that should return -1, 0 or 1 to indicate order of `a` to `b`. If not provided, {@link Util.defaultComparer} is used.
 * @param map
 * @param comparer
 * @returns
 */
export const sortByValue = <K, V>(
  map: ReadonlyMap<K, V>,
  comparer?: (a: V, b: V) => number
) => {
  const f = comparer ?? defaultComparer;
  return [ ...map.entries() ].sort((a, b) => f(a[ 1 ], b[ 1 ]));
};


/**
 * Returns an array of entries from a map, sorted by a property of the value
 *
 * ```js
 * const m = new Map();
 * m.set(`4491`, { name: `Bob` });
 * m.set(`2319`, { name: `Alice` });
 * const sorted = sortByValueProperty(m, `name`);
 * ```
 * @param map Map to sort
 * @param property Property of value
 * @param compareFunction Comparer. If unspecified, uses a default.
 */
export const sortByValueProperty = <K, V, Z>(
  map: ReadonlyMap<K, V>,
  property: string,
  compareFunction?: (a: Z, b: Z) => number
) => {
  const cfn = typeof compareFunction === `undefined` ? defaultComparer : compareFunction;
  return [ ...map.entries() ].sort((aE, bE) => {
    const a = aE[ 1 ];
    const b = bE[ 1 ];
    return cfn(a[ property ] as Z, b[ property ] as Z);
  });
};
/**
 * Returns _true_ if any key contains `value`, based on the provided `comparer` function. Use {@link hasKeyValue}
 * if you only want to find a value under a certain key.
 *
 * Having a comparer function is useful to check by value rather than object reference.
 * @example Finds value where name is 'samantha', regardless of other properties
 * ```js
 * hasAnyValue(map, {name:`samantha`}, (a, b) => a.name === b.name);
 * ```
 *
 * Works by comparing `value` against all values contained in `map` for equality using the provided `comparer`.
 *
 * @param map Map to search
 * @param value Value to find
 * @param comparer Function that determines matching. Should return true if `a` and `b` are considered equal.
 * @returns True if value is found
 */
export const hasAnyValue = <K, V>(
  map: ReadonlyMap<K, V>,
  value: V,
  comparer: IsEqual<V>
): boolean => {
  const entries = [ ...map.entries() ];
  return entries.some((kv) => comparer(kv[ 1 ], value));
};

/**
 * Returns values where `predicate` returns true.
 *
 * If you just want the first match, use `find`
 *
 * @example All people over thirty
 * ```js
 * // for-of loop
 * for (const v of filterValues(people, person => person.age > 30)) {
 *
 * }
 * // If you want an array
 * const overThirty = Array.from(filterValues(people, person => person.age > 30));
 * ```
 * @param map Map
 * @param predicate Filtering predicate
 * @returns Values that match predicate
 */

export function* filterValues<V>(
  map: ReadonlyMap<string, V>,
  predicate: (v: V) => boolean
) {
  for (const v of map.values()) {
    if (predicate(v)) yield v;
  }
}

//export const filter = <V>(map:ReadonlyMap<string, V>, predicate:(v:V) => boolean):ReadonlyArray<V> => Array.from(map.values()).filter(predicate);

/**
 * Copies data to an array
 * @param map
 * @returns
 */
export const toArray = <V>(map: ReadonlyMap<string, V>): readonly V[] =>
  [ ...map.values() ];


/**
 * Returns a Map from an iterable. By default throws an exception
 * if iterable contains duplicate values.
 *
 * ```js
 * const data = [
 *  { fruit: `granny-smith`, family: `apple`, colour: `green` },
 *  { fruit: `mango`, family: `stone-fruit`, colour: `orange` }
 * ];
 * const map = fromIterable(data, v => v.fruit);
 * map.get(`granny-smith`); // { fruit: `granny-smith`, family: `apple`, colour: `green` }
 * ```
 * @param data Input data
 * @param keyFunction Function which returns a string id. By default uses the JSON value of the object.
 * @param collisionPolicy By default, values with same key overwrite previous (`overwrite`)
 * @returns
 */
export const fromIterable = <V>(
  data: Iterable<V>,
  keyFunction = toStringDefault<V>,
  collisionPolicy: `overwrite` | `skip` | `throw` = `overwrite`
): ReadonlyMap<string, V> => {
  const m = new Map<string, V>();
  for (const d of data) {
    const key = keyFunction(d);
    if (m.has(key)) {
      if (collisionPolicy === `throw`) throw new Error(
        `Key '${ key }' is already used and new data will overwrite it. `
      );
      if (collisionPolicy === `skip`) continue;
    }
    m.set(key, d);
  }
  return m;
};

/**
 * Returns a Map from an object, or array of objects.
 * Assumes the top-level properties of the object is the key.
 *
 * ```js
 * const data = {
 *  Sally: { name: `Sally`, colour: `red` },
 *  Bob: { name: `Bob`, colour: `pink` }
 * };
 * const map = fromObject(data);
 * map.get(`Sally`); // { name: `Sally`, colour: `red` }
 * ```
 *
 * To add an object to an existing map, use {@link addObjectEntriesMutate}.
 * @param data
 * @returns
 */
export const fromObject = <V>(data: object | object[]): ReadonlyMap<string, V> => {
  const map = new Map<string, V>();
  if (Array.isArray(data)) {
    for (const d of data) addObjectEntriesMutate<V>(map, d as object);
  } else {
    addObjectEntriesMutate<V>(map, data);
  }
  return map;
};

/**
 * Adds an object to an existing map, mutating it. 
 * It assumes a structure where each top-level property is a key:
 *
 * ```js
 * const data = {
 *  Sally: { colour: `red` },
 *  Bob:   { colour: `pink` }
 * };
 * const map = new Map();
 * addObjectEntriesMutate(map, data);
 *
 * map.get(`Sally`); // { name: `Sally`, colour: `red` }
 * ```
 *
 * To create a new map from an object, use {@link fromObject} instead.
 * @param map
 * @param data
 */
export const addObjectEntriesMutate = <V>(map: Map<string, V>, data: object) => {
  const entries = Object.entries(data);
  for (const [ key, value ] of entries) {
    map.set(key, value as V);
  }
};
/**
 * Returns the first found value that matches `predicate` or _undefined_.
 * To get an entry see {@link findEntryByPredicate}
 *
 * Use {@link some} if you don't care about the value, just whether it appears.
 * Use {@link filter} to get all value(s) that match `predicate`.
 *
 * @example First person over thirty
 * ```js
 * const overThirty = findValue(people, person => person.age > 30);
 * ```
 * @param map Map to search
 * @param predicate Function that returns true for a matching value
 * @returns Found value or _undefined_
 */
export const findValue = <K, V>(
  map: ReadonlyMap<K, V>,
  predicate: (v: V) => boolean
): V | undefined => [ ...map.values() ].find(v => predicate(v));

/**
 * Returns _true_ if `predicate` yields _true_ for any value in `map`.
 * Use {@link find} if you want the matched value.
 * ```js
 * const map = new Map();
 * map.set(`fruit`, `apple`);
 * map.set(`colour`, `red`);
 * Maps.some(map, v => v === `red`);    // true
 * Maps.some(map, v => v === `orange`); // false
 * ```
 * @param map 
 * @param predicate 
 * @returns 
 */
export const some = <V>(map: ReadonlyMap<string, V>, predicate: (v: V) => boolean): boolean => [ ...map.values() ].some(v => predicate(v));

/**
 * Converts a map to a simple object, transforming from type `T` to `K` as it does so. If no transforms are needed, use {@link toObject}.
 *
 * ```js
 * const map = new Map();
 * map.set(`name`, `Alice`);
 * map.set(`pet`, `dog`);
 *
 * const o = mapToObjectTransform(map, v => {
 *  ...v,
 *  registered: true
 * });
 *
 * // Yields: { name: `Alice`, pet: `dog`, registered: true }
 * ```
 *
 * If the goal is to create a new map with transformed values, use {@link transformMap}.
 * @param m
 * @param valueTransform
 * @typeParam T Value type of input map
 * @typeParam K Value type of destination map
 * @returns
 */
export const mapToObjectTransform = <T, K>(
  m: ReadonlyMap<string, T>,
  valueTransform: (value: T) => K
): Readonly<Record<string, K>> =>
  [ ...m ].reduce((object: object, [ key, value ]) => {
    const t = valueTransform(value);
    object[ key ] = t;
    return object;
  }, {});

/**
 * Zips together an array of keys and values into an object. Requires that
 * `keys` and `values` are the same length.
 *
 * @example
 * ```js
 * const o = zipKeyValue([`a`, `b`, `c`], [0, 1, 2])
 * Yields: { a: 0, b: 1, c: 2}
 *```
 * @param keys String keys
 * @param values Values
 * @typeParam V Type of values
 * @return Object with keys and values
 */
export const zipKeyValue = <V>(
  keys: readonly string[],
  values: ArrayLike<V | undefined>
) => {
  if (keys.length !== values.length) {
    throw new Error(`Keys and values arrays should be same length`);
  }
  return Object.fromEntries(keys.map((k, index) => [ k, values[ index ] ]));
};

//#region Functions by Kees C. Bakker
// Functions by Kees C. Bakker
// https://keestalkstech.com/2021/10/having-fun-grouping-arrays-into-maps-with-typescript/

/**
 * Like `Array.map`, but for a Map. Transforms from Map<K,V> to Map<K,R>, returning as a new Map.
 *
 * @example
 * ```js
 * const mapOfStrings = new Map();
 * mapOfStrings.set(`a`, `10`);
 * mapOfStrings.get(`a`); // Yields `10` (a string)
 *
 * // Convert a map of string->string to string->number
 * const mapOfInts = transformMap(mapOfStrings, (value, key) => parseInt(value));
 *
 * mapOfInts.get(`a`); // Yields 10 (a proper number)
 * ```
 *
 * If you want to combine values into a single object, consider instead  {@link mapToObjectTransform}.
 * @param source
 * @param transformer
 * @typeParam K Type of keys (generally a string)
 * @typeParam V Type of input map values
 * @typeParam R Type of output map values
 * @returns
 */
export const transformMap = <K, V, R>(
  source: ReadonlyMap<K, V>,
  transformer: (value: V, key: K) => R
) => new Map(Array.from(source, (v) => [ v[ 0 ], transformer(v[ 1 ], v[ 0 ]) ]));

/**
 * Converts a `Map` to a plain object, useful for serializing to JSON.
 * To convert back to a map use {@link fromObject}.
 *
 * @example
 * ```js
 * const map = new Map();
 * map.set(`Sally`, { name: `Sally`, colour: `red` });
 * map.set(`Bob`, { name: `Bob`, colour: `pink });
 *
 * const objects = Maps.toObject(map);
 * // Yields: {
 * //  Sally: { name: `Sally`, colour: `red` },
 * //  Bob: { name: `Bob`, colour: `pink` }
 * // }
 * ```
 * @param m
 * @returns
 */
export const toObject = <T>(
  m: ReadonlyMap<string, T>
): Readonly<Record<string, T>> =>
  [ ...m ].reduce((object: object, [ key, value ]) => {
    object[ key ] = value;
    return object;
  }, {});

/**
 * Converts Map to Array with a provided `transformer` function. Useful for plucking out certain properties
 * from contained values and for creating a new map based on transformed values from an input map.
 *
 * @example Get an array of ages from a map of Person objects
 * ```js
 * const person = { age: 29, name: `John`};
 * map.set(person.name, person);
 *
 * const ages = mapToArray(map, (key, person) => person.age);
 * // [29, ...]
 * ```
 *
 * In the above example, the `transformer` function returns a number, but it could
 * just as well return a transformed version of the input:
 *
 * ```js
 * // Return with random heights and uppercased name
 * mapToArray(map, (key, person) => ({
 *  ...person,
 *  height: Math.random(),
 *  name: person.name.toUpperCase();
 * }))
 * // Yields:
 * // [{height: 0.12, age: 29, name: "JOHN"}, ...]
 * ```
 * @param m
 * @param transformer A function that takes a key and item, returning a new item.
 * @returns
 */
export const mapToArray = <K, V, R>(
  m: ReadonlyMap<K, V>,
  transformer: (key: K, item: V) => R
): readonly R[] => [ ...m.entries() ].map((x) => transformer(x[ 0 ], x[ 1 ]));
// End Functions by Kees C. Bakker
//#endregion

/**
 * Returns a result of `a` merged into `b`.
 * `b` is always the 'newer' data that takes
 * precedence.
 */
export type MergeReconcile<V> = (a: V, b: V) => V;

/**
 * Merges maps left to right, using the provided
 * `reconcile` function to choose a winner when keys overlap.
 *
 * There's also {@link Data.Arrays.mergeByKey Arrays.mergeByKey} if you don't already have a map.
 *
 * For example, if we have the map A:
 * 1 => `A-1`, 2 => `A-2`, 3 => `A-3`
 *
 * And map B:
 * 1 => `B-1`, 2 => `B-2`, 4 => `B-4`
 *
 * If they are merged with the reconile function:
 * ```js
 * const reconcile = (a, b) => b.replace(`-`, `!`);
 * const output = mergeByKey(reconcile, mapA, mapB);
 * ```
 *
 * The final result will be:
 *
 * 1 => `B!1`, 2 => `B!2`, 3 => `A-3`, 4 => `B-4`
 *
 * In this toy example, it's obvious how the reconciler transforms
 * data where the keys overlap. For the keys that do not overlap -
 * 3 and 4 in this example - they are copied unaltered.
 *
 * A practical use for `mergeByKey` has been in smoothing keypoints
 * from a TensorFlow pose. In this case, we want to smooth new keypoints
 * with older keypoints. But if a keypoint is not present, for it to be
 * passed through.
 *
 * @param reconcile
 * @param maps
 */
export const mergeByKey = <K, V>(
  reconcile: MergeReconcile<V>,
  ...maps: readonly ReadonlyMap<K, V>[]
): ReadonlyMap<K, V> => {
  const result = new Map<K, V>();
  for (const m of maps) {
    for (const [ mk, mv ] of m) {
      let v = result.get(mk);
      v = v ? reconcile(v, mv) : mv;
      result.set(mk, v);
    }
  }
  return result;
};


export type GetOrGenerate<K, V, Z> = (key: K, args?: Z) => Promise<V>;

/**
 * @inheritDoc getOrGenerate
 * @param map
 * @param fn
 * @returns
 */
export const getOrGenerateSync =
  <K, V, Z>(map: IDictionary<K, V>, fn: (key: K, args?: Z) => V) =>
    (key: K, args?: Z): V => {
      let value = map.get(key);
      if (value !== undefined) return value;
      value = fn(key, args);
      map.set(key, value);
      return value;
    };

/**
 * Returns a function that fetches a value from a map, or generates and sets it if not present.
 * Undefined is never returned, because if `fn` yields that, an error is thrown.
 *
 * See {@link getOrGenerateSync} for a synchronous version.
 *
 * ```
 * const m = getOrGenerate(new Map(), (key) => {
 *  return key.toUppercase();
 * });
 *
 * // Not contained in map, so it will run the uppercase function,
 * // setting the value to the key 'hello'.
 * const v = await m(`hello`);  // Yields 'HELLO'
 * const v1 = await m(`hello`); // Value exists, so it is returned ('HELLO')
 * ```
 *
 */
export const getOrGenerate =
  <K, V, Z>(
    map: IDictionary<K, V>,
    fn: (key: K, args?: Z) => Promise<V> | V
  ): GetOrGenerate<K, V, Z> =>
    async (key: K, args?: Z): Promise<V> => {
      let value = map.get(key);
      if (value !== undefined) return value; //Promise.resolve(value);
      value = await fn(key, args);
      if (value === undefined) throw new Error(`fn returned undefined`);
      map.set(key, value);
      return value;
    };

