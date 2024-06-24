import type { GenOrData, GenFactoryNoInput, CombineLatestOptions, Gen } from "./Types.js";
import { resolveToGen } from "./Util.js";
import { isEqual as ArrayIsEqual } from "../../collections/arrays/Equality.js";

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
export async function* combineLatestToArray(sources: Array<GenOrData<any> | GenFactoryNoInput<any>>, options: Partial<CombineLatestOptions> = {}): AsyncGenerator<Array<any>> {
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
  const allEmpty = (d: Array<any>) => !d.some(v => v !== undefined);

  let lastEmitted: Array<any> = [];
  //let count = 0;
  while (true) {
    const promises = [];
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
          //console.log(`   ${ input.index } value: ${ v.value }`);
          input.lastValue = v.value;
        }
        return input;
      })());
      input.waiting = p;
      promises.push(p);
    }
    const won = await Promise.race(promises);

    if (won.done && onSourceDone === `break`) break;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const d = inputs.map(v => v.lastValue);
    if (d.length === 0) {
      return;
    }

    const dataEmpty = allEmpty(d);

    if (dataEmpty && !isWaiting()) {
      return;
    }

    if (!ArrayIsEqual(lastEmitted, d) && !dataEmpty) {
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
