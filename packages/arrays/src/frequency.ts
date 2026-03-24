// export function frequencyByGroup<TValue, TGroup extends string | number>(groupBy: ((value: TValue) => TGroup), data: TValue[]): Map<TGroup, number> {
//   if (!Array.isArray(data))
//     throw new TypeError(`Param 'array' is expected to be an array. Got type: '${typeof data}'`);
//   const store = new Map<TGroup, number>();

//   for (const value of data) {
//     const group = groupBy(value);
//     if (typeof group !== `string` && typeof group !== `number`) {
//       throw new TypeError(`groupBy function is expected to return type string or number. Got type: '${typeof group}' for value: '${value}'`);
//     }
//     let groupValue = store.get(group);
//     groupValue ??= 0;
//     groupValue++;
//     store.set(group, groupValue);
//   }
//   return store;
// }

/**
 * Computes the frequency of values by a grouping function.
 *
 * ```js
 * const data = [1,2,3,4,5,6,7,8,9,10];
 * // Returns 'odd' or 'even' for an input value
 *
 * const groupBy = v => v % 2 === 0 ? `even`:`odd`;
 *
 * FrequencyByGroup.fromArray(data, groupBy);
 * // Yields map with:
 * //  key: 'even', value: 5
 * //  key: 'odd', value: 5
 * ```
 *
 * Or for example, group by the value itself:
 * ```js
 * const data = [1,2,3,1,2,0];
 * const groupBy = v => v.toString();
 * FrequencyByGroup.fromArray(data, groupBy);
 * // "1" = 2, "2" = 2, "3" = 1, "0" = 1
 * ```
 * @param groupBy
 * @param data
 */
export class FrequencyByGroup<TValue, TGroup extends string | number> {
  #store = new Map<TGroup, number>();
  #groupBy: ((value: TValue) => TGroup);
  #total = 0;

  constructor(groupBy: ((value: TValue) => TGroup) = v => (v as any).toString()) {
    this.#groupBy = groupBy;
  }

  add(data: TValue[]): void {
    if (!Array.isArray(data))
      throw new TypeError(`Param 'array' is expected to be an array. Got type: '${typeof data}'`);

    for (const value of data) {
      const group = this.#groupBy(value);
      if (typeof group !== `string` && typeof group !== `number`) {
        throw new TypeError(`groupBy function is expected to return type string or number. Got type: '${typeof group}' for value: '${value}'`);
      }
      const groupValue = (this.#store.get(group) ?? 0) + 1;
      this.#total++;
      this.#store.set(group, groupValue);
    }
  }

  /**
   * Creates a new FrequencyByGroup instance, adds data to it and returns the instance.
   * If you just want the computed frequencies, consider using {@link entriesFromArray}.
   * @param data
   * @param groupBy
   * @returns FrequencyGroup instance with data added
   */
  static fromArray<TValue, TGroup extends string | number>(data: any[], groupBy?: ((value: TValue) => TGroup)): FrequencyByGroup<TValue, TGroup> {
    const instance = new FrequencyByGroup<TValue, TGroup>(groupBy);
    instance.add(data);
    return instance;
  }

  /**
   * Computes the frequency of `data`, yielding results as entries consisting of the key and frequency.
   * ```js
   * const v = [...FrequencyByGroup.entriesFromArray([1, 2, 3, 1, 2, 3, 0, 1, 1, 1, 4], v => v.toString())];
   * // Yields: [ ["1", 5], ["2", 2], ["3", 2], ["0", 1], ["4", 1] ]
   * ```
   *
   * It's a generator, so you can also use it like this:
   * ```js
   * for (const [key,freq] of FrequencyByGroup.entriesFromArray(data, v => v.toString())) {
   *   console.log(key, freq);// Logs key and frequency for each group
   * }
   * ```
   * @param data
   * @param groupBy
   * @returns Iterator over entries
   */
  static *entriesFromArray<TValue, TGroup extends string | number>(data: any[], groupBy?: ((value: TValue) => TGroup)): Generator<[TGroup, number]> {
    const f = FrequencyByGroup.fromArray(data, groupBy);
    return yield* f.entries();
  }

  /**
   * Returns the relative frequency for a group, or _undefined_ if not found.
   * @param group
   * @returns Relative frequency or _undefined_ if not found
   */
  getRelative(group: TGroup): number | undefined {
    const freq = this.#store.get(group);
    if (typeof freq === `undefined`)
      return undefined;
    return freq / this.#total;
  }

  /**
   * Returns _true_ if group was found.
   * @param group
   * @returns _True_ if group was found
   */
  has(group: TGroup): boolean {
    return this.#store.has(group);
  }

  /**
   * Gets the frequency for this group, or _undefined_ if the group does not exist
   * @param group
   * @returns Frequency for this group, or _undefined_ if the group does not exist
   */
  get(group: TGroup): number | undefined {
    return this.#store.get(group);
  }

  /**
   * Returns an iterator over the entries, ie `[group, frequency]` pairs.
   * Use {@link entriesRelative} to get the relative frequency instead of the absolute frequency.
   * @returns Iterator
   */
  entries(): IterableIterator<[TGroup, number]> {
    return this.#store.entries();
  }

  /**
   * Returns an iterator over the entries, ie `[group, relativeFrequency]` pairs.
   * Use {@link entries} to get the absolute frequency instead.
   * @returns Iterator
   */
  *entriesRelative(): Generator<[TGroup, number]> {
    for (const [group, freq] of this.#store.entries()) {
      yield [group, freq / this.#total];
    }
  }

  /**
   * Returns an iterator over keys (ie. groups).
   */
  keys(): IterableIterator<TGroup> {
    return this.#store.keys();
  }

  /**
   * Returns an iterator over values (ie. absolute frequencies)
   * @returns
   */
  values(): IterableIterator<number> {
    return this.#store.values();
  }

  /**
   * Gets the average frequency across all groups.
   * @returns Average frequency
   */
  averageFrequency(): number {
    let total = 0;
    for (const freq of this.#store.values()) {
      total += freq;
    }
    return total / this.#store.size;
  }
}
