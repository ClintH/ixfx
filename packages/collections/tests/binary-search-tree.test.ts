import { test, expect } from 'vitest';
import { BinarySearchTree } from '../src/binary-search-tree.js';
import { defaultComparer } from '@ixfx/core';

test('add single item', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  const node = tree.add(10);
  
  expect(tree.size).toBe(1);
  expect(tree.root).toBe(node);
  expect(node.value).toBe(10);
});

test('add multiple items creates BST structure', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);
  
  expect(tree.size).toBe(3);
  expect(tree.root!.value).toBe(10);
  expect(tree.root!.left!.value).toBe(5);
  expect(tree.root!.right!.value).toBe(15);
});

test('add creates nested structure', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(3);
  tree.add(7);
  
  expect(tree.root!.left!.value).toBe(5);
  expect(tree.root!.left!.left!.value).toBe(3);
  expect(tree.root!.left!.right!.value).toBe(7);
});

test('has finds existing values', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);
  
  expect(tree.has(10)).toBe(true);
  expect(tree.has(5)).toBe(true);
  expect(tree.has(15)).toBe(true);
});

test('has returns false for non-existing values', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  
  expect(tree.has(100)).toBe(false);
  expect(tree.has(0)).toBe(false);
});

test('has on empty tree returns false', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  expect(tree.has(10)).toBe(false);
});

test('find returns node for existing value', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  const found = tree.find(10);
  
  expect(found).toBeDefined();
  expect(found!.value).toBe(10);
});

test('find returns undefined for non-existing value', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  const found = tree.find(999);
  
  expect(found).toBeUndefined();
});

test('add duplicate increases multiplicity', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(10);
  
  expect(tree.size).toBe(2);
  expect(tree.root!.multiplicity).toBe(2);
});

test('remove leaf node', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  
  const removed = tree.remove(5);
  expect(removed).toBe(true);
  expect(tree.size).toBe(1);
  expect(tree.has(5)).toBe(false);
  expect(tree.root!.left).toBeUndefined();
});

test('remove node with one child', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(3);
  
  const removed = tree.remove(5);
  expect(removed).toBe(true);
  expect(tree.has(5)).toBe(false);
  expect(tree.has(3)).toBe(true);
  expect(tree.root!.left!.value).toBe(3);
});

test('remove node with two children', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);
  tree.add(12);
  tree.add(18);
  
  const removed = tree.remove(15);
  expect(removed).toBe(true);
  expect(tree.has(15)).toBe(false);
  expect(tree.has(12)).toBe(true);
  expect(tree.has(18)).toBe(true);
});

test('remove root node', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);
  
  const removed = tree.remove(10);
  expect(removed).toBe(true);
  expect(tree.has(10)).toBe(false);
  expect(tree.size).toBe(2);
});

test('remove non-existing returns false', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  
  const removed = tree.remove(999);
  expect(removed).toBe(false);
  expect(tree.size).toBe(1);
});

test('remove root from single node tree', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  
  const removed = tree.remove(10);
  expect(removed).toBe(true);
  expect(tree.size).toBe(0);
  expect(tree.root).toBeUndefined();
});

test('remove decreases multiplicity', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(10);
  tree.add(10);
  
  const removed = tree.remove(10);
  expect(removed).toBe(true);
  expect(tree.size).toBe(2);
  expect(tree.root!.multiplicity).toBe(2);
});

test('getLeftmost returns minimum value', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);
  tree.add(3);
  tree.add(7);
  
  const leftmost = tree.getLeftmost();
  expect(leftmost!.value).toBe(3);
});

test('getLeftmost of empty tree returns undefined', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  expect(tree.getLeftmost()).toBeUndefined();
});

test('getRightmost returns maximum value', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);
  tree.add(12);
  tree.add(20);
  
  const rightmost = tree.getRightmost();
  expect(rightmost!.value).toBe(20);
});

test('getRightmost of empty tree returns undefined', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  expect(tree.getRightmost()).toBeUndefined();
});

test('toArray on empty tree returns empty array', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  expect(tree.toArray()).toEqual([]);
});

test('toArray returns values in BFS order', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);
  tree.add(3);
  tree.add(7);
  
  const result = tree.toArray();
  expect(result).toContain(10);
  expect(result).toContain(5);
  expect(result).toContain(15);
  expect(result).toContain(3);
  expect(result).toContain(7);
  expect(result.length).toBe(5);
});

test('inOrderTraversal yields sorted values', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);
  tree.add(3);
  tree.add(7);
  tree.add(12);
  tree.add(20);

  const values: number[] = [];
  for (const node of tree.inOrderTraversal()) {
    if (node) values.push(node.value);
  }
  expect(values).toEqual([3, 5, 7, 10, 12, 15, 20]);
});

test('inOrderTraversal on empty tree', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  const values = Array.from(tree.inOrderTraversal());
  expect(values).toEqual([]);
});

test('preOrderTraversal yields root before children', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);

  const values: number[] = [];
  for (const node of tree.preOrderTraversal()) {
    if (node) values.push(node.value);
  }
  expect(values[0]).toBe(10);
});

test('postOrderTraversal yields children before root', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);

  const values: number[] = [];
  for (const node of tree.postOrderTraversal()) {
    if (node) values.push(node.value);
  }
  expect(values[values.length - 1]).toBe(10);
});

test('bfs traversal order', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);
  tree.add(3);
  tree.add(7);

  const values: number[] = [];
  for (const node of tree.bfs()) {
    if (node) values.push(node.value);
  }
  expect(values[0]).toBe(10);
  expect(values[1]).toBe(5);
  expect(values[2]).toBe(15);
});

test('bfs on empty tree', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  const values = Array.from(tree.bfs());
  expect(values).toEqual([]);
});

test('dfs traversal', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  tree.add(10);
  tree.add(5);
  tree.add(15);
  tree.add(3);
  tree.add(7);

  const values: number[] = [];
  for (const node of tree.dfs()) {
    if (node) values.push(node.value);
  }
  expect(values.length).toBe(5);
  expect(values[0]).toBe(10);
});

test('dfs on empty tree', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  const values = Array.from(tree.dfs());
  expect(values).toEqual([]);
});

test('complex tree operations', () => {
  const tree = new BinarySearchTree<number>(defaultComparer);
  const values = [30, 40, 10, 15, 12, 50];
  
  values.forEach(v => tree.add(v));
  
  expect(tree.size).toBe(6);
  expect(tree.has(30)).toBe(true);
  expect(tree.has(40)).toBe(true);
  expect(tree.has(10)).toBe(true);
  
  tree.remove(30);
  expect(tree.has(30)).toBe(false);
  expect(tree.size).toBe(5);
});

test('custom comparer with strings', () => {
  const tree = new BinarySearchTree<string>((a, b) => a.localeCompare(b));
  tree.add('banana');
  tree.add('apple');
  tree.add('cherry');
  
  expect(tree.root!.value).toBe('banana');
  expect(tree.root!.left!.value).toBe('apple');
  expect(tree.root!.right!.value).toBe('cherry');
});
