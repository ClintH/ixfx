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
 * Create using {@link root}
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