export interface ISet<V> {
  has(v: V): boolean;
  get size(): number;
  values(): IterableIterator<V>;
  /**
   * Returns an array of values
   */
  toArray(): readonly V[];
}
