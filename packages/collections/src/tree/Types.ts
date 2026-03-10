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
 * Create using:
 * * {@link Trees.Mutable.root}: Imperative building of a tree
 * * {@link Trees.FromObject.create}: Create based on a snapshot of an object
 * 
 * Use {@link Trees.isTreeNode} to check if an object is this type.
 * 
 * Convert:
 * * {@link Trees.Mutable.stripParentage}: Create a {@link Trees.SimplifiedNode}, with parentage removed.
 * * {@link Trees.Mutable.wrap}: Create an object-oriented {@link Trees.WrappedNode} based on a node.
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

/**
 * A simplified node has its parentage stripped.
 * 
 * To create:
 * * {@link Trees.Mutable.stripParentage}: Create based on a {@link Trees.TreeNode} instance
 * * {@link Trees.FromObject.createSimplified}: Create based on an object
 */
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
 * Traversable Tree.
 * 
 * Creatable from:
 * * {@link Trees.FromObject.asDynamicTraversable}: Create based on dynamic reading of an object
 * * {@link Trees.TraversableTree}: Create based on an {@link Trees.TreeNode}, a {@link Trees.TraversableTree} or an object (same as calling asDynamicTraversable).
 * Use {@link Trees.isTraversable} to check if an object is this type.
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
 * 
 * Create:
 * * {@link Trees.FromObject.createWrapped}: Create based on an object
 * * {@link Trees.Mutable.wrap}: Create based on a {@link Trees.TreeNode} instance
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
