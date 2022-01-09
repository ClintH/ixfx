/// TODO: NEEDS TESTING

import {MapMulti} from "./collections/MapMulti";
import { KeyString } from "./util";

export class MutableHistogram<V> {
  readonly #store:MapMulti<V>;
  
  constructor(keyString: KeyString<V> | undefined = undefined) {
    this.#store = new MapMulti<V>(keyString);
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