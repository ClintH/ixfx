import { initUpstream } from "../init-stream.js";
import { toReadable } from "../to-readable.js";
import type { ReactiveOrSource, Reactive, ReactivePingable } from "../types.js";
import { hasLast } from "../util.js";

/**
 * When there is a value from `input`, or the reactive is pinged,
 * this reactive emits the result of `fn`.
 * 
 * `fn` is provided the previous value as well as the most recent value.
 * 
 * If no previous value is available, the current value is emitted and `fn` is not called.
 * @param input 
 * @param fn 
 * @returns 
 */
export function computeWithPrevious<TIn>(input: ReactiveOrSource<TIn>, fn: (previous: TIn, current: TIn) => TIn): ReactivePingable<TIn> {
  let previousValue: TIn | undefined;
  let currentValue: TIn | undefined;
  if (hasLast(input)) {
    currentValue = previousValue = input.last();
  }

  const trigger = () => {
    if (previousValue === undefined && currentValue !== undefined) {
      previousValue = currentValue;
      upstream.set(previousValue);
    } else if (previousValue !== undefined && currentValue !== undefined) {
      const vv = fn(previousValue, currentValue);
      //console.log(`vv: ${ vv } prev: ${ previousValue } target: ${ target }`)
      previousValue = vv;
      upstream.set(vv);
    }
  }

  const upstream = initUpstream<TIn, TIn>(input, {
    lazy: "very",
    debugLabel: `computeWithPrevious`,
    onValue(value) {
      //console.log(`onValue ${ value }`);
      currentValue = value;
      trigger();
    },
  })
  if (currentValue) trigger();

  return {
    ...toReadable(upstream),
    ping: () => {
      if (currentValue !== undefined) trigger()
    }
  }
}