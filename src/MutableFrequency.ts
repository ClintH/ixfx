/// ✔ Unit tested!

import { ToString } from "./util.js";
import {SimpleEventEmitter} from "./Events.js";
import * as KeyValueUtil from './KeyValue.js';
import {KeyValues} from "./index.js";

type FrequencyEventMap = {
  readonly change:void;
}

export const frequencyMutable = <V>(keyString?:ToString<V>|undefined) => new FrequencyMutable<V>(keyString);

/**
 * Mutable Frequency
 *
 * @example
 * ```
 * .add(value)  - adds a value
 * .clear()     - clears all data
 * .keys() / .values()  - returns an iterator for keys and values
 * .toArray()   - returns an array of data in the shape [[key,freq],[key,freq]...]
 * ```
 * 
 * @example
 * ```
 * const fh = new MutableFrequency();
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
 * @export
 * @class MutableFrequency
 * @extends {SimpleEventEmitter<FrequencyEventMap>}
 * @template V
 */
export class FrequencyMutable<V> extends SimpleEventEmitter<FrequencyEventMap> {
  readonly #store:Map<string, number>;
  readonly #keyString: ToString<V>;

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

  clear() {
    this.#store.clear();
    this.fireEvent(`change`, undefined);
  }
  
  keys():IterableIterator<string> {
    return this.#store.keys();
  }

  values():IterableIterator<number> {
    return this.#store.values();
  }

  toArray():[key:string, count:number][] {
    return Array.from(this.#store.entries());
  }

  frequencyOf(value:V|string):number|undefined {
    if (typeof value === `string`) return this.#store.get(value);

    const key = this.#keyString(value);
    return this.#store.get(key);
  }

  relativeFrequencyOf(value:V|string):number|undefined {
    if (typeof value === `string`) return this.#store.get(value);

    const key = this.#keyString(value);
    const freq = this.#store.get(key);
    if (freq === undefined) return;

    const mma = this.minMaxAvg();
    return freq / mma.total;
  }

  entries():Array<KeyValueUtil.KeyValue> {
    return Array.from(this.#store.entries());
  }
  
  minMaxAvg() {
    return KeyValues.minMaxAvg(this.entries());
  }

  entriesSorted(sortStyle:`value` | `valueReverse` | `key` | `keyReverse`):ReadonlyArray<KeyValues.KeyValue> {
    const s = KeyValueUtil.getSorter(sortStyle);
    return s(this.entries());
  }

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

