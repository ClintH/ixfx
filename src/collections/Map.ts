import { defaultComparer, IsEqual, isEqualDefault, ToString } from "../Util.js";
export { create as expiringMap, ExpiringMap} from './ExpiringMap.js';
export type {ExpiringMapEvent, ExpiringMapEvents, Opts as ExpiringMapOpts} from './ExpiringMap.js';


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

/**
 * Deletes all key/values from map where value matches `value`,
 * with optional comparer. Mutates map.
 * 
 * ```js
 * import { Maps } from "https://unpkg.com/ixfx/dist/collections.js"
 * 
 * // Compare fruits based on their colour property
 * const colourComparer = (a, b) => a.colour === b.colour;
 * 
 * // Deletes all values where .colour = `red`
 * Maps.deleteByValue(map, { colour: `red` }, colourComparer);
 * ```
 * @param map 
 * @param value 
 * @param comparer 
 */
export const deleteByValue = <K, V>(map:ReadonlyMap<K, V>, value:V, comparer:IsEqual<V> = isEqualDefault) => {
  for (const e of Object.entries(map)) {
    if (comparer(e[1], value)) {
      // @ts-ignore
      map.delete(e[0]);
    }
  }
};

export type GetOrGenerate<K, V, Z> = (key:K, args?:Z)=>Promise<V>;

export interface Mappish<K, V> {
  get(key:K):V|undefined;
  set(key:K, value:V):void;
}

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
//eslint-disable-next-line functional/prefer-readonly-type
export const getOrGenerate = <K, V, Z>(map:Mappish<K, V>, fn:(key:K, args?:Z)=>Promise<V>|V):GetOrGenerate<K, V, Z> => async (key:K, args?:Z):Promise<V> => {
  //eslint-disable-next-line functional/no-let
  let value = map.get(key);
  if (value !== undefined) return Promise.resolve(value);
  value = await fn(key, args);
  if (value === undefined) throw new Error(`fn returned undefined`);
  map.set(key, value);
  return value;
};

/**
 * @inheritDoc getOrGenerate
 * @param map 
 * @param fn 
 * @returns 
 */
//eslint-disable-next-line functional/prefer-readonly-type
export const getOrGenerateSync = <K, V, Z>(map:Mappish<K, V>, fn:(key:K, args?:Z)=>V) => (key:K, args?:Z):V => {
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
 * Uses provided {@link Util.ToString} function to create keys for items. Item is only added if it doesn't already exist.
 * Thus the older item wins out, versus normal `Map.set` where the newest wins.
 * 
 * 
 * @example
 * ```js
 * import { Maps } from "https://unpkg.com/ixfx/dist/collections.js";
 * const map = new Map();
 * const peopleArray = [ _some people objects..._];
 * Maps.addKeepingExisting(map, p => p.name, ...peopleArray);
 * ```
 * @param set 
 * @param hashFunc 
 * @param values 
 * @returns 
 */
export const addKeepingExisting = <V>(set:ReadonlyMap<string, V>|undefined, hashFunc:ToString<V>, ...values:readonly V[]) => {
  const s = set === undefined ? new Map() : new Map(set);
  values.forEach(v => {
    const vStr = hashFunc(v);
    if (s.has(vStr)) return;
    s.set(vStr, v);
  });
  return s;
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
 * @param compareFn 
 * @returns 
 */
export const sortByValue = <K, V>(map:ReadonlyMap<K, V>, compareFn?:(a:V, b:V)=>number) => {
  const f = compareFn ?? defaultComparer;
  [...map.entries()].sort((a, b) => f(a[1], b[1]));
};

/**
 * Returns an array of entries from a map, sorted by a property of the value
 * 
 * ```js
 * cosnt m = new Map();
 * m.set(`4491`, { name: `Bob` });
 * m.set(`2319`, { name: `Alice` });
 * const sorted = Maps.sortByValue(m, `name`);
 * ```
 * @param map Map to sort
 * @param prop Property of value
 * @param compareFn Comparer. If unspecified, uses a default.
 */
export const sortByValueProperty = <K, V, Z>(map:ReadonlyMap<K, V>, prop:string, compareFn?:(a:Z, b:Z)=>number) => {
  const cfn = (typeof compareFn === `undefined`) ? defaultComparer : compareFn;
  return [...map.entries()].sort((aE, bE) => {
    const a = aE[1];
    const b = bE[1];
    // @ts-ignore
    return cfn(a[prop], b[prop]);
  });
};
/**
 * Returns true if _any_ key contains `value`, based on the provided `comparer` function. Use {@link hasKeyValue}
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
export const hasAnyValue = <K, V>(map:ReadonlyMap<K, V>, value:V, comparer:IsEqual<V>):boolean => {
  const entries = Array.from(map.entries());
  return entries.some(kv => comparer(kv[1], value));
};

/**
 * Returns values where `predicate` returns true.
 * 
 * If you just want the first match, use `find`
 * 
 * @example All people over thirty
 * ```js
 * // for-of loop
 * for (const v of filter(people, person => person.age > 30)) {
 * 
 * }
 * // If you want an array
 * const overThirty = Array.from(filter(people, person => person.age > 30));
 * ```
 * @param map Map
 * @param predicate Filtering predicate 
 * @returns Values that match predicate
 */
//eslint-disable-next-line func-style
export function * filter<V>(map:ReadonlyMap<string, V>, predicate:(v:V)=>boolean) {
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
export const toArray = <V>(map:ReadonlyMap<string, V>):ReadonlyArray<V> => Array.from(map.values());

/**
 * Returns a Map from an iterable
 * 
 * ```js
 * const data = [ 
 *  { fruit: `granny-smith`, family: `apple`, colour: `green` }
 *  { fruit: `mango`, family: `stone-fruit`, colour: `orange` }
 * ];
 * const map = Maps.fromIterable(data, v => v.fruit);
 * ```
 * @param data Input data
 * @param keyFn Function which returns a string id
 * @param allowOverwrites If true, items with same id will silently overwrite each other, with last write wins
 * @returns 
 */
export const fromIterable = <V>(data:Iterable<V>, keyFn:(v:V)=>string, allowOverwrites = false):ReadonlyMap<string, V> => {
  const m = new Map<string, V>();
  for (const d of data) {
    const id = keyFn(d);
    if (m.has(id) && !allowOverwrites) throw new Error(`id ${id} is already used and new data will overwrite it. `);
    m.set(id, d);
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
 * const map = Maps.fromObject(data);
 * map.get(`Sally`); // { name: `Sally`, colour: `red` }
 * ```
 * 
 * To add an object to an existing map, use {@link addObject}.
 * @param data 
 * @returns 
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any,functional/prefer-readonly-type
export const fromObject = <V>(data:any):ReadonlyMap<string, V> => {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any,functional/prefer-readonly-type
  const map = new Map<string, V>();
  if (Array.isArray(data)) {
    data.forEach(d => addObject<V>(map, d));
  } else {
    addObject<V>(map, data);
  }
  return map;
};

/**
 * Adds an object to an existing map. It assumes a structure where
 * each top-level property is a key:
 * 
 * ```js
 * const data = {
 *  Sally: { name: `Sally`, colour: `red` },
 *  Bob: { name: `Bob`, colour: `pink` }
 * };
 * const map = new Map();
 * Maps.addObject(map, data);
 * 
 * map.get(`Sally`); // { name: `Sally`, colour: `red` }
 * ```
 * 
 * To create a new map from an object, use {@link fromObject} instead.
 * @param map 
 * @param data 
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any,functional/prefer-readonly-type
export const addObject = <V>(map:Map<string, V>, data:any) => {
  const entries = Object.entries(data);
  for (const [key, value] of entries) {
    map.set(key, value as V);
  }
};
/**
 * Returns the first found item that matches `predicate` or _undefined_.
 * 
 * If you want all matches, use {@link filter}.
 * 
 * @example First person over thirty
 * ```js
 * const overThirty = find(people, person => person.age > 30);
 * ```
 * @param map Map to search
 * @param predicate Function that returns true for a matching item
 * @returns Found item or _undefined_
 */
export const find = <V>(map:ReadonlyMap<string, V>, predicate:(v:V)=>boolean):V|undefined =>  Array.from(map.values()).find(vv => predicate(vv));

/**
 * Converts a map to a simple object, transforming from type `T` to `K` as it does so. If no transforms are needed, use {@link toObject}.
 * 
 * ```js
 * const map = new Map();
 * map.set(`name`, `Alice`);
 * map.set(`pet`, `dog`);
 * 
 * const o = mapToObjTransform(map, v => {
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
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapToObjTransform = <T, K>(m:ReadonlyMap<string, T>, valueTransform:(value:T)=>K):{readonly [key:string]:K} => Array.from(m).reduce((obj:any, [key, value]) => {
  const t = valueTransform(value);
  /* eslint-disable-next-line functional/immutable-data */
  obj[key] = t;
  return obj;
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
export const zipKeyValue = <V>(keys:ReadonlyArray<string>, values:ArrayLike<V|undefined>) => {
  if (keys.length !== values.length) throw new Error(`Keys and values arrays should be same length`);
  return Object.fromEntries(keys.map((k, i) => [k, values[i]]));
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
 * If you want to combine values into a single object, consider instead  {@link mapToObjTransform}.
 * @param source 
 * @param transformer 
 * @typeParam K Type of keys (generally a string)
 * @typeParam V Type of input map values
 * @typeParam R Type of output map values
 * @returns 
 */
export const transformMap = <K, V, R>(
  source:ReadonlyMap<K, V>,
  transformer:(value:V, key:K)=>R
) => new Map(
    Array.from(source, v => [v[0], transformer(v[1], v[0])])
  );


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
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const toObject = <T>(m:ReadonlyMap<string, T>):{ readonly [key:string]:T} => Array.from(m).reduce((obj:any, [key, value]) => {
  /* eslint-disable-next-line functional/immutable-data */
  obj[key] = value;
  return obj;
}, {});

/**
 * Converts Map to Array with a provided `transformer` function. Useful for plucking out certain properties
 * from contained values and for creating a new map based on transformed values from an input map.
 * 
 * @example Get an array of ages from a map of Person objects
 * ```js
 * let person = { age: 29, name: `John`};
 * map.add(person.name, person);
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
  m:ReadonlyMap<K, V>,
  transformer:(key:K, item:V)=>R
):readonly R[] => Array.from(m.entries()).map(x => transformer(x[0], x[1]));
// End Functions by Kees C. Bakker
//#endregion

/**
 * Returns a result of a merged into b.
 * B is always the 'newer' data that takes
 * precedence.
 */
export type MergeReconcile<V> = (a:V, b:V)=>V;

/**
 * Merges maps left to right, using the provided
 * `reconcile` function to choose a winner when keys overlap.
 * 
 * There's also [Arrays.mergeByKey](functions/Collections.Arrays.mergeByKey.html) if you don't already have a map.
 * 
 * For example, if we have the map A:
 * 1 => `A-1`, 2 => `A-2`, 3 => `A-3`
 * 
 * And map B:
 * 2 => `B-1`, 2 => `B-2`, 4 => `B-4`
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
export const mergeByKey = <K, V>(reconcile:MergeReconcile<V>, ...maps:readonly ReadonlyMap<K, V>[]):ReadonlyMap<K, V> => {
  const result = new Map<K, V>();
  for (const m of maps) {
    for (const [mk, mv] of m) {
      //eslint-disable-next-line functional/no-let
      let v = result.get(mk);
      if (v) {
        v = reconcile(v, mv);
      } else {
        v = mv;
      }
      result.set(mk, v);
    }
  }
  return result;
};