import { Comparer, defaultComparer } from "../Util.js";
import { BinaryTreeNode } from "./BinaryTreeNode.js";
import { queueMutable } from "./Queue.js";
import { stackMutable } from "./Stack.js";

/**
 * BinarySearchTree
 * Source: https://github.com/amejiarosario/dsa.js-data-structures-algorithms-javascript/blob/master/src/data-structures/trees/binary-search-tree.js
 */
export class BinarySearchTree<V> {
  root?:BinaryTreeNode<V>;
  size:number;

  constructor(readonly comparer:Comparer<V>) {
    this.size = 0;
  }

  /**
   * Insert value on the BST.
   *
   * If the value is already in the tree,
   * then it increases the multiplicity value
   * @param {any} value node's value to insert in the tree
   * @returns {BinaryTreeNode} newly added node
   */
  add(value:V) {
    const node = new BinaryTreeNode(value);

    if (this.root) {
      const { found, parent } = this.findNodeAndParent(value, this.root); // <1>
      if (found) { // duplicated: value already exist on the tree
        found.multiplicity = (found.multiplicity || 1) + 1; // <2>
        this.size += 1;
        return found;
      } 
      
      if (parent) {
        const comp = this.comparer(value, parent.value);
        if (comp < 1) {
          parent.setLeftAndUpdateParent(node);
        } else {
          parent.setRightAndUpdateParent(node);
        }
      } else throw new Error(`Expecting a parent`);
    } else {
      this.root = node;
    }

    this.size += 1;
    return node;
  }

  /**
   * Find if a node is present or not
   * @param {any} value node to find
   * @returns {boolean} true if is present, false otherwise
   */
  has(value:V):boolean {
    return !!this.find(value);
  }

  /**
   * @param {any} value value to find
   * @returns {BinaryTreeNode|null} node if it found it or null if not
   */
  find(value:V):BinaryTreeNode<V>|undefined {
    return this.findNodeAndParent(value, this.root).found;
  }


  /**
   * Recursively finds the node matching the value.
   * If it doesn't find, it returns the leaf `parent` where the new value should be appended.
   * @param {any} value Node's value to find
   * @param {BinaryTreeNode} node first element to start the search (root is default)
   * @param {BinaryTreeNode} parent keep track of parent (usually filled by recursion)
   * @returns {object} node and its parent like {node, parent}
   */
  findNodeAndParent(value:V, node?:BinaryTreeNode<V>, parent?:BinaryTreeNode<V>):{found?:BinaryTreeNode<V>, parent?:BinaryTreeNode<V>} {
    if (!node) return { found: node, parent };

    const comp = this.comparer(value, node?.value);

    if (comp === 0) {
      return { found: node, parent };
    } if (comp < 1) {
      return this.findNodeAndParent(value, node.left, node);
    } else {
      return this.findNodeAndParent(value, node.right, node);
    }
  }

  /**
   * Get the node with the max value of subtree: the right-most value (max)
   * @param {BinaryTreeNode} node subtree's root
   * @returns {BinaryTreeNode} right-most node (max value)
   */
  getRightmost(node = this.root):BinaryTreeNode<V>|undefined {
    if (!node || !node.right) {
      return node;
    }
    return this.getRightmost(node.right);
  }

  /**
   * Get the node with the min value of subtree: the left-most value.
   * @param {BinaryTreeNode} node subtree's root
   * @returns {BinaryTreeNode} left-most node (min value)
   */
  getLeftmost(node = this.root):BinaryTreeNode<V>|undefined {
    if (!node || !node.left) {
      return node;
    }
    return this.getLeftmost(node.left);
  }

  /**
   * Remove a node from the tree
   * @returns {boolean} false if not found and true if it was deleted
   */
  remove(value:V):boolean {
    const { found: nodeToRemove, parent } = this.findNodeAndParent(value, this.root); // <1>

    if (!nodeToRemove) return false; // <2>

    // Combine left and right children into one subtree without nodeToRemove
    const removedNodeChildren = this.combineLeftIntoRightSubtree(nodeToRemove); // <3>

    if (nodeToRemove.multiplicity && nodeToRemove.multiplicity > 1) { // <4>
      nodeToRemove.multiplicity -= 1; // handles duplicated
    } else if (nodeToRemove === this.root) { // <5>
      // Replace (root) node to delete with the combined subtree.
      this.root = removedNodeChildren;
      if (this.root) { this.root.parent = undefined; } // clearing up old parent
    } else if (nodeToRemove.isParentLeftChild) { // <6>
      // Replace node to delete with the combined subtree.
      parent?.setLeftAndUpdateParent(removedNodeChildren);
    } else {
      parent?.setRightAndUpdateParent(removedNodeChildren);
    }

    this.size -= 1;
    return true;
  }
  // end::remove[]

  // tag::combine[]
  /**
   * Combine left into right children into one subtree without given parent node.
   *
   * @example combineLeftIntoRightSubtree(30)
   *
   *      30*                             40
   *    /     \                          /  \
   *   10      40      combined        35   50
   *     \    /  \    ---------->     /
   *     15  35   50                 10
   *                                   \
   *                                    15
   *
   * It takes node 30 left subtree (10 and 15) and put it in the
   * leftmost node of the right subtree (40, 35, 50).
   *
   * @param {BinaryTreeNode} node
   * @returns {BinaryTreeNode} combined subtree
   */
  combineLeftIntoRightSubtree(node:BinaryTreeNode<V>) {
    if (node.right) {
      const leftmost = this.getLeftmost(node.right);
      leftmost?.setLeftAndUpdateParent(node.left);
      return node.right;
    }
    return node.left;
  }

  /**
   * Breath-first search for a tree (always starting from the root element).
   * @yields {BinaryTreeNode}
   */
  * bfs() {
    const queue = queueMutable<BinaryTreeNode<V>>();
    if (!this.root) return;
    queue.enqueue(this.root);

    while (!queue.isEmpty) {
      const node = queue.dequeue();
      yield node;
      if (node) {
        if (node.left) { queue.enqueue(node.left); }
        if (node.right) { queue.enqueue(node.right); }
      }
    }
  }

  /**
   * Depth-first search for a tree (always starting from the root element)
   * @see preOrderTraversal Similar results to the pre-order transversal.
   * @yields {BinaryTreeNode}
   */
  * dfs() {
    const stack = stackMutable<BinaryTreeNode<V>>();
    if (!this.root) return;

    stack.push(this.root);

    while (!stack.isEmpty) {
      const node = stack.pop();
      yield node;
      if (node) {
        if (node.right) { stack.push(node.right); }
        if (node.left) { stack.push(node.left); }
      }
    }
  }
 
  /**
   * In-order traversal on a tree: left-root-right.
   * If the tree is a BST, then the values will be sorted in ascendent order
   * @param {BinaryTreeNode} node first node to start the traversal
   * @yields {BinaryTreeNode}
   */
  * inOrderTraversal(node = this.root):IterableIterator<BinaryTreeNode<V>> {
    if (!node) return;
    if (node && node.left) { yield* this.inOrderTraversal(node.left); }
    yield node;
    if (node && node.right) { yield* this.inOrderTraversal(node.right); }
  }
 
  /**
   * Pre-order traversal on a tree: root-left-right.
   * Similar results to DFS
   * @param {BinaryTreeNode} node first node to start the traversal
   * @yields {BinaryTreeNode}
   */
  * preOrderTraversal(node = this.root):IterableIterator<BinaryTreeNode<V>> {
    if (!node) return;
    yield node;
    if (node) {
      if (node.left) { yield* this.preOrderTraversal(node.left); }
      if (node.right) { yield* this.preOrderTraversal(node.right); }
    }
  }

  /**
   * Post-order traversal on a tree: left-right-root.
   * @param {BinaryTreeNode} node first node to start the traversal
   * @yields {BinaryTreeNode}
   */
  * postOrderTraversal(node = this.root):IterableIterator<BinaryTreeNode<V>> {
    if (node) {
      if (node.left) { yield* this.postOrderTraversal(node.left); }
      if (node.right) { yield* this.postOrderTraversal(node.right); }
      yield node;
    }
  }


  /**
   * Represent Binary Tree as an array.
   *
   * Leaf nodes will have two `undefined` descendants.
   *
   * The array representation of the binary tree is as follows:
   *
   * First element (index=0) is the root.
   * The following two elements (index=1,2) are descendants of the root: left (a) and right (b).
   * The next two elements (index=3,4) are the descendants of a
   * The next two elements (index=5,6) are the descendants of b and so on.
   *
   *  0     1            2             3       4        5       6        n
   * [root, a=root.left, b=root.right, a.left, a.right, b.left, b.right, ...]
   *
   * You can also find the parents as follows
   *
   * e.g.
   * Parent 0: children 1,2
   * Parent 1: children 3,4
   * Parent 2: children 5,6
   * Parent 3: children 7,8
   *
   * Given any index you can find the parent index with the following formula:
   *
   * parent = (index) => Math.floor((index-1)/2)
   */
  toArray() {
    const array = [];
    const queue = queueMutable<BinaryTreeNode<V>>();
    const visited = new Map();

    if (this.root) { queue.enqueue(this.root); }

    while (!queue.isEmpty) {
      const current = queue.dequeue();
      array.push(current && current.value);

      if (current) {
        visited.set(current, null); 
        if (!visited.has(current.left) && current.left) { queue.enqueue(current.left); }
        if (!visited.has(current.right) && current.right) { queue.enqueue(current.right); }
      }
    }

    return array;
  }
}


const stringBst = <V>(r:BinaryTreeNode<V>|undefined, indent = 0) => {
  if (!r) return `?`;

  const prefix = ` `.repeat(indent);
  //eslint-disable-next-line functional/no-let
  let s = ``+ r.value;
  s += `\n` + prefix + ` left: ` + stringBst(r.left, indent+1);
  s += `\n` + prefix + ` right: ` + stringBst(r.right, indent+1);
  return s;
};

const test = [30, 40, 10, 15, 12, 50];
const testTree = new BinarySearchTree<number>(defaultComparer);

test.forEach((t, index) => {
  console.log(index+ `. ` + t);
  testTree.add(t);
  console.log(stringBst(testTree.root));
});

// console.log(testTree.find(15));
// console.log(testTree.find(99));