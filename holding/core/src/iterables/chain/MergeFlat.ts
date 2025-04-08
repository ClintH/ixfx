import type { GenFactoryNoInput, GenOrData } from "./Types.js";
import { Queues } from "../../collections/index.js";
import { sleep } from "../..//flow/Sleep.js";
import { resolveToAsyncGen } from "./Util.js";
/**
 * Merge values from several sources into one stream, interleaving values.
 * When all streams are complete it finishes.
 * 
 * Alternatively:
 * - {@link combineLatestToArray}/{@link combineLatestToObject} emits snapshots of all the generators, as quickly as the fastest one
 * - {@link syncToArray}/{@link syncToObject} which releases a set of results when all inputs have emitted a value
 * @param sources 
 */
export async function* mergeFlat<Out>(...sources: Array<GenOrData<any> | GenFactoryNoInput<any>>): AsyncGenerator<Out> {
  const sourcesInput = sources.map(source => resolveToAsyncGen(source));
  const buffer = Queues.mutable<Out>();
  let completed = 0;

  const schedule = async (source: AsyncGenerator<any> | undefined) => {
    if (source === undefined) {
      completed++;
      return;
    }

    const x = await source.next();
    if (x.done) {
      completed++;
    } else {
      buffer.enqueue(x.value as Out);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(() => schedule(source), 1);
    }
  }

  for (const source of sourcesInput) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(() => schedule(source), 1);
  }

  const loopSpeed = 10;
  let loopFactor = 1;
  while (completed < sourcesInput.length) {
    const d = buffer.dequeue();
    if (d === undefined) {
      // Grow loop factor up to 10
      loopFactor = Math.min(loopFactor + 1, 10);
    } else {
      yield d;
      // Reset loop factor
      loopFactor = 1;
    }
    await sleep(loopSpeed * loopFactor);
  }
}