export * from './circular-array.js';

/**
 * A tree-like structure of branches and leaves.
 * 
 * ```js
 * import { Trees } from "https://unpkg.com/@ixfx/collections/bundle"
 * const root = Trees.Mutable.rootWrapped(`root`);
 * // Add 'a' as the child of the root node
 * let a = root.addValue(`a`);
 * // Add `aa` as the child of `a`
 * let b = a.addValue(`aa`);
 * b.hasParent(a); // True
 * ```
 */
export * as Trees from './tree/index.js';
export * from './tree/types.js';

export type * from './types.js';


/**
 * Stacks store items in order, like a stack of plates.
 * 
 * ```js
 * import { Stacks } from "https://unpkg.com/@ixfx/collections/bundle"
 * let s = Stacks.immutable();
 * s = s.push(`a`, `b`);   // Add two strings
 * // Peek looks at the top of the stack
 * // (ie most recently added)
 * s.peek; // `b`
 * // Remove item from top of stack
 * s = s.pop();
 * s.peek // `a`
 * ```
 */
export * as Stacks from './stack/index.js';
export { StackMutable } from './stack/StackMutable.js';
export { StackImmutable } from './stack/StackImmutable.js';
export type { IStackImmutable } from './stack/IStackImmutable.js';

/**
 * Sets store unique items.
 */
export * as Sets from './set/index.js';
export * from './set/types.js';
export { SetStringMutable } from './set/set-mutable.js';
export { SetStringImmutable } from './set/SetImmutable.js';
export type { ISetImmutable } from './set/ISetImmutable.js';
export * from './set/ISetMutable.js';


/**
 * Queues store items in the order in which they are added.
 */
export * as Queues from './queue/index.js';
export { QueueMutable } from './queue/queue-mutable.js';
export { QueueImmutable } from './queue/queue-immutable.js';
export type * from './queue/queue-types.js';

/**
 * Maps associate keys with values.
 */
export * as Maps from './map/index.js';
export { ExpiringMap } from './map/expiring-map.js';
export { MapOfSimpleMutable } from './map/map-of-simple-mutable.js';

/**
 * Undirected and directed graphs and associated algorithms.
 * 
 * @example
 * ```js
 * import { Graphs } from "https://unpkg.com/@ixfx/collections/bundle"
 * const Dg = Graphs.Directed;
 * let g = Dg.graph();
 * g = Dg.connect(g, { from: `a`, to: `b` });
 * g = Dg.connect(g, { from: `b`, to: `c` });
 * g = Dg.connect(g, { from: `c`, to: `a` });
 * Dg.dumpGraph(g);
 * // A -> B, B -> C, C -> A
 * ```
 */
export * as Graphs from './graph/index.js';

export { Table } from './table.js';