import { clamp } from '../data/Clamp.js';
import { intervalToMs, type Interval } from './index.js';

/**
 * Creates a timer
 */
export type TimerSource = () => Timer;

/**
 * A timer instance.
 * See {@link msElapsedTimer}, {@link ticksElapsedTimer}, {@link frequencyTimer}
 */
export type Timer = {
  reset(): void
  get elapsed(): number
  get isDone(): boolean
};

export type ModulationTimer = Timer & {
  mod(amt: number): void;
};

export type TimerOpts = {
  /**
   * Timer to use. By default {@link msElapsedTimer}.
   */
  readonly timer: Timer;
};

/**
 * Options for relative timer
 */
export type RelativeTimerOpts = TimerOpts & {
  /**
   * If true, returned value will be clamped to 0..1. False by default
   */
  readonly clampValue: boolean
  readonly wrapValue: boolean
};

/**
 * A function that returns _true_ when an interval has elapsed
 *
 * ```js
 * const oneSecond = hasElapsed(1000);
 * oneSecond(); // Returns _true_ when timer is done
 * ```
 *
 * See also {@link Elapsed.progress}.
 * @param elapsed
 * @returns
 */
export function hasElapsed(elapsed: Interval): () => boolean {
  const t = relativeTimer(intervalToMs(elapsed, 0), { timer: msElapsedTimer() });
  return () => t.isDone;
}

export const frequencyTimerSource =
  (frequency: number): TimerSource =>
    () =>
      frequencyTimer(frequency, { timer: msElapsedTimer() });

/**
 * Wraps a timer, returning a relative elapsed value based on
 * a given total. ie. percentage complete toward a total duration.
 * This is useful because other parts of code don't need to know
 * about the absolute time values, you get a nice relative completion number.
 *
 * If no timer is specified, milliseconds-based timer is used.
 *
 * ```js
 * const t = relativeTimer(1000);
 * t.elapsed;   // returns % completion (0...1)
 * ```
 * 
 * Additional fields/methods on the timer:
 * ```js
 * t.isDone;  // _true_ if .elapsed has reached 1
 * t.reset(); // start from zero again
 * ```
 *
 * With options
 * ```js
 * // Total duration of 1000 ticks
 * const t = relativeTimer(1000, { timer: ticksElapsedTimer(); clampValue:true });
 * ```
 *
 * @private
 * @param total Total
 * @param opts Options
 * @returns Timer
 */
export const relativeTimer = (
  total: number,
  opts: Partial<RelativeTimerOpts> = {}
): ModulationTimer => {

  const clampValue = opts.clampValue ?? false;
  const wrapValue = opts.wrapValue ?? false;
  if (clampValue && wrapValue) throw new Error(`clampValue and wrapValue cannot both be enabled`);

  let modulationAmount = 1;

  // Create and starts timer
  const timer = opts.timer ?? msElapsedTimer();

  const computeElapsed = () => {
    let v = timer.elapsed / (total * modulationAmount);
    if (clampValue) v = clamp(v);
    else if (wrapValue && v >= 1) v = v % 1;
    return v;
  }

  return {
    mod(amt: number) {
      modulationAmount = amt;
    },
    get isDone() {
      return computeElapsed() >= 1;
    },
    get elapsed() {
      return computeElapsed();
    },
    reset: () => {
      timer.reset();
    }
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
  opts: Partial<TimerOpts> = {}
): ModulationTimer => {
  const timer = opts.timer ?? msElapsedTimer();
  const cyclesPerSecond = frequency / 1000;
  let modulationAmount = 1;

  const computeElapsed = () => {
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
  }
  return {
    mod: (amt: number) => {
      modulationAmount = amt;
    },
    reset: () => {
      timer.reset();
    },
    get isDone() {
      return computeElapsed() >= 1;
    },
    get elapsed() {
      return computeElapsed();
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
 * 
 * Like other {@link Timer} functions, it returns a `isDone` property,
 * but this will always return _true_.
 * @returns {Timer}
 * @see {ticksElapsedTimer}
 */
export const msElapsedTimer = (): Timer => {
  let start = performance.now();
  return {
    /**
     * Reset timer
     */
    reset: () => {
      start = performance.now();
    },
    /**
     * Returns elapsed time since start
     */
    get elapsed() {
      return performance.now() - start;
    },
    /**
     * Always returns _true_
     */
    get isDone() {
      return false;
    }
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
 * timer.elapsed; // Number of ticks (and also increment ticks)
 * ```
 * 
 * Like other {@link Timer} functions, returns with a `isDone` field,
 * but this will always return _true_.
 * @returns {Timer}
 * @see {msElapsedTimer}
 */
export const ticksElapsedTimer = (): Timer => {
  // eslint-disable-next-line functional/no-let
  let start = 0;
  return {
    /**
     * Reset ticks to 0. The next call to `elapsed` will return 1.
     */
    reset: () => {
      start = 0;
    },
    /**
     * Returns the number of elapsed ticks as well as
     * incrementing the tick count. 
     * 
     * Minimum is 1
     */
    get elapsed() {
      return ++start;
    },
    /**
     * Always returns _true_
     */
    get isDone() {
      return true;
    }
  };
};
