import { clamp } from '../numbers/Clamp.js';
import { intervalToMs, type Interval } from './IntervalType.js';
import type { HasCompletion } from './Types.js';

/**
 * Creates a timer
 */
export type TimerSource = () => Timer;

/**
 * A timer instance.
 * {@link CompletionTimer} also contains an 'isDone' field.
 * 
 * Implementations: {@link elapsedMillisecondsAbsolute}, {@link elapsedTicksAbsolute}, {@link frequencyTimer}
 */
export type Timer = {
  reset(): void
  get elapsed(): number
};

/**
 * A {@link Timer} that has a sense of completion, when `isDone` returns _true_.
 * See {@link relative}
 */
export type CompletionTimer = Timer & {
  /**
   * Returns _true_ if this timer has completed.
   */
  get isDone(): boolean
}

export type ModulationTimer = CompletionTimer & {
  mod(amt: number): void;
};


export type TimerOpts = {
  /**
   * Timer to use. By default {@link elapsedMillisecondsAbsolute}.
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
 * import { hasElapsed } from "https://unpkg.com/ixfx/dist/flow.js"
 * const oneSecond = hasElapsed(1000);
 * 
 * // Keep calling to check if time has elapsed.
 * // Will return _true_ when it has
 * oneSecond();
 * ```
 * 
 * @param elapsed
 * @returns
 */
export function hasElapsed(elapsed: Interval): () => boolean {
  const t = relative(intervalToMs(elapsed, 0), { timer: elapsedMillisecondsAbsolute(), clampValue: true });
  return () => t.isDone;
}

// export const frequencyTimerSource =
//   (frequency: number): TimerSource =>
//     () =>
//       frequencyTimer(frequency, { timer: elapsedMillisecondsAbsolute() });

/**
 * Returns a function that returns the percentage of timer completion.
 * Starts when return function is first invoked.
 *
 * ```js
 * import * as Flow from "https://unpkg.com/ixfx/dist/flow.js"
 * const timer = Flow.ofTotal(1000);
 * 
 * // Call timer() to find out the completion
 * timer(); // Returns 0..1
 * ```
 *
 * Note that timer can exceed 1 (100%). To cap it:
 * ```js
 * Flow.ofTotal(1000, { clampValue: true });
 * ```
 *
 * Takes an {@link Interval} for more expressive time:
 * ```js
 * const timer = Flow.ofTotal({ mins: 4 });
 * ```
 * 
 * Is a simple wrapper around {@link relative}.
 * @param duration
 * @see {@link ofTotalTicks} - Use ticks instead of time
 * @see {@link hasElapsed} - Simple _true/false_ if interval has elapsed
 * @returns
 */
export function ofTotal(
  duration: Interval,
  opts: { readonly clampValue?: boolean, readonly wrapValue?: boolean } = {}
): () => number {
  const totalMs = intervalToMs(duration);
  if (!totalMs) throw new Error(`Param 'duration' not valid`);
  const timerOpts = {
    ...opts,
    timer: elapsedMillisecondsAbsolute(),
  };
  let t: ModulationTimer | undefined;
  return () => {
    if (!t) {
      t = relative(totalMs, timerOpts);
    }
    return t.elapsed;
  }
}

/**
 * Returns a function that returns the percentage of timer completion.
 * Uses 'ticks' as a measure. Use {@link ofTotal} if you want time-based.
 *
 * ```js
 * import * as Flow from "https://unpkg.com/ixfx/dist/flow.js"
 * const timer = Flow.ofTotalTicks(1000);
 * timer(); // Returns 0..1
 * ```
 *
 * Note that timer can exceed 1 (100%). To cap it:
 * ```js
 * Flow.ofTotalTicks(1000, { clampValue: true });
 * ```
 *
 * This is a a simple wrapper around {@link relative}.
 * @see {@link ofTotal}
 * @see {@link hasElapsed}: Simple _true/false_ if interval has elapsed
 * @param totalTicks
 * @returns
 */
export function ofTotalTicks(totalTicks: number, opts: { readonly clampValue?: boolean, readonly wrapValue?: boolean } = {}
): () => number {
  const timerOpts = {
    ...opts,
    timer: elapsedTicksAbsolute(),
  };
  let t: ModulationTimer | undefined;
  return () => {
    if (!t) {
      t = relative(totalTicks, timerOpts);
    }
    return t.elapsed;
  }
}

/**
 * Returns a {@link ModulationTimer} that is always at 100%.
 * Opposite: {@link timerNeverDone}.
 * @returns 
 */
export const timerAlwaysDone = (): ModulationTimer => ({
  elapsed: 1,
  isDone: true,
  reset() {

  },
  mod(amt) {

  },
})

/**
 * Returns a {@link ModulationTimer} that is always at 0%.
 * Opposite: {@link timerAlwaysDone}.
 * @returns 
 */
export const timerNeverDone = (): ModulationTimer => (
  {
    elapsed: 0,
    isDone: false,
    reset() {

    },
    mod() {

    }
  }
);

/**
 * Wraps a timer, returning a relative elapsed value based on
 * a given total. ie. percentage complete toward a total value.
 * This is useful because other parts of code don't need to know
 * about the absolute time values, you get a nice relative completion number.
 *
 * If no timer is specified, a milliseconds-based timer is used.
 *
 * ```js
 * const t = relative(1000);
 * t.elapsed;   // returns % completion (0...1)
 * ```
 * It can also use a tick based timer
 * ```js
 * // Timer that is 'done' at 100 ticks
 * const t = relative(100, { timer: ticksElapsedTimer() });
 * ```
 * 
 * Additional fields/methods on the timer instance
 * ```js
 * t.isDone;  // _true_ if .elapsed has reached (or exceeded) 1
 * t.reset(); // start from zero again
 * ```
 *
 * Options:
 * * timer: timer to use. If not specified, `elapsedMillisecondsAbsolute()` is used.
 * * clampValue: if _true_, return value is clamped to 0..1 (default: _false_)
 * * wrapValue: if _true_, return value wraps around continously from 0..1..0 etc. (default: _false_)
 * 
 * Note that `clampValue` and `wrapValue` are mutually exclusive: only one can be _true_, but both can be _false_.
 * 
 * With options
 * ```js
 * // Total duration of 1000 ticks
 * const t = Timer.relative(1000, { timer: ticksElapsedTimer(); clampValue:true });
 * ```
 *
 * If `total` is Infinity, a 'always completed; timer is returned. Use a value of `NaN` for a
 * timer that always returns 0.
 * @private
 * @param total Total (of milliseconds or ticks, depending on timer source)
 * @param options Options
 * @returns Timer
 */
export const relative = (
  total: number,
  options: Partial<RelativeTimerOpts> = {}
): ModulationTimer => {

  if (!Number.isFinite(total)) {
    return timerAlwaysDone()
  } else if (Number.isNaN(total)) {
    return timerNeverDone();
  }

  const clampValue = options.clampValue ?? false;
  const wrapValue = options.wrapValue ?? false;
  if (clampValue && wrapValue) throw new Error(`clampValue and wrapValue cannot both be enabled`);

  let modulationAmount = 1;

  // Create and starts timer
  const timer = options.timer ?? elapsedMillisecondsAbsolute();
  // Keep track of value to avoid over-advancing the tick counter
  let lastValue = 0;
  const computeElapsed = (value: number) => {
    lastValue = value;
    let v = value / (total * modulationAmount);
    if (clampValue) v = clamp(v);
    else if (wrapValue && v >= 1) v = v % 1;
    return v;
  }

  return {
    mod(amt: number) {
      modulationAmount = amt;
    },
    get isDone() {
      //const tmp = computeElapsed();
      //console.log(`Timer.relative ${ tmp } elapsed: ${ timer.elapsed } total: ${ total }`)
      return computeElapsed(lastValue) >= 1;
    },
    get elapsed() {
      return computeElapsed(timer.elapsed);
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
 * @param frequency Cycles
 * @param options Options for timer
 * @returns
 */
export const frequencyTimer = (
  frequency: number,
  options: Partial<TimerOpts> = {}
): ModulationTimer => {
  const timer = options.timer ?? elapsedMillisecondsAbsolute();
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
 * const t = elapsedMillisecondsAbsolute();
 * t.reset(); // reset start
 * t.elapsed; // milliseconds since start
 * ```
 * @returns {Timer}
 * @see {ticksElapsedTimer}
 */
export const elapsedMillisecondsAbsolute = (): Timer => {
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
    }
  };
};

/**
 * A timer that progresses with each call to `elapsed`.
 *
 * The first call to elapsed will return 1.
 *
 * ```js
 * const timer = elapsedTicksAbsolute();
 * timer.reset(); // Reset to 0
 * timer.elapsed; // Number of ticks (and also increment ticks)
 * timer.peek;    // Number of ticks (without incrementing)
 * ```
 * 
 * Like other {@link Timer} functions, returns with a `isDone` field,
 * but this will always return _true_.
 * @returns {Timer}
 * @see {elapsedMillisecondsAbsolute}
 */
export const elapsedTicksAbsolute = (): Timer & { peek: number } => {
  let start = 0;
  return {
    /**
     * Reset ticks to 0. The next call to `elapsed` will return 1.
     */
    reset: () => {
      start = 0;
    },
    /**
     * Get current ticks without incrementing.
     */
    get peek() {
      return start;
    },
    /**
     * Returns the number of elapsed ticks as well as
     * incrementing the tick count. 
     * 
     * Minimum is 1
     * 
     * Use {@link peek} to get the current ticks without incrementing.
     */
    get elapsed() {
      return ++start;
    }
  };
};


/**
 * Wraps `timer`, computing a value for based on its elapsed value.
 * `fn` creates this value.
 * ```js
 * const t = timerWithFunction(v=>v/2, relativeTimer(1000));
 * t.compute();
 * ```
 * 
 * In the above case, `relativeTimer(1000)` creates a timer that goes
 * from 0..1 over one second. `fn` will divide that value by 2, so
 * `t.compute()` will yield values 0..0.5.
 * 
 * @param fn 
 * @param timer 
 * @returns 
 */
export const timerWithFunction = (
  fn: ((v: number) => number),
  timer: CompletionTimer
): HasCompletion & CompletionTimer & { compute: () => number } => {
  if (typeof fn !== `function`) throw new Error(`Param 'fn' should be a function. Got: ${ typeof fn }`);
  let startCount = 1;
  return {
    get elapsed() {
      return timer.elapsed;
    },
    get isDone() {
      return timer.isDone;
    },
    get runState() {
      if (timer.isDone) return `idle`;
      return `scheduled`;
    },
    /**
     * Returns 1 if it has been created, returns +1 for each additional time the timer has been reset.
     */
    get startCount() {
      return startCount;
    },
    get startCountTotal() {
      return startCount;
    },
    compute: () => {
      const elapsed = timer.elapsed;
      return fn(elapsed);
    },
    reset: () => {
      timer.reset();
      startCount++;
    },
  };
};