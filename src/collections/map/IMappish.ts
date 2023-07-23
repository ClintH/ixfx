export interface IMappish<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
}

export interface IWithEntries<K, V> {
  entries(): IterableIterator<readonly [K, V]>;
}
