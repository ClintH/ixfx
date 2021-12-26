// Functions by Kees C. Bakker
// https://keestalkstech.com/2021/10/having-fun-grouping-arrays-into-maps-with-typescript/
export function transformMap<K, V, R>(
  source: Map<K, V>,
  transformer: (value: V, key: K) => R
) {
  return new Map(
    Array.from(source, v => [v[0], transformer(v[1], v[0])])
  )
}

export function groupBy<K, V>(array: V[], grouper: (item: V) => K) {
  return array.reduce((store, item) => {
    var key = grouper(item)
    if (!store.has(key)) {
      store.set(key, [item])
    } else {
      store.get(key)!.push(item)
    }
    return store
  }, new Map<K, V[]>())
}

export function mapToObj<T>(m: Map<string, T>): {[key: string]: T} {
  return Array.from(m).reduce((obj: any, [key, value]) => {
    obj[key] = value
    return obj
  }, {})
}

export function mapToArray<K, V, R>(
  m: Map<K, V>,
  transformer: (key: K, item: V) => R
) {
  return Array.from(m.entries()).map(x =>
    transformer(x[0], x[1])
  )
}
// End