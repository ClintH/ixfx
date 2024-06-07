import { isEqualDefault, type IsEqual } from "../../IsEqual.js";
import { max as IterablesMax, min as IterablesMin } from "../Iterables.js";
import type { IPriorityQueueMutable, PriorityItem } from "./IPriorityQueueMutable.js";
import { QueueMutable } from "./QueueMutable.js";
import type { QueueOpts } from "./QueueTypes.js";

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

  enqueueWithPriority(item: V, priority: number) {
    super.enqueue({ item, priority });
  }

  changePriority(item: V, priority: number, addIfMissing = false, eq?: IsEqual<V>) {
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
    const m = IterablesMax(this.data, v => v.priority);
    if (m === undefined) return;
    this.removeWhere(item => item === m);
    return m.item;
  }

  dequeueMin(): V | undefined {
    const m = IterablesMin(this.data, v => v.priority);
    if (m === undefined) return;
    this.removeWhere(item => item === m);
    return m.item;
  }

  peekMax(): V | undefined {
    const m = IterablesMax(this.data, v => v.priority);
    if (m === undefined) return;
    return m.item;
  }

  peekMin(): V | undefined {
    const m = IterablesMin(this.data, v => v.priority);
    if (m === undefined) return;
    return m.item;
  }
}

export function priority<V>(
  opts: QueueOpts<PriorityItem<V>> = {}
): IPriorityQueueMutable<V> {
  return new PriorityMutable(opts);
}