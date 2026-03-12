import type { IsEqual } from "@ixfx/core";
import type { DiffNode } from './compare.js';
import type { LabelledSingleValue, SimplifiedNode, TraversableTree, TreeNode, WrappedNode } from "./types.js";
import { containsDuplicateInstances, without } from '@ixfx/arrays';
import { isEqualDefault } from "@ixfx/core";
import { toStringAbbreviate } from "@ixfx/core/text";
import { QueueMutable } from "../queue/queue-mutable.js";
import { StackMutable } from "../stack/StackMutable.js";
import { compare as treeCompare } from './compare.js';

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
export function compare<T>(a: TreeNode<T>, b: TreeNode<T>, eq?: IsEqual<T>): DiffNode<T> {
  return treeCompare(asDynamicTraversable(a), asDynamicTraversable(b), eq);
}

/**
 * Converts {@link Trees.TreeNode} to {@link Trees.SimplifiedNode}, removing the 'parent' fields.
 * This can be useful because if you have the whole tree, the parent field
 * is redundant and because it makes circular references can make dumping to console etc more troublesome.
 *
 * Recursive: strips parentage of all children and so on too.
 * @param node
 */
export function stripParentage<T>(node: TreeNode<T>): SimplifiedNode<T> {
  const n: SimplifiedNode<T> = {
    value: node.value,
    childrenStore: node.childrenStore.map(c => stripParentage(c)),
  };
  return n;
}

const unwrapped = <T>(node: TreeNode<T> | WrappedNode<T>) => (`wraps` in node) ? node.wraps : node;
const wrapped = <T>(node: TreeNode<T> | WrappedNode<T>) => (`wraps` in node) ? node : wrap(node);

/**
 * Wraps node `n` for a more object-oriented means of access.
 * It will wrap child nodes on demand. For this reason, WrappedNode object
 * identity is not stable
 * @param n Node to wrap
 */
export function wrap<T>(n: TreeNode<T>): WrappedNode<T> {
  return {
    *children() {
      for (const c of n.childrenStore) {
        yield wrap(c);
      }
    },
    getValue: () => n.value as T,
    getIdentity: () => n,
    *queryValue(value: T): IterableIterator<WrappedNode<T>> {
      for (const v of queryByValue(value, unwrapped(n))) {
        yield wrap(v);
      }
    },
    *queryParentsValue<T>(child: TreeNode<T> | WrappedNode<T>, value: T, eq?: IsEqual<T>): IterableIterator<WrappedNode<T>> {
      for (const v of queryParentsValue(unwrapped(child), value, eq)) {
        yield wrap(v);
      }
    },
    *parentsValues<T>(child: TreeNode<T> | WrappedNode<T>): IterableIterator<T> {
      yield* parentsValues(unwrapped(child));
    },
    findParentsValue<T>(child: TreeNode<T>, value: T, eq: IsEqual<T>): WrappedNode<T> | undefined {
      const n = findParentsValue(child, value, eq);
      if (n !== undefined)
        return wrap(n);
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
    wraps: n,
  };
}

/**
 * Removes `child` from the tree structure it is in.
 * It removes `child` from its parent. Any sub-children of `child` still remain connected.
 * @param child
 */
export function remove<T>(child: TreeNode<T>): boolean {
  const p = child.parent;
  if (p === undefined)
    return false;
  child.parent = undefined;
  const count = p.childrenStore.length;
  p.childrenStore = without(p.childrenStore, child);
  return count !== p.childrenStore.length;
}

/**
 * Starting from a child node, work backwards, removing it and ancestors that have no value
 *
 * If `child` is an only child, it will recursively call the same function on the parent.
 * @param child Child to start from
 */
export function removeValuelessNodesFromChild<T>(child: TreeNode<T>): boolean {
  // If there is a value, don't do anything
  if (typeof child.value !== `undefined`)
    return false;

  // If there's no parent, can't do anything either
  const parent = child.parent;
  if (!parent)
    return false;

  // Take a snapshot of siblings
  const sibs = [...siblings(child)];

  // Remove from tree
  remove(child);

  // If we were an only child, recurse upwards
  if (sibs.length === 0) {
    return removeValuelessNodesFromChild(parent);
  }
  return true;
}

/**
 * Enumeate all siblings of `child`. This won't include `child` itself.
 * If `child` is not part of a tree (ie has no parent) no values are yielded.
 */
export function *siblings<T>(child: TreeNode<T>, eq: IsEqual<TreeNode<T>> = isEqualDefault): IterableIterator<TreeNode<T>> {
  const parent = child.parent;
  if (typeof parent === `undefined`)
    return;
  for (const c of parent.childrenStore) {
    if (eq(c, child))
      continue;
    yield c;
  }
}

/**
 * Depth-first iteration of the children of `node`
 * @param node
 */
export function *depthFirst<T>(node: TreeNode<T>): IterableIterator<TreeNode<T>> {
  if (!root)
    return;
  const stack = new StackMutable<TreeNode<T>>();
  stack.push(...node.childrenStore);
  let entry: TreeNode<T> | undefined = stack.pop();
  while (entry) {
    yield entry;
    if (entry) {
      stack.push(...entry.childrenStore);
    }
    if (stack.isEmpty)
      break;
    entry = stack.pop();
  }
}

/**
 * Breadth-first iteration of the children of `node`
 * @param node
 */
export function *breadthFirst<T>(node: TreeNode<T>): IterableIterator<TreeNode<T>> {
  if (!node)
    return;
  const queue = new QueueMutable<TreeNode<T>>();
  queue.enqueue(...node.childrenStore);
  let entry: TreeNode<T> | undefined = queue.dequeue();
  while (entry) {
    yield entry;
    if (entry) {
      queue.enqueue(...entry.childrenStore);
    }
    if (queue.isEmpty)
      break;
    entry = queue.dequeue();
  }
}

/**
 * Validates the tree from `root` downwards.
 * @param root
 * @param seen
 */
export function treeTest<T>(root: TreeNode<T>, seen: Array<TreeNode<T>> = []): [ ok: boolean, msg: string, node: TreeNode<T> ] {
  if (root.parent === root)
    return [false, `Root has itself as parent`, root];
  if (seen.includes(root))
    return [false, `Same node instance is appearing further in tree`, root];
  seen.push(root);
  if (containsDuplicateInstances(root.childrenStore))
    return [false, `Children list contains duplicates`, root];

  for (const c of root.childrenStore) {
    if (c.parent !== root)
      return [false, `Member of childrenStore does not have .parent set`, c];
    if (hasAnyChild(root, c))
      return [false, `Child has parent as its own child`, c];
    const v = treeTest(c, seen);
    if (!v[0])
      return v;
  }
  return [true, ``, root];
}

/**
 * Throws an exception if `root` fails tree validation
 * @param root
 */
export function throwTreeTest<T>(root: TreeNode<T>): void {
  const v = treeTest(root);
  if (v[0])
    return;
  throw new Error(`${v[1]} Node: ${toStringAbbreviate(v[2].value, 30)}`, { cause: v[2] });
}

/**
 * Iterate over direct children of `root`, yielding {@link TreeNode} instances.
 * Use {@link childrenValues} to iterate over child values
 * @param root
 */
export function *children<T>(root: TreeNode<T>): IterableIterator<TreeNode<T>> {
  for (const c of root.childrenStore) {
    yield c;
  }
}

/**
 * Iterate over the value of direct children of `root`.
 * Use {@link children} if you want to iterate over {@link TreeNode} instances instead.
 * @param root
 */
export function *childrenValues<T>(root: TreeNode<T>): IterableIterator<T> {
  for (const c of root.childrenStore) {
    if (typeof c.value !== `undefined`)
      yield c.value;
  }
}

/**
 * Iterate over all parents of `child`. First result is the immediate parent.
 * @param child
 */
export function *parents<T>(child: TreeNode<T>): IterableIterator<TreeNode<T>> {
  let p = child.parent;
  while (p) {
    yield p;
    p = p.parent;
  }
}

/**
 * Returns the depth of `node`. A root node (ie. with no parents) has a depth of 0.
 * @param node
 */
export function nodeDepth(node: TreeNode<any>): number {
  const p = [...parents(node)];
  return p.length;
}

/**
 * Returns _true_ if `child` is an immediate child of `parent`.
 * @param child
 * @param parent
 * @param eq Equality function to compare nodes. Uses `isEqualDefault` by default, which compares by reference.
 */
export function hasChild<T>(child: TreeNode<T>, parent: TreeNode<T>, eq: IsEqual<TreeNode<T>> = isEqualDefault): boolean {
  for (const c of parent.childrenStore) {
    if (eq(c, child))
      return true;
  }
  return false;
}

/**
 * Returns the first immediate child of `parent` that matches `value`.
 *
 * Use {@link queryByValue} if you want all matching children.
 * @param value
 * @param parent
 * @param eq
 */
export function findChildByValue<T>(value: T, parent: TreeNode<T>, eq: IsEqual<T> = isEqualDefault): TreeNode<T> | undefined {
  for (const c of parent.childrenStore) {
    if (eq(value, c.value as T))
      return c;
  }
}

/**
 * Yield all immediate children of `parent` that match `value`.
 *
 * Use {@link findChildByValue} if you only want the first matching child.
 * @param value
 * @param parent
 * @param eq
 */
export function *queryByValue<T>(value: T, parent: TreeNode<T>, eq: IsEqual<T> = isEqualDefault): IterableIterator<TreeNode<T>> {
  for (const c of parent.childrenStore) {
    if (eq(value, c.value as T))
      yield c;
  }
}

/**
 * Returns _true_ if `prospectiveChild` is some child node of `parent`,
 * anywhere in the tree structure.
 *
 * Use {@link hasChild} to only check immediate children.
 * @param prospectiveChild
 * @param parent
 */
export function hasAnyChild<T>(prospectiveChild: TreeNode<T>, parent: TreeNode<T>): boolean {
  for (const c of breadthFirst(parent)) {
    if (c === prospectiveChild)
      return true;
  }
  return false;
}

/**
 * Using a breadth-first search, return the first child of `parent` that has `value`.
 * @param value Value being sought
 * @param parent Parent node
 * @param eq Equality function to compare values. Uses `isEqualDefault` by default, which compares by reference.
 */
export function findAnyChildByValue<T>(value: T, parent: TreeNode<T>, eq: IsEqual<T> = isEqualDefault): TreeNode<T> | undefined {
  for (const c of breadthFirst(parent)) {
    if (eq(c.value as T, value))
      return c;
  }
}

/**
 * Traverses up a node to find the root.
 * @param node
 */
export function getRoot<T>(node: TreeNode<T>): TreeNode<T> {
  if (node.parent)
    return getRoot(node.parent);
  return node;
}

/**
 * Returns _true_ if `prospectiveParent` is any ancestor
 * parent of `child`.
 *
 * Use {@link hasParent} to only check immediate parent.
 * @param child
 * @param prospectiveParent
 */
export function hasAnyParent<T>(child: TreeNode<T>, prospectiveParent: TreeNode<T>): boolean {
  for (const p of parents(child)) {
    if (p === prospectiveParent)
      return true;
  }
  return false;
}

/**
 * Yields the node value of each parent of `child`.
 * _undefined_ values are not returned.
 *
 * Use {@link queryParentsValue} to search for a particular value
 * @param child
 */
export function *parentsValues<T>(child: TreeNode<T>): Generator<T> {
  for (const p of parents(child)) {
    if (typeof p.value !== `undefined`) {
      yield p.value as T;
    }
  }
  return false;
}

/**
 * Yields all parents of `child` that have a given value.
 * Use {@link findParentsValue} to find the first match only.
 * @param child
 * @param value
 * @param eq
 */
export function *queryParentsValue<T>(child: TreeNode<T>, value: T, eq: IsEqual<T> = isEqualDefault): Generator<TreeNode<T>, boolean, unknown> {
  for (const p of parents(child)) {
    if (typeof p.value !== `undefined`) {
      if (eq(p.value, value))
        yield p;
    }
  }
  return false;
}

/**
 * Returns the first parent that has a given value.
 * @param child
 * @param value
 * @param eq
 */
export function findParentsValue<T>(child: TreeNode<T>, value: T, eq: IsEqual<T> = isEqualDefault): TreeNode<T> | undefined {
  const v = [...queryParentsValue(child, value, eq)];
  return v[0];
}
/**
 * Returns _true_ if `prospectiveParent` is the immediate
 * parent of `child`.
 *
 * Use {@link hasAnyParent} to check for any ancestor parent.
 * @param child
 * @param prospectiveParent
 */
export function hasParent<T>(child: TreeNode<T>, prospectiveParent: TreeNode<T>): boolean {
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
 */
export function computeMaxDepth<T>(node: TreeNode<T>): number {
  return computeMaxDepthImpl(node, 0);
}

function computeMaxDepthImpl<T>(node: TreeNode<T>, startingDepth = 0) {
  let depth = startingDepth;
  for (const c of node.childrenStore) {
    depth = Math.max(depth, computeMaxDepthImpl(c, startingDepth + 1));
  }
  return depth;
}

/**
 * Adds a child node to `parent`.
 * If `child` already has a parent, it is removed from that parent.
 * @param child
 * @param parent
 * @throws Error if adding a child would break tree structure
 */
export function add<T>(child: TreeNode<T>, parent: TreeNode<T>): void {
  throwAttemptedChild(child, parent);
  const p = child.parent;
  parent.childrenStore = [...parent.childrenStore, child];
  child.parent = parent;
  if (p) {
    p.childrenStore = without(p.childrenStore, child);
  }
}

/**
 * Adds a new child node based on a value
 */
export function addValue<T>(value: T | undefined, parent: TreeNode<T>): TreeNode<T> {
  return createNode(value, parent);
}

/**
 * Creates the root for a tree, with an optional `value`.
 * Use {@link rootWrapped} if you want a more object-oriented mode of access.
 * @param value
 */
export function root<T>(value?: T): TreeNode<T> {
  return createNode(value);
}

export function fromPlainObject(value: Record<string, any>, label = ``, parent?: TreeNode<any>, seen: any[] = []): TreeNode<LabelledSingleValue<any>> {
  const entries = Object.entries(value);
  parent = parent === undefined ? root() : addValue<LabelledSingleValue<any>>({ label, value }, parent);
  for (const entry of entries) {
    const value = entry[1];
    // Avoid circular references
    if (seen.includes(value))
      continue;
    seen.push(value);

    if (typeof entry[1] === `object`) {
      fromPlainObject(value, entry[0], parent, seen);
    } else {
      addValue<LabelledSingleValue<any>>({ label: entry[0], value }, parent);
    }
  }
  return parent;
}

/**
 * Creates a tree, returning it as a {@link WrappedNode} for object-oriented access.
 * Use {@link Trees.Mutable.root} alternatively.
 * @param value
 */
export function rootWrapped<T>(value: T | undefined): WrappedNode<T> {
  return wrap(createNode(value));
}

/**
 * Creates a `TreeNode` instance with a given value and parent.
 * Parent node, if specified, has its `childrenStore` property changed to include new child.
 * @param value
 * @param parent
 */
export function createNode<T>(value: T | undefined, parent?: TreeNode<T>): TreeNode<T> {
  const n: TreeNode<T> = {
    childrenStore: [],
    parent,
    value,
  };
  if (parent !== undefined) {
    parent.childrenStore = [...parent.childrenStore, n];
  }
  return n;
}

export function childrenLength<T>(node: TreeNode<T>): number {
  return node.childrenStore.length;
}

export function value<T>(node: TreeNode<T>): T | undefined {
  return node.value;
}

/**
 * Projects `node` as a dynamic traversable.
 * Dynamic in the sense that it creates the traversable project for nodes on demand.
 * A consequence is that node identities are not stable.
 * @param node
 */
export function asDynamicTraversable<T>(node: TreeNode<T>): TraversableTree<T> {
  const t: TraversableTree<T> = {
    *children() {
      for (const c of node.childrenStore) {
        yield asDynamicTraversable(c);
      }
    },
    getParent() {
      if (node.parent === undefined)
        return;
      return asDynamicTraversable(node.parent);
    },
    getValue(): any {
      return node.value;
    },
    getIdentity() {
      return node;
    },
  };
  return t;
}

/**
 * Throws an error if:
 * 1. `child` is the same node as `parent`
 * 2. `child` is already an immediate child of `parent`
 * 3. `child` is an ancestor parent of `parent`
 * 4. `child` has `parent` as its own child
 * @param c
 * @param parent
 */
function throwAttemptedChild<T>(c: TreeNode<T>, parent: TreeNode<T>) {
  if (parent === c)
    throw new Error(`Cannot add self as child`);
  if (c.parent === parent)
    return; // skip if it's already a child
  if (hasAnyParent(parent, c))
    throw new Error(`Child contains parent (1)`, { cause: c });
  if (hasAnyParent(c, parent))
    throw new Error(`Parent already contains child`, { cause: c });
  if (hasAnyChild(parent, c))
    throw new Error(`Child contains parent (2)`, { cause: c });
}

/**
 * Sets the children of `parent` to a list of `children`.
 *
 * Any previous children are disconnected from this parent.
 * All new children have their parent set to `parent`.
 *
 * There is some validation to ensure that adding the children doesn't break the tree.
 */
export function setChildren<T>(parent: TreeNode<T>, children: Array<TreeNode<T>>): void {
  // Verify children are legit
  for (const c of children) {
    throwAttemptedChild(c, parent);
  }

  parent.childrenStore = [...children];
  for (const c of children) {
    c.parent = parent;
  }
}

export function toStringDeep<T>(node: TreeNode<T>, indent = 0): string {
  const t = `${`  `.repeat(indent)} + ${node.value ? JSON.stringify(node.value) : `-`}`;
  return node.childrenStore.length > 0
    ? (
        `${t
        }\n${
          node.childrenStore.map(d => toStringDeep(d, indent + 1)).join(`\n`)}`
      )
    : t;
}

export function *followValue<T>(root: TreeNode<T>, continuePredicate: (nodeValue: T, depth: number) => boolean, depth = 1): IterableIterator<T | undefined> {
  for (const c of root.childrenStore) {
    const value = c.value;
    if (value === undefined)
      continue;
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