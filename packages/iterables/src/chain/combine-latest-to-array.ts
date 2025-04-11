import { isEqual } from "@ixfxfun/arrays";
import type { GenOrData, GenFactoryNoInput, CombineLatestOptions, Gen } from "./types.js";
import { resolveToGen } from "./utility.js";

/**
 * Monitors sources, storing as they happen to an array.
 * Whenever a new value is emitted, the whole array is sent out, containing current
 * values from each source, or _undefined_ if not yet emitted.
 * 
 * The tempo of this stream will be set by the fastest source stream.
 * See {@link syncToArray} to have pace determined by slowest source, and only
 * send when each source has produce a new value compared to last time.
 * 
 * Set `onSourceDone` to choose behaviour if a source stops. The default is
 * 'break', meaning the whole combined stream stops.
 * 
 * If a source completes and onSourceDone = 'allow', the option
 * 'finalValue' sets the logic for what values get returned for the source.
 * By default the setting is 'undefined', thus _undefined_ results. 'last' will be the last (old) value
 * from that source.
 */
export async function* combineLatestToArray(sources: (GenOrData<any> | GenFactoryNoInput<any>)[], options: Partial<CombineLatestOptions> = {}): AsyncGenerator<any[]> {
  const onSourceDone = options.onSourceDone ?? `break`;
  const finalValue = options.finalValue ?? `undefined`;
  const afterEmit = options.afterEmit ?? `last`;
  type InputState = {
    waiting: Promise<any> | undefined,
    index: number
    gen: Gen<any>
    done: boolean
    lastValue: any
  }
  const inputs = sources.map<InputState>((source, index) => ({ waiting: undefined, index, gen: resolveToGen(source), done: false, lastValue: undefined }));

  const isDone = () => !inputs.some(v => !v.done);
  const isWaiting = () => inputs.some(v => v.waiting !== undefined);
  const allEmpty = (d: any[]) => !d.some(v => v !== undefined);

  let lastEmitted: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const promises: Promise<any>[] = [];
    for (const input of inputs) {
      //console.log(`  ${ input.index } done: ${ input.done } waiting: ${ input.waiting !== undefined } last: ${ input.lastValue }`);
      if (input.done) continue;
      if (input.waiting !== undefined) {
        promises.push(input.waiting);
        continue;
      }
      const p = Promise.resolve((async () => {
        if (input.done) return input;
        const v = await input.gen.next();
        input.waiting = undefined;
        if (v.done) {
          input.done = true;
          if (finalValue === `undefined`) input.lastValue = undefined;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          input.lastValue = v.value;
        }
        return input;
      })());
      input.waiting = p;
      promises.push(p);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const won = await Promise.race(promises);
    if (`done` in won) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (won.done && onSourceDone === `break`) break;
    } else {
      throw new Error(`Missing 'done' property`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const d = inputs.map(v => v.lastValue);
    if (d.length === 0) {
      return;
    }

    const dataEmpty = allEmpty(d);

    if (dataEmpty && !isWaiting()) {
      return;
    }

    if (!isEqual(lastEmitted, d) && !dataEmpty) {
      lastEmitted = d;
      yield d;
    }
    if (afterEmit === `undefined`) {
      for (const input of inputs) {
        if (input.waiting !== undefined) continue;
        input.lastValue = undefined;
      }
    }
    if (isDone()) {
      break;
    }
  }
}
