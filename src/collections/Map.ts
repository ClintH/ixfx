import {IsEqual} from "~/util";

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