import { intervalToMs, type Interval } from "@ixfx/core";
import type { ModulationFunction, ModulatorTimed } from "./types.js";
import * as Flow from '@ixfx/flow';
import { functionTest, resultThrow } from "@ixfx/guards";

/**
 * Produce values over time. When the modulate function is complete, the final
 * value continues to return. Timer starts when return function is first invoked.
 * 
 * ```js
 * const fn = (t) => {
 *  // 't' will be values 0..1 where 1 represents end of time period.
 *  // Return some computed value based on 't'
 *  return t*Math.random();
 * }
 * const e = Modulate.time(fn, 1000);
 * 
 * // Keep calling e() to get the current value
 * e();
 * ```
 * @param fn Modulate function
 * @param duration Duration
 * @returns 
 */
export const time = (
  fn: ModulationFunction,
  duration: Interval
): () => number => {
  resultThrow(functionTest(fn, `fn`));
  let relative: undefined | (() => number);
  return () => {
    if (typeof relative === `undefined`) relative = Flow.ofTotal(duration, { clampValue: true });
    return fn(relative());
  }
}

/**
 * Creates an modulator based on clock time. Time
 * starts being counted when modulate function is created.
 * 
 * `timeModulator` allows you to reset and check for completion.
 * Alternatively, use {@link time} which is a simple function that just returns a value.
 *
 * @example Time based easing
 * ```
 * import { timeModulator } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const fn = (t) => {
 *  // 't' will be a value 0..1 representing time elapsed. 1 being end of period.
 *  return t*Math.random();
 * }
 * const t = timeModulator(fn, 5*1000); // Will take 5 seconds to complete
 * ...
 * t.compute(); // Get current value of modulator
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * @param fn Modulator
 * @param duration Duration
 * @returns ModulatorTimed
 */
export const timeModulator = (
  fn: ModulationFunction,
  duration: Interval
): ModulatorTimed => {
  resultThrow(functionTest(fn, `fn`));

  const timer = Flow.elapsedMillisecondsAbsolute();
  const durationMs = intervalToMs(duration);
  if (durationMs === undefined) throw new Error(`Param 'duration' not provided`);
  const relativeTimer = Flow.relative(
    durationMs,
    {
      timer,
      clampValue: true
    });
  return Flow.timerWithFunction(fn, relativeTimer);
};

/**
 * Produce modulate values with each invocation. When the time is complete, the final
 * value continues to return. Timer starts when return function is first invoked.
 * 
 * If you need to check if a modulator is done or reset it, consider {@link tickModulator}.
 * 
 * ```js
 * const fn = (t) => {
 *  // 't' will be values 0..1 representing elapsed ticks toward totwal
 * }
 * const e = ticks(fn, 100);
 * 
 * // Keep calling e() to get the current value
 * e();
 * ```
 * @param fn Function that produces 0..1 scale
 * @param totalTicks Total length of ticks
 * @returns 
 */
export const ticks = (
  fn: ModulationFunction,
  totalTicks: number
): () => number => {
  resultThrow(functionTest(fn, `fn`));

  let relative: undefined | (() => number);
  return () => {
    if (typeof relative === `undefined`) relative = Flow.ofTotalTicks(totalTicks, { clampValue: true });
    return fn(relative());
  }
}

/**
 * Creates an modulator based on ticks. 
 * 
 * `tickModulator` allows you to reset and check for completion.
 * Alternatively, use {@link ticks} which is a simple function that just returns a value.
 *
 * @example Tick-based modulator
 * ```
 * import { tickModulator } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const fn = (t) => {
 *  // 't' will be values 0..1 based on completion
 *  return Math.random() * t;
 * }
 * const t = tickModulator(fn, 1000);   // Will take 1000 ticks to complete
 * t.compute(); // Each call to `compute` progresses the tick count
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * @param fn Modulate function that returns 0..1
 * @param durationTicks Duration in ticks
 * @returns ModulatorTimed
 */
export const tickModulator = (
  fn: ModulationFunction,
  durationTicks: number
): ModulatorTimed => {
  resultThrow(functionTest(fn, `fn`));
  const timer = Flow.elapsedTicksAbsolute();
  const relativeTimer = Flow.relative(
    durationTicks,
    {
      timer,
      clampValue: true
    });
  return Flow.timerWithFunction(fn, relativeTimer);
};