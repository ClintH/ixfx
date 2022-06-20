import {IsEqual, ToString} from "../Util.js";

// ✔ UNIT TESTED!

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

export type GetOrGenerate<K, V, Z> = (key:K, args?:Z) => Promise<V>;

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
 * // Not contained in map, so it will run the uppercase function
 * const v = await m(`hello`);
 * const v1 = await m(`hello`); // Value exists, so it is returned.
 * ```
 * 
 */
//eslint-disable-next-line functional/prefer-readonly-type
export const getOrGenerate = <K, V, Z>(map:Map<K, V>, fn:(key:K, args?:Z)=>Promise<V>|V):GetOrGenerate<K, V, Z> => async (key:K, args?:Z):Promise<V> => {
  //eslint-disable-next-line functional/no-let
  let value = map.get(key);
  if (value !== undefined) return Promise.resolve(value);
  value = await fn(key, args);
  if (value === undefined) throw new Error(`fn returned undefined`);
  map.set(key, value);
  return value;
};

/**
 * @inheritdoc getOrGenerate
 * @param map 
 * @param fn 
 * @returns 
 */
//eslint-disable-next-line functional/prefer-readonly-type
export const getOrGenerateSync = <K, V, Z>(map:Map<K, V>, fn:(key:K, args?:Z)=>V) => (key:K, args?:Z):V => {
  //eslint-disable-next-line functional/no-let
  let value = map.get(key);
  if (value !== undefined) return value;
  value = fn(key, args);
  map.set(key, value);
  return value;
};

/**
 * Adds items to a map only if their key doesn't already exist 
 * 
 * Uses provided {@link ToString} function to create keys for items. Item is only added if it doesn't already exist.
 * Thus the older item wins out, versus normal `Map.set` where the newest wins.
 * 
 * 
 * @example
 * ```js
 * const map = new Map();
 * const peopleArray = [ _some people objects..._];
 * addUniqueByHash(map, p => p.name, ...peopleArray);
 * ```
 * @param set 
 * @param hashFunc 
 * @param values 
 * @returns 
 */
export const addUniqueByHash = <V>(set:ReadonlyMap<string, V>|undefined, hashFunc: ToString<V>, ...values:readonly V[]) => {
  const s = set === undefined ? new Map() : new Map(set);
  values.forEach(v => {
    const vStr = hashFunc(v);
    if (s.has(vStr)) return;
    s.set(vStr, v);
  });
  return s;
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
 * Converts a map to a simple object, transforming from type `T` to `K` as it does so. If no transforms are needed, use {@link mapToObj}.
 * 
 * @param m
 * @param valueTransform 
 * @returns 
 */
export const mapToObjTransform = <T, K>(m: ReadonlyMap<string, T>, valueTransform: (value: T) => K): {readonly [key: string]: K} => Array.from(m).reduce((obj: any, [key, value]) => {
  const t = valueTransform(value);
  /* eslint-disable-next-line functional/immutable-data */
  obj[key] = t;
  return obj;
}, {});

// export const without = <V>(map:ReadonlyMap<string, V>, value:V): ReadonlyMap<string,V> => {
//   source.toArray().filter(v => hash(v) !== hash(value))
// }

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
 * 
 * In the above example, the `transformer` function returns a single value, but it could
 * just as well return an object:
 * ```js
 * mapToArray(map, (key, person) => ({
 *  height: Math.random(),
 *  name: person.name.toUpperCase();
 * }))
 * // Yields:
 * // [{height: 0.12, name: "JOHN"}, ...]
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
