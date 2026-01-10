import { numberTest, resultThrow } from "@ixfx/guards";
import { isEqualDefault, type IsEqual } from "@ixfx/core";
import { max as IterablesMax, min as IterablesMin, last as IterablesLast } from "@ixfx/iterables";
import type { IPriorityQueueMutable, PriorityItem } from "./ipriority-queue-mutable.js";
import { QueueMutable } from "./queue-mutable.js";
import type { QueueOpts } from "./queue-types.js";

/**
 * Simple priority queue implementation.
 * Higher numbers mean higher priority.
 * 
 * ```js
 * const pm = new PriorityMutable();
 * 
 * // Add items with a priority (higher numeric value = higher value)
 * pm.enqueueWithPriority(`hello`, 4);
 * pm.enqueueWithPriotity(`there`, 1);
 * 
 * ```
 */
export class PriorityMutable<V> extends QueueMutable<PriorityItem<V>> implements IPriorityQueueMutable<V> {
  constructor(opts: QueueOpts<PriorityItem<V>> = {}) {
    if (opts.eq === undefined) {
      opts = {
        ...opts,
        eq: (a, b) => {
          return isEqualDefault(a.item, b.item);
        }
      }
    }
    super(opts);
  }

  /**
   * Adds an item with a given priority
   * @param item Item
   * @param priority Priority (higher numeric value means higher priority)
   */
  enqueueWithPriority(item: V, priority: number): void {
    resultThrow(numberTest(priority, `positive`));
    super.enqueue({ item, priority });
  }

  changePriority(item: V, priority: number, addIfMissing = false, eq?: IsEqual<V>): void {
    if (item === undefined) throw new Error(`Item cannot be undefined`);
    let toDelete: PriorityItem<V> | undefined;
    for (const d of this.data) {
      if (eq) {
        if (eq(d.item, item)) {
          toDelete = d;
          break;
        }
      } else {
        if (this.eq(d, { item, priority: 0 })) {
          toDelete = d;
          break;
        }
      }
    }
    if (toDelete === undefined && !addIfMissing) throw new Error(`Item not found in priority queue. Item: ${ JSON.stringify(item) }`);
    if (toDelete !== undefined) {
      this.removeWhere(item => toDelete === item)
    }
    this.enqueueWithPriority(item, priority);
  }

  dequeueMax(): V | undefined {
    //const m = IterablesLast(IterablesMax(this.data, v => v.priority));
    const m = IterablesLast(IterablesMax(this.data, (a, b) => a.priority >= b.priority));

    if (m === undefined) return;
    this.removeWhere(item => item === m);
    return m.item;
  }

  dequeueMin(): V | undefined {
    const m = IterablesLast(IterablesMax(this.data, (a, b) => a.priority >= b.priority));
    //const m = IterablesLast(IterablesMin(this.data, (a,b) => a.priority >= b.priority));
    if (m === undefined) return;
    this.removeWhere(item => item.item === m);
    return m.item;
  }

  peekMax(): V | undefined {
    const m = IterablesLast(IterablesMax(this.data, (a, b) => a.priority >= b.priority));
    //const m = IterablesLast(IterablesMax(this.data, v => v.priority));
    if (m === undefined) return;
    return m.item;
  }

  peekMin(): V | undefined {
    //const m = IterablesLast<V>(IterablesMin(this.data, (a,b) => a.priority >= b.priority));
    const m = IterablesLast(IterablesMin(this.data, (a, b) => a.priority >= b.priority));
    if (m === undefined) return;
    return m.item;
  }
}

/**
 * Creates a {@link PriorityMutable} queue.
 * 
 * Options:
 * * eq: Equality function
 * * capacity: limit on number of items
 * * discardPolicy: what to do if capacity is reached
 * @param opts 
 * @returns 
 */
export function priority<V>(
  opts: QueueOpts<PriorityItem<V>> = {}
): IPriorityQueueMutable<V> {
  return new PriorityMutable(opts);
}