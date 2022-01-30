//#region Functions by Kees C. Bakker

// Functions by Kees C. Bakker
// https://keestalkstech.com/2021/10/having-fun-grouping-arrays-into-maps-with-typescript/
export const transformMap = <K, V, R>(
  source: ReadonlyMap<K, V>,
  transformer: (value: V, key: K) => R
) => new Map(
    Array.from(source, v => [v[0], transformer(v[1], v[0])])
  );

/**
 * Zips together an array of keys and values into an object:
 * ```js
 * const o = zipKeyValue([`a`, `b`, `c`], [0, 1, 2])
 * // Yields: { a: 0, b: 1, c: 2}
 *```
  * @template V
  * @param {Array<string>} keys
  * @param {ArrayLike<V>} values
  * @return {*} 
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

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const mapToObj = <T>(m: ReadonlyMap<string, T>): { readonly [key: string]: T} => Array.from(m).reduce((obj: any, [key, value]) => {
  /* eslint-disable-next-line functional/immutable-data */
  obj[key] = value;
  return obj;
}, {});

export const mapToArray = <K, V, R>(
  m: ReadonlyMap<K, V>,
  transformer: (key: K, item: V) => R
) => Array.from(m.entries()).map(x => transformer(x[0], x[1]));
// End Functions by Kees C. Bakker
//#endregion