import { toStringAbbreviate } from "../../Text.js";
import { isEqualDefault, type IsEqual } from "../../IsEqual.js";
import { QueueMutable } from "../queue/QueueMutable.js";
import { StackMutable } from "../stack/StackMutable.js";
import type { TraversableTree } from "./Types.js";

export const childrenLength = <T>(tree: TraversableTree<T>): number => {
  return [ ...tree.children() ].length;
}

/**
 * Returns _true_ if `child` is parented at any level (grand-parented etc) by `possibleParent`
 * @param child Child being sought
 * @param possibleParent Possible parent of child
 * @param eq Equality comparison function {@link isEqualDefault} used by default
 * @returns
 */
export const hasAnyParent = <T>(
  child: TraversableTree<T>,
  possibleParent: TraversableTree<T>,
  eq?: IsEqual<TraversableTree<T>>
): boolean => {
  return hasParent(child, possibleParent, eq, Number.MAX_SAFE_INTEGER);
};

export const hasAnyParentValue = <T>(
  child: TraversableTree<T>,
  possibleParentValue: T,
  eq?: IsEqual<T>
): boolean => {
  return hasParentValue(child, possibleParentValue, eq, Number.MAX_SAFE_INTEGER);
};

export const findAnyParentByValue = <TValue>(
  child: TraversableTree<TValue>,
  possibleParentValue: TValue,
  eq?: IsEqual<TValue>
): TraversableTree<TValue> | undefined => {
  return findParentByValue(child, possibleParentValue, eq, Number.MAX_SAFE_INTEGER);
};

/**
 * Returns _true_ if `child` exists within `possibleParent`. By default it only looks at the immediate
 * parent (maxDepth: 0). Use Number.MAX_SAFE_INTEGER for searching recursively upwards (or {@link hasAnyParent})
 * @param child Child being sought
 * @param possibleParent Possible parent of child
 * @param maxDepth Max depth of traversal. Default of 0 only looks for immediate parent.
 * @param eq Equality comparison function. {@link isEqualDefault} used by default.
 * @returns
 */
export const hasParent = <T>(
  child: TraversableTree<T>,
  possibleParent: TraversableTree<T>,
  eq: IsEqual<TraversableTree<T>> = isEqualDefault<TraversableTree<T>>,
  maxDepth = 0
): boolean => {
  if (maxDepth < 0) return false;
  const p = child.getParent();
  if (p === undefined) return false;
  if (eq(p, possibleParent)) return true;
  if (eq(p.getIdentity(), possibleParent.getIdentity())) return true;
  return hasParent(p, possibleParent, eq, maxDepth - 1);
};

export const hasParentValue = <TValue>(
  child: TraversableTree<TValue>,
  possibleParentValue: TValue,
  eq: IsEqual<TValue> = isEqualDefault<TValue>,
  maxDepth = 0
): boolean => {
  if (maxDepth < 0) return false;
  const p = child.getParent();
  if (p === undefined) return false;
  if (eq(p.getValue(), possibleParentValue)) return true;
  return hasParentValue(p, possibleParentValue, eq, maxDepth - 1);
};

export const findParentByValue = <TValue>(
  child: TraversableTree<TValue>,
  possibleParentValue: TValue,
  eq: IsEqual<TValue> = isEqualDefault<TValue>,
  maxDepth = 0
): TraversableTree<TValue> | undefined => {
  if (maxDepth < 0) return;
  const p = child.getParent();
  if (p === undefined) return;
  if (eq(p.getValue(), possibleParentValue)) return p;
  return findParentByValue(p, possibleParentValue, eq, maxDepth - 1);
};

/**
 * Returns _true_ if `prospectiveChild` can be legally added to `parent`.
 * _False_ is returned if:
 *  * `parent` and `prospectiveChild` are equal
 *  * `parent` already contains `prospectiveChild`
 *  * `prospectiveChild` has `parent` as its own child
 *
 * Throws an error if `parent` or `prospectiveChild` is null/undefined.
 * @param parent Parent to add to
 * @param prospectiveChild Prospective child
 * @param eq Equality function
 */
export const couldAddChild = <T>(
  parent: TraversableTree<T>,
  prospectiveChild: TraversableTree<T>,
  eq: IsEqual<TraversableTree<T>> = isEqualDefault
) => {

  if (eq(parent, prospectiveChild)) throw new Error(`Child equals parent`);
  if (hasAnyChild(parent, prospectiveChild, eq)) {
    throw new Error(`Circular. Parent already has child`);
  }
  if (hasAnyChild(prospectiveChild, parent, eq)) {
    throw new Error(`Prospective child has parent as child relation`);
  }
};

/**
 * Returns _true_ if _possibleChild_ is contained within _parent_ tree.
 * That is, it is any sub-child.
 * @param parent Parent tree
 * @param possibleChild Sought child
 * @param eq Equality function, or {@link isEqualDefault} if undefined.
 * @returns
 */
export const hasAnyChild = <T>(
  parent: TraversableTree<T>,
  possibleChild: TraversableTree<T>,
  eq: IsEqual<TraversableTree<T>> = isEqualDefault
): boolean => {
  return hasChild(parent, possibleChild, eq, Number.MAX_SAFE_INTEGER);
};

export const hasAnyChildValue = <T>(
  parent: TraversableTree<T>,
  possibleChildValue: T,
  eq: IsEqual<T> = isEqualDefault
): boolean => {
  return hasChildValue(parent, possibleChildValue, eq, Number.MAX_SAFE_INTEGER);
};

/**
 * Returns _true_ if _possibleChild_ is contained within _maxDepth_ children
 * of _parent_ node. By default only looks at immediate children (maxDepth = 0).
 *
 * ```js
 * // Just check parentNode for childNode
 * Trees.hasChild(parentNode, childNode);
 * // See if parentNode or parentNode's parents have childNode
 * Trees.hasChild(parentNode, childNode, 1);
 * // Use custom equality function, in this case comparing on name field
 * Trees.hasChild(parentNode, childNode, 0, (a, b) => a.name === b.name);
 * ```
 * @param parent Parent tree
 * @param possibleChild Sought child
 * @param maxDepth Maximum depth. 0 for immediate children, Number.MAX_SAFE_INTEGER for boundless
 * @param eq Equality function, or {@link isEqualDefault} if undefined.
 * @returns
 */
export const hasChild = <T>(
  parent: TraversableTree<T>,
  possibleChild: TraversableTree<T>,
  eq: IsEqual<TraversableTree<T>> = isEqualDefault,
  maxDepth = 0
): boolean => {

  if (maxDepth < 0) return false;
  if (eq(parent, possibleChild)) return true;
  if (eq(parent.getIdentity(), possibleChild.getIdentity())) return true;
  for (const c of breadthFirst(parent, maxDepth)) {
    if (eq(c, possibleChild)) return true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (eq(c.getIdentity(), possibleChild.getIdentity())) return true;
  }
  return false;
};

export const hasChildValue = <T>(
  parent: TraversableTree<T>,
  possibleValue: T,
  eq: IsEqual<T> = isEqualDefault,
  maxDepth = 0
): boolean => {

  if (maxDepth < 0) return false;
  if (eq(parent.getValue(), possibleValue)) return true;
  for (const c of breadthFirst(parent, maxDepth)) {
    if (eq(c.getValue(), possibleValue)) return true;
  }
  return false;
};

/**
 * Iterates over siblings of `node`.
 * 
 * Other iteration options:
 * * {@link breadthFirst}: Children, breadth-first
 * * {@link depthFirst}: Children, depth-first
 * * {@link parents}: Chain of parents, starting with immediate parent
 * * {@link siblings}: Nodes with same parent
 * @param node Node to begin from
 * @returns 
 */
export function* siblings<T>(node: TraversableTree<T>): IterableIterator<TraversableTree<T>> {
  const p = node.getParent();
  if (p === undefined) return;
  for (const s of p.children()) {
    if (s === node) continue;
    yield s;
  }
}

/**
 * Iterates over parents of `node`, starting with immediate parent
 * 
 * Other iteration options:
 * * {@link breadthFirst}: Children, breadth-first
 * * {@link depthFirst}: Children, depth-first
 * * {@link parents}: Chain of parents, starting with immediate parent
 * * {@link siblings}: Nodes with same parent
 * @param node Node to begin from
 * @returns 
 */
export function* parents<T>(node: TraversableTree<T>): IterableIterator<TraversableTree<T>> {
  let p = node.getParent();
  while (p !== undefined) {
    yield p;
    p = p.getParent();
  }
}


export const findAnyChildByValue = <TValue>(parent: TraversableTree<TValue>,
  possibleValue: TValue,
  eq: IsEqual<TValue> = isEqualDefault
): TraversableTree<TValue> | undefined => {
  return findChildByValue(parent, possibleValue, eq, Number.MAX_SAFE_INTEGER);
};

export const findChildByValue = <TValue>(parent: TraversableTree<TValue>,
  possibleValue: TValue,
  eq: IsEqual<TValue> = isEqualDefault,
  maxDepth = 0
): TraversableTree<TValue> | undefined => {

  if (maxDepth < 0) return;
  if (eq(parent.getValue(), possibleValue)) return parent;

  for (const d of breadthFirst(parent, maxDepth)) {
    // This child matches
    if (eq(d.getValue(), possibleValue)) return d;
  }
  return;
};

/**
 * Iterates over children of `root`, depth-first.
 * 
 * Other iteration options:
 * * {@link breadthFirst}: Children, breadth-first
 * * {@link depthFirst}: Children, depth-first
 * * {@link parents}: Chain of parents, starting with immediate parent
 * * {@link siblings}: Nodes with same parent
 * @param root Root node 
 * @returns 
 */
export function* depthFirst<T extends TraversableTree<any>>(root: T): Generator<T> {
  if (!root) return;
  const stack = new StackMutable<T>();
  let entry: T | undefined = root;
  while (entry) {
    const entries = [ ...entry.children() ] as Array<T>;
    stack.push(...entries);
    if (stack.isEmpty) break;
    entry = stack.pop();
    if (entry) yield entry;
  }
}

/**
 * Iterates over the children of `root`, breadth-first
 * 
 * Other iteration options:
 * * {@link breadthFirst}: Children, breadth-first
 * * {@link depthFirst}: Children, depth-first
 * * {@link parents}: Chain of parents, starting with immediate parent
 * * {@link siblings}: Nodes with same parent
 * @param root Root node
 * @param depth How many levels to traverse 
 * @returns 
 */
export function* breadthFirst<T>(root: TraversableTree<T>, depth = Number.MAX_SAFE_INTEGER): IterableIterator<TraversableTree<T>> {
  if (!root) return;
  const queue = new QueueMutable<TraversableTree<T>>();
  let entry: TraversableTree<T> | undefined = root;
  while (entry) {
    if (depth < 0) return;
    for (const c of entry.children()) {
      yield c;
      queue.enqueue(c);
    }
    entry = queue.dequeue();
    depth--;
  }
}

/**
 * Applies `predicate` to `root` and all its child nodes, returning the node where
 * `predicate` yields _true_.
 * Use {@link findByValue} to find a node by its value
 * @param root 
 * @param predicate 
 * @param order Iterate children by breadth or depth. Default 'breadth'
 * @returns 
 */
export function find<T>(root: TraversableTree<T>, predicate: (node: TraversableTree<T>) => boolean, order: `breadth` | `depth` = `breadth`): TraversableTree<T> | undefined {
  if (predicate(root)) return root;
  const iter = order === `breadth` ? breadthFirst : depthFirst;
  for (const c of iter(root)) {
    if (predicate(c)) return c;
  }
}

/**
 * Applies `predicate` to `root` and all its child nodes, returning the node value for
 * `predicate` yields _true_.
 * Use {@link find} to filter by nodes rather than values
 * 
 * ```js
 * const n = findByValue(root, (v) => v.name === 'Bob');
 * ```
 * @param root 
 * @param predicate 
 * @param order Iterate children by breadth or depth. Default 'breadth'
 * @returns 
 */
export function findByValue<T>(root: TraversableTree<T>, predicate: (nodeValue: T) => boolean, order: `breadth` | `depth` = `breadth`): TraversableTree<T> | undefined {
  if (predicate(root.getValue())) return root;
  const iter = order === `breadth` ? breadthFirst : depthFirst;

  for (const c of iter(root)) {
    if (predicate(c.getValue())) return c;
  }
}

/**
 * Search through children in a path-like manner.
 * 
 * It finds the first child of `root` that matches `continuePredicate`. 
 * The function gets passed a depth of 1 to begin with. It recurses, looking for the next sub-child, etc.
 * 
 * If it can't find a child, it stops.
 * 
 * This is different to 'find' functions, which exhausively search all possible child nodes, regardless of position in tree.
 * 
 * ```js
 * const path = 'a.aa.aaa'.split('.');
 * const pred = (nodeValue, depth) => {
 *  if (nodeValue === path[0]) {
 *    path.shift(); // Remove first element
 *    return true;
 *  }
 *  return false;
 * }
 * 
 * // Assuming we have a tree of string values:
 * // a
 * //   - aa
 * //       - aaa
 * //   - ab
 * // b
 * //   - ba
 * for (const c of follow(tree, pred)) {
 *  // Returns nodes: a, aa and then aaa
 * }
 * ```
 * @param root 
 * @param continuePredicate 
 * @param depth 
 */
export function* followValue<T>(root: TraversableTree<T>, continuePredicate: (nodeValue: T, depth: number) => boolean, depth = 1): IterableIterator<T> {
  for (const c of root.children()) {
    if (continuePredicate(c.getValue(), depth)) {
      yield c.getValue();
      yield* followValue(c, continuePredicate, depth + 1);
    }
  }
}

export function toStringDeep<T>(node: TraversableTree<T>, depth = 0) {
  if (node === undefined) return `(undefined)`;
  if (node === null) return `(null)`;
  const v = node.getValue();
  let type: string = typeof v;
  if (Array.isArray(v)) type = `array`;
  let t = `  `.repeat(depth) + `value: ${ JSON.stringify(v) } (${ type })\n`;
  for (const n of node.children()) {
    t += toStringDeep(n, depth + 1);
  }
  return t;
}

export function toString(...nodes: Array<TraversableTree<any>>) {
  let t = ``;
  for (const node of nodes) {
    const v = node.getValue();
    const vString = toStringAbbreviate(v);
    const children = [ ...node.children() ];
    const parent = node.getParent();
    let type: string = typeof v;
    if (Array.isArray(v)) type = `array`;
    t += `value: ${ vString } (${ type }) kids: ${ children.length } parented: ${ parent ? `y` : `n` }\n`;
  }
  return t;
}