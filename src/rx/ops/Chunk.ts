import { QueueMutable } from "../../collections/queue/QueueMutable.js";
import { timeout } from "../../flow/Timeout.js";
import { initUpstream } from "../InitStream.js";
import type { ReactiveOrSource, Reactive } from "../Types.js";
import { toReadable } from "../ToReadable.js";
import type { ChunkOptions } from "./Types.js";

/**
 * Queue from `source`, emitting when thresholds are reached. 
 * The resulting Reactive produces arrays.
 * 
 * Can use a combination of elapsed time or number of data items.
 * 
 * By default options are OR'ed together.
 *
 * ```js
 * // Emit data in chunks of 5 items
 * chunk(source, { quantity: 5 });
 * // Emit a chunk of data every second
 * chunk(source, { elapsed: 1000 });
 * ```
 * @param source 
 * @param options 
 * @returns 
 */
export function chunk<V>(source: ReactiveOrSource<V>, options: Partial<ChunkOptions> = {}): Reactive<Array<V>> {
  const queue = new QueueMutable<V>();
  const quantity = options.quantity ?? 0;
  const returnRemainder = options.returnRemainder ?? true;

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
  const upstream = initUpstream<V, Array<V>>(source, upstreamOpts);

  //let testElapsed = performance.now();
  const send = () => {
    //console.log(`Elapsed: ${ performance.now() - testElapsed }`);
    //testElapsed = performance.now();
    if (queue.isEmpty) return;

    // Reset timer
    if (timer !== undefined) timer.start();

    // Fire queued data
    const data = queue.toArray();
    queue.clear();
    setTimeout(() => upstream.set(data));
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
