import { initUpstream } from "../InitStream.js";
import { toReadable } from "../ToReadable.js";
import type { ReactiveOrSource, Reactive, ReactivePingable } from "../Types.js";
import { hasLast } from "../Util.js";

/**
 * From the basis of an input stream of values, run a function over
 * each value. The function takes in the last value from the stream as well as the current.
 * @param input 
 * @param fn 
 * @returns 
 */
export function computeWithPrevious<TIn>(input: ReactiveOrSource<TIn>, fn: (previous: TIn, current: TIn) => TIn): ReactivePingable<TIn> {
  let previousValue: TIn | undefined;
  let target: TIn | undefined;
  if (hasLast(input)) {
    target = previousValue = input.last();
  }

  const trigger = () => {
    if (previousValue === undefined && target !== undefined) {
      previousValue = target;
      upstream.set(previousValue);
    } else if (previousValue !== undefined && target !== undefined) {
      const vv = fn(previousValue, target);
      console.log(`vv: ${ vv } prev: ${ previousValue } target: ${ target }`)
      previousValue = vv;
      upstream.set(vv);
    }
  }

  const upstream = initUpstream<TIn, TIn>(input, {
    lazy: "very",
    debugLabel: `computeWithPrevious`,
    onValue(value) {
      console.log(`onValue ${ value }`);
      target = value;
      trigger();
    },
  })
  if (target) trigger();

  return {
    ...toReadable(upstream),
    ping: () => {
      if (target !== undefined) trigger()
    }
  }
}