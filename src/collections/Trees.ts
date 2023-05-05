import {IsEqual, isEqualDefault} from "../Util.js";
import { queueMutable } from "./Queue.js";
import { stackMutable } from "./Stack.js";
import {betweenChomp} from "../Text.js";
import { TreeNodeMutable, treeNodeMutable } from "./TreeNodeMutable.js";

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

export function isTreeNode<V>(p:TreeNode|unknown):p is TreeNode {
  if (p === undefined) return false;
  if (p === null) return false;
  if (typeof (p as TreeNode).descendants === 'undefined') return false;
  if (typeof (p as TreeNode).parents === 'undefined') return false;
  return true;
}


// function treeTest() {
//   console.log(`Tree test`);

//   const testMap = new Map();
//   testMap.set('jill', {
//     address: {
//       street: 'Blah St',
//       number: 27
//     }
//   });
//   testMap.set('john', {
//     address: {
//       street: 'West St',
//       number: 35
//     }
//   })

//   const testArray = [
//     'one',
//     ['two'],
//     'three',
//     ['four-a', 'four-b', 'four-c'],
//     'five'
//   ];

//   const testObj = {
//     name: 'Jill',
//     address: {
//       street: 'Blah St',
//       number: 27
//     },
//     kids: [
//       {
//         name:'John',
//         address: {
//           street: 'West St',
//           number: 35
//         }
//       },
//       {name:'Sam'}
//     ]
//   }

  // console.log('direct descendants');
  // for (const x of directDescendants(testObj)) {
  //   console.log(x);
  // }
//   console.log('breadth first');
//   for (const x of breadthFirst(testObj)) {
//     console.log(x[0] + ' - ', x[1]);
//   }
// console.log();
// console.log('depth first');
// for (const x of depthFirst(testObj)) {
//   console.log(x[0] + ' - ', x[1]);
// }
  // console.log('Find result');
  // console.log('f1: ', findByDottedPath('kids[1]', testObj));
  // console.log('f2: ', findByDottedPath('address.street', testObj));
  // console.log('f2: ', findByDottedPath('kids[0].address.street', testObj));
  

//   const f1 = findByDottedPath('kids[0].address.blah', testObj);
//   console.log(prettyPrintEntryPath(f1));
// } 
//treeTest();

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

/**
 * Returns path of Entries:
 * ```js
 * const p = findByDottedPath('kids[0].address.street', rootNode);
 * // Returns Entry objects representing:
 * // [kids[0], address, street]
 * ```
 * 
 * Partial results are returned:
 * ```js
 * const p = findByDottedPath('kids[0].address.blah', rootNode);
 * // [kids[0], address]
 * // Could only trace path until 'address'
 * ```
 * @param path 
 * @param node 
 * @returns 
 */
export function findByDottedPath(path:string, node:object):Entry[] {
  const pathSplit = path.split('.');
  const navigationPath:Entry[] = [];

  for (let p of pathSplit) {
    const [origStr, arrayIndex] = betweenChomp(p, '[', ']');
    let e:Entry|undefined;
    //console.log(`orig: ${origStr} arrayIndex: ${arrayIndex}`);
    if (arrayIndex && Number.isInteger(parseInt(arrayIndex))) {
      p = origStr;
    }
    
    e = findDirectDescendantByLabel(p, node);
    if (e && arrayIndex && Number.isInteger(parseInt(arrayIndex)) && Array.isArray(e[1])) {
      e = [origStr, e[1][parseInt(arrayIndex)]];
    }    

    if (!e) {
      return navigationPath
    }
    node = e[1];
    navigationPath.push(e)
  }
  return navigationPath;
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