import { keyValueSorter, type KeyValue, type KeyValueSortSyles, type ToString } from '@ixfx/core';
import { SimpleEventEmitter } from '@ixfx/events';
import { numberArrayCompute, type NumbersComputeResult } from '@ixfx/numbers';

export type FrequencyEventMap = {
  readonly change: { context: unknown };
};

/**
 * Wraps a {@link FrequencyTracker}, but ignores values that come from the same source.
 */
export class GatedFrequencyTracker<T> {
  readonly ft: FrequencyTracker<T>;
  readonly sources: Set<string> = new Set<string>();

  constructor(keyString?: ToString<T>) {
    this.ft = new FrequencyTracker<T>(keyString);
  }

  add(value: T, source: string): void {
    if (this.sources.has(source)) return;
    this.sources.add(source);
    this.ft.add(value);
  }

  clear(): void {
    this.ft.clear();
    this.sources.clear();
  }
}

/**
 * Frequency keeps track of how many times a particular value is seen, but
 * unlike a Map it does not store the data. By default compares
 * items by value (via JSON.stringify).
 *
 * Fires `change` event when items are added or it is cleared.
 *
 * Overview
 * ```
 * const fh = new FrequencyTracker();
 * fh.add(value); // adds a value
 * fh.clear();    // clears all data
 * fh.keys() / .values() // returns an iterator for keys and values
 * fh.toArray();  //  returns an array of data in the shape [[key,freq],[key,freq]...]
 * ```
 *
 * Usage
 * ```
 * const fh = new FrequencyTracker();
 * fh.add(`apples`); // Count an occurence of `apples`
 * fh.add(`oranges)`;
 * fh.add(`apples`);
 *
 * const fhData = fh.toArray(); // Expect result [[`apples`, 2], [`oranges`, 1]]
 * fhData.forEach((d) => {
 *  const [key,freq] = d;
 *  console.log(`Key '${key}' occurred ${freq} time(s).`);
 * })
 * ```
 *
 * Custom key string
 * ```
 * const fh = frequency( person => person.name);
 * // All people with name `Samantha` will be counted in same group
 * fh.add({name:`Samantha`, city:`Brisbane`});
 * ```
 * @typeParam V - Type of items
 */
export class FrequencyTracker<V> extends SimpleEventEmitter<FrequencyEventMap> {
  readonly #store: Map<string, number>;
  readonly #keyString: ToString<V>;
  #cachedResults: NumbersComputeResult | undefined;

  /**
   * Constructor
   * @param keyString Function to key items. Uses JSON.stringify by default
   */
  constructor(keyString?: ToString<V>) {
    super();
    this.#store = new Map();

    if (typeof keyString === `undefined`) {
      keyString = (a) => {
        if (a === undefined) throw new Error(`Cannot create key for undefined`);
        return typeof a === `string` ? a : JSON.stringify(a);
      };
    }
    this.#keyString = keyString;
  }

  /**
   * Clear data. Fires `change` event
   */
  clear(): void {
    this.#store.clear();
    this.#cachedResults = undefined;
    this.fireEvent(`change`, { context: this });
  }

  /**
   * @returns Iterator over keys (ie. groups)
   */
  keys(): IterableIterator<string> {
    return this.#store.keys();
  }

  /**
   * @returns Iterator over frequency counts
   */
  values(): IterableIterator<number> {
    return this.#store.values();
  }

  /**
   * @returns Copy of entries as an array of `[key, count]`
   */
  toArray(): [ key: string, count: number ][] {
    return [ ...this.#store.entries() ];
  }

  /**
   * Returns a string with keys and counts, useful for debugging.
   * @returns
   */
  debugString(): string {
    let t = ``;
    for (const [ key, count ] of this.#store.entries()) {
      t += `${ key }: ${ count.toString() }, `;
    }
    if (t.endsWith(`, `)) return t.slice(0, Math.max(0, t.length - 2));
    return t;
  }

  /**
   *
   * @param value Value to count
   * @returns Frequency of value, or _undefined_ if it does not exist
   */
  frequencyOf(value: V | string): number | undefined {
    if (typeof value === `string`) return this.#store.get(value);

    const key = this.#keyString(value);
    return this.#store.get(key);
  }

  /**
   * Gets the relative frequency of `value`.
   * @param value Value to count
   * @returns Relative frequency of `value`, or _undefined_ if it does not exist
   */
  relativeFrequencyOf(value: V | string): number | undefined {
    let freq: number | undefined;
    if (typeof value === `string`) freq = this.#store.get(value);
    else {
      const key = this.#keyString(value);
      freq = this.#store.get(key);
    }
    if (freq === undefined) return;

    const mma = this.computeValues();
    return freq / mma.total;
  }

  /**
   * Returns copy of entries as an array
   * @returns Copy of entries as an array
   */
  *entries(): Generator<[ string, number ], void, unknown> {
    //return [ ...this.#store.entries() ];
    yield* this.#store.entries();
  }

  /**
   * Yields key-value pairs, passing through the filter predicate
   * @param predicate 
   */
  *filterByTally(predicate: (tally: number) => boolean): Generator<[ string, number ], void, unknown> {
    for (const kv of this.#store.entries()) {
      if (predicate(kv[ 1 ])) {
        yield kv;
      }
    }
  }

  /**
  * Yields key-value pairs, passing through the filter predicate.
  * 
  * Passes a relative tally amount
  * ```js
  * // Get all key-value pairs where tally is 10% of total
  * for (const kv of fm.filterByRelativeTally(t=>t>0.1)) {
  * }
  * ```
  * @param predicate 
  */
  *filterByRelativeTally(predicate: (tally: number) => boolean): Generator<[ string, number ], void, unknown> {
    const total = this.computeValues().total;
    for (const kv of this.#store.entries()) {
      if (predicate(kv[ 1 ] / total)) {
        yield kv;
      }
    }
  }

  /**
   * Calculate min,max,avg,total & count from values
   * @returns Returns `{min,max,avg,total}`
   */
  computeValues(): NumbersComputeResult {
    if (!this.#cachedResults) {
      const valuesAsNumbers = [ ...this.values() ];
      this.#cachedResults = numberArrayCompute(valuesAsNumbers);
    }
    return this.#cachedResults;
  }

  /**
   * Return entries sorted
   * @param sortStyle Sorting style (default: _value_, ie. count)
   * @returns Sorted array of [key,frequency]
   */
  entriesSorted(
    sortStyle: KeyValueSortSyles = `value`
  ): KeyValue[] {
    const s = keyValueSorter(sortStyle);
    return s([ ...this.entries() ]);
  }

  /**
   * Add one or more values, firing _change_ event.
   * @param values Values to add. Fires _change_ event after adding item(s)
   */
  add(...values: V[]): void {
    if (typeof values === `undefined`) throw new Error(`Param 'values' undefined`);
    this.#cachedResults = undefined;

    const keys = values.map(v => this.#keyString(v));

    //const key = this.#keyString(value);
    for (const key of keys) {
      const score = this.#store.get(key) ?? 0;
      this.#store.set(key, score + 1);
    }
    this.fireEvent(`change`, { context: this });
  }
}


export const frequency = <V>(keyString?: ToString<V>): FrequencyTracker<V> =>
  new FrequencyTracker<V>(keyString);
