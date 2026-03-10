import { test, expect } from 'vitest';
import { defaultComparer, type Comparer } from '@ixfx/core';
import * as BST from '../../src/tree/binary-search-tree.js';

test(`insert-single`, () => {
  const root = BST.insert(BST.root(), 5);
  expect(root.value).toBe(5);
});

test(`insert-multiple`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 7);
  
  expect(root.value).toBe(5);
  expect(root.childrenStore[0]?.value).toBe(3);
  expect(root.childrenStore[1]?.value).toBe(7);
});

test(`insert-duplicate-skips`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 5);
  
  expect(root.value).toBe(5);
  expect(root.childrenStore.length).toBe(0);
});

test(`has-existing`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  
  expect(BST.has(root, 5)).toBe(true);
  expect(BST.has(root, 3)).toBe(true);
});

test(`has-missing`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  
  expect(BST.has(root, 3)).toBe(false);
  expect(BST.has(root, 99)).toBe(false);
});

test(`find-existing`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 7);
  
  const found = BST.find(root, 3);
  expect(found?.value).toBe(3);
});

test(`find-missing`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  
  const found = BST.find(root, 99);
  expect(found).toBeUndefined();
});

test(`min`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 7);
  root = BST.insert(root, 1);
  
  const minNode = BST.min(root);
  expect(minNode?.value).toBe(1);
});

test(`max`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 7);
  root = BST.insert(root, 10);
  
  const maxNode = BST.max(root);
  expect(maxNode?.value).toBe(10);
});

test(`min-empty-tree`, () => {
  const root = BST.root<number>();
  const minNode = BST.min(root);
  expect(minNode).toBeUndefined();
});

test(`max-empty-tree`, () => {
  const root = BST.root<number>();
  const maxNode = BST.max(root);
  expect(maxNode).toBeUndefined();
});

test(`in-order-sorted`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 7);
  root = BST.insert(root, 1);
  root = BST.insert(root, 4);
  
  const values = [...BST.inOrder(root)].map(n => n.value);
  expect(values).toEqual([1, 3, 4, 5, 7]);
});

test(`values-in-order`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 7);
  
  const values = [...BST.valuesInOrder(root)];
  expect(values).toEqual([3, 5, 7]);
});

test(`pre-order`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 7);
  
  const values = [...BST.preOrder(root)].map(n => n.value);
  expect(values).toEqual([5, 3, 7]);
});

test(`post-order`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 7);
  
  const values = [...BST.postOrder(root)].map(n => n.value);
  expect(values).toEqual([3, 7, 5]);
});

test(`remove-leaf`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 7);
  
  const result = BST.remove(root, 3);
  expect(result).toBeDefined();
  expect(BST.has(result!, 3)).toBe(false);
  expect(BST.has(result!, 5)).toBe(true);
  expect(BST.has(result!, 7)).toBe(true);
});

test(`remove-one-child-left`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 1);
  
  const result = BST.remove(root, 3);
  expect(result).toBeDefined();
  expect(BST.has(result!, 3)).toBe(false);
  expect(BST.has(result!, 1)).toBe(true);
});

test(`remove-one-child-right`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 7);
  root = BST.insert(root, 10);
  
  const result = BST.remove(root, 7);
  expect(result).toBeDefined();
  expect(BST.has(result!, 7)).toBe(false);
  expect(BST.has(result!, 10)).toBe(true);
});

test(`remove-two-children`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 7);
  root = BST.insert(root, 6);
  root = BST.insert(root, 8);
  
  const result = BST.remove(root, 7);
  expect(result).toBeDefined();
  expect(BST.has(result!, 7)).toBe(false);
  expect(BST.has(result!, 5)).toBe(true);
  expect(BST.has(result!, 3)).toBe(true);
  expect(BST.has(result!, 6)).toBe(true);
  expect(BST.has(result!, 8)).toBe(true);
});

test(`remove-root`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  root = BST.insert(root, 3);
  root = BST.insert(root, 7);
  
  const result = BST.remove(root, 5);
  expect(result).toBeDefined();
  expect(BST.has(result!, 5)).toBe(false);
  expect(BST.has(result!, 3)).toBe(true);
  expect(BST.has(result!, 7)).toBe(true);
});

test(`remove-missing`, () => {
  let root = BST.root<number>();
  root = BST.insert(root, 5);
  
  const result = BST.remove(root, 99);
  expect(result).toBeUndefined();
});

test(`remove-empty-tree`, () => {
  const root = BST.root<number>();
  const result = BST.remove(root, 5);
  expect(result).toBeUndefined();
});

test(`custom-comparer`, () => {
  const stringComparer: Comparer<string> = (a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };
  
  let root = BST.root<string>();
  root = BST.insert(root, `banana`, stringComparer);
  root = BST.insert(root, `apple`, stringComparer);
  root = BST.insert(root, `cherry`, stringComparer);
  
  expect(BST.has(root, `apple`, stringComparer)).toBe(true);
  expect(BST.has(root, `banana`, stringComparer)).toBe(true);
  expect(BST.has(root, `cherry`, stringComparer)).toBe(true);
  
  const values = [...BST.valuesInOrder(root)];
  expect(values).toEqual([`apple`, `banana`, `cherry`]);
});

test(`from-array`, () => {
  const bst = BST.fromArray([5, 3, 7, 1, 4, 6, 8]);
  
  expect(BST.has(bst.root, 5)).toBe(true);
  expect(BST.has(bst.root, 3)).toBe(true);
  expect(BST.has(bst.root, 7)).toBe(true);
  expect(BST.has(bst.root, 1)).toBe(true);
  expect(BST.has(bst.root, 4)).toBe(true);
  expect(BST.has(bst.root, 6)).toBe(true);
  expect(BST.has(bst.root, 8)).toBe(true);
});

test(`from-array-empty`, () => {
  const bst = BST.fromArray([]);
  expect(bst.root.value).toBeUndefined();
});

test(`to-array-in-order`, () => {
  const bst = BST.fromArray([5, 3, 7, 1, 4, 6, 8]);
  
  const arr = bst.toArrayInOrder();
  expect(arr).toEqual([1, 3, 4, 5, 6, 7, 8]);
});

test(`class-insert`, () => {
  const bst = new BST.Bst<number>();
  bst.insert(5);
  bst.insert(3);
  bst.insert(7);
  
  expect(bst.has(5)).toBe(true);
  expect(bst.has(3)).toBe(true);
  expect(bst.has(7)).toBe(true);
});

test(`class-find`, () => {
  const bst = new BST.Bst<number>();
  bst.insert(5);
  bst.insert(3);
  bst.insert(7);
  
  const found = bst.find(3);
  expect(found?.value).toBe(3);
  
  const notFound = bst.find(99);
  expect(notFound).toBeUndefined();
});

test(`class-remove`, () => {
  const bst = new BST.Bst<number>();
  bst.insert(5);
  bst.insert(3);
  bst.insert(7);
  
  const result = bst.remove(3);
  expect(result).toBe(true);
  expect(bst.has(3)).toBe(false);
  expect(bst.has(5)).toBe(true);
  expect(bst.has(7)).toBe(true);
});

test(`class-min-max`, () => {
  const bst = new BST.Bst<number>();
  bst.insert(5);
  bst.insert(3);
  bst.insert(7);
  bst.insert(1);
  bst.insert(10);
  
  expect(bst.min()?.value).toBe(1);
  expect(bst.max()?.value).toBe(10);
});

test(`class-traversals`, () => {
  const bst = new BST.Bst<number>();
  bst.insert(5);
  bst.insert(3);
  bst.insert(7);
  
  const inOrderValues = [...bst.inOrder()].map(n => n.value);
  expect(inOrderValues).toEqual([3, 5, 7]);
  
  const preOrderValues = [...bst.preOrder()].map(n => n.value);
  expect(preOrderValues).toEqual([5, 3, 7]);
  
  const postOrderValues = [...bst.postOrder()].map(n => n.value);
  expect(postOrderValues).toEqual([3, 7, 5]);
});

test(`class-custom-comparer`, () => {
  const bst = new BST.Bst<string>((a, b) => a.localeCompare(b));
  bst.insert(`banana`);
  bst.insert(`apple`);
  bst.insert(`cherry`);
  
  const arr = bst.toArrayInOrder();
  expect(arr).toEqual([`apple`, `banana`, `cherry`]);
});

test(`create-factory`, () => {
  const bst = BST.create<number>();
  bst.insert(5);
  bst.insert(3);
  
  expect(bst.has(5)).toBe(true);
  expect(bst.has(3)).toBe(true);
});

test(`insert-maintains-bst-property`, () => {
  let root = BST.root<number>();
  const values = [10, 5, 15, 3, 7, 12, 20, 2, 4, 6, 8, 11, 13, 18, 25];
  
  for (const v of values) {
    root = BST.insert(root, v);
  }
  
  const sorted = [...BST.valuesInOrder(root)];
  expect(sorted).toEqual([2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 15, 18, 20, 25]);
});
