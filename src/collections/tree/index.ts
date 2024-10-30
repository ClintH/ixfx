import { asDynamicTraversable as ObjectToTraversable } from './TraverseObject.js';
import { asDynamicTraversable as TreeNodeToTraversable } from './TreeMutable.js';
import type { TraversableTree, TreeNode } from './Types.js';

export * as Mutable from './TreeMutable.js';
export * as Pathed from './Pathed.js'
export * as FromObject from './TraverseObject.js';
export * as Traverse from './TraversableTree.js';
export * from './Compare.js';
export type * from './Types.js';

export const toTraversable = <T>(node: TreeNode<T> | TraversableTree<T> | object) => {
  if (isTraversable(node)) return node;
  if (isTreeNode(node)) return TreeNodeToTraversable(node);
  if (typeof node === `object`) return ObjectToTraversable(node);
  throw new Error(`Parameter 'node' not convertible`);
}

export const isTreeNode = (node: any): node is TreeNode<any> => {
  if (`parent` in node && `childrenStore` in node && `value` in node) {
    if (Array.isArray(node.childrenStore)) return true;
  }
  return false;
}

export const isTraversable = (node: any): node is TraversableTree<any> => {
  return (`children` in node && `getParent` in node && `getValue` in node && `getIdentity` in node);
}