/// TODO: NEEDS TESTING

import { mutableMapArray } from "./collections/MutableMap";
import { ToString } from "./util";

export class MutableHistogram<V> {
  readonly #store;
  
  constructor(groupBy: ToString<V> | undefined = undefined) {
    this.#store = mutableMapArray<V>({groupBy});
  }

  #addSingle(v:V) {
    this.#store.addValue(v);
  }

  add(...v: readonly V[]) {
    v.forEach(this.#addSingle);
  }

  count(key:string):number {
    return this.#store.count(key);
  }

  clear() {
    this.#store.clear();
  }

  delete(v: V) {
    this.#store.deleteDeep(v);   
  }

  // has(v: V): boolean {
  //   return this.#store.hasKeyValue(v);
  // }

}