import { type IsEqual, isEqualValueIgnoreOrder } from "@ixfxfun/core";
import * as TreeMutable from './TreeMutable.js';
import type { TreeNode, TraversableTree } from './Types.js';

export type DiffAnnotation<T> = {
  /**
   * In the case of changes, this is old value
   */
  a: TraversableTree<T>
  /**
   * In the case of changes, this is the new value
   */
  b: TraversableTree<T>
  /**
   * If true, this node's value has been modified
   */
  valueChanged: boolean
  /**
   * If true, one of the child values has changed
   */
  childChanged: boolean
  /**
   * List of new children
   */
  added: Array<TraversableTree<T>>
  /**
   * List of removed children
   */
  removed: Array<TraversableTree<T>>
}

export type DiffNode<T> = TreeNode<DiffAnnotation<T>> & {
  toString: () => string
};

export const compare = <T>(a: TraversableTree<T>, b: TraversableTree<T>, eq: IsEqual<T> = isEqualValueIgnoreOrder, parent?: DiffNode<T> | undefined): DiffNode<T> => {
  const valueEqual = valueOrIdentityEqual(a, b, eq);
  // if (!valueEqual) {
  //   nsole.log(`changed compare a: ${ toStringSingle(a) } b: ${ toStringSingle(b) }`);
  // }
  const childrenCompare = compareChildren(a, b, eq);

  const diff: DiffAnnotation<T> = {
    valueChanged: !valueEqual, a, b,
    added: childrenCompare.added,
    removed: childrenCompare.removed,
    childChanged: false
  }
  const diffNode: DiffNode<T> = {
    value: diff,
    childrenStore: [],
    parent
  }

  const childrenDiff = childrenCompare.identical.map(c => compare(c[ 0 ], c[ 1 ], eq, diffNode));
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const someChildChange = hasChange(diff) || childrenDiff.some(v => hasChange(v.value!));
  TreeMutable.setChildren(diffNode, childrenDiff);
  //diffNode.childrenStore = childrenDiff;

  diffNode.toString = () => toString(diffNode, 0);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  diffNode.value!.childChanged = someChildChange;
  TreeMutable.throwTreeTest(diffNode);

  return diffNode;
}

const hasChange = (vv: DiffAnnotation<any>): boolean => {
  if (vv === undefined) return false;
  if (vv.valueChanged) return true;
  if (vv.childChanged) return true;
  if (vv.added.length > 0) return true;
  if (vv.removed.length > 0) return true;
  return false;
}


const compareChildren = <T>(a: TraversableTree<T>, b: TraversableTree<T>, eq: IsEqual<T> = isEqualValueIgnoreOrder) => {
  const childrenOfA = [ ...a.children() ];
  const childrenOfB = [ ...b.children() ];

  const identical: Array<[ a: TraversableTree<T>, b: TraversableTree<T> ]> = []
  const removed: Array<TraversableTree<T>> = [];
  for (const childA of childrenOfA) {
    let foundIndex = -1;
    for (const [ index, childOfB ] of childrenOfB.entries()) {
      const d = valueOrIdentityEqual(childA, childOfB, eq);
      if (d) {
        identical.push([ childA, childOfB ]);
        foundIndex = index;
        break;
      }
    }
    if (foundIndex === -1) {
      // A's child not found in B's children
      removed.push(childA);
    } else {
      // Found, remove it from list of B's children
      childrenOfB.splice(foundIndex, 1);
    }
  }
  const added = [ ...childrenOfB ];
  return { added, identical, removed }
}

const valueOrIdentityEqual = <T>(a: TraversableTree<T>, b: TraversableTree<T>, eq: IsEqual<T>): boolean => {
  if (a.getIdentity() === b.getIdentity()) return true;
  if (eq(a.getValue(), b.getValue())) return true;
  return false;
}

const toStringSingle = <T>(n: TraversableTree<T>):string => {
  return JSON.stringify(n.getValue());
}

const toString = <T>(n: DiffNode<T>, indent = 0): string => {
  if (n === undefined) return `(undefined)`;
  let t = toStringDiff(n.value, indent);
  for (const c of n.childrenStore) {
    t += toString(c, indent + 2);
  }
  return t;
}

const toStringDiff = <T>(n: DiffAnnotation<T> | undefined, indent: number): string => {
  const spaces = ` `.repeat(indent);
  if (n === undefined) return `${ spaces }(undefined)`;
  const t:string[] = [];
  t.push(`a: ${ toStringSingle(n.a) } b: ${ toStringSingle(n.b) }`);
  if (n.valueChanged) t.push(`Value changed. Child changed: ${ n.childChanged }`);
  else t.push(`Value unchanged. Child changed: ${ n.childChanged }`);

  if (n.added.length > 0) {
    t.push(`Added:`);
    for (const c of n.added) {
      t.push(` - ` + toStringSingle(c));
    }
  }
  if (n.removed.length > 0) {
    t.push(`Removed: ${ n.removed.length }`);
    for (const c of n.removed) {
      t.push(` - ` + toStringSingle(c));
    }
  }
  t.push(`----\n`)
  return t.map(line => spaces + line).join(`\n`);
}