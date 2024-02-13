import { clamp } from '../data/Clamp.js';
import { type HasCompletion } from './index.js';

/**
 * Creates a timer
 */
export type TimerSource = () => Timer;

/**
 * A timer instance.
 * See {@link msElapsedTimer}, {@link ticksElapsedTimer}, {@link frequencyTimer}
 */
export type Timer = {
  reset(): void;
  get elapsed(): number;
};

export type ModulationTimer = Timer & {
  mod(amt: number): void;
};

export type TimerOpts = {
  /**
   * Timer to use. By default {@link msElapsedTimer}.
   */
  readonly timer?: Timer;
};

/**
 * Options for relative timer
 */
export type RelativeTimerOpts = TimerOpts & {
  /**
   * If true, returned value will be clamped to 0..1. False by default
   */
  readonly clampValue?: boolean
  readonly wrapValue?: boolean
};

/**
 * Returns a function that returns true if timer is complete
 *
 * ```js
 * const timer = hasElapsedMs(1000);
 * timer(); // Returns true if timer is done
 * ```
 *
 * See also {@link Elapsed.progress}.
 * @param totalMs
 * @returns
 */
export function hasElapsedMs(totalMs: number): () => boolean {
  const t = relativeTimer(totalMs, { timer: msElapsedTimer() });
  return () => t.isDone;
}

export const frequencyTimerSource =
  (frequency: number): TimerSource =>
    () =>
      frequencyTimer(frequency, { timer: msElapsedTimer() });

/**
 * Wraps a timer, returning a relative elapsed value based on
 * a given total. ie. percentage complete toward a total duration.
 *
 * If no timer is specified, milliseconds-based timer is used.
 *
 * ```js
 * const t = relativeTimer(1000);
 * t.isDone;
 * t.reset();
 * t.elapsed;
 * ```
 *
 * With options
 * ```js
 * // Total duration of 1000 ticks
 * const t = relativeTimer(1000, { timer: ticksElapsedTimer(); clampValue:true });
 *
 * t.isDone;  // true if total has elapsed
 * t.reset(); // reset timer to 0
 * t.elapsed; // 0..1 scale of how close to completion
 * ```
 *
 * @private
 * @param total Total
 * @param opts Options
 * @returns Timer
 */
export const relativeTimer = (
  total: number,
  opts: RelativeTimerOpts = {}
): ModulationTimer & HasCompletion => {
  const timer = opts.timer ?? msElapsedTimer();
  const clampValue = opts.clampValue ?? false;
  const wrapValue = opts.wrapValue ?? false;
  if (clampValue && wrapValue) throw new Error(`clampValue and wrapValue cannot both be enabled`);

  //eslint-disable-next-line functional/no-let
  let done = false;
  //eslint-disable-next-line functional/no-let
  let modulationAmount = 1;

  return {
    mod(amt: number) {
      modulationAmount = amt;
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
      let v = timer.elapsed / (total * modulationAmount);
      if (clampValue) v = clamp(v);
      else if (wrapValue) {
        if (v >= 1) v = v % 1;
      } else {
        if (v >= 1) done = true;
      }
      return v;
    },
  };
};

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
 * It returns a `ModulationTimer`, which allows for a modulation amount to be continually applied
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
  opts: TimerOpts = {}
): ModulationTimer => {
  const timer = opts.timer ?? msElapsedTimer();
  const cyclesPerSecond = frequency / 1000;
  //eslint-disable-next-line functional/no-let
  let modulationAmount = 1;
  return {
    mod: (amt: number) => {
      modulationAmount = amt;
    },
    reset: () => {
      timer.reset();
    },
    get elapsed() {
      // Get position in a cycle
      const v = timer.elapsed * (cyclesPerSecond * modulationAmount);

      // Get fractional part
      const f = v - Math.floor(v);
      if (f < 0) {
        throw new Error(
          `Unexpected cycle fraction less than 0. Elapsed: ${ v } f: ${ f }`
        );
      }
      if (f > 1) {
        throw new Error(
          `Unexpected cycle fraction more than 1. Elapsed: ${ v } f: ${ f }`
        );
      }
      return f;
    },
  };
};

/**
 * A timer that uses clock time. Start time is from the point of invocation.
 *
 * ```js
 * const t = msElapsedTimer();
 * t.reset(); // reset start
 * t.elapsed; // ms since start
 * ```
 * @returns {Timer}
 * @see {ticksElapsedTimer}
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
 *
 * ```js
 * const timer = ticksElapsedTimer();
 * timer.reset(); // Reset to 0
 * timer.elapsed; // Number of ticks
 * ```
 * @returns {Timer}
 * @see {msElapsedTimer}
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
