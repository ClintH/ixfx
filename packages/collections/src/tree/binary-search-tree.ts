import { defaultComparer, type Comparer } from '@ixfx/core';
import * as BinaryTree from './binary-tree.js';
import type { TreeNode } from './types.js';

export type BstNode<T> = TreeNode<T>;

export class Bst<T> {
  root: BstNode<T>;
  readonly comparer: Comparer<T>;

  constructor(comparer: Comparer<T> = defaultComparer as Comparer<T>) {
    this.comparer = comparer;
    this.root = BinaryTree.root();
  }

  insert(value: T): BstNode<T> {
    this.root = insert(this.root, value, this.comparer);
    return this.root;
  }

  has(value: T): boolean {
    return has(this.root, value, this.comparer);
  }

  find(value: T): BstNode<T> | undefined {
    return find(this.root, value, this.comparer);
  }

  remove(value: T): boolean {
    const result = remove(this.root, value, this.comparer);
    if (result) {
      this.root = result;
    }
    return result !== undefined;
  }

  min(): BstNode<T> | undefined {
    return min(this.root);
  }

  max(): BstNode<T> | undefined {
    return max(this.root);
  }

  inOrder(): IterableIterator<BstNode<T>> {
    return inOrder(this.root);
  }

  preOrder(): IterableIterator<BstNode<T>> {
    return preOrder(this.root);
  }

  postOrder(): IterableIterator<BstNode<T>> {
    return postOrder(this.root);
  }

  valuesInOrder(): IterableIterator<T> {
    return valuesInOrder(this.root);
  }

  toArrayInOrder(): T[] {
    return Array.from(this.valuesInOrder());
  }
}

export const insert = <T>(
  root: BstNode<T>,
  value: T,
  compare: Comparer<T> = defaultComparer as Comparer<T>
): BstNode<T> => {
  if (root.value === undefined) {
    root.value = value;
    return root;
  }

  let current = root;
  while (true) {
    const cmp = compare(value, current.value as T);
    if (cmp < 0) {
      const left = BinaryTree.getLeft(current);
      if (left) {
        current = left;
      } else {
        BinaryTree.addLeft(value, current);
        break;
      }
    } else if (cmp > 0) {
      const right = BinaryTree.getRight(current);
      if (right) {
        current = right;
      } else {
        BinaryTree.addRight(value, current);
        break;
      }
    } else {
      // Duplicate, do nothing
      break;
    }
  }

  return root;
};

export const has = <T>(
  root: BstNode<T>,
  value: T,
  compare: Comparer<T> = defaultComparer as Comparer<T>
): boolean => {
  return find(root, value, compare) !== undefined;
};

export const find = <T>(
  root: BstNode<T>,
  value: T,
  compare: Comparer<T> = defaultComparer as Comparer<T>
): BstNode<T> | undefined => {
  if (!root || root.value === undefined) return undefined;

  const cmp = compare(value, root.value as T);

  if (cmp === 0) {
    return root;
  } else if (cmp < 0) {
    const left = BinaryTree.getLeft(root);
    return left ? find(left, value, compare) : undefined;
  } else {
    const right = BinaryTree.getRight(root);
    return right ? find(right, value, compare) : undefined;
  }
};

export const min = <T>(root: BstNode<T>): BstNode<T> | undefined => {
  if (!root || root.value === undefined) return undefined;
  let current = root;
  while (BinaryTree.getLeft(current)) {
    current = BinaryTree.getLeft(current)!;
  }
  return current;
};

export const max = <T>(root: BstNode<T>): BstNode<T> | undefined => {
  if (!root || root.value === undefined) return undefined;
  let current = root;
  while (BinaryTree.getRight(current)) {
    current = BinaryTree.getRight(current)!;
  }
  return current;
};

export const remove = <T>(
  root: BstNode<T>,
  value: T,
  compare: Comparer<T> = defaultComparer as Comparer<T>
): BstNode<T> | undefined => {
  if (!root || root.value === undefined) return undefined;

  const nodeToRemove = find(root, value, compare);
  if (!nodeToRemove) {
    return undefined;
  }

  const left = BinaryTree.getLeft(nodeToRemove);
  const right = BinaryTree.getRight(nodeToRemove);

  if (!left && !right) {
    if (nodeToRemove === root) {
      root.value = undefined;
      root.childrenStore = [];
    } else {
      BinaryTree.removeNode(nodeToRemove);
    }
  } else if (!left) {
    if (nodeToRemove === root) {
      root.value = right!.value;
      root.childrenStore = right!.childrenStore;
      for (const child of root.childrenStore) {
        if (child) child.parent = root;
      }
    } else {
      const parent = nodeToRemove.parent!;
      if (BinaryTree.getLeft(parent) === nodeToRemove) {
        BinaryTree.setLeft(parent, right);
      } else {
        BinaryTree.setRight(parent, right);
      }
    }
  } else if (!right) {
    if (nodeToRemove === root) {
      root.value = left!.value;
      root.childrenStore = left!.childrenStore;
      for (const child of root.childrenStore) {
        if (child) child.parent = root;
      }
    } else {
      const parent = nodeToRemove.parent!;
      if (BinaryTree.getLeft(parent) === nodeToRemove) {
        BinaryTree.setLeft(parent, left);
      } else {
        BinaryTree.setRight(parent, left);
      }
    }
  } else {
    // Two children: find the inorder successor (min in right subtree)
    const successor = min(right)!;
    nodeToRemove.value = successor.value;
    
    // The successor has at most one child (right)
    const succParent = successor.parent!;
    const succRight = BinaryTree.getRight(successor);
    
    if (BinaryTree.getLeft(succParent) === successor) {
      BinaryTree.setLeft(succParent, succRight);
    } else {
      BinaryTree.setRight(succParent, succRight);
    }
  }

  return root;
};

export function* inOrder<T>(node: BstNode<T>): IterableIterator<BstNode<T>> {
  if (!node) return;
  const left = BinaryTree.getLeft(node);
  if (left) yield* inOrder(left);
  yield node;
  const right = BinaryTree.getRight(node);
  if (right) yield* inOrder(right);
}

export function* preOrder<T>(node: BstNode<T>): IterableIterator<BstNode<T>> {
  if (!node) return;
  yield node;
  const left = BinaryTree.getLeft(node);
  if (left) yield* preOrder(left);
  const right = BinaryTree.getRight(node);
  if (right) yield* preOrder(right);
}

export function* postOrder<T>(node: BstNode<T>): IterableIterator<BstNode<T>> {
  if (!node) return;
  const left = BinaryTree.getLeft(node);
  if (left) yield* postOrder(left);
  const right = BinaryTree.getRight(node);
  if (right) yield* postOrder(right);
  yield node;
}

export function* valuesInOrder<T>(node: BstNode<T>): IterableIterator<T> {
  for (const n of inOrder(node)) {
    if (n.value !== undefined) {
      yield n.value;
    }
  }
}

export const create = <T>(comparer?: Comparer<T>): Bst<T> => {
  return new Bst(comparer);
};

export const fromArray = <T>(array: T[], comparer: Comparer<T> = defaultComparer as Comparer<T>): Bst<T> => {
  const bst = new Bst(comparer);
  for (const value of array) {
    bst.insert(value);
  }
  return bst;
};

export const root = <T>(): BstNode<T> => {
  return BinaryTree.root();
};
