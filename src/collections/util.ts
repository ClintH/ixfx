

//#region Functions by Kees C. Bakker

// Functions by Kees C. Bakker
// https://keestalkstech.com/2021/10/having-fun-grouping-arrays-into-maps-with-typescript/
export const transformMap = <K, V, R>(
  source: Map<K, V>,
  transformer: (value: V, key: K) => R
) => new Map(
    Array.from(source, v => [v[0], transformer(v[1], v[0])])
  );
export const groupBy = <K, V>(array: V[], grouper: (item: V) => K) => array.reduce((store, item) => {
  const key = grouper(item);
  const val = store.get(key);
  if (val === undefined) {
    store.set(key, [item]);
  } else {
    val.push(item);
  }
  return store;
}, new Map<K, V[]>());

export const mapToObj = <T>(m: Map<string, T>): {[key: string]: T} => Array.from(m).reduce((obj: any, [key, value]) => {
  obj[key] = value;
  return obj;
}, {});

export const mapToArray = <K, V, R>(
  m: Map<K, V>,
  transformer: (key: K, item: V) => R
) => Array.from(m.entries()).map(x => transformer(x[0], x[1]));
// End Functions by Kees C. Bakker
//#endregion