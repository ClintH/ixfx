// #region Imports
import {IsEqual, isEqualDefault} from "../Util.js";
import { queueMutable } from "./Queue.js";
import { stackMutable } from "./Stack.js";
import {betweenChomp} from "../Text.js";
import { TreeNodeMutable, treeNodeMutable } from "./TreeNodeMutable.js";
import { integerParse } from "../Guards.js";
import {last} from "../IterableSync.js";

// #endregion

export { treeNodeMutable, TreeNodeMutable };

export type Entry = [name:string, value:any]

export type TreeNode = {
  /**
   * Diret descendants of node (ie. immediate children)
   */
  descendants():IterableIterator<TreeNode>
  /**
   * Chain of parents of node. First result will be immediate parent,
   * last result will be the terminating parent (root)
   */
  parents():IterableIterator<TreeNode>
}

export function isTreeNode(p:TreeNode|unknown):p is TreeNode {
  if (p === undefined) return false;
  if (p === null) return false;
  if (typeof (p as TreeNode).descendants === 'undefined') return false;
  if (typeof (p as TreeNode).parents === 'undefined') return false;
  return true;
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

function prettyPrint(indent = 0, node:object, defaultLabel = 'root'):string {
  const entry = getEntry(node, defaultLabel);
  const t = `${'  '.repeat(indent)} + label: ${entry[0]} value: ${JSON.stringify(entry[1])}`;
  const descendants = [...directDescendants(node, defaultLabel)];
  if (descendants.length) {
    return t + '\n' + descendants.map(d => prettyPrint(indent+1, d[1], d[0])).join('\n');
  } else {
    return t;
  }
}

/**
 * Returns the direct descendents of a tree-like object
 * @param node 
 * @param defaultName 
 */
export function* directDescendants(node:object, defaultName?:string):IterableIterator<Entry> {
  if (Array.isArray(node)) {
    if (!defaultName) defaultName = 'array';
    for (let i=0;i<node.length;i++) {
      yield [defaultName + '[' + i.toString() + ']', node[i]]
    }
  } else if (isTreeNode(node)) {
    for (const n of node.descendants()) yield getEntry(n);
  } else if (typeof node === 'object') {
    if ('entries' in node) {
      yield* (node as Map<any,any>).entries()
    }
    yield* Object.entries(node);
  }
}

/**
 * Finds a given direct descendent by label
 * @param label 
 * @param node 
 * @returns 
 */
function findDirectDescendantByLabel(label:string, node:object):Entry|undefined {
  for (const d of directDescendants(node)) {
    if (d[0] === label) return d;
  }
  return;
}

export type PathOpts = {
  separator?:string
  allowArrayIndexes?:boolean

}

/**
 * Returns the closest matching entry, tracing `path` in a tree.
 * 
 * Use {@link traceByPath} to step through all the segments.
 * @param path 
 * @param node 
 * @param opts 
 * @returns 
 */
export function getByPath(path:string, node:object, opts:PathOpts = {}):Entry|undefined {
 return last(traceByPath(path, node, opts));
}

/**
 * Enumerates from root over nodes that lead to the given path terminus
 * ```js
 * for (const p of traceByPath('address.street', rootNode)) {
 * // 1. ["address", {"number": 27, "street": "Blah St"}]
 * // 2. ["street", "Blah St"]]
 * }
 * ```
 * 
 * Results stop when the path goes 'cold'. Use {@link getByPath} to only fetch the
 * closest matching entry.
 * @param path 
 * @param node 
 * @returns 
 */
export function* traceByPath(path:string, node:object, opts:PathOpts = {}):Iterable<Entry> {
  const separator = opts.separator ?? '.';
  const allowArrayIndexes = opts.allowArrayIndexes ?? true;

  const pathSplit = path.split(separator);
  //const navigationPath:Entry[] = [];

  for (let p of pathSplit) {
    let e = findDirectDescendantByLabel(p, node);
    if (allowArrayIndexes) {
      const [withoutBrackets, arrayIndexStr] = betweenChomp(p, '[', ']');
      const arrayIndex = integerParse(arrayIndexStr, 'positive', -1);
      if (arrayIndex >=0) {
       
        // Get array by name without the []
        e = findDirectDescendantByLabel(withoutBrackets, node);

        if (e && Array.isArray(e[1])) {
          // Result was array as expected
          e = [p, e[1][arrayIndex]];
        }
      }
    }

    if (!e) {
      return;
    }
    node = e[1];
    //navigationPath.push(e);
    yield e;
  }
  //return navigationPath;
}

function getEntry(node:object, defaultLabel = ''):Entry {
  if ('label' in node) {
    return [node.label as string, node];
  }
  return [defaultLabel, node];
}

/**
 * Depth-first traversal
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
      stack.push(...directDescendants(entry[1], entry[0]));
    }
    if (stack.isEmpty) break;
    entry = stack.pop();
  }
}

export function* breadthFirst(root:object):IterableIterator<Entry> {
  if (!root) return;
  const queue = queueMutable<Entry>();
  queue.enqueue(getEntry(root, 'root'));
  let entry = queue.dequeue();
  while (entry) {
    yield entry;
    if (entry) {
      queue.enqueue(...directDescendants(entry[1], entry[0]));
    }
    if (queue.isEmpty) break;
    entry = queue.dequeue();
  }
}
export const hasAnyChild = <V extends TreeNode>(parent:V, possibleChild:V, eq:IsEqual<V> = isEqualDefault):boolean => {
  return hasChild(parent, possibleChild, Number.MAX_SAFE_INTEGER, eq);
}

export const hasChild = <V extends TreeNode>(parent:V, possibleChild:V, maxDepth = 0, eq:IsEqual<V> = isEqualDefault):boolean => {
  if (maxDepth < 0) return false;
  for (const d of parent.descendants()) {
    if (eq(d as V, possibleChild)) return true;
    if (hasChild(d, possibleChild, maxDepth - 1)) return true;
  }
  return false;
}

export const hasParent = <V extends TreeNode>(child:V, possibleParent:V, maxDepth = 0, eq:IsEqual<V> = isEqualDefault):boolean => {
  for (const p of child.parents()) {
    if (eq(p as V, possibleParent)) return true;
    maxDepth--;
    if (maxDepth < 0) break;
  }
  return false;
}

export const hasAnyParent = <V extends TreeNode>(child:V, possibleParent:V, eq:IsEqual<V> = isEqualDefault):boolean => {
  return hasParent(child, possibleParent, Number.MAX_SAFE_INTEGER, eq);
}

export const couldAddChild = <V extends TreeNode>(parent:V, prospectiveChild:V, eq:IsEqual<V> = isEqualDefault) => {
  if (eq(parent, prospectiveChild)) throw new Error(`Descendant equals parent`);
  if (hasAnyChild(parent, prospectiveChild, eq)) throw new Error(`Circular. Parent already has child`);
  if (hasAnyChild(prospectiveChild, parent, eq)) throw new Error(`Prospective child has parent as child relation`);
}