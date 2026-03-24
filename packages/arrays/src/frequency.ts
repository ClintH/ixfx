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

  static fromArray<TValue, TGroup extends string | number>(data: any[], groupBy?: ((value: TValue) => TGroup)): FrequencyByGroup<TValue, TGroup> {
    const instance = new FrequencyByGroup<TValue, TGroup>(groupBy);
    instance.add(data);
    return instance;
  }

  static entriesFromArray<TValue, TGroup extends string | number>(data: any[], groupBy?: ((value: TValue) => TGroup)): Array<[TGroup, number]> {
    const f = FrequencyByGroup.fromArray(data, groupBy);
    return [...f.entries()];
  }

  getRelative(group: TGroup): number | undefined {
    const freq = this.#store.get(group);
    if (typeof freq === `undefined`)
      return undefined;
    return freq / this.#total;
  }

  get(group: TGroup): number | undefined {
    return this.#store.get(group);
  }

  entries(): IterableIterator<[TGroup, number]> {
    return this.#store.entries();
  }

  *entriesRelative(): Generator<[TGroup, number]> {
    for (const [group, freq] of this.#store.entries()) {
      yield [group, freq / this.#total];
    }
  }

  keys(): IterableIterator<TGroup> {
    return this.#store.keys();
  }

  values(): IterableIterator<number> {
    return this.#store.values();
  }

  averageFrequency(): number {
    let total = 0;
    for (const freq of this.#store.values()) {
      total += freq;
    }
    return total / this.#store.size;
  }
}
