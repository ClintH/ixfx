import * as Named from './EasingsNamed.js';
import { throwStringTest } from '../../util/GuardString.js';
import { type Interval } from '../../flow/IntervalType.js';
import type { Modulate, ModulatorTimed } from '../Types.js';
export type { Modulate } from '../Types.js';
export * as Named from './EasingsNamed.js';
import * as ModTimed from '../ModulatorTimed.js';

/**
 * Easing name
 */
export type EasingName = keyof typeof Named;

export type Options = (TickOptions | TimeOptions) & {
  name?: EasingName
  fn?: Modulate
}

export type TimeOptions = {
  duration: Interval
}
export type TickOptions = {
  ticks: number
}

/**
 * Creates an easing function
 * ```js
 * const e = Easings.create({ duration: 1000, name: `quadIn` });
 * const e = Easings.create({ ticks: 100, name: `sineOut` });
 * const e = Easings.create({ 
 *  duration: 1000, 
 *  fn: (v) => {
 *    // v will be 0..1 based on time
 *    return Math.random() * v
 *  }
 * });
 * ```
 * @param options 
 * @returns 
 */
export const create = (options: Options): () => number => {
  let name = resolveEasingName(options.name ?? `quintIn`);
  const fn = name ?? options.fn;
  if (!fn) throw new Error(`Either 'name' or 'fn' must be set`);

  if (`duration` in options) {
    return time(fn, options.duration);
  } else if (`ticks` in options) {
    return ticks(fn, options.ticks);
  } else {
    throw new Error(`Expected 'duration' or 'ticks' in options`);
  }
}

/**
 * Creates an easing based on clock time. Time
 * starts being counted when easing function is created.
 * 
 * `timeEasing` allows you to reset and check for completion.
 * Alternatively, use {@link time} which is a simple function that just returns a value.
 *
 * 
 * @example Time based easing
 * ```
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const t = Easings.timeEasing(`quintIn`, 5*1000); // Will take 5 seconds to complete
 * ...
 * t.compute(); // Get current value of easing
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * 
 * Thisi function is just a wrapper around Modulator.timedModulator.
 * @param nameOrFunction Name of easing, or an easing function
 * @param duration Duration
 * @returns Easing
 */
export const timeEasing = (
  nameOrFunction: EasingName | ((v: number) => number),
  duration: Interval
): ModulatorTimed => {
  const fn = resolveEasingName(nameOrFunction);
  return ModTimed.timeModulator(fn, duration);
  // const timer = Timer.elapsedMillisecondsAbsolute();
  // const durationMs = intervalToMs(duration);
  // if (durationMs === undefined) throw new Error(`Param 'duration' not provided`);
  // const relativeTimer = Timer.relative(
  //   durationMs,
  //   {
  //     timer,
  //     clampValue: true
  //   });
  // return Timer.timerWithFunction(fn, relativeTimer);
};

/**
 * Produce easing values over time. When the easing is complete, the final
 * value continues to return. Timer starts when return function is first invoked.
 * 
 * If you need to check if an easing is done or reset it, consider {@link timeEasing}.
 * 
 * ```js
 * // Quad-in easing over one second
 * const e = Easings.time(`quadIn`, 1000);
 * 
 * // Keep calling e() to get the current value
 * e();
 * ```
 * 
 * This function is just a wrapper around Modulate.time
 * @param nameOrFunction Easing name or a function that produces 0..1 scale
 * @param duration Duration
 * @returns 
 */
export const time = (
  nameOrFunction: EasingName | ((v: number) => number),
  duration: Interval
): () => number => {
  const fn = resolveEasingName(nameOrFunction);
  return ModTimed.time(fn, duration);
  // let relative: undefined | (() => number);
  // return () => {
  //   if (relative === undefined) relative = Timer.ofTotal(duration, { clampValue: true });
  //   return fn(relative());
  // }
}


/**
 * Produce easing values with each invocation. When the easing is complete, the final
 * value continues to return. Timer starts when return function is first invoked.
 * 
 * If you need to check if an easing is done or reset it, consider {@link tickEasing}.
 * 
 * ```js
 * // Quad-in easing over 100 ticks
 * const e = Easings.ticks(`quadIn`, 100);
 * 
 * // Keep calling e() to get the current value
 * e();
 * ```
 * 
 * This is just a wrapper around Modulator.ticks
 * @param nameOrFunction Easing name or a function that produces 0..1 scale
 * @param totalTicks Total length of ticks
 * @returns 
 */
export const ticks = (
  nameOrFunction: EasingName | ((v: number) => number),
  totalTicks: number
): () => number => {
  const fn = resolveEasingName(nameOrFunction);
  return ModTimed.ticks(fn, totalTicks);
  // let relative: undefined | (() => number);
  // return () => {
  //   if (relative === undefined) relative = Timer.ofTotalTicks(totalTicks, { clampValue: true });
  //   return fn(relative());
  // }
}
/**
 * Creates an easing based on ticks. 
 * 
 * `tickEasing` allows you to reset and check for completion.
 * Alternatively, use {@link ticks} which is a simple function that just returns a value.
 *
 * @example Tick-based easing
 * ```
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const t = Easings.tickEasing(`sineIn`, 1000);   // Will take 1000 ticks to complete
 * t.compute(); // Each call to `compute` progresses the tick count
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * @param nameOrFunction Name of easing, or an easing function
 * @param durationTicks Duration in ticks
 * @returns Easing
 */
export const tickEasing = (
  nameOrFunction: EasingName | ((v: number) => number),
  durationTicks: number
): ModulatorTimed => {
  const fn = resolveEasingName(nameOrFunction);
  return ModTimed.tickModulator(fn, durationTicks);
  // const timer = Timer.elapsedTicksAbsolute();
  // const relativeTimer = Timer.relative(
  //   durationTicks,
  //   {
  //     timer,
  //     clampValue: true
  //   });
  // return Timer.timerWithFunction(fn, relativeTimer);
};

const resolveEasingName = (nameOrFunction: EasingName | ((v: number) => number)): Modulate => {
  const fn = typeof nameOrFunction === `function` ? nameOrFunction : get(nameOrFunction);
  if (fn === undefined) {
    const error = typeof nameOrFunction === `string` ? new Error(`Easing function not found: '${ nameOrFunction }'`) : new Error(`Easing function not found`);
    throw error;
  }
  return fn;
}


/**
 * Creates a new easing by name
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const e = Easings.create(`circInOut`, 1000, elapsedMillisecondsAbsolute);
 * ```
 * @param nameOrFunction Name of easing, or an easing function
 * @param duration Duration (meaning depends on timer source)
 * @param timerSource Timer source
 * @returns
 */
// const create = function (
//   nameOrFunction: EasingName | ((v: number) => number),
//   duration: number,
//   timerSource: TimerSource
// ): Easing {
//   const fn = typeof nameOrFunction === `function` ? nameOrFunction : get(nameOrFunction);
//   if (fn === undefined) {
//     const error = typeof nameOrFunction === `string` ? new Error(`Easing function not found: '${ nameOrFunction }'`) : new Error(`Easing function not found`);
//     throw error;
//   }

//   // Get a relative version of timer
//   const timer = relativeTimer(duration, {
//     timer: timerSource(),
//     clampValue: true,
//   });
//   let startCount = 1;

//   return {
//     get isDone() {
//       return timer.isDone;
//     },
//     get runState() {
//       if (timer.isDone) return `idle`;
//       return `scheduled`;
//     },
//     /**
//      * Returns 1 if it has been created, returns +1 for each additional time the timer has been reset.
//      */
//     get startCount() {
//       return startCount;
//     },
//     get startCountTotal() {
//       return startCount;
//     },
//     compute: () => {
//       const relative = timer.elapsed;
//       return fn(relative);
//     },
//     reset: () => {
//       timer.reset();
//       startCount++;
//     },
//   };
// };


let easingsMap: Map<string, ((v: number) => number)> | undefined;

/**
 * Returns an easing function by name. Throws an error if
 * easing is not found.
 *
 * ```js
 * const fn = Easings.get(`sineIn`);
 * // Returns 'eased' transformation of 0.5
 * fn(0.5);
 * ```
 * @param easingName eg `sineIn`
 * @returns Easing function
 */
export const get = function (easingName: EasingName): Modulate {
  throwStringTest(easingName, `non-empty`, `easingName`);

  const found = cacheEasings().get(easingName.toLowerCase());
  if (found === undefined) throw new Error(`Easing not found: '${ easingName }'`);
  return found;
};

// Cache named easings
function cacheEasings() {
  if (easingsMap === undefined) {
    easingsMap = new Map();
    for (const [ k, v ] of Object.entries(Named)) {
      easingsMap.set(k.toLowerCase(), v);
    }
    return easingsMap
  } else return easingsMap;
}

/**
 * Iterate over available easings.
 * @private
 * @returns Returns list of available easing names
 */
export function* getEasingNames(): Iterable<string> {
  const map = cacheEasings();
  yield* Object.keys(map.values);
};
