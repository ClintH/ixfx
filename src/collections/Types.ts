export type ArrayKeys<K, V> = ReadonlyArray<readonly [ key: K, value: V ]>;
export type ObjectKeys<K, V> = ReadonlyArray<{
  readonly key: K;
  readonly value: V;
}>;
export type EitherKey<K, V> = ArrayKeys<K, V> | ObjectKeys<K, V>;

