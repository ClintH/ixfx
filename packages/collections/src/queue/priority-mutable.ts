import { numberTest, resultThrow } from "@ixfx/guards";
import { isEqualDefault, type IsEqual } from "@ixfx/core";
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

  /**
   * Finds the entry with the highest (`max`) or lowest (`min`) priority.
   * Ties go to the entry enqueued first.
   */
  private findExtreme(which: `max` | `min`): PriorityItem<V> | undefined {
    let best: PriorityItem<V> | undefined;
    for (const d of this.data) {
      if (best === undefined) best = d;
      else if (which === `max` ? d.priority > best.priority : d.priority < best.priority) best = d;
    }
    return best;
  }

  private dequeueExtreme(which: `max` | `min`): V | undefined {
    const entry = this.findExtreme(which);
    if (entry === undefined) return;
    // Remove exactly this entry (by reference), not other entries holding an equal item
    this.removeWhere(d => d === entry);
    return entry.item;
  }

  dequeueMax(): V | undefined {
    return this.dequeueExtreme(`max`);
  }

  dequeueMin(): V | undefined {
    return this.dequeueExtreme(`min`);
  }

  peekMax(): V | undefined {
    return this.findExtreme(`max`)?.item;
  }

  peekMin(): V | undefined {
    return this.findExtreme(`min`)?.item;
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