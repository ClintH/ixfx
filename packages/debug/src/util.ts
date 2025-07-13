export const getOrGenerateSync =
  <K, V, Z>(map: Map<K, V>, fn: (key: K, args?: Z) => V) =>
    (key: K, args?: Z): V => {
      let value = map.get(key);
      if (value !== undefined) return value;
      value = fn(key, args);
      map.set(key, value);
      return value;
    };