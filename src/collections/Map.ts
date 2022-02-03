import {IsEqual} from "~/util.js";

// ✔ UNIT TESTED!
type ArrayKeys<K, V> = ReadonlyArray<readonly [key:K, value:V]>;
type ObjKeys<K, V> = ReadonlyArray<{readonly key: K, readonly value: V}>;
type EitherKey<K, V> = ArrayKeys<K, V> | ObjKeys<K, V>;

export const has = <K, V>(map:ReadonlyMap<K, V>, key:K):boolean => map.has(key);
export const hasKeyValue = <K, V>(map:ReadonlyMap<K, V>, key:K, value:V, comparer:IsEqual<V>):boolean => {
  if (!map.has(key)) return false;
  const values = Array.from(map.values());
  return values.some(v => comparer(v, value));
};

export const hasAnyValue = <K, V>(map:ReadonlyMap<K, V>, value:V, comparer:IsEqual<V>):boolean => {
  const entries = Array.from(map.entries());
  return entries.some(kv => comparer(kv[1], value));
};


export const filter = <V>(map:ReadonlyMap<string, V>, predicate:(v:V) => boolean):ReadonlyArray<V> => Array.from(map.values()).filter(predicate);
export const toArray = <V>(map:ReadonlyMap<string, V>):ReadonlyArray<V> => Array.from(map.values());
export const find = <V>(map:ReadonlyMap<string, V>, predicate:(v:V) => boolean):V|undefined =>  Array.from(map.values()).find(vv => predicate(vv));


const addArray = <K, V>(map: ReadonlyMap<K, V>, data:ArrayKeys<K, V>): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  data.forEach(d => {
    if (d[0] === undefined) throw new Error(`key cannot be undefined`);
    if (d[1] === undefined) throw new Error(`value cannot be undefined`);
    x.set(d[0], d[1]);
  });
  return x;
};

const addObjects = <K, V>(map: ReadonlyMap<K, V>, data:ObjKeys<K, V>): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  data.forEach(d => {
    if (d.key === undefined) throw new Error(`key cannot be undefined`);
    if (d.value === undefined) throw new Error(`value cannot be undefined`);

    x.set(d.key, d.value);
  });
  return x;
};

export const set = <K, V>(map: ReadonlyMap<K, V>, key:K, value:V) => {
  const x = new Map<K, V>(map.entries());
  x.set(key, value);
  return x;
};

export const add = <K, V>(map: ReadonlyMap<K, V>, ...data:EitherKey<K, V>): ReadonlyMap<K, V> => {
  if (map === undefined) throw new Error(`map parameter is undefined`);
  if (data === undefined) throw new Error(`data parameter is undefined`);
  if (data.length === 0) return map;

  const firstRecord = data[0];
  const isObj = typeof (firstRecord as {readonly key:K, readonly value:V}).key !== `undefined` && typeof (firstRecord as {readonly key:K, readonly value:V}).value !== `undefined`;  //(typeof (data[0] as {readonly key:K}).key !== undefined && typeof (data[0] as {readonly value:V}).value !== undefined);
  return isObj ? addObjects(map, data as ObjKeys<K, V>) : addArray(map, data as ArrayKeys<K, V>);
};

export const del = <K, V>(map: ReadonlyMap<K, V>, key: K): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  x.delete(key);
  return x;
};

type ImmutableMap<K, V> = Readonly<{
  add(...itemsToAdd:EitherKey<K, V>): ImmutableMap<K, V>
  delete(key:K): ImmutableMap<K, V>
  clear(): ImmutableMap<K, V>
  get(key:K):V|undefined
  has(key:K): boolean
  isEmpty(): boolean
  entries(): IterableIterator<readonly [K, V]>
}>;

type MutableMap<K, V> = Readonly<{
  add(...itemsToAdd:EitherKey<K, V>):void
  set(key:K, value:V):void
  delete(key:K):void
  clear(): void
  get(key:K):V|undefined
  has(key:K): boolean
  isEmpty(): boolean
  entries(): IterableIterator<readonly [K, V]>
}>;

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
 * Like `Array.map`. Transforms from Map<K,V> to Map<K,R>
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
 * Zips together an array of keys and values into an object:
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

export const groupBy = <K, V>(array: ReadonlyArray<V>, grouper: (item: V) => K) => array.reduce((store, item) => {
  const key = grouper(item);
  const val = store.get(key);
  if (val === undefined) {
    store.set(key, [item]);
  } else {
    // eslint-disable-next-line functional/immutable-data
    val.push(item);
  }
  return store;
  /* eslint-disable-next-line functional/prefer-readonly-type */
}, new Map<K, V[]>());

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
 * Converts Map<K,V> to Array<R>
 * 
 * @example Returns [[key, value],[key,value]]
 * ```js
 * const arr = mapToArray<string, string, number>(key, value, (key, value) => [key, value])
 * ```
 * @param m 
 * @param transformer 
 * @returns 
 */
export const mapToArray = <K, V, R>(
  m: ReadonlyMap<K, V>,
  transformer: (key: K, item: V) => R
) => Array.from(m.entries()).map(x => transformer(x[0], x[1]));
// End Functions by Kees C. Bakker
//#endregion
