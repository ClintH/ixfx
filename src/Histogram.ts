/// TODO: NEEDS TESTING

import {MutableMapMulti} from "./collections/MutableMapMulti";
import { ToString } from "./util";

export class MutableHistogram<V> {
  readonly #store:MutableMapMulti<V>;
  
  constructor(keyString: ToString<V> | undefined = undefined) {
    this.#store = new MutableMapMulti<V>(keyString);
  }

  #addSingle(v:V) {
    this.#store.add(v);
  }

  add(...v: V[]) {
    v.forEach(this.#addSingle);
  }

  count(key:string):number {
    return this.#store.count(key);
  }

  clear() {
    this.#store.clear();
  }

  delete(v: V) {
    this.#store.delete(v);   
  }

  has(v: V): boolean {
    return this.#store.has(v);
  }

}