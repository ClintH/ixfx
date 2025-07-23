/**
 * Key-value pairs in an array
 * @see {@link ObjectKeys}
 */
export type ArrayKeys<K, V> = readonly (readonly [ key: K, value: V ])[];

/**
 * Key-value pairs in object form
 * @see {@link ArrayKeys}
 */
export type ObjectKeys<K, V> = readonly {
  readonly key: K;
  readonly value: V;
}[];

/**
 * Type that represents key-values in object or array form
 */
export type EitherKey<K, V> = ArrayKeys<K, V> | ObjectKeys<K, V>;

/**
 * A table value or _undefined_
 */
export type TableValue<V> = V | undefined;

/**
 * A row of table values
 */
export type TableRow<V> = TableValue<V>[];
