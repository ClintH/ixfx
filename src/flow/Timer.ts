import { clamp } from '../data/Clamp.js';
import { type HasCompletion } from './index.js';
/**
 * Creates a timer
 */
export type TimerSource = () => Timer;

/**
 * A timer instance
 */
export type Timer = {
  reset(): void;
  get elapsed(): number;
};

export type ModTimer = Timer & {
  mod(amt: number): void;
};

/**
 * Returns a function that returns true if timer is complete
 *
 * ```js
 * const timer = hasElapsedMs(1000);
 * timer(); // Returns true if timer is done
 * ```
 *
 * See also {@link completionMs}.
 * @param totalMs
 * @returns
 */
export function hasElapsedMs(totalMs: number): () => boolean {
  const t = relativeTimer(totalMs, msElapsedTimer());
  return () => t.isDone;
}

/**
 * Returns a function that returns the percentage of timer completion
 *
 * ```js
 * const timer = completionMs(1000);
 * timer(); // Returns 0..1
 * ```
 *
 * See also {@link hasElapsedMs}.
 * @param totalMs
 * @returns
 */
export function completionMs(totalMs: number): () => number {
  const t = relativeTimer(totalMs, msElapsedTimer());
  return () => t.elapsed;
}

export const frequencyTimerSource =
  (frequency: number): TimerSource =>
  () =>
    frequencyTimer(frequency, msElapsedTimer());

/**
 * Wraps a timer, returning a relative elapsed value.
 *
 * ```js
 * let t = relativeTimer(1000, msElapsedTimer());
 *
 * t.isDone;  // true if total has elapsed
 * t.reset(); // reset timer to 0
 * t.elapsed; // 0..1 scale of how close to completion
 * ```
 *
 * Use `relativeTimerMs` if you want to have a millisecond-based total
 * @private
 * @param total Total
 * @param timer Timer
 * @param clampValue If true, returned value never exceeds 1.0
 * @returns Timer
 */
export const relativeTimer = (
  total: number,
  timer: Timer,
  clampValue = true
): ModTimer & HasCompletion => {
  //eslint-disable-next-line functional/no-let
  let done = false;
  //eslint-disable-next-line functional/no-let
  let modAmt = 1;

  return {
    mod(amt: number) {
      modAmt = amt;
    },
    get isDone() {
      return done;
    },
    reset: () => {
      done = false;
      timer.reset();
    },
    get elapsed() {
      //eslint-disable-next-line functional/no-let
      let v = timer.elapsed / (total * modAmt);
      if (clampValue) v = clamp(v);
      if (v >= 1) done = true;
      return v;
    },
  };
};

/**
 * Wraps a timer, returning a relative elapsed value.
 *
 * ```js
 * // Timer that counts to 1,000 milliseconds
 * let t = relativeTimerMs(1000);
 *
 * t.isDone;  // true if total milliseconds has elapsed
 * t.reset(); // reset timer to 0
 * t.elapsed; // 0..1 scale of how close to completion
 * ```
 * @param total Total
 * @param timer Timer
 * @param clampValue If true, returned value never exceeds 1.0
 * @returns Timer
 */
export const relativeTimerMs = (total: number, clampValue = true) =>
  relativeTimer(total, msElapsedTimer(), clampValue);

/**
 * Wraps a tick-based 'timer', returning a relative value (0..1).
 * A value of 1 indicates the timer has completed.
 *
 * ```js
 * // Timer that counts 20 ticks
 * let t = relativeTimerTicks(20);
 *
 * t.isDone;  // true if total ticks has elapsed
 * t.reset(); // reset timer to 0
 * t.elapsed; // 0..1 scale of how close to completion
 * ```
 *
 * Example:
 * ```js
 * const t = relativeTimerTicks(10);
 * while (!t.isDone) {
 *  const progress = t.elapsed;
 *  // Yields: 0.1, 0.2, ... 1
 * }
 * ```
 * @param total
 * @param clampValue
 * @returns
 */
export const relativeTimerTicks = (total: number, clampValue = true) =>
  relativeTimer(total, ticksElapsedTimer(), clampValue);

/**
 * A timer based on frequency: cycles per unit of time. These timers return a number from
 * 0..1 indicating position with a cycle.
 *
 * In practice, timers are used to 'drive' something like an Oscillator.
 *
 * @example Init a spring oscillator, with a half a cycle per second
 * ```js
 * import { Oscillators } from "https://unpkg.com/ixfx/dist/modulation.js"
 * import { frequencyTimer } from "https://unpkg.com/ixfx/dist/flow.js"
 * Oscillators.spring({}, frequencyTimer(0.5));
 * ```
 *
 * By default it uses elapsed clock time as a basis for frequency. ie., cycles per second.
 *
 * It returns a `ModTimer`, which allows for a modulation amount to be continually applied
 * to the calculation of the 'position' within a cycle.
 *
 * @example Prints around 0/0.5 each second, as timer is half a cycle per second
 * ```js
 * import { frequencyTimer } from "https://unpkg.com/ixfx/dist/flow.js"
 * const t = frequencyTimer(0.5);
 * setInterval(() => {
 *  console.log(t.elapsed);
 * }, 1000);
 * ```
 * @param frequency
 * @param timer
 * @returns
 */
export const frequencyTimer = (
  frequency: number,
  timer: Timer = msElapsedTimer()
): ModTimer => {
  const cyclesPerSecond = frequency / 1000;
  //eslint-disable-next-line functional/no-let
  let modAmt = 1;
  return {
    mod: (amt: number) => {
      modAmt = amt;
    },
    reset: () => {
      timer.reset();
    },
    get elapsed() {
      // Get position in a cycle
      const v = timer.elapsed * (cyclesPerSecond * modAmt);

      // Get fractional part
      const f = v - Math.floor(v);
      if (f < 0) {
        throw new Error(
          `Unexpected cycle fraction less than 0. Elapsed: ${v} f: ${f}`
        );
      }
      if (f > 1) {
        throw new Error(
          `Unexpected cycle fraction more than 1. Elapsed: ${v} f: ${f}`
        );
      }
      return f;
    },
  };
};

/**
 * A timer that uses clock time
 * @private
 * @returns {Timer}
 */
export const msElapsedTimer = (): Timer => {
  // eslint-disable-next-line functional/no-let
  let start = performance.now();
  return {
    reset: () => {
      start = performance.now();
    },
    get elapsed() {
      return performance.now() - start;
    },
  };
};

/**
 * A timer that progresses with each call to `elapsed`.
 *
 * The first call to elapsed will return 1.
 * @private
 * @returns {Timer}
 */
export const ticksElapsedTimer = (): Timer => {
  // eslint-disable-next-line functional/no-let
  let start = 0;
  return {
    reset: () => {
      start = 0;
    },
    get elapsed() {
      return ++start;
    },
  };
};
