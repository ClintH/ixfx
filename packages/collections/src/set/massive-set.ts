/**
 * MassiveSet supports semantics similar to Set, but without the
 * limitation on how much data is stored.
 * 
 * It only supports strings, and stores data in a hierarchy.
 * 
 * ```js
 * const set = new MassiveSet(); // maxDepth=1 default
 * set.add(`test`);
 * set.add(`bloorp`);
 * ```
 * 
 * In the above example, it will create a subtree for the first letter
 * of each key, putting the value underneath it. So we'd get a sub
 * MassiveSet for every key starting with 't' and every one starting with 'b'.
 * 
 * If `maxDepth` was 2, we'd get the same two top-level nodes, but then
 * another sub-node based on the _second_ character of the value.
 * 
 * It's not a very smart data-structure since it does no self-balancing
 * or tuning.
 */
export class MassiveSet {
  #depth
  #maxDepth;
  children: Map<string, MassiveSet> = new Map<string, MassiveSet>();
  values: Array<string> = [];

  constructor(maxDepth = 1, depth = 0) {
    this.#depth = depth;
    this.#maxDepth = maxDepth;
  }

  /**
   * Returns the number of values stored in just this level of the set
   * @returns 
   */
  sizeLocal(): number {
    return this.values.length;
  }

  /**
   * Returns the number of branches at this node
   * Use {@link sizeChildrenDeep} to count all branches recursively
   * @returns 
   */
  sizeChildren(): number {
    return [ ...this.children.values() ].length;
  }

  sizeChildrenDeep(): number {
    let t = this.sizeChildren();
    for (const c of this.children.values()) {
      t += c.sizeChildrenDeep();
    }
    return t;
  }

  /**
   * Returns the total number of values stored in the set
   */
  size(): number {
    let x = this.values.length;
    for (const set of this.children.values()) {
      x += set.size();
    }
    return x;
  }

  add(value: string): void {
    if (typeof value !== `string`) throw new Error(`Param 'value' must be a string. Got: ${ typeof value }`);

    if (value.length === 0) throw new Error(`Param 'value' is empty`);

    const destination = this.#getChild(value, true);
    if (destination === this) {
      if (!this.hasLocal(value)) {
        this.values.push(value);
      }
      return;
    }

    if (!destination) throw new Error(`Could not create child set for: ${ value }`);
    destination.add(value);
  }

  remove(value: string): boolean {
    if (typeof value !== `string`) throw new Error(`Param 'value' must be a string. Got: ${ typeof value }`);
    if (value.length === 0) throw new Error(`Param 'value' is empty`);

    const destination = this.#getChild(value, false);
    if (destination === undefined) return false;
    if (destination === this) {
      if (this.hasLocal(value)) {
        this.values = this.values.filter(v => v !== value);
        return true;
      }
      return false; // Not found
    }
    return destination.remove(value);
  }

  debugDump(): void {
    const r = this.#dumpToArray();
    for (const rr of r) {
      console.log(rr);
    }
  }

  #dumpToArray(depth = 0) {
    const r: Array<string> = [];
    r.push(`Depth: ${ this.#depth } Max: ${ this.#maxDepth }`);
    for (const [ key, value ] of this.children.entries()) {
      const dumped = value.#dumpToArray(depth + 1);
      r.push(` key: ${ key }`);
      for (const d of dumped) {
        r.push(` `.repeat(depth + 1) + d);
      }
    }

    r.push(`Values: (${ this.values.length })`);
    for (const v of this.values) {
      r.push(` ${ v }`);
    }
    return r.map(line => ` `.repeat(depth) + line);
  }

  #getChild(value: string, create: boolean) {
    if (value === undefined) throw new Error(`Param 'value' undefined`);
    if (this.#depth === this.#maxDepth) return this;
    if (value.length <= this.#depth) return this;
    const k = value[ this.#depth ];
    if (k === undefined) throw new Error(`Logic error. Depth: ${ this.#depth } Len: ${ value.length }`);
    let child = this.children.get(k);
    if (child === undefined && create) {
      child = new MassiveSet(this.#maxDepth, this.#depth + 1);
      this.children.set(k, child);
    }
    return child;
  }

  /**
   * Returns _true_ if `value` stored on this node
   * @param value 
   * @returns 
   */
  hasLocal(value: string): boolean {
    for (const v of this.values) {
      if (v === value) return true;
    }
    return false;
  }

  has(value: string): boolean {
    if (typeof value !== `string`) return false;

    const destination = this.#getChild(value, false);
    if (destination === undefined) return false;
    if (destination === this) return this.hasLocal(value);
    return destination.has(value);
  }
}