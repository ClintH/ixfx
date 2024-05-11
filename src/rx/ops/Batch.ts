import { QueueMutable } from "../../collections/index.js";
import { timeout } from "../../flow/Timeout.js";
import { initUpstream } from "../InitStream.js";
import type { ReactiveOrSource, Reactive } from "../Types.js";
import { toReadable } from "../ToReadable.js";
import type { BatchOptions } from "./Types.js";

/**
 * Queue from `source`, emitting when thresholds are reached. 
 * The resulting Reactive produces arrays.
 * 
 * Can use a combination of elapsed time or number of data items.
 * 
 * By default options are OR'ed together.
 *
 * ```js
 * // Emit data in batches of 5 items
 * batch(source, { quantity: 5 });
 * // Emit data every second
 * batch(source, { elapsed: 1000 });
 * ```
 * @param batchSource 
 * @param options 
 * @returns 
 */
export function batch<V>(batchSource: ReactiveOrSource<V>, options: Partial<BatchOptions> = {}): Reactive<Array<V>> {
  const queue = new QueueMutable<V>();
  const quantity = options.quantity ?? 0;
  //const logic = options.logic ?? `or`;
  const returnRemainder = options.returnRemainder ?? true;

  //let lastFire = performance.now();
  const upstreamOpts = {
    ...options,
    onStop() {
      if (returnRemainder && !queue.isEmpty) {
        const data = queue.toArray();
        queue.clear();
        upstream.set(data);
      }
    },
    onValue(value: V) {
      queue.enqueue(value);
      if (quantity > 0 && queue.length >= quantity) {
        // Reached quantity limit
        send();
      }
      // Start timer
      if (timer !== undefined && timer.runState === `idle`) {
        timer.start();
      }
    },
  }
  const upstream = initUpstream<V, Array<V>>(batchSource, upstreamOpts);

  const send = () => {
    if (queue.isEmpty) return;

    // Reset timer
    if (timer !== undefined) timer.start();

    // Fire queued data
    const data = queue.toArray();
    queue.clear();
    upstream.set(data);
  }

  const timer = options.elapsed ? timeout(send, options.elapsed) : undefined

  // const trigger = () => {
  //   const now = performance.now();
  //   let byElapsed = false;
  //   let byLimit = false;
  //   if (elapsed > 0 && (now - lastFire > elapsed)) {
  //     lastFire = now;
  //     byElapsed = true;
  //   }
  //   if (limit > 0 && queue.length >= limit) {
  //     byLimit = true;
  //   }
  //   if (logic === `or` && (!byElapsed && !byLimit)) return;
  //   if (logic === `and` && (!byElapsed || !byLimit)) return;

  //   send();
  // }

  return toReadable(upstream);
}
