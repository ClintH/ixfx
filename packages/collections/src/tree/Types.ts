import type { IsEqual } from "@ixfx/core";

/**
 * A labelled single value or array of values
 */
export type LabelledValue<TValue> = LabelledSingleValue<TValue> | LabelledValues<TValue>;

/**
 * A value that is labelled
 * @see {@link LabelledValues}
 */
export type LabelledSingleValue<TValue> = {
  label: string
  value: TValue | undefined
}

/**
 * A label for any number of values
 * @see {@link LabelledValues}
 */
export type LabelledValues<TValue> = {
  label: string
  values: TValue[]
}

/**
 * Array-backed tree node.
 * 
 * Create using {@link Trees.Mutable.root}
 */
export type TreeNode<TValue> = {
  /**
   * Parent node, or _undefined_ if a root
   */
  parent: TreeNode<TValue> | undefined
  /**
   * Associated value
   */
  value: TValue | undefined
  /**
   * Children of this node
   */
  childrenStore: readonly TreeNode<TValue>[]
}

export type SimplifiedNode<TValue> = {
  /**
   * Value of node, or _undefined_ if it has no value
   */
  value: TValue | undefined,
  /**
   * Children nodes of this one
   */
  childrenStore: readonly SimplifiedNode<TValue>[]
}

/**
 * A node with an accompanying label
 */
export type LabelledNode<TValue> = TreeNode<LabelledValue<TValue>>;

/**
 * Traversable Tree
 */
export type TraversableTree<TValue> = {
  /**
   * Direct children of node
   */
  children(): IterableIterator<TraversableTree<TValue>>
  /**
   * Direct parent of node
   */
  getParent(): TraversableTree<TValue> | undefined
  /**
   * Value of node
   */
  getValue(): TValue
  /**
   * Object reference that acts as the identity of the node
   */
  getIdentity(): any
};

export type TraverseObjectEntry = Readonly<{ name: string, sourceValue: any, leafValue: any, _kind: `entry` }>;
export type TraverseObjectEntryWithAncestors = Readonly<{ name: string, sourceValue: any, leafValue: any, ancestors: string[], _kind: `entry-ancestors` }>;
//export type EntryStatic = Readonly<{ name: string, value: any, ancestors?: Array<string> }>
export type TraverseObjectEntryStatic = Readonly<{ name: string, sourceValue: any, ancestors: string[], _kind: `entry-static` }>

/**
 * Options for parsing a path
 */
export type TraverseObjectPathOpts = {
  /**
   * Separator for path, eg '.'
   */
  readonly separator?: string;
};

/**
 * Wraps a {@link TreeNode} for a more object-oriented means of access.
 */
export type WrappedNode<T> = TraversableTree<T> & {
  /**
   * Underlying Node
   */
  wraps: TreeNode<T>,
  /**
   * Gets value of node, if defined
   * @returns Value of Node
   */
  getValue: () => T | undefined
  /**
   * Remove node and its children from tree
   * @returns 
   */
  remove: () => void
  /**
   * Adds a child node
   * @param child 
   * @returns 
   */
  add: (child: WrappedNode<T> | TreeNode<T>) => WrappedNode<T>
  /**
   * Adds a new child node, with `value` as its value
   * @param value 
   * @returns 
   */
  addValue: (value: T) => WrappedNode<T>
  /**
   * Returns _true_ if `child` is an immediate child of this node
   * @param child 
   * @returns 
   */
  hasChild: (child: WrappedNode<T> | TreeNode<T>) => boolean
  queryValue: (value: T) => IterableIterator<WrappedNode<T>>

  /**
 * Yields all parents of `child` that have a given value.
 * Use 'findParentsValue' to find the first match only.
 * @param child 
 * @param value 
 * @param eq 
 * @returns 
 */
  queryParentsValue<T>(child: TreeNode<T>, value: T, eq?: IsEqual<T>): IterableIterator<WrappedNode<T>>

  /**
 * Returns the first parent that has a given value.
 * @param child 
 * @param value 
 * @param eq 
 * @returns 
 */
  findParentsValue<T>(child: TreeNode<T>, value: T, eq: IsEqual<T>): WrappedNode<T> | undefined
  /**
   * Yields the node value of each parent of `child`.
   * _undefined_ values are not returned.
   * 
   * Use 'queryParentsValue' to search for a particular value
   * @param child
   * @returns 
   */
  parentsValues<T>(child: TreeNode<T>): IterableIterator<T>

  /**
   * Returns _true_ if `child` is contained any any descendant
   * @param child
   * @returns 
   */
  hasAnyChild: (child: WrappedNode<T> | TreeNode<T>) => boolean
  /**
   * Returns _true_ if `parent` is the immediate parent for this node
   * @param parent 
   * @returns 
   */
  hasParent: (parent: WrappedNode<T> | TreeNode<T>) => boolean
  /**
   * Returns _true_ if `parent` is the immediate or ancestor parent for this node
   * @param parent 
   * @returns 
   */
  hasAnyParent: (parent: WrappedNode<T> | TreeNode<T>) => boolean
}
