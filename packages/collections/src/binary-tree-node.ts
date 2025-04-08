
enum Side {
  Left, Right, Neutral
}
/**
 * Binary Tree Node
 * Source: https://github.com/amejiarosario/dsa.js-data-structures-algorithms-javascript/blob/master/src/data-structures/trees/binary-tree-node.js
 * License: MIT
 */
export class BinaryTreeNode<V> {
  value:V;
  left?:BinaryTreeNode<V>;
  right?:BinaryTreeNode<V>;
  parent?:BinaryTreeNode<V>;
  parentSide:Side;
  multiplicity:number = 0;

  constructor(value:V) {
    this.value = value;
    //this.meta = {};
    this.parentSide = Side.Neutral;
  }

  /**
   * Set a left node descendants.
   * Also, children get associated to parent.
   */
  setLeftAndUpdateParent(node?:BinaryTreeNode<V>) {
    if (node === this) throw new Error(`Cannot set left to be same as self`);

    this.left = node;
    if (node) {
      node.parent = this;
      node.parentSide = Side.Left;
    }
  }

  /**
   * Set a right node descendants.
   * Also, children get associated to parent.
   */
  setRightAndUpdateParent(node?:BinaryTreeNode<V>) {
    if (node === this) throw new Error(`Cannot set right to be same as self`);
    this.right = node;
    if (node) {
      node.parent = this;
      node.parentSide = Side.Right;
    }
  }
  // end::setAndUpdateParent[]

  /**
   * Tell if is parent's left or right child
   *
   * @returns {string} side (left or right) this node is of its parent
   */
  get parentChildSide() {
    if (this.parent) {
      return this.isParentLeftChild ? `left` : `right`;
    }

    return `root`;
  }

  /**
   * Return true if this node is its parent left child
   */
  get isParentLeftChild() {
    return this.parentSide === Side.Left;
  }

  /**
   * Return true if this node is its parent right child
   */
  get isParentRightChild() {
    return this.parentSide === Side.Right;
  }

  /**
   * Node is leaf is it has no descendants
   */
  get isLeaf() {
    return !this.left && !this.right;
  }

  /**
   * Get sibling of current node
   */
  get sibling():BinaryTreeNode<V>|undefined {
    const { parent } = this;
    if (!parent) return undefined;
    return parent.right === this ? parent.left : parent.right;
  }

  /**
   * Get parent sibling = uncle (duh)
   */
  get uncle():BinaryTreeNode<V>|undefined {
    const { parent } = this;
    if (!parent) return;
    return parent.sibling;
  }

  get grandparent() {
    const { parent } = this;
    return parent && parent.parent;
  }

  // /**
  //  * Get color
  //  */
  // get color() {
  //   return this.meta.color;
  // }

  // /**
  //  * Set Color
  //  */
  // set color(value) {
  //   this.meta.color = value;
  // }

  /**
   * @returns {Number} left subtree height or 0 if no left child
   */
  get leftSubtreeHeight():number {
    return this.left ? this.left.height + 1 : 0;
  }

  /**
   * @returns {Number} right subtree height or 0 if no right child
   */
  get rightSubtreeHeight():number {
    return this.right ? this.right.height + 1 : 0;
  }

  /**
   * Get the max height of the subtrees.
   *
   * It recursively goes into each children calculating the height
   *
   * Height: distance from the deepest leaf to this node
   */
  get height() {
    return Math.max(this.leftSubtreeHeight, this.rightSubtreeHeight);
  }

  /**
   * Returns the difference the heights on the left and right subtrees
   */
  get balanceFactor() {
    return this.leftSubtreeHeight - this.rightSubtreeHeight;
  }
  // end::avl[]

  /**
   * Serialize node's values
   */
  toValues() {
    return {
      value: this.value,
      left: this.left && this.left.value,
      right: this.right && this.right.value,
      parent: this.parent && this.parent.value,
      parentSide: this.parentSide,
    };
  }


  // data(value:V) {
  //   if (value === undefined) {
  //     return this.meta.data;
  //   }
  //   this.meta.data = value;
  //   return this;
  // }

  /**
   * Convert Binary tree from an iterable (e.g. array)
   * @param {array|string} iterable - The iterable
   */
  static from<V>(iterable:IterableIterator<V>) {
    const toBinaryTree = (array:V[], index = 0) => {
      if (index >= array.length) return undefined;
      const node = new BinaryTreeNode(array[index]);
      node.setLeftAndUpdateParent(toBinaryTree(array, index * 2 + 1));
      node.setRightAndUpdateParent(toBinaryTree(array, index * 2 + 2));
      return node;
    };
    return toBinaryTree(Array.from(iterable));
  }
}
