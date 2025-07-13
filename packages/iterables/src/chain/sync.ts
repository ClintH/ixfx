
import { intervalToMs, type SleepOpts } from "@ixfx/core";
import * as Async from "../async.js";
import type { GenOrData, GenFactoryNoInput, SyncOptions } from "./types.js";
import { resolveToGen } from "./utility.js";

// export function syncToObject<const T extends Record<string, GenOrData<any>>>(reactiveSources: T, options: Partial<SyncOptions> = {}): AsyncGenerator<GenValueTypeObject<T>> {
//   const keys = Object.keys(reactiveSources)
//   const values = Object.values(reactiveSources);

//   const s = syncToArray(values, options);
//   const st = transform(s, (streamValues) => {
//     return zipKeyValue(keys, streamValues);
//   });
//   return st as AsyncGenerator<GenValueTypeObject<T>>;
// }

/**
 * Waits for all sources to produce a value, sending the combined results as an array.
 * After sending, it waits again for each source to send at least one value.
 * 
 * Use {@link syncToObject} to output objects based on labelled sources rather than an array of values.
 * 
 * Pace will be set by the slowest source. Alternatively, use {@link combineLatestToArray} where the rate is determined by fastest source.
 * 
 * Only complete results are sent. For example if source A & B finish and 
 * source C is still producing values, synchronisation is not possible 
 * because A & B stopped producing values. Thus the stream will terminate
 * after `maximumWait` (2 seconds). Newer values from C are lost.
 */
export async function* syncToArray(sources: (GenOrData<any> | GenFactoryNoInput<any>)[], options: Partial<SyncOptions> = {}): AsyncGenerator<any[]> {
  const onSourceDone = options.onSourceDone ?? `break`;
  //const ac = new AbortController();
  const maximumWaitMs = intervalToMs(options.maximumWait, 2000);
  const finalValue = options.finalValue ?? `undefined`;
  const inputs = sources.map(source => ({ seq: 0, lastValue: undefined, gen: resolveToGen(source), done: false }));
  const nextWithTimeoutOpts: SleepOpts<any> = {
    millis: maximumWaitMs
  };
  let seq = 0;
  const isAllDone = () => !inputs.some(v => !v.done);
  let go = true;
  while (go) {
    seq++;
    for (const input of inputs) {
      if (input.done) {
        input.seq = seq;
        continue;
      }
      // Read source, with a timeout
      const v = await Async.nextWithTimeout(input.gen, nextWithTimeoutOpts);

      // Input has finished
      if (v.done) {
        input.done = true;
        input.seq = seq;
        if (finalValue === `undefined`) {
          input.lastValue = undefined;
        }
        if (onSourceDone === `break`) {
          return;
        }
      } else {
        // Stash away value
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        input.lastValue = v.value;
        input.seq = seq;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (go) {
      // Return the set of data
      const d = inputs.filter(v => v.seq === seq).map(v => v.lastValue);
      if (d.length === 0) return;
      if (!d.some(v => typeof v !== `undefined`)) return;
      yield d;
    }
    if (isAllDone()) go = false;
  }
  // let somethingProduced = true;

  // while (somethingProduced) {
  //   let data = [];
  //   for (let index = 0; index < sourcesInput.length; index++) {
  //     // eslint-disable-next-line unicorn/no-null
  //     data[ index ] = null;
  //   }

  //   somethingProduced = false;
  //   // Request the next value from each source
  //   for (const [ index, source ] of sourcesInput.entries()) {
  //     const v = await source.next();
  //     if (!v.done) {
  //       data[ index ] = v.value;
  //       somethingProduced = true;
  //     }
  //   }
  //   if (somethingProduced) {
  //     // Send data
  //     yield data;
  //     data = [];
  //   }
  // }
}