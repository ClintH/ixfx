import { isEqualDefault, type IsEqual } from "@ixfx/core"
import { without } from '@ixfx/arrays';
import { containsDuplicateInstances } from "@ixfx/arrays";
import { QueueMutable } from "../queue/queue-mutable.js"
import { StackMutable } from "../stack/StackMutable.js"
import { compare as treeCompare } from './compare.js';
import { toStringAbbreviate } from "@ixfx/core/text";
import type { LabelledSingleValue, TreeNode, SimplifiedNode, TraversableTree } from "./types.js"

/**
 * Compares two nodes.
 * 
 * By default uses `isEqualValueIgnoreOrder` to compare nodes. This means
 * values of nodes will be compared, ignoring the order of fields.
 * @param a 
 * @param b 
 * @param eq Comparison function. Uses `isEqualValueIgnoreOrder` by default.
 * @returns Compare results
 */
export const compare = <T>(a: TreeNode<T>, b: TreeNode<T>, eq?: IsEqual<T>) => {
  return treeCompare(asDynamicTraversable(a), asDynamicTraversable(b), eq);
}

/**
 * Converts `TreeNode` to `SimplifiedNode`, removing the 'parent' fields.
 * This can be useful because if you have the whole tree, the parent field
 * is redundant and because it makes circular references can make dumping to console etc more troublesome.
 * 
 * Recursive: strips parentage of all children and so on too.
 * @param node 
 * @returns 
 */
export const stripParentage = <T>(node: TreeNode<T>): SimplifiedNode<T> => {
  const n: SimplifiedNode<T> = {
    value: node.value,
    childrenStore: node.childrenStore.map(c => stripParentage(c))
  }
  return n;
}
/**
 * Wraps a {@link TreeNode} for a more object-oriented means of access.
 */
export type WrappedNode<T> = TraversableTree<T> & {
  /**
   * Underlying Node
   */
  wraps: TreeNode<T>,
  /**
   * Gets value, if defined
   * @returns Value of Node
   */
  getValue: () => T | undefined
  /**
   * Remove node and its children from tree
   * @returns 
   */
  remove: () => void
  /**
   * Adds a child node
   * @param child 
   * @returns 
   */
  add: (child: WrappedNode<T> | TreeNode<T>) => WrappedNode<T>
  /**
   * Adds a new child node, with `value` as its value
   * @param value 
   * @returns 
   */
  addValue: (value: T) => WrappedNode<T>
  /**
   * Returns _true_ if `child` is an immediate child of this node
   * @param child 
   * @returns 
   */
  hasChild: (child: WrappedNode<T> | TreeNode<T>) => boolean
  queryValue: (value: T) => IterableIterator<WrappedNode<T>>
  /**
   * Returns _true_ if `child` is contained any any descendant
   * @param child
   * @returns 
   */
  hasAnyChild: (child: WrappedNode<T> | TreeNode<T>) => boolean
  /**
   * Returns _true_ if `parent` is the immediate parent for this node
   * @param parent 
   * @returns 
   */
  hasParent: (parent: WrappedNode<T> | TreeNode<T>) => boolean
  /**
   * Returns _true_ if `parent` is the immediate or ancestor parent for this node
   * @param parent 
   * @returns 
   */
  hasAnyParent: (parent: WrappedNode<T> | TreeNode<T>) => boolean
}

const unwrapped = <T>(node: TreeNode<T> | WrappedNode<T>) => (`wraps` in node) ? node.wraps : node;
const wrapped = <T>(node: TreeNode<T> | WrappedNode<T>) => (`wraps` in node) ? node : wrap(node);

/**
 * Wraps node `n` for a more object-oriented means of access.
 * It will wrap child nodes on demand. For this reason, WrappedNode object
 * identity is not stable
 * @param n Node to wrap
 * @returns 
 */
export const wrap = <T>(n: TreeNode<T>): WrappedNode<T> => {
  return {
    *children() {
      for (const c of n.childrenStore) {
        yield wrap(c)
      }
    },
    getValue: () => n.value as T,
    getIdentity: () => n,
    *queryValue(value: T): IterableIterator<WrappedNode<T>> {
      for (const v of queryByValue(value, unwrapped(n))) {
        yield wrap(v);
      }
    },
    getParent: () => n.parent === undefined ? undefined : wrap(n.parent),
    hasParent: (parent: WrappedNode<T> | TreeNode<T>): boolean => {
      return hasParent(n, unwrapped(parent));
    },
    hasAnyParent: (parent: WrappedNode<T> | TreeNode<T>): boolean => {
      return hasAnyParent(n, unwrapped(parent));
    },
    hasChild: (child: WrappedNode<T> | TreeNode<T>): boolean => {
      return hasChild(unwrapped(child), n);
    },
    hasAnyChild: (child: WrappedNode<T> | TreeNode<T>): boolean => {
      return hasAnyChild(unwrapped(child), n);
    },
    remove: () => {
      remove(n);
    },
    addValue: (value: T): WrappedNode<T> => {
      const nodeValue = addValue(value, n);
      return wrap(nodeValue);
    },
    add: (child: WrappedNode<T> | TreeNode<T>): WrappedNode<T> => {
      add(unwrapped(child), n);
      return wrapped(child);
    },
    wraps: n
  }
}

/**
 * Removes `child` from the tree structure it is in.
 * It removes `child` from its parent. Any sub-children of `child` still remain connected.
 * @param child 
 * @returns 
 */
export const remove = <T>(child: TreeNode<T>) => {
  const p = child.parent;
  if (p === undefined) return;
  child.parent = undefined;
  p.childrenStore = without(p.childrenStore, child);
};

/**
 * Depth-first iteration of the children of `node`
 * @param node 
 * @returns 
 */
export function* depthFirst<T>(node: TreeNode<T>): IterableIterator<TreeNode<T>> {
  if (!root) return;
  const stack = new StackMutable<TreeNode<T>>();
  stack.push(...node.childrenStore);
  let entry: TreeNode<T> | undefined = stack.pop();
  while (entry) {
    yield entry;
    if (entry) {
      stack.push(...entry.childrenStore);
    }
    if (stack.isEmpty) break;
    entry = stack.pop();
  }
}

/**
 * Breadth-first iteration of the children of `node`
 * @param node 
 * @returns 
 */
export function* breadthFirst<T>(node: TreeNode<T>): IterableIterator<TreeNode<T>> {
  if (!node) return;
  const queue = new QueueMutable<TreeNode<T>>();
  queue.enqueue(...node.childrenStore);
  let entry: TreeNode<T> | undefined = queue.dequeue();
  while (entry) {
    yield entry;
    if (entry) {
      queue.enqueue(...entry.childrenStore);
    }
    if (queue.isEmpty) break;
    entry = queue.dequeue();
  }
}

/**
 * Validates the tree from `root` downwards.
 * @param root 
 * @param seen 
 * @returns 
 */
export function treeTest<T>(root: TreeNode<T>, seen: TreeNode<T>[] = []): [ ok: boolean, msg: string, node: TreeNode<T> ] {
  if (root.parent === root) return [ false, `Root has itself as parent`, root ];
  if (seen.includes(root)) return [ false, `Same node instance is appearing further in tree`, root ];
  seen.push(root);
  if (containsDuplicateInstances(root.childrenStore)) return [ false, `Children list contains duplicates`, root ];

  for (const c of root.childrenStore) {
    if (c.parent !== root) return [ false, `Member of childrenStore does not have .parent set`, c ];
    if (hasAnyChild(root, c)) return [ false, `Child has parent as its own child`, c ];
    const v = treeTest(c, seen);
    if (!v[ 0 ]) return v;
  }
  return [ true, ``, root ];
}

/**
 * Throws an exception if `root` fails tree validation
 * @param root 
 * @returns 
 */
export function throwTreeTest<T>(root: TreeNode<T>) {
  const v = treeTest(root);
  if (v[ 0 ]) return;
  throw new Error(`${ v[ 1 ] } Node: ${ toStringAbbreviate(v[ 2 ].value, 30) }`, { cause: v[ 2 ] })
}
/**
 * Iterate over direct children of `root`
 * @param root 
 */
export function* children<T>(root: TreeNode<T>): IterableIterator<TreeNode<T>> {
  for (const c of root.childrenStore) {
    yield c;
  }
}

/**
 * Iterate over all parents of `root`. First result is the immediate parent.
 * @param root 
 */
export function* parents<T>(root: TreeNode<T>): IterableIterator<TreeNode<T>> {
  let p = root.parent;
  while (p) {
    yield p;
    p = p.parent;
  }
}

/**
 * Returns the depth of `node`. A root node (ie. with no parents) has a depth of 0.
 * @param node 
 * @returns 
 */
export function nodeDepth(node: TreeNode<any>): number {
  const p = [ ...parents(node) ];
  return p.length;
}

export const hasChild = <T>(child: TreeNode<T>, parent: TreeNode<T>) => {
  for (const c of parent.childrenStore) {
    if (c === child) return true;
  }
  return false;
}

export const findChildByValue = <T>(value: T, parent: TreeNode<T>, eq: IsEqual<T> = isEqualDefault): TreeNode<T> | undefined => {
  for (const c of parent.childrenStore) {
    if (eq(value, c.value as T)) return c;
  }
}

export function* queryByValue<T>(value: T, parent: TreeNode<T>, eq: IsEqual<T> = isEqualDefault): IterableIterator<TreeNode<T>> {
  for (const c of parent.childrenStore) {
    if (eq(value, c.value as T)) yield c;
  }
}

/**
 * Returns _true_ if `prospectiveChild` is some child node of `parent`,
 * anywhere in the tree structure.
 * 
 * Use {@link hasChild} to only check immediate children.
 * @param prospectiveChild 
 * @param parent 
 * @returns 
 */
export const hasAnyChild = <T>(prospectiveChild: TreeNode<T>, parent: TreeNode<T>) => {
  for (const c of breadthFirst(parent)) {
    if (c === prospectiveChild) return true;
  }
  return false;
}

export const findAnyChildByValue = <T>(value: T, parent: TreeNode<T>, eq: IsEqual<T> = isEqualDefault) => {
  for (const c of breadthFirst(parent)) {
    if (eq(c.value as T, value)) return c;
  }
}

export const getRoot = <T>(node: TreeNode<T>): TreeNode<T> => {
  if (node.parent) return getRoot(node.parent);
  return node;
}

/**
 * Returns _true_ if `prospectiveParent` is any ancestor
 * parent of `child`.
 * 
 * Use {@link hasParent} to only check immediate parent.
 * @param child 
 * @param prospectiveParent 
 * @returns 
 */
export const hasAnyParent = <T>(child: TreeNode<T>, prospectiveParent: TreeNode<T>) => {
  for (const p of parents(child)) {
    if (p === prospectiveParent) return true;
  }
  return false;
}

/**
 * Returns _true_ if `prospectiveParent` is the immediate
 * parent of `child`.
 * 
 * Use {@link hasAnyParent} to check for any ancestor parent.
 * @param child 
 * @param prospectiveParent 
 * @returns 
 */
export const hasParent = <T>(child: TreeNode<T>, prospectiveParent: TreeNode<T>) => {
  return child.parent === prospectiveParent;
}

/**
 * Computes the maximum depth of the tree.
 * That is, how many steps down from `node` it can go.
 * If a tree is: root -> childA -> subChildB
 * ```js
 * // Yields 2, since there are at max two steps down from root
 * computeMaxDepth(root); 
 * ```
 * @param node 
 * @returns 
 */
export const computeMaxDepth = <T>(node: TreeNode<T>) => {
  return computeMaxDepthImpl(node, 0);
}

const computeMaxDepthImpl = <T>(node: TreeNode<T>, startingDepth = 0) => {
  let depth = startingDepth;
  for (const c of node.childrenStore) {
    depth = Math.max(depth, computeMaxDepthImpl(c, startingDepth + 1));
  }
  return depth;
}

export const add = <T>(child: TreeNode<T>, parent: TreeNode<T>) => {
  throwAttemptedChild(child, parent);
  //if (hasAnyChild(parent, child)) throw new Error(`Parent already contains child`);
  //if (hasAnyParent(child, parent)) throw new Error(`Child already has parent`);
  const p = child.parent;
  parent.childrenStore = [ ...parent.childrenStore, child ];
  child.parent = parent;
  if (p) {
    p.childrenStore = without(p.childrenStore, child);
  }
}

export const addValue = <T>(value: T | undefined, parent: TreeNode<T>) => {
  return createNode(value, parent);
}

/**
 * Creates the root for a tree, with an optional `value`.
 * Use {@link rootWrapped} if you want a more object-oriented mode of access.
 * @param value 
 * @returns 
 */
export const root = <T>(value?: T) => {
  return createNode(value);
}

export const fromPlainObject = (value: Record<string, any>, label = ``, parent?: TreeNode<any>, seen: any[] = []): TreeNode<LabelledSingleValue<any>> => {
  const entries = Object.entries(value);
  parent = parent === undefined ? root() : addValue<LabelledSingleValue<any>>({ label, value }, parent);
  for (const entry of entries) {
    const value = entry[ 1 ];
    // Avoid circular references
    if (seen.includes(value)) continue;
    seen.push(value);

    if (typeof entry[ 1 ] === `object`) {
      fromPlainObject(value, entry[ 0 ], parent, seen);
    } else {
      addValue<LabelledSingleValue<any>>({ label: entry[ 0 ], value: value }, parent);
    }
  }
  return parent;
}

/**
 * Creates a tree, returning it as a {@link WrappedNode} for object-oriented access.
 * Use {@link root} alternatively.
 * @param value 
 * @returns 
 */
export const rootWrapped = <T>(value: T | undefined) => {
  return wrap(createNode(value));
}

/**
 * Creates a `TreeNode` instance with a given value and parent.
 * Parent node, if specified, has its `childrenStore` property changed to include new child.
 * @param value 
 * @param parent 
 * @returns 
 */
export const createNode = <T>(value: T | undefined, parent?: TreeNode<T>): TreeNode<T> => {
  const n: TreeNode<T> = {
    childrenStore: [],
    parent: parent,
    value: value
  }
  if (parent !== undefined) {
    parent.childrenStore = [ ...parent.childrenStore, n ];
  }
  return n;
}

export const childrenLength = <T>(node: TreeNode<T>): number => {
  return node.childrenStore.length;
}

export const value = <T>(node: TreeNode<T>): T | undefined => {
  return node.value;
}

/**
 * Projects `node` as a dynamic traversable.
 * Dynamic in the sense that it creates the traversable project for nodes on demand.
 * A consequence is that node identities are not stable.
 * @param node 
 * @returns 
 */
export const asDynamicTraversable = <T>(node: TreeNode<T>): TraversableTree<T> => {
  const t: TraversableTree<T> = {
    *children() {
      for (const c of node.childrenStore) {
        yield asDynamicTraversable(c);
      }
    },
    getParent() {
      if (node.parent === undefined) return;
      return asDynamicTraversable(node.parent);
    },
    getValue(): any {
      return node.value;
    },
    getIdentity() {
      return node;
    },
  }
  return t;
}

const throwAttemptedChild = <T>(c: TreeNode<T>, parent: TreeNode<T>) => {
  if (parent === c) throw new Error(`Cannot add self as child`);
  if (c.parent === parent) return; // skip if it's already a child
  if (hasAnyParent(parent, c)) throw new Error(`Child contains parent (1)`, { cause: c });
  if (hasAnyParent(c, parent)) throw new Error(`Parent already contains child`, { cause: c });
  if (hasAnyChild(parent, c)) throw new Error(`Child contains parent (2)`, { cause: c });
}

export const setChildren = <T>(parent: TreeNode<T>, children: TreeNode<T>[]) => {
  // Verify children are legit
  for (const c of children) {
    throwAttemptedChild(c, parent);
  }

  parent.childrenStore = [ ...children ];
  for (const c of children) {
    c.parent = parent;
  }
}

export const toStringDeep = <T>(node: TreeNode<T>, indent = 0): string => {
  const t = `${ `  `.repeat(indent) } + ${ node.value ? JSON.stringify(node.value) : `-` }`;
  return node.childrenStore.length > 0 ? (
    t +
    `\n` +
    node.childrenStore.map((d) => toStringDeep(d, indent + 1)).join(`\n`)
  ) : t;
}

export function* followValue<T>(root: TreeNode<T>, continuePredicate: (nodeValue: T, depth: number) => boolean, depth = 1): IterableIterator<T | undefined> {
  for (const c of root.childrenStore) {
    const value = c.value;
    if (value === undefined) continue;
    if (continuePredicate(value, depth)) {
      yield c.value;
      yield* followValue(c, continuePredicate, depth + 1);
    }
  }
}

// export function* followNode<T>(root: Node<T>, continuePredicate: (nodeValue: T | undefined, depth: number) => boolean, depth = 1): IterableIterator<Node<T>> {
//   for (const c of root.childrenStore) {
//     if (continuePredicate(c.value, depth)) {
//       yield c;
//       yield* followNode(c, continuePredicate, depth + 1);
//     }
//   }
// }