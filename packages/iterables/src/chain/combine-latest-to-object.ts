import { isEqualValueIgnoreOrder } from "@ixfx/core";
import type { GenOrData, GenFactoryNoInput, CombineLatestOptions, Gen, GenValueTypeObject } from "./types.js";
import { resolveToGen } from "./utility.js";
import * as MapFns from "@ixfx/core/maps";

/**
 * Monitors sources, storing as they happen to an object.
 * Whenever a new value is emitted, the object is sent out, containing current
 * values from each source, or _undefined_ if not yet emitted.
 * 
 * The tempo of this stream will be set by the fastest source stream.
 * See {@link syncToObject} to have pace determined by slowest source, and only
 * send when each source has produce a new value compared to last time.
 * 
 * Set `onSourceDone` to choose behaviour if a source stops. By default it
 * is 'break', meaning the whole merged stream stops.
 * 
 * If a source completes and onSourceDone = 'allow', the option
 * 'finalValue' sets the logic for what values get returned for the source.
 * By default the setting is 'undefined', thus _undefined_ results. 'last' will be the last (old) value
 * from that source.
 */
export async function* combineLatestToObject<const T extends Record<string, GenOrData<any> | GenFactoryNoInput<any>>>(sources: T, options: Partial<CombineLatestOptions> = {}): AsyncGenerator<GenValueTypeObject<T>> {
  const onSourceDone = options.onSourceDone ?? `break`;
  const finalValue = options.finalValue ?? `undefined`;
  const afterEmit = options.afterEmit ?? `last`;
  type InputState = {
    waiting: Promise<any> | undefined
    gen: Gen<any>
    done: boolean
    lastValue: any
    key: string
  }

  const states = new Map<string, InputState>();
  for (const [ key, value ] of Object.entries(sources)) {
    states.set(key, {
      gen: resolveToGen(value),
      done: false,
      lastValue: undefined,
      waiting: undefined,
      key
    })
  }


  const isDone = () => !MapFns.some(states, (v: { done: boolean; }) => !v.done);

  const isWaiting = () => MapFns.some(states, (v: { waiting: any; }) => v.waiting !== undefined);
  const allEmpty = (d: object) => {
    for (const v of Object.values(d)) {
      if (v !== undefined) return false;
    }
    return true;
  }

  const getData = (): GenValueTypeObject<T> => {
    const r = {};
    for (const [ key, state ] of states) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      (r as any)[ key ] = state.lastValue;
    }
    return r as GenValueTypeObject<T>;
  }
  let lastEmitted: GenValueTypeObject<T> | undefined;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const promises: Promise<any>[] = [];
    for (const input of states.values()) {
      //console.log(`  ${ input.key } done: ${ input.done } waiting: ${ input.waiting !== undefined } last: ${ input.lastValue }`);
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
      throw new Error(`Result missing 'done' property`);
    }


    const d = getData();
    //console.log(`d`, d);
    // if (isEqualValueIgnoreOrder(d, {} as any)) {
    //   console.log(`keys is empty`);
    //   return;
    // }

    const dataEmpty = allEmpty(d);
    if (dataEmpty && !isWaiting()) {
      //console.log(`dataEmpty and not waiting`);
      return;
    }

    if (!isEqualValueIgnoreOrder(lastEmitted, d) && !dataEmpty) {
      //console.log(` -- emitting!`);
      lastEmitted = d;
      yield d;
    }
    if (afterEmit === `undefined`) {
      for (const input of states.values()) {
        if (input.waiting !== undefined) continue;
        input.lastValue = undefined;
      }
    }
    if (isDone()) {
      break;
    }
  }
}
