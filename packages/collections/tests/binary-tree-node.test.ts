import { test, expect } from 'vitest';
import { BinaryTreeNode } from '../src/binary-tree-node.js';

test('create node with value', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(node.value).toBe(10);
  expect(node.isLeaf).toBe(true);
  expect(node.multiplicity).toBe(0);
});

test('setLeftAndUpdateParent', () => {
  const parent = new BinaryTreeNode<number>(10);
  const left = new BinaryTreeNode<number>(5);
  
  parent.setLeftAndUpdateParent(left);
  
  expect(parent.left).toBe(left);
  expect(left.parent).toBe(parent);
  expect(left.parentSide).toBe(0); // Side.Left enum value
  expect(left.isParentLeftChild).toBe(true);
  expect(left.isParentRightChild).toBe(false);
});

test('setRightAndUpdateParent', () => {
  const parent = new BinaryTreeNode<number>(10);
  const right = new BinaryTreeNode<number>(15);
  
  parent.setRightAndUpdateParent(right);
  
  expect(parent.right).toBe(right);
  expect(right.parent).toBe(parent);
  expect(right.parentSide).toBe(1); // Side.Right enum value
  expect(right.isParentLeftChild).toBe(false);
  expect(right.isParentRightChild).toBe(true);
});

test('setLeftAndUpdateParent throws on self-reference', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(() => node.setLeftAndUpdateParent(node)).toThrow('Cannot set left to be same as self');
});

test('setRightAndUpdateParent throws on self-reference', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(() => node.setRightAndUpdateParent(node)).toThrow('Cannot set right to be same as self');
});

test('parentChildSide returns root for root node', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(node.parentChildSide).toBe('root');
});

test('parentChildSide returns left for left child', () => {
  const parent = new BinaryTreeNode<number>(10);
  const left = new BinaryTreeNode<number>(5);
  parent.setLeftAndUpdateParent(left);
  expect(left.parentChildSide).toBe('left');
});

test('parentChildSide returns right for right child', () => {
  const parent = new BinaryTreeNode<number>(10);
  const right = new BinaryTreeNode<number>(15);
  parent.setRightAndUpdateParent(right);
  expect(right.parentChildSide).toBe('right');
});

test('isLeaf returns true when no children', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(node.isLeaf).toBe(true);
});

test('isLeaf returns false when has left child', () => {
  const parent = new BinaryTreeNode<number>(10);
  parent.setLeftAndUpdateParent(new BinaryTreeNode<number>(5));
  expect(parent.isLeaf).toBe(false);
});

test('isLeaf returns false when has right child', () => {
  const parent = new BinaryTreeNode<number>(10);
  parent.setRightAndUpdateParent(new BinaryTreeNode<number>(15));
  expect(parent.isLeaf).toBe(false);
});

test('isLeaf returns false when has both children', () => {
  const parent = new BinaryTreeNode<number>(10);
  parent.setLeftAndUpdateParent(new BinaryTreeNode<number>(5));
  parent.setRightAndUpdateParent(new BinaryTreeNode<number>(15));
  expect(parent.isLeaf).toBe(false);
});

test('sibling returns undefined for root', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(node.sibling).toBeUndefined();
});

test('sibling returns right sibling', () => {
  const parent = new BinaryTreeNode<number>(10);
  const left = new BinaryTreeNode<number>(5);
  const right = new BinaryTreeNode<number>(15);
  parent.setLeftAndUpdateParent(left);
  parent.setRightAndUpdateParent(right);
  
  expect(left.sibling).toBe(right);
});

test('sibling returns left sibling', () => {
  const parent = new BinaryTreeNode<number>(10);
  const left = new BinaryTreeNode<number>(5);
  const right = new BinaryTreeNode<number>(15);
  parent.setLeftAndUpdateParent(left);
  parent.setRightAndUpdateParent(right);
  
  expect(right.sibling).toBe(left);
});

test('sibling returns undefined when only child', () => {
  const parent = new BinaryTreeNode<number>(10);
  const left = new BinaryTreeNode<number>(5);
  parent.setLeftAndUpdateParent(left);
  
  expect(left.sibling).toBeUndefined();
});

test('uncle returns undefined for root', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(node.uncle).toBeUndefined();
});

test('uncle returns undefined when parent has no sibling', () => {
  const grandparent = new BinaryTreeNode<number>(20);
  const parent = new BinaryTreeNode<number>(10);
  const child = new BinaryTreeNode<number>(5);
  
  grandparent.setLeftAndUpdateParent(parent);
  parent.setLeftAndUpdateParent(child);
  
  expect(child.uncle).toBeUndefined();
});

test('uncle returns correct uncle', () => {
  const grandparent = new BinaryTreeNode<number>(20);
  const parent = new BinaryTreeNode<number>(10);
  const uncle = new BinaryTreeNode<number>(25);
  const child = new BinaryTreeNode<number>(5);
  
  grandparent.setLeftAndUpdateParent(parent);
  grandparent.setRightAndUpdateParent(uncle);
  parent.setLeftAndUpdateParent(child);
  
  expect(child.uncle).toBe(uncle);
});

test('grandparent returns undefined for root', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(node.grandparent).toBeUndefined();
});

test('grandparent returns undefined when parent is root', () => {
  const parent = new BinaryTreeNode<number>(10);
  const child = new BinaryTreeNode<number>(5);
  parent.setLeftAndUpdateParent(child);
  
  expect(child.grandparent).toBeUndefined();
});

test('grandparent returns correct grandparent', () => {
  const grandparent = new BinaryTreeNode<number>(20);
  const parent = new BinaryTreeNode<number>(10);
  const child = new BinaryTreeNode<number>(5);
  
  grandparent.setLeftAndUpdateParent(parent);
  parent.setLeftAndUpdateParent(child);
  
  expect(child.grandparent).toBe(grandparent);
});

test('leftSubtreeHeight returns 0 when no left child', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(node.leftSubtreeHeight).toBe(0);
});

test('leftSubtreeHeight with one level', () => {
  const parent = new BinaryTreeNode<number>(10);
  const left = new BinaryTreeNode<number>(5);
  parent.setLeftAndUpdateParent(left);
  expect(parent.leftSubtreeHeight).toBe(1);
});

test('leftSubtreeHeight with nested levels', () => {
  const root = new BinaryTreeNode<number>(10);
  const left = new BinaryTreeNode<number>(5);
  const leftLeft = new BinaryTreeNode<number>(3);
  
  root.setLeftAndUpdateParent(left);
  left.setLeftAndUpdateParent(leftLeft);
  
  expect(root.leftSubtreeHeight).toBe(2);
});

test('rightSubtreeHeight returns 0 when no right child', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(node.rightSubtreeHeight).toBe(0);
});

test('rightSubtreeHeight with one level', () => {
  const parent = new BinaryTreeNode<number>(10);
  const right = new BinaryTreeNode<number>(15);
  parent.setRightAndUpdateParent(right);
  expect(parent.rightSubtreeHeight).toBe(1);
});

test('height returns 0 for leaf node', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(node.height).toBe(0);
});

test('height returns max of subtrees', () => {
  const root = new BinaryTreeNode<number>(10);
  const left = new BinaryTreeNode<number>(5);
  const leftLeft = new BinaryTreeNode<number>(3);
  
  root.setLeftAndUpdateParent(left);
  left.setLeftAndUpdateParent(leftLeft);
  
  expect(root.height).toBe(2);
});

test('balanceFactor returns 0 for balanced tree', () => {
  const root = new BinaryTreeNode<number>(10);
  root.setLeftAndUpdateParent(new BinaryTreeNode<number>(5));
  root.setRightAndUpdateParent(new BinaryTreeNode<number>(15));
  
  expect(root.balanceFactor).toBe(0);
});

test('balanceFactor for left-heavy tree', () => {
  const root = new BinaryTreeNode<number>(10);
  const left = new BinaryTreeNode<number>(5);
  root.setLeftAndUpdateParent(left);
  left.setLeftAndUpdateParent(new BinaryTreeNode<number>(3));
  
  expect(root.balanceFactor).toBe(2);
});

test('balanceFactor for right-heavy tree', () => {
  const root = new BinaryTreeNode<number>(10);
  const right = new BinaryTreeNode<number>(15);
  root.setRightAndUpdateParent(right);
  right.setRightAndUpdateParent(new BinaryTreeNode<number>(20));
  
  expect(root.balanceFactor).toBe(-2);
});

test('toValues serializes node', () => {
  const parent = new BinaryTreeNode<number>(10);
  const left = new BinaryTreeNode<number>(5);
  const right = new BinaryTreeNode<number>(15);
  
  parent.setLeftAndUpdateParent(left);
  parent.setRightAndUpdateParent(right);
  
  const values = parent.toValues();
  expect(values.value).toBe(10);
  expect(values.left).toBe(5);
  expect(values.right).toBe(15);
  expect(values.parent).toBeUndefined();
  expect(values.parentSide).toBe(2); // Side.Neutral
});

test('toValues for child node shows parent', () => {
  const parent = new BinaryTreeNode<number>(10);
  const left = new BinaryTreeNode<number>(5);
  
  parent.setLeftAndUpdateParent(left);
  
  const values = left.toValues();
  expect(values.parent).toBe(10);
  expect(values.parentSide).toBe(0); // Side.Left
});

test('from creates tree from iterable', () => {
  const values = [10, 5, 15, 3, 7];
  const root = BinaryTreeNode.from<number>(values.values());
  
  expect(root).toBeDefined();
  expect(root!.value).toBe(10);
  expect(root!.left!.value).toBe(5);
  expect(root!.right!.value).toBe(15);
});

test('from with empty iterable returns undefined', () => {
  const root = BinaryTreeNode.from<number>([].values());
  expect(root).toBeUndefined();
});

test('from with single value', () => {
  const root = BinaryTreeNode.from<number>([42].values());
  expect(root!.value).toBe(42);
  expect(root!.isLeaf).toBe(true);
});

test('multiplicity property', () => {
  const node = new BinaryTreeNode<number>(10);
  expect(node.multiplicity).toBe(0);
  
  node.multiplicity = 3;
  expect(node.multiplicity).toBe(3);
});

test('complex tree structure', () => {
  const root = new BinaryTreeNode<number>(20);
  const left = new BinaryTreeNode<number>(10);
  const right = new BinaryTreeNode<number>(30);
  const leftLeft = new BinaryTreeNode<number>(5);
  const leftRight = new BinaryTreeNode<number>(15);
  
  root.setLeftAndUpdateParent(left);
  root.setRightAndUpdateParent(right);
  left.setLeftAndUpdateParent(leftLeft);
  left.setRightAndUpdateParent(leftRight);
  
  expect(root.height).toBe(2);
  expect(root.balanceFactor).toBe(1);
  expect(leftLeft.parent!.value).toBe(10);
  expect(leftRight.sibling).toBe(leftLeft);
  expect(right.sibling).toBe(left);
  expect(leftLeft.uncle).toBe(right);
});
