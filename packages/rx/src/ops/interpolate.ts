import type { ReactiveOrSource, ReactivePingable } from "../types.js";
import { interpolate as interpolateFunction, type InterpolateOptions } from "@ixfx/modulation";
import { computeWithPrevious } from "./compute-with-previous.js";

export type OpInterpolateOptions = InterpolateOptions & {
  amount: number
  /**
   * Percentage of value that we consider 'done'.
   * Since interpolation can never converge to target exactly, this allows us to snap to completion.
   * Default: 0.99, meaning if value gets to within 99%, return the target.
   */
  snapAt: number
}

/**
 * Interpolates to the source value.
 * 
 * Outputs one value for every input value. Thus, to interpolation
 * over time, it's necessary to get the source to emit values at the desired rate.
 * 
 * Options can specify an easing name or custom transform of easing progress.
 * @param input 
 * @param options 
 * @returns 
 */
export function interpolate(input: ReactiveOrSource<number>, options: Partial<OpInterpolateOptions> = {}): ReactivePingable<number> {
  const amount = options.amount ?? 0.1;
  const snapAt = options.snapAt ?? 0.99;

  const index = interpolateFunction(amount, options);

  return computeWithPrevious<number>(input, (previous, target) => {
    const v = index(previous, target);
    if (target > previous) {
      if (v / target >= snapAt) return target;
    }
    return v;
  });
}


/**
 * From the basis of an input stream of values, run a function over
 * each value. The function takes in the last value from the stream as well as the current.
 * @param input
 * @param fn
 * @returns
 */
// export function interpolateToTarget<TIn>(input: ReactiveOrSource<TIn>, fn: (previous: TIn, target: TIn) => TIn): ReactivePingable<TIn> {
//   let previousValue: TIn | undefined;
//   let target: TIn | undefined;
//   if (hasLast(input)) {
//     target = previousValue = input.last();
//   }

//   const ping = () => {
//     if (previousValue === undefined && target !== undefined) {
//       previousValue = target;
//     } else if (previousValue !== undefined && target !== undefined) {
//       previousValue = fn(previousValue, target);
//     }
//     upstream.set(previousValue!);
//   }

//   const upstream = initUpstream<TIn, TIn>(input, {
//     lazy: "very",
//     debugLabel: `computeWithPrevious`,
//     onValue(value) {
//       target = value;
//       ping();
//     },
//   })
//   if (target) ping();

//   return {
//     ...toReadable(upstream),
//     ping: () => {
//       if (target !== undefined) ping()
//     }
//   }
// }