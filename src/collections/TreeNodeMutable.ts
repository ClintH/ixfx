// #region Import
import {afterMatch} from "../Text.js";
import {QuadTreeItem} from "../geometry/QuadTree.js";
import {without} from "./Arrays.js";
import * as Trees from "./Trees.js";
import { couldAddChild, directChildren } from "./Trees.js";
// #endregion

/**
 * Basic tree node implementation
 */
export class TreeNodeMutable<V> implements Trees.TreeNode {
  value: V;
  readonly label: string;
  #children: readonly TreeNodeMutable<V>[];
  #parent: TreeNodeMutable<V>| undefined;

  /**
   * Constructor
   * @param value Value associated with node 
   * @param label Label
   */
  constructor(value:V, label:string) {
    this.value = value;
    this.label = label;
    this.#children = [];
  }

  getLengthChildren(): number {
    return this.#children.length;
  }

  hasChild = (possibleChild:TreeNodeMutable<V>) => Trees.hasChild(this, possibleChild);
  hasAnyChild = (possibleChild:TreeNodeMutable<V>) => Trees.hasAnyChild(this, possibleChild);

  hasParent = (possibleParent:TreeNodeMutable<V>) => Trees.hasParent(this, possibleParent);
  hasAnyParent = (possibleParent:TreeNodeMutable<V>) => Trees.hasAnyParent(this, possibleParent);
;
  getByPath = (path:string, opts:Trees.PathOpts = {}):TreeNodeMutable<V>|undefined => {
    const e = Trees.getByPath(path, this, opts);
    if (!e[1]) return;
    return (e[1] as TreeNodeMutable<V>)
  }

  /**
   * Adds a value by a string path.
   * Automatically generates intermediate nodes.
   * 
   * ```js
   * const rootValue = {}
   * const root = treeNodeMutable(rootValue, 'pc');
   * root.addValueByPath({x:'c'},  'c');
   * root.addValueByPath({x:'admin'}, 'c.users.admin');
   * ```
   * 
   * Creates the structure:
   * ```
   * pc         {}
   * + c        {x: 'c' }
   *  + users   undefined
   *   + admin  {x: 'admin'}    
   * ```
   * @param value 
   * @param path 
   * @param pathOpts 
   */
  addValueByPath(value:V, path:string, pathOpts:Trees.PathOpts = {}) {
    const sep = pathOpts.separator ?? '.';
    const split = path.split(sep);
    const label = split.at(-1); //afterMatch(path, sep, { fromEnd: true });
    let node:TreeNodeMutable<any> = this;

    for (const p of split) {
      const found = node?.findChild(p);
      if (!found && node) {
        const n = new TreeNodeMutable<V|undefined>(undefined, p);
        node.add(n);
        node = n;
      } else if (found) {
        node = found;
      }
    }
    if (node) node.value = value;
  }

  /**
   * Adds a child
   * Throws an error if child cannot be added due to logical inconsistency (eg adding a child to self)
   * @param child 
   */
  add(child:TreeNodeMutable<V>) {
    Trees.couldAddChild(this, child);
    this.#children = [...this.#children, child];
    if (child.#parent) {
      child.#parent.remove(child);
    }
    child.#parent = this;
  }

  /**
   * Removes a child node.
   * Throws an exception if child was not found
   * @param child 
   */
  remove(child:TreeNodeMutable<V>) {
    if (child.#parent !== this) throw new Error(`child.parent doesn't match`);
    const w = without(this.#children, child);
    if (w.length === this.#children.length) throw new Error(`child not found in descendants`);
    this.#children = w;
  }

  /**
   * Sets the descendents of the node
   * 'Unparents' existing children nodes. Checks each new node that it can
   * be logically added
   * @param d 
   */
  setDescendants(d:TreeNodeMutable<V>[]) {
    // Unset existing
    for (const d of this.#children) {
      d.#parent = undefined;
    }

    for (const dd of d) {
      couldAddChild(this, dd);
      dd.#parent = this;      
    }
    this.#children = d;
  }

  /**
   * Returns a string representation of tree
   * @param indent 
   * @returns 
   */
  prettyPrint(indent = 0):string {
    const t = `${'  '.repeat(indent)} + label: ${this.label} value: ${this.value ? JSON.stringify(this.value) : '-'}`;
    if (this.#children.length) {
      return t + '\n' + this.#children.map(d => d.prettyPrint(indent+1)).join('\n');
    } else {
      return t;
    }
  }

  /**
   * Iterates all parents up to its root.
   * First result is the immediate parent.
   */
  *parents():IterableIterator<TreeNodeMutable<V>> {
    let n:TreeNodeMutable<V>|undefined = this;
    while (n.#parent !== undefined) {
      yield n.#parent
      n = n.#parent;
    }
  }

  /**
   * Iterates over the direct descendents of node
   */
  *children():IterableIterator<TreeNodeMutable<V>> {
    for (const c of this.#children) {
      yield c;
    }
  }

  /**
   * Searches direct children, returning the node that has the given `label`
   * @param label 
   * @returns 
   */
  findChild(label:string):TreeNodeMutable<V>|undefined {
    if (label === undefined) throw new Error(`label param cannot be undefined`)
    for (const c of this.#children) {
      if (c.label === label) return c;
    }
  }

  /**
   * Returns _true_ if this node is root,
   * ie. does not have a parent
   */
  get isRoot():boolean {
    return this.#parent === undefined;
  }

  /**
   * Returns _true_ if this node has no children
   */
  get isEmpty():boolean {
    return this.#children.length === 0;
  }
}

/**
 * Creates a tree node from an object
 * @param obj 
 * @param label 
 * @param parent 
 * @returns 
 */
export const fromObject = (obj:object, label = `root`, parent?:TreeNodeMutable<any>):TreeNodeMutable<any> => {
  const root = new TreeNodeMutable(obj, label);
  if (parent) parent.add(root);
  const children = [...directChildren(obj, label)];
  const childNodes = children.map(c => fromObject(c[1], c[0], root));
  root.setDescendants(childNodes);
  return root;
}


/**
 * Create a root tree node
 * @param value Value associated with node
 * @param label Label for node
 * @returns New TreeNodeMutable instance
 */
export const treeNodeMutable = <V>(value:V, label:string) => new TreeNodeMutable<V>(value, label);
