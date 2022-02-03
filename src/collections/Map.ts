import {IsEqual} from "~/util.js";
import {ArrayKeys, EitherKey, ObjKeys, ImmutableMap, MutableMap } from "./Interfaces";

// ✔ UNIT TESTED!


/**
 * Returns true if map contains key
 * 
 * @example
 * ```js
 * if (has(map, `London`)) ...
 * ```
 * @param map Map to search
 * @param key Key to find
 * @returns True if map contains key
 */
export const has = <K, V>(map:ReadonlyMap<K, V>, key:K):boolean => map.has(key);

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
 * @param comparer Function to determine match
 * @returns True if key is found
 */
export const hasKeyValue = <K, V>(map:ReadonlyMap<K, V>, key:K, value:V, comparer:IsEqual<V>):boolean => {
  if (!map.has(key)) return false;
  const values = Array.from(map.values());
  return values.some(v => comparer(v, value));
};

/**
 * Returns true if _any_ key contains `value`, based on the provided `comparer` function. Use {@link hasKeyValue}
 * if you only want to find a value under a certain key.
 * 
 * Having a comparer function is useful to check by value rather than object reference.
 * @example Finds value `samantha`, using string equality to match
 * ```js
 * hasAnyValue(map, `samantha`, (a, b) => a === b);
 * ```
 * @param map Map to search
 * @param value Value to find
 * @param comparer Function that determines matching
 * @returns True if value is found
 */
export const hasAnyValue = <K, V>(map:ReadonlyMap<K, V>, value:V, comparer:IsEqual<V>):boolean => {
  const entries = Array.from(map.entries());
  return entries.some(kv => comparer(kv[1], value));
};

/**
 * Returns items where `predicate` returns true.
 * 
 * If you just want the first match, use `find`
 * 
 * @example All people over thirty
 * ```js
 * const overThirty = filter(people, person => person.age > 30);
 * ```
 * @param map Map
 * @param predicate Filtering predicate 
 * @returns Values that match predicate
 */
export const filter = <V>(map:ReadonlyMap<string, V>, predicate:(v:V) => boolean):ReadonlyArray<V> => Array.from(map.values()).filter(predicate);

/**
 * Copies data to an array
 * @param map 
 * @returns 
 */
export const toArray = <V>(map:ReadonlyMap<string, V>):ReadonlyArray<V> => Array.from(map.values());

/**
 * Returns the first found item that matches `predicate` or undefined.
 * 
 * If you want all matches, use `filter`.
 * 
 * @example First person over thirty
 * ```js
 * const overThirty = find(people, person => person.age > 30);
 * ```
 * @param map 
 * @param predicate 
 * @returns Found item or undefined
 */
export const find = <V>(map:ReadonlyMap<string, V>, predicate:(v:V) => boolean):V|undefined =>  Array.from(map.values()).find(vv => predicate(vv));

/**
 * Adds an array o [k,v] to the map, returning a new instance
 * @param map Initial data
 * @param data Data to add
 * @returns New map with data added
 */
const addArray = <K, V>(map: ReadonlyMap<K, V>, data:ArrayKeys<K, V>): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  data.forEach(d => {
    if (d[0] === undefined) throw new Error(`key cannot be undefined`);
    if (d[1] === undefined) throw new Error(`value cannot be undefined`);
    x.set(d[0], d[1]);
  });
  return x;
};

/**
 * Adds objects to the map, returning a new instance
 * @param map Initial data
 * @param data Data to add
 * @returns A new map with data added
 */
const addObjects = <K, V>(map: ReadonlyMap<K, V>, data:ObjKeys<K, V>): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  data.forEach(d => {
    if (d.key === undefined) throw new Error(`key cannot be undefined`);
    if (d.value === undefined) throw new Error(`value cannot be undefined`);

    x.set(d.key, d.value);
  });
  return x;
};

/**
 * Sets data in a copy of the initial map
 * @param map Initial map
 * @param key Key
 * @param value Value to  set
 * @returns New map with data set
 */
export const set = <K, V>(map: ReadonlyMap<K, V>, key:K, value:V) => {
  const x = new Map<K, V>(map.entries());
  x.set(key, value);
  return x;
};

/**
 * Adds data to a map, returning the new map.
 * 
 * Can add items in the form of [key,value] or {key, value}.
 * @example These all produce the same result
 * ```js
 * map.set(`hello`, `samantha`);
 * map.add([`hello`, `samantha`]);
 * map.add({key: `hello`, value: `samantha`})
 * ```
 * @param map Initial data
 * @param data One or more data to add in the form of [key,value] or {key, value} 
 * @returns New map with data added
 */
export const add = <K, V>(map: ReadonlyMap<K, V>, ...data:EitherKey<K, V>): ReadonlyMap<K, V> => {
  if (map === undefined) throw new Error(`map parameter is undefined`);
  if (data === undefined) throw new Error(`data parameter is undefined`);
  if (data.length === 0) return map;

  const firstRecord = data[0];
  const isObj = typeof (firstRecord as {readonly key:K, readonly value:V}).key !== `undefined` && typeof (firstRecord as {readonly key:K, readonly value:V}).value !== `undefined`;  //(typeof (data[0] as {readonly key:K}).key !== undefined && typeof (data[0] as {readonly value:V}).value !== undefined);
  return isObj ? addObjects(map, data as ObjKeys<K, V>) : addArray(map, data as ArrayKeys<K, V>);
};

/**
 * Delete a key from the map, returning a new map
 * @param map Initial data
 * @param key 
 * @returns New map with data deleted
 */
export const del = <K, V>(map: ReadonlyMap<K, V>, key: K): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  x.delete(key);
  return x;
};

/**
 * Returns an {@link ImmutableMap}.
 * Use {@link mutableMap} as an alternatve.
 * 
 * @param dataOrMap Optional initial data in the form of an array of {key:value} or [key,value]
 * @returns {@link ImmutableMap}
 */
export const map = <K, V>(dataOrMap?: ReadonlyMap<K, V>|EitherKey<K, V>):ImmutableMap<K, V> => {
  if (dataOrMap === undefined) return map([]);
  if (Array.isArray(dataOrMap)) return map(add(new Map(), ...dataOrMap));
  const data = dataOrMap as ReadonlyMap<K, V>;
  return {
    add: (...itemsToAdd:EitherKey<K, V>) => {
      const s = add(data, ...itemsToAdd);
      return map(s);
    },
    get: (key:K) => data.get(key),
    delete: (key:K) => map(del(data, key)),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clear: () => map(),
    has: (key:K) => data.has(key),
    entries: () => data.entries(),
    isEmpty: () => data.size === 0
  };
};

// export const without = <V>(map:ReadonlyMap<string, V>, value:V): ReadonlyMap<string,V> => {
//   source.toArray().filter(v => hash(v) !== hash(value))
// }

/**
 * Returns a {@link MutableMap} (which just wraps the in-built Map)
 * Use {@link map} for the immutable alternative.
 * 
 * @param data Optional initial data in the form of an array of {key:value} or [key,value]
 * @returns {@link MutableMap}
 */
export const mutableMap = <K, V>(...data:EitherKey<K, V>): MutableMap<K, V> => {
  // eslint-disable-next-line functional/no-let
  let m = add(new Map<K, V>(), ...data);
  return {
    add: (...data:EitherKey<K, V>) => {
      m = add(m, ...data);
    },
    delete: (key:K) => {
      m = del(m, key);
    },
    clear: () => {
      m = add(new Map<K, V>());
    },
    set: (key:K, value:V):void => {
      m = set(m, key, value);
    },
    get: (key:K):V|undefined => m.get(key),
    entries: () => m.entries(),
    isEmpty: () => m.size === 0,
    has: (key:K) => has(m, key)
  };
};

//#region Functions by Kees C. Bakker
// Functions by Kees C. Bakker
// https://keestalkstech.com/2021/10/having-fun-grouping-arrays-into-maps-with-typescript/

/**
 * Like `Array.map`, but for a Map. Transforms from Map<K,V> to Map<K,R>
 * 
 * @example
 * ```js
 * // Convert a map of string->string to string->number
 * transformMap<string, string, number>(mapOfStrings, (value, key) => parseInt(value));
 * ```
 * @param source 
 * @param transformer 
 * @returns 
 */
export const transformMap = <K, V, R>(
  source: ReadonlyMap<K, V>,
  transformer: (value: V, key: K) => R
) => new Map(
    Array.from(source, v => [v[0], transformer(v[1], v[0])])
  );

/**
 * Zips together an array of keys and values into an object. Requires that 
 * `keys` and `values` are the same length.
 * 
 * @example
 * ```js
 * const o = zipKeyValue([`a`, `b`, `c`], [0, 1, 2])
 * Yields: { a: 0, b: 1, c: 2}
 *```
  * @template V
  * @param keys
  * @param values
  * @return 
  */
export const zipKeyValue = <V>(keys:ReadonlyArray<string>, values:ArrayLike<V|undefined>) => {
  if (keys.length !== values.length) throw new Error(`Keys and values arrays should be same length`);
  return Object.fromEntries(keys.map((k, i) => [k, values[i]]));
};

/**
 * Converts a `Map` to a plain object, useful for serializing to JSON
 * 
 * @example
 * ```js
 * const str = JSON.stringify(mapToObj(map));
 * ```
 * @param m 
 * @returns 
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const mapToObj = <T>(m: ReadonlyMap<string, T>): { readonly [key: string]: T} => Array.from(m).reduce((obj: any, [key, value]) => {
  /* eslint-disable-next-line functional/immutable-data */
  obj[key] = value;
  return obj;
}, {});

/**
 * Converts Map<K,V> to Array<R> with a provided `transformer`
 * 
 * @example Get a list of ages from a map of Person objects
 * ```js
 * let person = { age: 29, name: `John`};
 * map.add(person.name, person);
 * const ages = mapToArray<string, People, number>(map, (key, person) => person.age);
 * // [29, ...]
 * ```
 * @param m 
 * @param transformer 
 * @returns 
 */
export const mapToArray = <K, V, R>(
  m: ReadonlyMap<K, V>,
  transformer: (key: K, item: V) => R
):readonly R[] => Array.from(m.entries()).map(x => transformer(x[0], x[1]));
// End Functions by Kees C. Bakker
//#endregion
