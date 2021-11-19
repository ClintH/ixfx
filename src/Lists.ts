
/**
 * The circular array grows to a fixed size. Once full, new
 * items replace the oldest item in the array
 *
 * Add things using `add`, noting that it returns a new instance with the item added.
 * Like normal arrays, contents can be edited.
 * 
 * Usage:
 * ```
 * let a = new Circular(10);
 * let b = a.add(something);
 * ```
 * @class CircularArray
 * @extends {Array}
 * @template V
 */
class Circular<V> extends Array {
  #capacity:number;
  #pointer:number;
 
  constructor(capacity:number) {
    super();
    if (Number.isNaN(capacity)) throw Error('capacity is NaN');
    if (capacity <= 0) throw Error('capacity must be greater than zero');
    this.#capacity = capacity;
    this.#pointer = 0;
  }

  add(thing:V):Circular<V> {
    const ca = Circular.from(this) as Circular<V>;
    ca[this.#pointer] = thing;
    ca.#capacity= this.#capacity;
    ca.#pointer = this.#pointer +1 === this.#capacity ? 0 : this.#pointer+1;
    return ca;    
  }
}

/**
 * Lifo (last-in-first-out) grows to capacity, with new items added at position 0 of array.
 * Once full, older items are removed. 
 * `remove()` removes newest, while `removeLast()` removes oldest.
 * `peek()` returns the newest item
 *
 * @class Lifo
 * @extends {Array}
 * @template V
 */
class Lifo<V> extends Array {
  #capacity:number;
  
  /**
  * Create Lifo array.
  * @param {number} capacity Use <=0 for unlimited size
  * @memberof Lifo
  */
  constructor(capacity = -1) {
    super();
    this.#capacity = capacity;
  }

  add(thing:V):Lifo<V> {
    let size, len;
    if (this.#capacity > 0 && this.length >= this.#capacity) {
      size = this.#capacity;
      len = this.#capacity-1;
    } else {
      size = this.length +1;
      len = this.length;
    }
    
    const t = Array(size);
    t[0] = thing;
    for (let i=1;i<len+1;i++) {
      t[i] = this[i-1];
    }
    const a = Lifo.from(t) as Lifo<V>;
    a.#capacity = this.#capacity;
    return a;
  }

  peek():V {
    return this[0];
  }

  removeLast():Lifo<V> { 
    if (this.length === 0) return this;
    const a = Lifo.from(this.slice(0, this.length-1)) as Lifo<V>;
    a.#capacity = this.#capacity;
    return a;
  }

  remove():Lifo<V> {
    if (this.length === 0) return this;
    const a = Lifo.from(this.slice(1)) as Lifo<V>;
    a.#capacity = this.#capacity;
    return a;
  }
}

/**
 * Fifo (first-in-first-out) grows to capacity with new items being added to the end of the array
 * Once full, newer items are discarded.
 *
 * @class Fifo
 * @extends {Array}
 * @template V
 */
class Fifo<V> extends Array {
  #capacity:number;
  /**
   * Create fifo.
   * @param {number} capacity Use <=0 for unlimited size
   * @memberof Fifo
   */
  constructor(capacity = -1) {
    super();
    this.#capacity = capacity;
  }

  static create<V>(capacity:number, data:Array<V>):Fifo<V> {
    const q = new Fifo<V>(capacity);
    q.push(...data);
    return q;
  }

  add(thing:V):Fifo<V> {
    const d = [...this, thing];
    if (this.#capacity > 0 && d.length > this.#capacity) {
      return Fifo.create(this.#capacity, d.slice(0, this.#capacity));
    } return Fifo.create(this.#capacity, d);
  }

  peek():V {
    return this[0];
  }

  remove():Fifo<V> {
    if (this.length === 0) return this;
    const d = this.slice(1);
    return Fifo.create(this.#capacity, d);
  }
}


export {Circular, Lifo, Fifo};