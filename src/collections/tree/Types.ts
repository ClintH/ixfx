export type LabelledValue<TValue> = LabelledSingleValue<TValue> | LabelledValues<TValue>;
export type LabelledSingleValue<TValue> = {
  label: string
  value: TValue | undefined
}

export type LabelledValues<TValue> = {
  label: string
  values: Array<TValue>
}

/**
 * Array-backed tree node
 */
export type Node<TValue> = {
  parent: Node<TValue> | undefined
  value: TValue | undefined
  childrenStore: ReadonlyArray<Node<TValue>>
}

export type SimplifiedNode<TValue> = {
  value: TValue | undefined,
  childrenStore: ReadonlyArray<SimplifiedNode<TValue>>
}

export type LabelledNode<TValue> = Node<LabelledValue<TValue>>;

export type TraversableTree<TValue> = {
  /**
   * Direct children of node
   */
  children(): IterableIterator<TraversableTree<TValue>>
  getParent(): TraversableTree<TValue> | undefined
  getValue(): TValue
  getIdentity(): any
};