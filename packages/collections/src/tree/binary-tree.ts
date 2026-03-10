import * as Mutable from './tree-mutable.js';
import type { TreeNode } from './types.js';

export type BinaryChildSide = `left` | `right` | `neutral`;

export type WrappedBinaryNode<T> = {
  node: TreeNode<T>
  get left(): WrappedBinaryNode<T> | undefined
  get right(): WrappedBinaryNode<T> | undefined
  set left(value: WrappedBinaryNode<T> | undefined)
  set right(value: WrappedBinaryNode<T> | undefined)
  get parentChildSide(): BinaryChildSide
  get isParentLeftChild(): boolean
  get isParentRightChild(): boolean
  get isLeaf(): boolean
  get sibling(): WrappedBinaryNode<T> | undefined
  get uncle(): WrappedBinaryNode<T> | undefined
  get grandparent(): WrappedBinaryNode<T> | undefined
  get leftSubtreeHeight(): number
  get rightSubtreeHeight(): number
  get height(): number
  get balanceFactor(): number
  has(value: T): boolean
  addLeft(value: T): WrappedBinaryNode<T>
  addRight(value: T): WrappedBinaryNode<T>
  setLeft(node: WrappedBinaryNode<T> | TreeNode<T>): void
  setRight(node: WrappedBinaryNode<T> | TreeNode<T>): void
  remove(): void
}

const getLeftChild = <T>(node: TreeNode<T>): TreeNode<T> | undefined => {
  return node.childrenStore[0];
};

const getRightChild = <T>(node: TreeNode<T>): TreeNode<T> | undefined => {
  return node.childrenStore[1];
};

export const getLeft = <T>(node: TreeNode<T>): TreeNode<T> | undefined => {
  return getLeftChild(node);
};

export const getRight = <T>(node: TreeNode<T>): TreeNode<T> | undefined => {
  return getRightChild(node);
};

export const hasLeft = <T>(node: TreeNode<T>): boolean => {
  return getLeftChild(node) !== undefined;
};

export const hasRight = <T>(node: TreeNode<T>): boolean => {
  return getRightChild(node) !== undefined;
};

export const isLeaf = <T>(node: TreeNode<T>): boolean => {
  return !hasLeft(node) && !hasRight(node);
};

export const setLeft = <T>(parent: TreeNode<T>, child: TreeNode<T> | undefined): void => {
  const existingLeft = getLeftChild(parent);
  if (existingLeft) {
    existingLeft.parent = undefined;
  }
  
  const children = [...parent.childrenStore];
  if (child === undefined && children.length <= 1) {
    parent.childrenStore = [];
    return;
  } else if (child === undefined) {
    children[0] = undefined as any;
    parent.childrenStore = children;
    return;
  }
  
  if (children.length === 0) {
    children.push(child);
  } else {
    children[0] = child;
  }
  parent.childrenStore = children;
  child.parent = parent;
};

export const setRight = <T>(parent: TreeNode<T>, child: TreeNode<T> | undefined): void => {
  const existingRight = getRightChild(parent);
  if (existingRight) {
    existingRight.parent = undefined;
  }
  
  const children = [...parent.childrenStore];
  if (child === undefined) {
    if (children.length >= 2) {
      children[1] = undefined as any;
      if (children[0] === undefined) {
        parent.childrenStore = [];
      } else {
        parent.childrenStore = children;
      }
    }
    return;
  }
  
  if (children.length === 0) {
    children.push(undefined as any, child);
  } else if (children.length === 1) {
    children.push(child);
  } else {
    children[1] = child;
  }
  parent.childrenStore = children;
  child.parent = parent;
};

export const removeNode = <T>(node: TreeNode<T>): void => {
  const p = node.parent;
  if (!p) return;
  if (p.childrenStore[0] === node) {
    setLeft(p, undefined);
  } else if (p.childrenStore[1] === node) {
    setRight(p, undefined);
  }
};

export const sibling = <T>(node: TreeNode<T>): TreeNode<T> | undefined => {
  const parent = node.parent;
  if (!parent) return undefined;
  const left = getLeftChild(parent);
  const right = getRightChild(parent);
  if (left === node) return right;
  if (right === node) return left;
  return undefined;
};

export const uncle = <T>(node: TreeNode<T>): TreeNode<T> | undefined => {
  const parent = node.parent;
  if (!parent) return undefined;
  return sibling(parent);
};

export const grandparent = <T>(node: TreeNode<T>): TreeNode<T> | undefined => {
  const parent = node.parent;
  if (!parent) return undefined;
  return parent.parent;
};

export const isParentLeftChild = <T>(node: TreeNode<T>): boolean => {
  const parent = node.parent;
  if (!parent) return false;
  return getLeftChild(parent) === node;
};

export const isParentRightChild = <T>(node: TreeNode<T>): boolean => {
  const parent = node.parent;
  if (!parent) return false;
  return getRightChild(parent) === node;
};

export const parentChildSide = <T>(node: TreeNode<T>): BinaryChildSide => {
  if (!node.parent) return `neutral`;
  return isParentLeftChild(node) ? `left` : `right`;
};

const leftSubtreeHeight = <T>(node: TreeNode<T>): number => {
  const left = getLeftChild(node);
  return left ? subtreeHeight(left) + 1 : 0;
};

const rightSubtreeHeight = <T>(node: TreeNode<T>): number => {
  const right = getRightChild(node);
  return right ? subtreeHeight(right) + 1 : 0;
};

const subtreeHeight = <T>(node: TreeNode<T>): number => {
  return Math.max(leftSubtreeHeight(node), rightSubtreeHeight(node));
};

export const height = <T>(node: TreeNode<T>): number => {
  return subtreeHeight(node);
};

export const balanceFactor = <T>(node: TreeNode<T>): number => {
  return leftSubtreeHeight(node) - rightSubtreeHeight(node);
};

export const leftSubtreeHeightFn: <T>(node: TreeNode<T>) => number = leftSubtreeHeight;
export const rightSubtreeHeightFn: <T>(node: TreeNode<T>) => number = rightSubtreeHeight;

export const addLeft = <T>(value: T, parent: TreeNode<T>): TreeNode<T> => {
  const existingLeft = getLeftChild(parent);
  if (existingLeft) {
    existingLeft.parent = undefined;
  }
  const child: TreeNode<T> = {
    value,
    parent,
    childrenStore: []
  };
  const children = [...parent.childrenStore];
  if (children.length === 0) {
    children.push(child);
  } else if (children.length === 1) {
    children[0] = child;
  } else {
    children[0] = child;
  }
  parent.childrenStore = children;
  return child;
};

export const addRight = <T>(value: T, parent: TreeNode<T>): TreeNode<T> => {
  const existingRight = getRightChild(parent);
  if (existingRight) {
    existingRight.parent = undefined;
  }
  const child: TreeNode<T> = {
    value,
    parent,
    childrenStore: []
  };
  const children = [...parent.childrenStore];
  if (children.length === 0) {
    children.push(undefined as any);
    children.push(child);
  } else if (children.length === 1) {
    children.push(child);
  } else {
    children[1] = child;
  }
  parent.childrenStore = children;
  return child;
};

export const root = <T>(value?: T): TreeNode<T> => {
  return Mutable.root(value);
};

export const createNode = <T>(value: T | undefined, parent?: TreeNode<T>): TreeNode<T> => {
  return Mutable.createNode(value, parent);
};

const unwrapNode = <T>(node: WrappedBinaryNode<T> | TreeNode<T>): TreeNode<T> => {
  return `node` in node ? node.node : node;
};

const wrapNode = <T>(node: TreeNode<T>): WrappedBinaryNode<T> => {
  return wrap(node);
};

export const wrap = <T>(node: TreeNode<T>): WrappedBinaryNode<T> => {
  return {
    node,
    get left() {
      const left = getLeftChild(node);
      return left ? wrapNode(left) : undefined;
    },
    get right() {
      const right = getRightChild(node);
      return right ? wrapNode(right) : undefined;
    },
    set left(value: WrappedBinaryNode<T> | undefined) {
      const child = value ? unwrapNode(value) : undefined;
      setLeft(node, child);
    },
    set right(value: WrappedBinaryNode<T> | undefined) {
      const child = value ? unwrapNode(value) : undefined;
      setRight(node, child);
    },
    get parentChildSide() {
      return parentChildSide(node);
    },
    get isParentLeftChild() {
      return isParentLeftChild(node);
    },
    get isParentRightChild() {
      return isParentRightChild(node);
    },
    get isLeaf() {
      return isLeaf(node);
    },
    get sibling() {
      const sib = sibling(node);
      return sib ? wrapNode(sib) : undefined;
    },
    get uncle() {
      const unc = uncle(node);
      return unc ? wrapNode(unc) : undefined;
    },
    get grandparent() {
      const gp = grandparent(node);
      return gp ? wrapNode(gp) : undefined;
    },
    get leftSubtreeHeight() {
      return leftSubtreeHeight(node);
    },
    get rightSubtreeHeight() {
      return rightSubtreeHeight(node);
    },
    get height() {
      return height(node);
    },
    get balanceFactor() {
      return balanceFactor(node);
    },
    has(value: T): boolean {
      return find(node, value) !== undefined;
    },
    addLeft(value: T): WrappedBinaryNode<T> {
      const child = addLeft(value, node);
      return wrapNode(child);
    },
    addRight(value: T): WrappedBinaryNode<T> {
      const child = addRight(value, node);
      return wrapNode(child);
    },
    setLeft(nodeOrWrapped: WrappedBinaryNode<T> | TreeNode<T>): void {
      const child = unwrapNode(nodeOrWrapped);
      setLeft(node, child);
    },
    setRight(nodeOrWrapped: WrappedBinaryNode<T> | TreeNode<T>): void {
      const child = unwrapNode(nodeOrWrapped);
      setRight(node, child);
    },
    remove(): void {
      removeNode(node);
    }
  };
};

export const rootWrapped = <T>(value?: T): WrappedBinaryNode<T> => {
  return wrap(Mutable.root(value));
};

export const find = <T>(root: TreeNode<T>, value: T): TreeNode<T> | undefined => {
  for (const n of breadthFirst(root)) {
    if (n.value === value) return n;
  }
  return undefined;
};

export function* inOrder<T>(node: TreeNode<T>): IterableIterator<TreeNode<T>> {
  const left = getLeftChild(node);
  if (left) yield* inOrder(left);
  yield node;
  const right = getRightChild(node);
  if (right) yield* inOrder(right);
}

export function* preOrder<T>(node: TreeNode<T>): IterableIterator<TreeNode<T>> {
  yield node;
  const left = getLeftChild(node);
  if (left) yield* preOrder(left);
  const right = getRightChild(node);
  if (right) yield* preOrder(right);
}

export function* postOrder<T>(node: TreeNode<T>): IterableIterator<TreeNode<T>> {
  const left = getLeftChild(node);
  if (left) yield* postOrder(left);
  const right = getRightChild(node);
  if (right) yield* postOrder(right);
  yield node;
}

export function* depthFirst<T>(node: TreeNode<T>): IterableIterator<TreeNode<T>> {
  const left = getLeftChild(node);
  const right = getRightChild(node);
  if (left) yield* depthFirst(left);
  if (right) yield* depthFirst(right);
  yield node;
}

export function* breadthFirst<T>(node: TreeNode<T>): IterableIterator<TreeNode<T>> {
  yield node;
  const queue: TreeNode<T>[] = [];
  queue.push(...node.childrenStore.filter((c): c is TreeNode<T> => c !== undefined && c.value !== undefined));
  while (queue.length > 0) {
    const current = queue.shift()!;
    yield current;
    queue.push(...current.childrenStore.filter((c): c is TreeNode<T> => c !== undefined && c.value !== undefined));
  }
}

export const fromArray = <T>(array: T[]): TreeNode<T> | undefined => {
  if (array.length === 0) return undefined;
  
  const rootNode = Mutable.root(array[0]);
  
  const insert = (index: number, parent: TreeNode<T>): void => {
    const leftIdx = 2 * index + 1;
    const rightIdx = 2 * index + 2;
    
    if (leftIdx < array.length) {
      addLeft(array[leftIdx], parent);
      insert(leftIdx, getLeftChild(parent)!);
    }
    
    if (rightIdx < array.length) {
      addRight(array[rightIdx], parent);
      insert(rightIdx, getRightChild(parent)!);
    }
  };
  
  insert(0, rootNode);
  return rootNode;
};

export const toArray = <T>(root: TreeNode<T>): T[] => {
  const result: T[] = [];
  for (const node of breadthFirst(root)) {
    if (node.value !== undefined) {
      result.push(node.value);
    }
  }
  return result;
};

export const toStringDeep = <T>(node: TreeNode<T>, indent = 0): string => {
  const v = node.value !== undefined ? JSON.stringify(node.value) : `-`;
  const prefix = `  `.repeat(indent);
  
  const left = getLeftChild(node);
  const right = getRightChild(node);
  
  let result = `${prefix}${v}`;
  
  if (left || right) {
    result += `\n`;
    if (left) {
      result += `${prefix}  L: ${toStringDeep(left, indent + 1)}`;
      if (right) result += `\n`;
    }
    if (right) {
      result += `${prefix}  R: ${toStringDeep(right, indent + 1)}`;
    }
  }
  
  return result;
};
