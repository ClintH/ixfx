// #region Imports
import {IsEqual, isEqualDefault} from "../Util.js";
import { queueMutable } from "./Queue.js";
import { stackMutable } from "./Stack.js";
import {betweenChomp} from "../Text.js";
import { TreeNodeMutable, treeNodeMutable } from "./TreeNodeMutable.js";
import { integerParse, nullUndef } from "../Guards.js";
import {last} from "../IterableSync.js";

// #endregion

export { treeNodeMutable, TreeNodeMutable };

export type Entry = [name:string, value:any]

/**
 * TreeNode type
 */
export type TreeNode = {
  /**
   * Direct children of node
   */
  children():IterableIterator<TreeNode>
  /**
   * Chain of parents of node. First result will be immediate parent,
   * last result will be the terminating parent (root)
   */
  parents():IterableIterator<TreeNode>

  getLengthChildren?():number
}

/**
 * Options for parsing a path
 */
export type PathOpts = {
  /**
   * Separator for path, eg '.'
   */
  separator?:string
  /**
   * If true, [integer] will be used for arrays
   */
  allowArrayIndexes?:boolean
}

/**
 * Returns _true_ if `p` seems to match the `TreeNode` type.
 * Returns _false_ if `p` is undefined or null.
 * 
 * @param p 
 * @returns 
 */
export function isTreeNode(p:TreeNode|unknown):p is TreeNode {
  nullUndef(p, `p`);

  if (typeof (p as TreeNode).children === 'undefined') return false;
  if (typeof (p as TreeNode).parents === 'undefined') return false;
  return true;
}

/**
 * Returns the count of immediate children for this
 * TreeNode (or map, or plain object)
 * 
 * ```js
 * const basicObj = {
 *  john: {
 *    address: { postcode: 1234, city: 'Blahville' }
 *  }
 * }
 * Trees.getLengthChildren(basicObj); // 1
 * ```
 * @param p 
 * @returns 
 */
export const getLengthChildren = (p:TreeNode|object):number => {
  // ✔️ Unit tested
  if (isTreeNode(p)) {
    if (typeof p.getLengthChildren !== `undefined`) return p.getLengthChildren();
  }
  return [...directChildren(p)].length;
}

function prettyPrintEntryPath(entries:Entry[]) {
  if (entries.length === 0) return '(empty)';
  let t = '';
  for (let i=0;i<entries.length;i++) {
    t += '  '.repeat(i);
    t += entries[i][0] + ' = ' + JSON.stringify(entries[i][1]) + '\n';
  }
  return t;
}

/**
 * Returns a human-friendl debug string for a tree-like structure
 * ```js
 * console.log(Trees.prettyPrint(obj));
 * ```
 * @param indent 
 * @param node 
 * @param defaultLabel 
 * @returns 
 */
export const prettyPrint = (node:object, indent = 0, defaultLabel = 'root'):string => {
  nullUndef(node, `node`);
  const entry = getEntry(node, defaultLabel);
  const t = `${'  '.repeat(indent)} + label: ${entry[0]} value: ${JSON.stringify(entry[1])}`;
  const children = [...directChildren(node, defaultLabel)];
  if (children.length) {
    return t + '\n' + children.map(d => prettyPrint(d[1], indent+1,  d[0])).join('\n');
  } else {
    return t;
  }
}

/**
 * Returns the direct children of a tree-like object as a pairing
 * of node label and value. Supports basic objects, Maps, arrays and {@link TreeNode}s.
 * 
 * Sub-children are included as an object blob.
 * 
 * @example Simple object
 * ```js
 * const o = {
 *  colour: {
 *    r: 0.5, g: 0.5, b: 0.5
 *  }
 * };
 * 
 * const children = [...Trees.directChildren(o)];
 * // Children:
 * // [
 * //  [ "colour", { b: 0.5, g: 0.5, r: 0.5 }]
 * // ]
 * ```
 * 
 * Arrays are assigned a label based on index.
 * @example Arrays
 * ```js
  const colours = [ {r:1,g:0,b:0}, {r:0,g:1,b:0}, {r:0,g:0,b:1} ];
 * // Children: 
 * // [
 * //  ["array[0]", {r:1,g:0,b:0}],
 * //  ["array[1]", {r:0,g:1,b:0}],
 * //  ["array[2]", {r:0,g:0,b:1}],
 * // ]
 * ```
 * 
 * Pass in `defaultName` (eg 'colours') to have labels generated as 'colours[0]', etc.
 * @param node 
 * @param defaultName 
 */
export function* directChildren(node:object, defaultName?:string):IterableIterator<Entry> {
  // ✔️ Unit tested
  nullUndef(node, `node`);
  if (Array.isArray(node)) {
    if (!defaultName) defaultName = 'array';
    for (let i=0;i<node.length;i++) {
      yield [defaultName + '[' + i.toString() + ']', node[i]]
    }
  } else if (isTreeNode(node)) {
    for (const n of node.children()) yield getEntry(n);
  } else if (typeof node === 'object') {
    if ('entries' in node) {
      yield* (node as Map<any,any>).entries()
    }
    yield* Object.entries(node);
  }
}

/**
 * Finds a given direct child by label
 * @param label 
 * @param node 
 * @returns 
 */
function findDirectChildByLabel(label:string, node:object):Entry|undefined {
  for (const d of directChildren(node)) {
    if (d[0] === label) return d;
  }
  return;
}

/**
 * Returns the closest matching entry, tracing `path` in a tree.
 * Returns an entry with _undefined_ value at the point where tracing stopped.
 * Use {@link traceByPath} to step through all the segments.
 * 
 * ```js
 * const people = {
 *  jane: {
 *   address: {
 *    postcode: 1000,
 *    street: 'West St',
 *    city: 'Blahville'
 *   },
 *   colour: 'red'
 *  }
 * }
 * Trees.getByPath('jane.address.postcode', people); // '.' default separator
 * // ['postcode', 1000]
 * Trees.getByPath('jane.address.country.state', people);
 * // ['country', undefined] - since full path could not be resolved.
 * ```
 * @param path Path, eg `jane.address.postcode`
 * @param node Node to look within
 * @param opts Options for parsing path. By default '.' is used as a separator
 * @returns 
 */
export function getByPath(path:string, node:object, opts:PathOpts = {}):Entry {
  // ✔️ Unit tested
 const v = last(traceByPath(path, node, opts));
 if (!v) throw new Error(`Could not trace path: ${path}`);
 return v;
}

/**
 * Enumerates from root over nodes that lead to the given path terminus.
 * Use {@link getByPath} to only fetch the closest matching entry.
 * 
 * ```js
 * const people = {
 *  jane: {
 *   address: {
 *    postcode: 1000,
 *    street: 'West St',
 *    city: 'Blahville'
 *   },
 *   colour: 'red'
 *  }
 * }
 * for (const p of Trees.traceByPath('jane.address.street', rootNode)) {
 * // ["jane", { address: { postcode: 1000,street: 'West St', city: 'Blahville' }, colour: 'red'}],
 * // ["address", { postcode: 1000, street: 'West St', city: 'Blahville' }],
 * // ["street","West St"]
 * }
 * ```
 * 
 * Results stop when the path can't be followed. The last entry will have a label of
 * the last sought path segment, and _undefined_ as its value.
 * 
 * @param path 
 * @param node 
 * @returns 
 */
export function* traceByPath(path:string, node:object, opts:PathOpts = {}):Iterable<Entry> {
  // ✔️ Unit tested
  nullUndef(path, `path`);
  nullUndef(node, `node`);

  const separator = opts.separator ?? '.';
  const allowArrayIndexes = opts.allowArrayIndexes ?? true;
  const pathSplit = path.split(separator);

  for (let p of pathSplit) {
    let e = findDirectChildByLabel(p, node);
    if (allowArrayIndexes) {
      const [withoutBrackets, arrayIndexStr] = betweenChomp(p, '[', ']');
      const arrayIndex = integerParse(arrayIndexStr, 'positive', -1);
      if (arrayIndex >=0) {
       
        // Get array by name without the []
        e = findDirectChildByLabel(withoutBrackets, node);

        if (e && Array.isArray(e[1])) {
          // Result was array as expected
          e = [p, e[1][arrayIndex]];
        }
      }
    }

    if (!e) {
      yield [p, undefined];
      return;
    }
    node = e[1];
    yield e;
  }
}

/**
 * Generates a label for a node.
 * Uses the 'label' property if it exists, otherwise uses `defaultLabel`
 * @param node 
 * @param defaultLabel 
 * @returns 
 */
function getEntry(node:object, defaultLabel = ''):Entry {
  if ('label' in node) {
    return [node.label as string, node];
  }
  return [defaultLabel, node];
}

/**
 * Depth-first traversal over object, array, Map or TreeNode
 * @param root
 * @returns 
 */
export function* depthFirst(root:object):IterableIterator<Entry> {
  if (!root) return;
  const stack = stackMutable<Entry>();

  stack.push(getEntry(root, 'root'));
  let entry = stack.pop();
  while (entry) {
    yield entry;
    if (entry) {
      stack.push(...directChildren(entry[1], entry[0]));
    }
    if (stack.isEmpty) break;
    entry = stack.pop();
  }
}

/**
 * Breadth-first traversal over object, array, Map or TreeNode
 * @param root 
 * @returns 
 */
export function* breadthFirst(root:object):IterableIterator<Entry> {
  if (!root) return;
  const queue = queueMutable<Entry>();
  queue.enqueue(getEntry(root, 'root'));
  let entry = queue.dequeue();
  while (entry) {
    yield entry;
    if (entry) {
      queue.enqueue(...directChildren(entry[1], entry[0]));
    }
    if (queue.isEmpty) break;
    entry = queue.dequeue();
  }
}

/**
 * Returns _true_ if _possibleChild_ is contained within _parent_ tree.
 * That is, it is any possible sub-child.
 * @param parent Parent tree
 * @param possibleChild Sought child
 * @param eq Equality function, or {@link isEqualDefault} if undefined.
 * @returns 
 */
export const hasAnyChild = <V extends TreeNode>(parent:V, possibleChild:V, eq:IsEqual<V> = isEqualDefault):boolean => {
  return hasChild(parent, possibleChild, Number.MAX_SAFE_INTEGER, eq);
}

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
export const hasChild = <V extends TreeNode>(parent:V, possibleChild:V, maxDepth = 0, eq:IsEqual<V> = isEqualDefault):boolean => {
  nullUndef(parent, `parent`);
  nullUndef(possibleChild, `possibleChild`);

  if (maxDepth < 0) return false;
  for (const d of parent.children()) {
    if (eq(d as V, possibleChild)) return true;
    if (hasChild(d, possibleChild, maxDepth - 1)) return true;
  }
  return false;
}

/**
 * Returns _true_ if `child` exists within `possibleParent`. By default it only looks at the immediate
 * parent (maxDepth: 0). Use Number.MAX_SAFE_INTEGER for searching recursively upwards (or {@link hasAnyParent})
 * @param child Child being sought
 * @param possibleParent Possible parent of child
 * @param maxDepth Max depth of traversal. Default of 0 only looks for immediate parent.
 * @param eq Equality comparison function. {@link isEqualDefault} used by default.
 * @returns 
 */
export const hasParent = <V extends TreeNode>(child:V, possibleParent:V, maxDepth = 0, eq:IsEqual<V> = isEqualDefault):boolean => {
  nullUndef(possibleParent, `possibleParent`);
  nullUndef(child, `child`);

  for (const p of child.parents()) {
    if (eq(p as V, possibleParent)) return true;
    maxDepth--;
    if (maxDepth < 0) break;
  }
  return false;
}

/**
 * Returns _true_ if `child` is parented at any level (grand-parented etc) by `possibleParent`
 * @param child Child being sought
 * @param possibleParent Possible parent of child
 * @param eq Equality comparison function {@link isEqualDefault} used by default
 * @returns 
 */
export const hasAnyParent = <V extends TreeNode>(child:V, possibleParent:V, eq:IsEqual<V> = isEqualDefault):boolean => {
  return hasParent(child, possibleParent, Number.MAX_SAFE_INTEGER, eq);
}

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
export const couldAddChild = <V extends TreeNode>(parent:V, prospectiveChild:V, eq:IsEqual<V> = isEqualDefault) => {
  nullUndef(prospectiveChild, `prospectiveChild`);
  nullUndef(parent, `parent`);

  if (eq(parent, prospectiveChild)) throw new Error(`Child equals parent`);
  if (hasAnyChild(parent, prospectiveChild, eq)) throw new Error(`Circular. Parent already has child`);
  if (hasAnyChild(prospectiveChild, parent, eq)) throw new Error(`Prospective child has parent as child relation`);
}