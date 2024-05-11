import { intervalToMs } from "../../flow/IntervalType.js";
import type { SleepOpts } from "../../flow/Sleep.js";
import * as Async from "../IterableAsync.js";
import type { GenOrData, GenFactoryNoInput, SyncOptions } from "./Types.js";
import { resolveToGen } from "./Util.js";

/**
 * Waits for all sources to produce a value, sending the combined results as an array.
 * After sending, it waits again for each source to send at least one value.
 * 
 * Use {@link syncToObject} to output objects based on labelled sources rather than an array of values.
 * 
 * Pace will be set by the slowest source. Alternatively, use {@link combineLatestToArray} where the rate is determined by fastest source.
 * 
 * Only complete results are sent. For example if source A & B finish and source C is still producing values,
 * synchronisation is not possible because A & B stopped producing values. Thus the stream will self-terminate
 * after `maximumWait` (2 seconds). The newer values from C are lost.
 */
export async function* syncToArray(sources: Array<GenOrData<any> | GenFactoryNoInput<any>>, options: Partial<SyncOptions> = {}): AsyncGenerator<Array<any>> {
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
        input.lastValue = v.value;
        input.seq = seq;
      }
    }
    if (go) {
      // Return the set of data
      const d = inputs.filter(v => v.seq === seq).map(v => v.lastValue);
      if (d.length === 0) return;
      if (!d.some(v => v !== undefined)) return;
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