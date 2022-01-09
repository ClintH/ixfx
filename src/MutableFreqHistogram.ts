/// TODO: NEEDS TESTING
import { KeyString } from "./util.js";
import {SimpleEventEmitter} from "./Events.js";
type MutableFreqHistogramEventMap = {
  changed:void;
}

export class MutableFreqHistogram<V> extends SimpleEventEmitter<MutableFreqHistogramEventMap> {
  readonly #store:Map<string, number>;
  readonly #keyString: KeyString<V>;

  constructor(keyString: KeyString<V> | undefined = undefined) {
    super();
    this.#store = new Map();

    if (keyString === undefined) {
      keyString = (a) => {
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
    this.fireEvent(`changed`, undefined);
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

  add(value:V) {
    if (value === undefined) throw new Error(`value parameter is undefined`);
    const key = this.#keyString(value);
    let score = this.#store.get(key) ?? 0;
    score++;
    this.#store.set(key, score);
    this.fireEvent(`changed`, undefined);
  }
}