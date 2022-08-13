/// ✔ Unit tested!

import { ToString } from "../Util.js";
import {SimpleEventEmitter} from "../Events.js";
import * as KeyValueUtil from '../KeyValue.js';
import {KeyValues} from "../index.js";

export type FrequencyEventMap = {
  readonly change:void;
}

export class FrequencyMutable<V> extends SimpleEventEmitter<FrequencyEventMap> {
  readonly #store:Map<string, number>;
  readonly #keyString: ToString<V>;

  /**
   * Constructor
   * @param keyString Function to key items. Uses JSON.stringify by default
   */
  constructor(keyString: ToString<V> | undefined = undefined) {
    super();
    this.#store = new Map();

    if (keyString === undefined) {
      keyString = (a) => {
        if (a === undefined) throw new Error(`Cannot create key for undefined`);
        if (typeof a === `string`) { 
          return a;
        } else { 
          return JSON.stringify(a);
        }
      };
    }
    this.#keyString = keyString;
  }

  /**
   * Clear data. Fires `change` event
   */
  clear() {
    this.#store.clear();
    this.fireEvent(`change`, undefined);
  }
  
  /**
   * @returns Iterator over keys (ie. groups)
   */
  keys():IterableIterator<string> {
    return this.#store.keys();
  }

  /**
   * @returns Iterator over frequency counts
   */
  values():IterableIterator<number> {
    return this.#store.values();
  }

  /**
   * @returns Copy of entries as an array of `[key, count]`
   */
  toArray():[key:string, count:number][] {
    return Array.from(this.#store.entries());
  }
  
  /**
   * Returns a string with keys and counts, useful for debugging.
   * @returns 
   */
  debugString():string {
    //eslint-disable-next-line functional/no-let
    let t = ``;
    //eslint-disable-next-line functional/no-loop-statement
    for (const [key, count] of this.#store.entries()) {
      t += `${key}: ${count}, `;
    }
    if (t.endsWith(`, `)) return t.substring(0, t.length-2);
    return t;
  }

  /**
   * 
   * @param value Value to count
   * @returns Frequency of value, or _undefined_ if it does not exist
   */
  frequencyOf(value:V|string):number|undefined {
    if (typeof value === `string`) return this.#store.get(value);

    const key = this.#keyString(value);
    return this.#store.get(key);
  }

  /**
   * 
   * @param value Value to count
   * @returns Relative frequency of `value`, or _undefined_ if it does not exist
   */
  relativeFrequencyOf(value:V|string):number|undefined {
    //eslint-disable-next-line functional/no-let
    let freq:number|undefined;
    if (typeof value === `string`) freq = this.#store.get(value);
    else {
      const key = this.#keyString(value);
      freq = this.#store.get(key);
    }
    if (freq === undefined) return;

    const mma = this.minMaxAvg();
    return freq / mma.total;
  }

  /**
   * @returns Copy of entries as an array 
   */
  entries():Array<KeyValueUtil.KeyValue> {
    return Array.from(this.#store.entries());
  }
  
  /**
   * 
   * @returns Returns `{min,max,avg,total}`
   */
  minMaxAvg() {
    return KeyValues.minMaxAvg(this.entries());
  }

  /**
   * 
   * @param sortStyle Sorting style (default: _value_, ie. count)
   * @returns Sorted array of [key,frequency]
   */
  entriesSorted(sortStyle:`value` | `valueReverse` | `key` | `keyReverse` = `value`):ReadonlyArray<KeyValues.KeyValue> {
    const s = KeyValueUtil.getSorter(sortStyle);
    return s(this.entries());
  }

  /**
   * 
   * @param values Values to add. Fires _change_ event after adding item(s)
   */
  add(...values:V[]) {
    if (values === undefined) throw new Error(`value parameter is undefined`);
    
    const keys = values.map(this.#keyString);
    
    //const key = this.#keyString(value);
    keys.forEach(key => {
      const score = this.#store.get(key) ?? 0;
      this.#store.set(key, score+1);  
    });
    this.fireEvent(`change`, undefined);
  }
}

/**
 * Frequency keeps track of how many times a particular value is seen, but
 * unlike a Map it does not store the data. By default compares
 * items by value (via JSON.stringify).
 * 
 * Create with {@link frequencyMutable}.
 * 
 * Fires `change` event when items are added or it is cleared.
 *
 * Overview
 * ```
 * const fh = frequencyMutable();
 * fh.add(value); // adds a value
 * fh.clear();    // clears all data
 * fh.keys() / .values() // returns an iterator for keys and values
 * fh.toArray();  //  returns an array of data in the shape [[key,freq],[key,freq]...]
 * ```
 * 
 * Usage
 * ```
 * const fh = frequencyMutable();
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
 * const fh = frequencyMutable( person => person.name);
 * // All people with name `Samantha` will be counted in same group
 * fh.add({name:`Samantha`, city:`Brisbane`});
 * ```
 * @template V Type of items
 */
export const frequencyMutable = <V>(keyString?:ToString<V>|undefined) => new FrequencyMutable<V>(keyString);
