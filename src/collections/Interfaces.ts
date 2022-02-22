/* eslint-disable */
import {SimpleEventEmitter} from "../Events.js";
import {ToString, IsEqual} from "../Util.js";

/**
 * @private
 */
export type ArrayKeys<K, V> = ReadonlyArray<readonly [key:K, value:V]>;

/**
 * @private
 */
export type ObjKeys<K, V> = ReadonlyArray<{readonly key: K, readonly value: V}>;

/**
 * @private
 */
export type EitherKey<K, V> = ArrayKeys<K, V> | ObjKeys<K, V>;

/**
 * @private
 */
export type MapSetOpts<V> = MapMultiOpts<V> & {
  readonly hash:ToString<V>
};

/**
 * @private
 */
export type MapCircularOpts<V> = MapMultiOpts<V> & {
  readonly capacity:number
}

/**
 * @private
 */
export type MultiValue<V, M> = Readonly<{
  get name():string
  has(source:M, value:V): boolean
  add(destination:M|undefined, values:ReadonlyArray<V>):M
  toArray(source:M): ReadonlyArray<V>|undefined
  find(source:M, predicate:(v:V) => boolean): V|unknown
  filter(source:M, predicate:(v:V) => boolean): ReadonlyArray<V>
  without(source:M, value:V): ReadonlyArray<V>
  count(source:M): number
}>;

/**
 * @private
 */
export type MapMultiOpts<V> = {
  /**
   * Returns a group for values added via `addValue`. Eg. maybe you want to 
   * group values in the shape `{name: 'Samantha' city: 'Copenhagen'}` by city:
   * 
   * ```
   * const opts = {
   *  groupBy: (v) => v.city
   * }
   * ```
   *
   * @type {(ToString<V>|undefined)}
   */
  readonly groupBy?: ToString<V>|undefined
}

/**
 * @private
 */
export type MapArrayOpts<V> = MapMultiOpts<V> & {
  readonly comparer?:IsEqual<V>
  readonly toString?:ToString<V>
}

/**
 * @private
 */
export type ValueSetEventMap<V> = {
  readonly add: {readonly value: V, readonly updated: boolean}
  readonly clear: boolean
  readonly delete: V
}

export type DiscardPolicy = `older` | `newer` | `additions`;


/**
 * Queue (immutable). See also {@link QueueMutable}.
 * 
 * Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 *
 * ```js
 * let q = queue();           // Create
 * q = q.enqueue(`a`, `b`);   // Add two strings
 * const front = q.peek;      // `a` is at the front of queue (oldest)
 * q = q.dequeue();           // q now just consists of `b`  
 * ```
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = queue({capacity: 5, discardPolicy: `newer`});
 * ```
 * 
 */
export interface Queue<V> {
  /**
   * Enumerates queue from back-to-front
   *
  */
   forEach(fn:(v:V) => void): void


   /**
    * Enumerates queue from front-to-back
    * @param fn 
    */
   forEachFromFront(fn:(v:V) => void): void

  /**
   * Returns a new queue with items added
   * @param toAdd Items to add
   */
  enqueue(...toAdd: ReadonlyArray<V>): Queue<V>

  /**
   * Dequeues (removes oldest item / item at front of queue).
   * Use {@link peek} to get item that will be removed.
   * 
   * @returns Queue with item removed
   */
  dequeue(): Queue<V> 

/**
 * Returns true if queue is empty
 */
  get isEmpty(): boolean

  /** 
 * Is queue full? Returns _false_ if no capacity has been set
 */
  get isFull(): boolean
/** 
 * Number of items in queue
 */
  get length():number 

/**
 * Returns front of queue (oldest item), or _undefined_ if queue is empty
 */
  get peek(): V | undefined
  /** 
 * Data in queue as an array
 */
   get data():readonly V[]
}

/**
 * Queue (mutable). See also {@link Queue} for the immutable version.
 * 
 * Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 * 
 * ```js
 * const q = queue();       // Create
 * q.enqueue(`a`, `b`);     // Add two strings
 * const front = q.dequeue();  // `a` is at the front of queue (oldest)
 * ```
 *
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = queue({capacity: 5, discardPolicy: `newer`});
 * ```
 * 
 */
export interface QueueMutable<V> {
/**
 * Returns true if queue is empty
 */
  get isEmpty():boolean
  /**
   * Dequeues (removes oldest item / item at front of queue)
   * @returns Item, or undefined if queue is empty
   */
  readonly dequeue: () => V|undefined
/**
 * Enqueues (adds items to back of queue).
 * If a capacity is set, not all items might be added.
 * @returns How many items were added
 */
  readonly enqueue: (...toAdd:ReadonlyArray<V>) => number
    /**
   * Returns front of queue (oldest item), or _undefined_ if queue is empty
   */
  get peek():V|undefined
/** 
 * Number of items in queue
 */
  get length():number
  /** 
   * Is queue full? Returns _false_ if no capacity has been set
   */
  get isFull():boolean
/** 
 * Data in queue as an array
 */
  get data():readonly V[]
}

/**
 * A set which stores unique items, determined by their value, rather
 * than object reference. Create with {@link setMutable}. Mutable.
 * 
 * By default the JSON.stringify() representation is used to compare
 * objects.
 *
 * It fires `add`, `clear` and `delete` events.
 * 
 * Overview of functions
 * ```js
 * const s = setMutable();
 * s.add(item);    // Add one or more items. Items with same key are overriden.
 * s.has(item);    // Returns true if item *value* is present
 * s.clear();      // Remove everything
 * s.delete(item); // Delete item by value
 * s.toArray();    // Returns values as an array
 * s.values();     // Returns an iterator over values
 * ```
 * 
 * Usage
 * ```js
 * const people = [
 *  {name: `Barry`, city: `London`}
 *  {name: `Sally`, city: `Bristol`}
 * ];
 * const set = setMutable(person => {
 *  // Key person objects by name and city (assi)
 *  return `${person.name}-${person.city}`
 * });
 * set.add(...people);
 * 
 * set.has({name:`Barry`, city:`Manchester`})); // False, key is different (Barry-Manchester)
 * set.has({name:`Barry`, city:`London`}));     // True, we have Barry-London as a key
 * set.has(people[1]);   // True, key of object is found (Sally-Bristol)
 * ```
 * 
 * Events
 * ```js
 * set.addEventListener(`add`, ev => {
 *  console.log(`New item added: ${ev.value}`);
 * });
 * ```
 * 
 * @template V Type of data stored
 */
export interface SetMutable<V> extends SimpleEventEmitter<ValueSetEventMap<V>> {
  /**
   * Add `values` to set
   * @param v 
   */
  add(...values: ReadonlyArray<V>):void
  /**
   * Iterate over values
   * ```js
   * for (let value of set.values()) {
   *  // use value...
   * }
   * ```
   */
  values():IterableIterator<V>
  /**
   * Clears set
   */
  clear():void
/**
 * Deletes specified `value`
 * @param value
 */
  delete(value: V): boolean
/**
 * Returns _true_ if `value` is contained
 * @param v 
 */
  has(value: V): boolean 

  /**
   * Returns an array of values
   */
  toArray(): V[]
}

/**
 * Like a `Map` but multiple values can be stored for each key. 
 * Duplicate values can be added to the same or even a several keys.
 *
 * Three pre-defined MapOf's are available:
 * * {@link mapArray} - Map of mutable arrays
 * * {@link mapSet} - Map of mutable sets
 * * {@link mapCircular} - Map of immutable circular arrays
 * 
 * Several events can be listened to via `addEventListener`
 * * addedKey, addedValue - when a new key is added, or when a new value is added
 * * clear - when contents are cleared
 * * deleteKey - when a key is deleted
 * 
 * ```js
 * map.addEventLister(`addedKey`, ev => {
 *  console.log(`New key ${evt.key} seen.`);
 * });
 * ```
 * 
 * @template V Values stored under keys
 * @template M Type of data structure managing values
 */
 export interface MapOfMutable<V, M> extends SimpleEventEmitter<MapArrayEvents<V>> {

  /**
   * Returns the type name. For in-built implementations, it will be one of: array, set or circular
   */
  get typeName():string;

/**
 * Returns a human-readable rendering of contents 
 */
  debugString():string
/**
 * Returns list of keys
 */
  keys():readonly string[]
/**
 * Returns a list of all keys and count of items therein
 */
  keysAndCounts(): Array<[string, number]>

/**
 * Returns items under `key` or undefined if `key` is not found
 * @param key 
 */
  get(key:string):ReadonlyArray<V>|undefined

  /**
   * Returns the object managing values under the specified `key`
   * @private
   * @param key
   */
  getSource(key:string): M|undefined

/**
 * Returns _true_ if `value` is stored under `key`.
 *
 * @param key Key
 * @param value Value
 */
  hasKeyValue(key:string, value:V):boolean

  /**
 * Adds several `values` under the same `key`. Duplicate values are permitted, depending on implementation.
 * @param key
 * @param values
 */
  addKeyedValues(key: string, ...values: ReadonlyArray<V>):void
/**
 * Adds a value, automatically extracting a key via the
 * `groupBy` function assigned in the constructor options.
 * @param values Adds several values
 */
  addValue(...values:ReadonlyArray<V>):void

  /**
   * Clears the map
   */
  clear():void

/**
 * Deletes all values under `key` that match `value`.
 * @param key Key
 * @param value Value
 */
  deleteKeyValue(key: string, value: V):boolean
  
  /**
   * Deletes all values stored under `key`. Returns _true_ if key was found
   * @param key
   */
  delete(key:string): boolean

/**
 * Returns true if the map is empty
 */
  get isEmpty():boolean

  /**
   * REturns the length of the longest child item
   */
  get lengthMax():number; 
/**
 * Finds the first key where value is stored. 
 * Note: value could be stored in multiple keys
 * @param value Value to seek
 * @returns Key, or undefined if value not found
 */
  findKeyForValue(value: V): string | undefined
/**
 * Returns the number of values stored under `key`, or _0_ if `key` is not present.
 * @param key Key
 */
  count(key: string): number
}

/**
 * @private
 */
export type MapArrayEvents<V> = {
  readonly addedValues: {readonly values: ReadonlyArray<V>}
  readonly addedKey: {readonly key: string }
  readonly clear: boolean
  readonly deleteKey: {readonly key: string}
}

/**
 * The circular array is immutable. It keeps up to `capacity` items.
 * Old items are overridden with new items.
 * 
 * `CircularArray` extends the regular JS array. Only use `add` to change the array if you want
 * to keep the `CircularArray` behaviour.
 * @example
 * ```js
 * let a = circularArray(10);
 * a = a.add(`hello`); // Because it's immutable, capture the return result of `add`
 * a.isFull;  // True if circular array is full
 * a.pointer; // The current position in array it will write to
 * ```
 * @class CircularArray
 * @extends {Array}
 * @template V
 */
export interface CircularArray<V> extends Array<V> {
/**
 * Returns true if the array has filled to capacity and is now
 * recycling array indexes.
 */
  get isFull():boolean

/**
 * Returns a new Circular with item added
 * 
 * Items are added at `pointer` position, which automatically cycles through available array indexes.
 *
 * @param {V} thing Thing to add
 * @returns {Circular<V>} Circular with item added
 * @memberof Circular
 */
  add(v:V):CircularArray<V>

  get length():number

/** 
 * Returns the current add position of array.
 */
  get pointer():number
}

/**
 * A simple mutable map of arrays, without events. It can store multiple values
 * under the same key.
 * 
 * For a fancier approaches, consider {@link mapArray}, {@link mapCircular} or {@link mapSet}.
 * 
 * @example
 * ```js
 * const m = simpleMapArrayMutable();
 * m.add(`hello`, 1, 2, 3); // Adds numbers under key `hello`
 * m.delete(`hello`);       // Deletes everything under `hello`
 * 
 * const hellos = m.get(`hello`); // Get list of items under `hello`
 * ```
 *
 * @template V Type of items
 */
 export interface SimpleMapArrayMutable<V> {
   /**
    * Adds `values` under specified `key`
    * @param key 
    * @param values 
    */
  add(key:string, ...values:ReadonlyArray<V>):void

  /**
   * Get items at key. Returns _undefined_ if key does not exist
   * @param key 
   */
  get(key:string):ReadonlyArray<V>|undefined

  /**
   * Deletes the specified `value` under `key`. Returns true if found.
   * @param key 
   * @param value
   */
  delete(key: string, value: V): boolean

  /**
   * Removes all data
   */
  clear():void
}

/**
 * A mutable Set that compares by value
 */
export interface SetMutable<V> {
  /**
   * Add item
   */
  add (item:V): void
  /**
   * Retuns true if set contains item
   */
  has(item:V): boolean
}

/**
 * An immutable map. Rather than changing the map, functions like `add` and `delete` 
 * return a new map reference which must be captured.
 * 
 * Immutable data is useful because as it gets passed around your code, it never
 * changes from underneath you. You have what you have.
 * 
 * @example
 * ```js
 * let m = map(); // Create
 * let m2 = m.set(`hello`, `samantha`);
 * // m is still empty, only m2 contains a value.
 * ```
 * 
 * @template K Type of map keys. Typically `string`
 * @template V Type of stored values
 */
export interface MapImmutable<K, V> {
  /**
   * Adds one or more items, returning the changed map.
   * 
   * Can add items in the form of `[key,value]` or `{key, value}`.
   * @example These all produce the same result
   * ```js
   * map.set(`hello`, `samantha`);
   * map.add([`hello`, `samantha`]);
   * map.add({key: `hello`, value: `samantha`})
   * ```
   * @param itemsToAdd 
   */
  add(...itemsToAdd: EitherKey<K, V>): MapImmutable<K, V>
  /**
   * Deletes an item by key, returning the changed map
   * @param key 
   */
  delete(key: K): MapImmutable<K, V>
  /**
   * Returns an empty map
   */
  clear(): MapImmutable<K, V>
  /**
   * Returns an item by key, or _undefined_ if not found
   * @example
   * ```js
   * const item = map.get(`hello`);
   * ```
   * @param key 
   */
  get(key: K): V | undefined
  /**
   * Returns _true_ if map contains `key`
   * @example
   * ```js
   * if (map.has(`hello`)) ...
   * ```
   * @param key
   */
  has(key: K): boolean
  /**
   * Returns _true_ if map is empty
   */
  isEmpty(): boolean
  /**
   * Iterates over entries (in the form of [key,value])
   * 
   * @example
   * ```js
   * for (const [key, value] of map.entries()) {
   *  // Use key, value...
   * }
   * ```
   */
  entries(): IterableIterator<readonly [K, V]>
}

/**
 * A mutable map.
 * 
 * It is a wrapper around the in-built Map type, but adds roughly the same API as {@link MapImmutable}.
 * 
 * @template K Type of map keys. Typically `string`
 * @template V Type of stored values
 */
export interface MapMutable<K, V> {
  /**
   * Adds one or more items to map
   * 
   * Can add items in the form of [key,value] or {key, value}.
   * @example These all produce the same result
   * ```js
   * map.set(`hello`, `samantha`);
   * map.add([`hello`, `samantha`]);
   * map.add({key: `hello`, value: `samantha`})
   * ```
   * @param itemsToAdd 
   * @param itemsToAdd 
   */
  add(...itemsToAdd: EitherKey<K, V>): void
  /**
   * Sets a value to a specified key
   * @param key 
   * @param value 
   */
  set(key: K, value: V): void
  /**
   * Deletes an item by key
   * @param key 
   */
  delete(key: K): void
  /**
   * Clears map
   */
  clear(): void
  /**
   * Gets an item by key
   * @example
   * ```js
   * const item = map.get(`hello`);
   * ```
   * @param key 
   */
  get(key: K): V | undefined
  /**
   * Returns _true_ if map contains key
   * @example
   * ```js
   * if (map.has(`hello`)) ...
   * ```
   * @param key
   */
  has(key: K): boolean
  /**
   * Returns _true_ if map is empty
   */
  isEmpty(): boolean
  /**
   * Iterates over entries (consisting of [key,value])
   * @example
   * ```js
   * for (const [key, value] of map.entries()) {
   *  // Use key, value...
   * }
   * ```
   */
  entries(): IterableIterator<readonly [K, V]>
}

/**
 * Stack (mutable)
 * 
 * @example Overview
 * ```
 * stack.push(item); // Add one or more items to the top of the stack
 * stack.pop(); // Removes and retiurns the item at the top of the stack (ie the newest thing)
 * stack.peek; // Return what is at the top of the stack or undefined if empty
 * stack.isEmpty/.isFull;
 * stack.length; // How many items in stack
 * stack.data; // Get the underlying array
 * ```
 * 
 * @example
 * ```
 * const sanga = new MutableStack();
 * sanga.push(`bread`, `tomato`, `cheese`);
 * sanga.peek;  // `cheese`
 * sanga.pop(); // removes `cheese`
 * sanga.peek;  // `tomato`
 * sanga.push(`lettuce`, `cheese`); // Stack is now [`bread`, `tomato`, `lettuce`, `cheese`]
 * ```
 *
 * Stack can also be created from the basis of an existing array. First index of array will be the bottom of the stack.
 * @template V
 */
 export interface StackMutable<V> extends StackBase<V> {
  /**
   * Add items to the 'top' of the stack.
   * 
   * @param toAdd Items to add.
   * @returns How many items were added
   */
  push(...toAdd: ReadonlyArray<V>): number

  /**
   * Remove and return item from the top of the stack, or _undefined_ if empty.
   * If you just want to find out what's at the top, use {@link peek}.
   */
  pop(): V|undefined 

}

/**
 * Stack (immutable)
 * 
 * @example Overview
 * ```js
 * stack.push(item); // Return a new stack with item(s) added
 * stack.pop();      // Return a new stack with top-most item removed (ie. newest)
 * stack.peek;       // Return what is at the top of the stack or undefined if empty
 * stack.isEmpty;     
 * stack.isFull;
 * stack.length;     // How many items in stack
 * stack.data;       // Get the underlying array
 * ```
 * 
 * @example
 * ```js
 * let sanga = new Stack();
 * sanga = sanga.push(`bread`, `tomato`, `cheese`);
 * sanga.peek;  // `cheese`
 * sanga = sanga.pop(); // removes `cheese`
 * sanga.peek;  // `tomato`
 * const sangaAlt = sanga.push(`lettuce`, `cheese`); // sanga stays [`bread`, `tomato`], while sangaAlt is [`bread`, `tomato`, `lettuce`, `cheese`]
 * ```
 *
 * Stack can also be created from the basis of an existing array. First index of array will be the bottom of the stack.
 * @class Stack
 * @template V
 */
 export interface Stack<V> extends StackBase<V> {
  push(...toAdd: ReadonlyArray<V>): Stack<V>
  pop(): Stack<V>
}

export interface StackBase<V> {
/**
 * Enumerates stack from bottom-to-top
 *
 */
  forEach(fn:(v:V) => void): void


  /**
   * Enumerates stack from top-to-bottom
   * @param fn 
   */
  forEachFromTop(fn:(v:V) => void): void

  get data():readonly V[]
 /** 
   * _True_ if stack is empty
   */
  get isEmpty(): boolean

  /** 
   * _True_ if stack is at its capacity. _False_ if not, or if there is no capacity.
   */
  get isFull(): boolean 

  /** 
   * Get the item at the top of the stack without removing it (like {@link pop} would do)
   * @returns Item at the top of the stack, or _undefined_ if empty.
   */
  get peek(): V | undefined

  /** 
   * Number of items in stack
   */
  get length():number 
}