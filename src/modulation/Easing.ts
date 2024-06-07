// Easings from https://easings.net/
import { msElapsedTimer, relativeTimer, ticksElapsedTimer, type TimerSource } from '../flow/Timer.js';
import { interpolate } from '../data/Interpolate.js';
import type { HasCompletion } from '../flow/Types.js';


const sqrt = Math.sqrt;
const pow = Math.pow;
const cos = Math.cos;
//eslint-disable-next-line @typescript-eslint/naming-convention
const pi = Math.PI;
const sin = Math.sin;
/*
type RelativeTimer = {
  reset(): void
  elapsed(): number
  isDone(): boolean
}

type TimerSource = (upperBound: number) => RelativeTimer;

const msRelativeTimer = function (upperBound: number): RelativeTimer {
  let start = performance.now();
  return {
    reset: () => {
      start = performance.now();
    },
    elapsed: () => clamp((performance.now() - start) / upperBound),
    isDone: () => (performance.now() - start) >= upperBound,
  };
};

const tickRelativeTimer = function (upperBound: number): RelativeTimer {
  let start = 0;
  return {
    reset: () => {
      start = 0;
    },
    elapsed: () => clamp(start++ / upperBound),
    isDone: () => start >= upperBound,
  };
};
*/

// eslint-disable-next-line unicorn/prevent-abbreviations
export type EasingFn = (x: number) => number;

/**
 * Creates an easing based on clock time. Time
 * starts being counted when easing function is created.
 * @example Time based easing
 * ```
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const t = Easings.time(`quintIn`, 5*1000); // Will take 5 seconds to complete
 * ...
 * t.compute(); // Get current value of easing
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * @param nameOrFunction Name of easing, or an easing function
 * @param durationMs Duration in milliseconds
 * @returns Easing
 */
export const time = function (
  nameOrFunction: EasingName | EasingFn,
  durationMs: number
): Easing {
  return create(nameOrFunction, durationMs, msElapsedTimer);
};

/**
 * Creates an easing based on ticks
 *
 * @example Tick-based easing
 * ```
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const t = Easings.tick(`sineIn`, 1000);   // Will take 1000 ticks to complete
 * t.compute(); // Each call to `compute` progresses the tick count
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * @param nameOrFn Name of easing, or an easing function
 * @param durationTicks Duration in ticks
 * @returns Easing
 */
export const tick = function (
  nameOrFunction: EasingName | EasingFn,
  durationTicks: number
): Easing {
  return create(nameOrFunction, durationTicks, ticksElapsedTimer);
};

/**
 * 'Ease' from `0` to `1` over a delicious curve. Commonly used for animation
 * and basic modelling of phyical motion.
 *
 * Create via {@link tick} or {@link time}, call `compute` to calculate the next
 * value in the progression, until you reach `1` or `isDone` returns true.
 *
 */
export type Easing = HasCompletion & {
  /**
   * Computes the current value of the easing
   *
   * @returns {number}
   */
  compute(): number;

  /**
   * Reset the easing
   */
  reset(): void;
  /**
   * Returns true if the easing is complete
   *
   * @returns {boolean}
   */
  get isDone(): boolean;
};

/**
 * Creates a new easing by name
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const e = Easings.create(`circInOut`, 1000, msElapsedTimer);
 * ```
 * @param nameOrFn Name of easing, or an easing function
 * @param duration Duration (meaning depends on timer source)
 * @param timerSource Timer source. Eg {@link tickRelativeTimer}, {@link msRelativeTimer}
 * @returns
 */
const create = function (
  nameOrFunction: EasingName | EasingFn,
  duration: number,
  timerSource: TimerSource
): Easing {
  const fn = typeof nameOrFunction === `function` ? nameOrFunction : get(nameOrFunction);
  if (fn === undefined) {
    const error = typeof nameOrFunction === `string` ? new Error(`Easing function not found: ${ nameOrFunction }`) : new Error(`Easing function not found`);
    throw error;
  }

  // Get a relative version of timer
  const timer = relativeTimer(duration, {
    timer: timerSource(),
    clampValue: true,
  });
  let startCount = 1;

  return {
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
      const relative = timer.elapsed;
      return fn(relative);
    },
    reset: () => {
      timer.reset();
      startCount++;
    },
  };
};

/**
 * Creates an easing function using a simple cubic bezier defined by two points.
 *
 * Eg: https://cubic-bezier.com/#0,1.33,1,-1.25
 *  a:0, b: 1.33, c: 1, d: -1.25
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * // Time-based easing using bezier
 * const e = Easings.time(fromCubicBezier(1.33, -1.25), 1000);
 * e.compute();
 * ```
 * @param b
 * @param d
 * @param t
 * @returns Value
 */
export const fromCubicBezier =
  (b: number, d: number): EasingFn =>
    (t: number) => {
      const s = 1 - t;
      const s2 = s * s;
      const t2 = t * t;
      const t3 = t2 * t;
      return 3 * b * s2 * t + 3 * d * s * t2 + t3;
    };

/**
 * Returns a mix of two easing functions.
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * // Get a 50/50 mix of two easing functions at t=0.25
 * Easings.mix(0.5, 0.25, Easings.functions.sineIn, Easings.functions.sineOut);
 *
 * // 10% of sineIn, 90% of sineOut
 * Easings.mix(0.90, 0.25, Easings.functions.sineIn, Easings.functions.sineOut);
 * ```
 * @param amt 'Progress' value passed to the easing functions
 * @param balance Mix between a and b
 * @param easingA
 * @param easingB
 * @returns Numeric value
 */
export const mix = (
  amt: number,
  balance: number,
  easingA: EasingFn,
  easingB: EasingFn
) => interpolate(balance, easingA(amt), easingB(amt));

/**
 * Returns a 'crossfade' of two easing functions, synchronised with the progress through the easing. That is:
 * * 0.0 will yield 100% of easingA at its `easing(0)` value.
 * * 0.2 will yield 80% of a, 20% of b, with both at their `easing(0.2)` values
 * * 0.5 will yield 50% of both functions both at their `easing(0.5)` values
 * * 0.8 will yield 20% of a, 80% of a, with both at their `easing(0.8)` values
 * * 1.0 will yield 100% of easingB at its `easing(1)` value.
 *
 * So easingB will only ever kick in at higher `amt` values and `easingA` will only be present in lower valus.
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * Easings.crossFade(0.5, Easings.functions.sineIn, Easings.functions.sineOut);
 * ```
 * @param amt
 * @param easingA
 * @param easingB
 * @returns Numeric value
 */
export const crossfade = (amt: number, easingA: EasingFn, easingB: EasingFn) =>
  mix(amt, amt, easingA, easingB);

/**
 * Easing name
 */
export type EasingName = keyof typeof functions;

/**
 * Returns an easing function by name, or _undefined_ if not found.
 * This is a manual way of working with easing functions. If you want to
 * ease over time or ticks, use `Flow.Timer.msElapsedTimer` or `Flow.Timer.ticksElapsedTimer`.
 *
 * ```js
 * const fn = Easings.get(`sineIn`);
 * // Returns 'eased' transformation of 0.5
 * fn(0.5);
 * ```
 *
 * This function is useful if trying to resolve an easing by string. If you
 * know in advance what easing to use, you could also access it via
 * `Easings.functions.NAME`, eg `Easings.functions.sineIn`.
 * @param easingName eg `sineIn`
 * @returns Easing function
 */
export const get = function (easingName: EasingName): EasingFn | undefined {
  if (easingName === null) throw new Error(`easingName is null`);
  if (easingName === undefined) throw new Error(`easingName is undefined`);
  const name = easingName.toLocaleLowerCase();
  const found = Object.entries(functions).find(
    ([ k, _v ]) => k.toLocaleLowerCase() === name
  );

  if (found === undefined) return found;
  return found[ 1 ];
};

/**
 * Iterate over available easings.
 * @private
 * @returns Returns list of available easing names
 */
export function* getEasings(): Iterable<string> {
  yield* Object.keys(functions);
};

/**
 * Returns a roughly gaussian easing function
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const fn = Easings.gaussian();
 * ```
 *
 * Try different positive and negative values for `stdDev` to pinch
 * or flatten the bell shape.
 * @param standardDeviation
 * @returns
 */
export const gaussian = (standardDeviation = 0.4): EasingFn => {
  const a = 1 / sqrt(2 * pi);
  const mean = 0.5;

  return (t: number) => {
    const f = a / standardDeviation;
    // p:-8 pinched
    //eslint-disable-next-line functional/no-let
    let p = -2.5; // -1/1.25;
    //eslint-disable-next-line functional/no-let
    let c = (t - mean) / standardDeviation;
    c *= c;
    p *= c;
    const v = f * pow(Math.E, p); // * (2/pi);//0.62;
    if (v > 1) return 1;
    if (v < 0) return 0;

    //if (v >1) console.log(v);
    //if (v < 0) console.log(v);
    return v;
  };
};

const bounceOut = function (x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
    return n1 * x * x;
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984_375;
  }
};

const quintIn = (x: number): number => x * x * x * x * x;
const quintOut = (x: number): number => 1 - pow(1 - x, 5);
const arch = (x: number): number => x * (1 - x) * 4;

/**
 * Weighted average
 * 
 * `slowDownFactor` 
 * @param currentValue 
 * @param targetValue 
 * @param slowDownFactor 
 * @returns 
 */
export const weightedAverage = (currentValue: number, targetValue: number, slowDownFactor: number) => {
  return ((currentValue * (slowDownFactor - 1)) + targetValue) / slowDownFactor
}

export const functions = {
  smoothstep: (x: number): number => x * x * (3 - 2 * x),
  smootherstep: (x: number): number => (x * (x * 6 - 15) + 10) * x * x * x,
  arch,
  bell: gaussian(),
  sineIn: (x: number): number => 1 - cos((x * pi) / 2),
  sineOut: (x: number): number => sin((x * pi) / 2),
  quadIn: (x: number): number => x * x,
  quadOut: (x: number): number => 1 - (1 - x) * (1 - x),
  sineInOut: (x: number): number => -(cos(pi * x) - 1) / 2,
  quadInOut: (x: number): number =>
    x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2,
  cubicIn: (x: number): number => x * x * x,
  cubicOut: (x: number): number => 1 - pow(1 - x, 3),
  quartIn: (x: number): number => x * x * x * x,
  quartOut: (x: number): number => 1 - pow(1 - x, 4),
  quintIn,
  quintOut, //: (x: number): number => 1 - pow(1 - x, 5),
  expoIn: (x: number): number => (x === 0 ? 0 : pow(2, 10 * x - 10)),
  expoOut: (x: number): number => (x === 1 ? 1 : 1 - pow(2, -10 * x)),
  quintInOut: (x: number): number =>
    x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2,
  expoInOut: (x: number): number =>
    x === 0
      ? 0
      : x === 1
        ? 1
        // eslint-disable-next-line unicorn/no-nested-ternary
        : x < 0.5
          ? pow(2, 20 * x - 10) / 2
          : (2 - pow(2, -20 * x + 10)) / 2,
  circIn: (x: number): number => 1 - sqrt(1 - pow(x, 2)),
  circOut: (x: number): number => sqrt(1 - pow(x - 1, 2)),
  backIn: (x: number): number => {
    const c1 = 1.701_58;
    const c3 = c1 + 1;

    return c3 * x * x * x - c1 * x * x;
  },
  backOut: (x: number): number => {
    const c1 = 1.701_58;
    const c3 = c1 + 1;

    return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
  },
  circInOut: (x: number): number =>
    x < 0.5
      ? (1 - sqrt(1 - pow(2 * x, 2))) / 2
      : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2,
  backInOut: (x: number): number => {
    const c1 = 1.701_58;
    const c2 = c1 * 1.525;

    return x < 0.5
      ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
  },
  elasticIn: (x: number): number => {
    const c4 = (2 * pi) / 3;

    return x === 0
      ? 0
      : (x === 1
        ? 1
        : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4));
  },
  elasticOut: (x: number): number => {
    const c4 = (2 * pi) / 3;

    return x === 0
      ? 0
      : (x === 1
        ? 1
        : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1);
  },
  bounceIn: (x: number): number => 1 - bounceOut(1 - x),
  bounceOut: bounceOut,
  elasticInOut: (x: number): number => {
    const c5 = (2 * pi) / 4.5;

    return x === 0
      ? 0
      : x === 1
        ? 1
        // eslint-disable-next-line unicorn/no-nested-ternary
        : x < 0.5
          ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
          : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
  },
  bounceInOut: (x: number): number =>
    x < 0.5 ? (1 - bounceOut(1 - 2 * x)) / 2 : (1 + bounceOut(2 * x - 1)) / 2,
};
