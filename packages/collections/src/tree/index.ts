import { asDynamicTraversable as ObjectToTraversable } from './traverse-object.js';
import { asDynamicTraversable as TreeNodeToTraversable } from './tree-mutable.js';
import type { TraversableTree, TreeNode } from './types.js';

export * as Mutable from './tree-mutable.js';
export * as Pathed from './pathed.js'
export * as FromObject from './traverse-object.js';
export * as Traverse from './traversable-tree.js';
export * from './compare.js';
export type * from './types.js';

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