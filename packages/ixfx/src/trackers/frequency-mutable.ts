import { keyValueSorter, type KeyValue, type KeyValueSortSyles, type ToString } from '@ixfxfun/core';
import { SimpleEventEmitter } from '@ixfxfun/events';
import { numberArrayCompute } from '@ixfxfun/numbers';


export type FrequencyEventMap = {
  readonly change: { context: unknown };
};

export class FrequencyTracker<V> extends SimpleEventEmitter<FrequencyEventMap> {
  readonly #store: Map<string, number>;
  readonly #keyString: ToString<V>;

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
  clear() {
    this.#store.clear();
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
   *
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
  entries(): KeyValue[] {
    return [ ...this.#store.entries() ];
  }

  /**
   * Calculate min,max,avg,total & count from values
   * @returns Returns `{min,max,avg,total}`
   */
  computeValues() {
    const valuesAsNumbers = [ ...this.values() ];
    return numberArrayCompute(valuesAsNumbers);
  }

  /**
   * Return entries sorted
   * @param sortStyle Sorting style (default: _value_, ie. count)
   * @returns Sorted array of [key,frequency]
   */
  entriesSorted(
    sortStyle: KeyValueSortSyles = `value`
  ): readonly KeyValue[] {
    const s = keyValueSorter(sortStyle);
    return s(this.entries());
  }

  /**
   * Add one or more values, firing _change_ event.
   * @param values Values to add. Fires _change_ event after adding item(s)
   */
  add(...values: V[]) {
    if (typeof values === `undefined`) throw new Error(`Param 'values' undefined`);

    const keys = values.map(v => this.#keyString(v));

    //const key = this.#keyString(value);
    for (const key of keys) {
      const score = this.#store.get(key) ?? 0;
      this.#store.set(key, score + 1);
    }
    this.fireEvent(`change`, { context: this });
  }
}

/**
 * Frequency keeps track of how many times a particular value is seen, but
 * unlike a Map it does not store the data. By default compares
 * items by value (via JSON.stringify).
 *
 * Create with {@link Trackers.frequency}.
 *
 * Fires `change` event when items are added or it is cleared.
 *
 * Overview
 * ```
 * const fh = Trackers.frequency();
 * fh.add(value); // adds a value
 * fh.clear();    // clears all data
 * fh.keys() / .values() // returns an iterator for keys and values
 * fh.toArray();  //  returns an array of data in the shape [[key,freq],[key,freq]...]
 * ```
 *
 * Usage
 * ```
 * const fh = Trackers.frequency();
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
 * const fh = Trackers.frequency( person => person.name);
 * // All people with name `Samantha` will be counted in same group
 * fh.add({name:`Samantha`, city:`Brisbane`});
 * ```
 * @typeParam V - Type of items
 */
export const frequency = <V>(keyString?: ToString<V>) =>
  new FrequencyTracker<V>(keyString);
