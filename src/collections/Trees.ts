import { queueMutable } from "./Queue.js";
import { stackMutable } from "./Stack.js";

/**
 * Source: https://github.com/amejiarosario/dsa.js-data-structures-algorithms-javascript/blob/c20acfb32f057355fa51fc0fedbdacebcab78baf/src/data-structures/trees/tree-node.js
 * License: MIT
 */
export class TreeNode<V> {
  value:V;
  descendants:TreeNode<V>[] = [];

  constructor(value:V) {
    this.value = value;
  }
}

/***
 * Breadth-first traversal
 */
export function* bfs<V>(root:TreeNode<V>) {
  if (!root) return;
  const queue = queueMutable<TreeNode<V>>();
  queue.enqueue(root);

  while (!queue.isEmpty) {
    const node = queue.dequeue();
    yield node;
    if (node) {
      queue.enqueue(...node.descendants);
    }
  }
}

/**
 * Depth-first traversal
 * @param root
 * @returns 
 */
export function* dfs<V>(root:TreeNode<V>) {
  if (!root) return;
  const stack = stackMutable<TreeNode<V>>();

  stack.push(root);

  while (!stack.isEmpty) {
    const node = stack.pop();
    yield node;
    if (node) {
      stack.push(...node.descendants);
    }
  }
}