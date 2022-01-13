/// ✔ Unit tested!

import { ToString } from "./util.js";
import {SimpleEventEmitter} from "./Events.js";
type MutableFreqHistogramEventMap = {
  readonly change:void;
}
/**
 * Mutable Frequency Histogram
 *
 * Usage:
 * ```
 * .add(value)  - adds a value
 * .clear()     - clears all data
 * .keys() / .values()  - returns an iterator for keys and values
 * .toArray()   - returns an array of data in the shape [[key,freq],[key,freq]...]
 * ```
 * 
 * Example
 * ```
 * const fh = new MutableFreqHistogram();
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
 * @class MutableFreqHistogram
 * @extends {SimpleEventEmitter<MutableFreqHistogramEventMap>}
 * @template V
 */
export class MutableFreqHistogram<V> extends SimpleEventEmitter<MutableFreqHistogramEventMap> {
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

  frequencyOf(value:V):number|undefined {
    const key = this.#keyString(value);

    return this.#store.get(key);
  }

  add(...values:V[]) {
    if (values === undefined) throw new Error(`value parameter is undefined`);
    
    const keys = values.map(this.#keyString);
    
    //const key = this.#keyString(value);
    keys.forEach(key => {
      let score = this.#store.get(key) ?? 0;
      this.#store.set(key, ++score);  
    });
    this.fireEvent(`change`, undefined);
  }
}

