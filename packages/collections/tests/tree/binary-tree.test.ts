import { test, expect } from 'vitest';
import * as BinaryTree from '../../src/tree/binary-tree.js';

test(`root-creation`, () => {
  const root = BinaryTree.root(1);
  expect(root.value).toBe(1);
  expect(root.childrenStore.length).toBe(0);
});

test(`get-left-right-empty`, () => {
  const root = BinaryTree.root(1);
  expect(BinaryTree.getLeft(root)).toBeUndefined();
  expect(BinaryTree.getRight(root)).toBeUndefined();
});

test(`has-left-right`, () => {
  const root = BinaryTree.root(1);
  expect(BinaryTree.hasLeft(root)).toBe(false);
  expect(BinaryTree.hasRight(root)).toBe(false);
});

test(`add-left`, () => {
  const root = BinaryTree.root(1);
  const left = BinaryTree.addLeft(2, root);
  expect(left.value).toBe(2);
  expect(BinaryTree.getLeft(root)?.value).toBe(2);
  expect(BinaryTree.hasLeft(root)).toBe(true);
});

test(`add-right`, () => {
  const root = BinaryTree.root(1);
  const right = BinaryTree.addRight(2, root);
  expect(right.value).toBe(2);
  expect(BinaryTree.getRight(root)?.value).toBe(2);
  expect(BinaryTree.hasRight(root)).toBe(true);
});

test(`add-both-children`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  BinaryTree.addRight(3, root);
  
  expect(BinaryTree.getLeft(root)?.value).toBe(2);
  expect(BinaryTree.getRight(root)?.value).toBe(3);
  expect(BinaryTree.hasLeft(root)).toBe(true);
  expect(BinaryTree.hasRight(root)).toBe(true);
});

test(`is-leaf`, () => {
  const root = BinaryTree.root(1);
  expect(BinaryTree.isLeaf(root)).toBe(true);
  
  BinaryTree.addLeft(2, root);
  expect(BinaryTree.isLeaf(root)).toBe(false);
  
  const left = BinaryTree.getLeft(root)!;
  expect(BinaryTree.isLeaf(left)).toBe(true);
});

test(`set-left-replaces`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  
  const newLeft = BinaryTree.createNode(20);
  BinaryTree.setLeft(root, newLeft);
  
  expect(BinaryTree.getLeft(root)?.value).toBe(20);
});

test(`set-right-replaces`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addRight(2, root);
  
  const newRight = BinaryTree.createNode(20);
  BinaryTree.setRight(root, newRight);
  
  expect(BinaryTree.getRight(root)?.value).toBe(20);
});

test(`set-left-to-undefined`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  BinaryTree.setLeft(root, undefined);
  
  expect(BinaryTree.getLeft(root)).toBeUndefined();
  expect(BinaryTree.hasLeft(root)).toBe(false);
});

test(`set-right-to-undefined`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addRight(2, root);
  BinaryTree.setRight(root, undefined);
  
  expect(BinaryTree.getRight(root)).toBeUndefined();
  expect(BinaryTree.hasRight(root)).toBe(false);
});

test(`parent-child-side`, () => {
  const root = BinaryTree.root(1);
  expect(BinaryTree.parentChildSide(root)).toBe(`neutral`);
  
  const left = BinaryTree.addLeft(2, root);
  const right = BinaryTree.addRight(3, root);
  
  expect(BinaryTree.parentChildSide(left)).toBe(`left`);
  expect(BinaryTree.parentChildSide(right)).toBe(`right`);
});

test(`is-parent-left-child`, () => {
  const root = BinaryTree.root(1);
  const left = BinaryTree.addLeft(2, root);
  BinaryTree.addRight(3, root);
  
  expect(BinaryTree.isParentLeftChild(left)).toBe(true);
  expect(BinaryTree.isParentLeftChild(root)).toBe(false);
});

test(`is-parent-right-child`, () => {
  const root = BinaryTree.root(1);
  const left = BinaryTree.addLeft(2, root);
  const right = BinaryTree.addRight(3, root);
  
  expect(BinaryTree.isParentRightChild(right)).toBe(true);
  expect(BinaryTree.isParentRightChild(left)).toBe(false);
});

test(`sibling`, () => {
  const root = BinaryTree.root(1);
  const left = BinaryTree.addLeft(2, root);
  const right = BinaryTree.addRight(3, root);
  
  expect(BinaryTree.sibling(left)?.value).toBe(3);
  expect(BinaryTree.sibling(right)?.value).toBe(2);
  expect(BinaryTree.sibling(root)).toBeUndefined();
});

test(`uncle`, () => {
  const root = BinaryTree.root(1);
  const left = BinaryTree.addLeft(2, root);
  const leftLeft = BinaryTree.addLeft(3, left);
  
  expect(BinaryTree.uncle(leftLeft)?.value).toBeUndefined();
});

test(`grandparent`, () => {
  const root = BinaryTree.root(1);
  const left = BinaryTree.addLeft(2, root);
  const leftLeft = BinaryTree.addLeft(3, left);
  
  expect(BinaryTree.grandparent(leftLeft)?.value).toBe(1);
  expect(BinaryTree.grandparent(left)).toBeUndefined();
  expect(BinaryTree.grandparent(root)).toBeUndefined();
});

test(`height`, () => {
  const root = BinaryTree.root(1);
  expect(BinaryTree.height(root)).toBe(0);
  
  BinaryTree.addLeft(2, root);
  expect(BinaryTree.height(root)).toBe(1);
  
  const left = BinaryTree.getLeft(root)!;
  BinaryTree.addLeft(3, left);
  expect(BinaryTree.height(root)).toBe(2);
});

test(`balance-factor`, () => {
  const root = BinaryTree.root(1);
  expect(BinaryTree.balanceFactor(root)).toBe(0);
  
  BinaryTree.addLeft(2, root);
  expect(BinaryTree.balanceFactor(root)).toBe(1);
  
  BinaryTree.addRight(3, root);
  expect(BinaryTree.balanceFactor(root)).toBe(0);
});

test(`left-subtree-height`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  
  expect(BinaryTree.leftSubtreeHeightFn(root)).toBe(1);
  expect(BinaryTree.rightSubtreeHeightFn(root)).toBe(0);
});

test(`right-subtree-height`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addRight(2, root);
  
  expect(BinaryTree.leftSubtreeHeightFn(root)).toBe(0);
  expect(BinaryTree.rightSubtreeHeightFn(root)).toBe(1);
});

test(`traversal-in-order`, () => {
  const root = BinaryTree.root(2);
  BinaryTree.addLeft(1, root);
  BinaryTree.addRight(3, root);
  
  const values = [...BinaryTree.inOrder(root)].map(n => n.value);
  expect(values).toEqual([1, 2, 3]);
});

test(`traversal-pre-order`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  BinaryTree.addRight(3, root);
  
  const values = [...BinaryTree.preOrder(root)].map(n => n.value);
  expect(values).toEqual([1, 2, 3]);
});

test(`traversal-post-order`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  BinaryTree.addRight(3, root);
  
  const values = [...BinaryTree.postOrder(root)].map(n => n.value);
  expect(values).toEqual([2, 3, 1]);
});

test(`traversal-depth-first`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  BinaryTree.addRight(3, root);
  
  const values = [...BinaryTree.depthFirst(root)].map(n => n.value);
  expect(values).toEqual([2, 3, 1]);
});

test(`traversal-breadth-first`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  BinaryTree.addRight(3, root);
  
  const values = [...BinaryTree.breadthFirst(root)].map(n => n.value);
  expect(values).toEqual([1, 2, 3]);
});

test(`from-array`, () => {
  const root = BinaryTree.fromArray([1, 2, 3, 4, 5]);
  
  expect(root?.value).toBe(1);
  expect(BinaryTree.getLeft(root!)?.value).toBe(2);
  expect(BinaryTree.getRight(root!)?.value).toBe(3);
});

test(`from-array-empty`, () => {
  const root = BinaryTree.fromArray([]);
  expect(root).toBeUndefined();
});

test(`to-array`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  BinaryTree.addRight(3, root);
  
  const arr = BinaryTree.toArray(root);
  expect(arr).toEqual([1, 2, 3]);
});

test(`find-existing`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  BinaryTree.addRight(3, root);
  
  const found = BinaryTree.find(root, 2);
  expect(found?.value).toBe(2);
});

test(`find-missing`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  
  const found = BinaryTree.find(root, 99);
  expect(found).toBeUndefined();
});

test(`wrapped-node`, () => {
  const wrapped = BinaryTree.rootWrapped(1);
  
  expect(wrapped.node.value).toBe(1);
  expect(wrapped.isLeaf).toBe(true);
  
  wrapped.addLeft(2);
  wrapped.addRight(3);
  
  expect(wrapped.isLeaf).toBe(false);
  expect(wrapped.left?.node.value).toBe(2);
  expect(wrapped.right?.node.value).toBe(3);
  
  expect(wrapped.left?.isParentLeftChild).toBe(true);
  expect(wrapped.right?.isParentRightChild).toBe(true);
  
  expect(wrapped.left?.sibling?.node.value).toBe(3);
  expect(wrapped.right?.sibling?.node.value).toBe(2);
});

test(`wrapped-node-height`, () => {
  const wrapped = BinaryTree.rootWrapped(1);
  wrapped.addLeft(2);
  wrapped.left?.addLeft(3);
  
  expect(wrapped.height).toBe(2);
  expect(wrapped.balanceFactor).toBe(2);
});

test(`wrapped-node-has`, () => {
  const wrapped = BinaryTree.rootWrapped(1);
  wrapped.addLeft(2);
  wrapped.addRight(3);
  
  expect(wrapped.has(1)).toBe(true);
  expect(wrapped.has(2)).toBe(true);
  expect(wrapped.has(3)).toBe(true);
  expect(wrapped.has(99)).toBe(false);
});

test(`wrapped-node-remove`, () => {
  const wrapped = BinaryTree.rootWrapped(1);
  const left = wrapped.addLeft(2);
  
  expect(wrapped.left?.node.value).toBe(2);
  
  left.remove();
  
  expect(wrapped.left).toBeUndefined();
});

test(`to-string-deep`, () => {
  const root = BinaryTree.root(1);
  BinaryTree.addLeft(2, root);
  BinaryTree.addRight(3, root);
  
  const str = BinaryTree.toStringDeep(root);
  expect(str).toContain(`1`);
  expect(str).toContain(`2`);
  expect(str).toContain(`3`);
});
