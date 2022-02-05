// Easings from https://easings.net/
import {HasCompletion} from '~/Interfaces.js';
import {msElapsedTimer, relativeTimer, ticksElapsedTimer, TimerSource} from '~/Timer.js';

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

type EasingFn = (x: number) => number;

/**
 * Creates an easing based on clock time
 * @inheritdoc Easing
 * @example Time based easing
 * ```
 * const t = timer(`easeIn`, 5*1000); // Will take 5 seconds to complete
 * ...
 * t.compute(); // Get current value of easing
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * @param name Name of easing
 * @param durationMs Duration in milliseconds
 * @returns Easing
 */
export const easeOverTime = function (name: EasingName, durationMs: number):Easing {
  return create(name, durationMs, msElapsedTimer);
};

/**
 * Creates an easing based on ticks
 * 
 * @inheritdoc Easing
 * @example Tick-based easing
 * ```
 * const t = tick(`easeOut`, 1000);   // Will take 1000 ticks to complete
 * t.compute(); // Each call to `compute` progresses the tick count
 * t.reset();   // Reset to 0
 * t.isDone;    // _True_ if finished
 * ```
 * @param name Name of easing
 * @param durationTicks Duration in ticks
 * @returns Easing
 */
export const easeOverTicks = function (name: EasingName, durationTicks: number):Easing {
  return create(name, durationTicks, ticksElapsedTimer);
};

/**
 * 'Ease' from `0` to `1` over a delicious curve. Used commonly for animation
 * and basic modelling of phyical motion. 
 * 
 * Create via {@link easeOverTicks} or {@link easeOverTime}, call `compute` to calculate the next
 * value in the progression, until you reach `1` or `isDone` returns true.
 * 
 * For [demos of functions](https://easings.net/)
 * 
 */
export type Easing = HasCompletion & {
/**
 * Computes the current value of the easing
 *
 * @returns {number}
 */
  compute(): number

/**
 * Reset the easing
 */
  reset(): void
/**
 * Returns true if the easing is complete
 *
 * @returns {boolean}
 */
  get isDone(): boolean
};

/**
 * Creates a new easing by name
 *
 * @param name Name of easing
 * @param duration Duration (meaning depends on timer source)
 * @param timerSource Timer source. Eg {@link tickRelativeTimer}, {@link msRelativeTimer}
 * @returns
 */
const create = function (name: EasingName, duration: number, timerSource: TimerSource): Easing {
  const fn = resolveEasing(name);

  // Get a relative version of timer
  const timer = relativeTimer(duration, timerSource(), true);

  return {
    get isDone() {
      return timer.isDone;
    },
    compute: () => {
      const relative = timer.elapsed;
      return fn(relative);
    },
    reset: () => {
      timer.reset();
    }
  };
};

export type EasingName = keyof typeof easings;

const resolveEasing = function (name: string): EasingFn {
  name = name.toLocaleLowerCase();
  const found = Object
    .entries(easings)
    .find(([k, _v]) => k.toLocaleLowerCase() === name);

  if (found === undefined) throw new Error(`Easing '${name}' not found.`);
  return found[1];
};

/**
 * @private
 * @returns Returns list of available easing names
 */
export const getEasings = function ():readonly string[] {
  return Array.from(Object.keys(easings));
};

const easeOutBounce = function (x:number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
    return n1 * x * x;
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
};

const easings = {
  easeInSine: (x: number): number => 1 - cos((x * pi) / 2),
  easeOutSine: (x: number): number => sin((x * pi) / 2),
  easeInQuad: (x: number): number => x * x,
  easeOutQuad: (x: number): number => 1 - (1 - x) * (1 - x),
  easeInOutSine: (x: number): number => -(cos(pi * x) - 1) / 2,
  easeInOutQuad: (x: number): number => (x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2),
  easeInCubic: (x: number): number => x * x * x,
  easeOutCubic: (x: number): number => 1 - pow(1 - x, 3),
  easeInQuart: (x: number): number => x * x * x * x,
  easeOutQuart: (x: number): number => 1 - pow(1 - x, 4),
  easeInQuint: (x: number): number => x * x * x * x * x,
  easeOutQuint: (x: number): number => 1 - pow(1 - x, 5),
  easeInExpo: (x: number): number => (x === 0 ? 0 : pow(2, 10 * x - 10)),
  easeOutExpo: (x: number): number => (x === 1 ? 1 : 1 - pow(2, -10 * x)),
  easeInOutQuint: (x: number): number => (x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2),
  easeInOutExpo: (x: number): number => (x === 0
    ? 0
    : x === 1
      ? 1
      : x < 0.5 ? pow(2, 20 * x - 10) / 2
        : (2 - pow(2, -20 * x + 10)) / 2),
  easeInCirc: (x: number): number => 1 - sqrt(1 - pow(x, 2)),
  easeOutCirc: (x: number): number => sqrt(1 - pow(x - 1, 2)),
  easeInBack: (x: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return c3 * x * x * x - c1 * x * x;
  },
  easeOutBack: (x: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
  },
  easeInOutCirc: (x: number): number => (x < 0.5
    ? (1 - sqrt(1 - pow(2 * x, 2))) / 2
    : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2),
  easeInOutBack: (x: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;

    return x < 0.5
      ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
      : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
  },
  easeInElastic: (x: number): number => {
    const c4 = (2 * pi) / 3;

    return x === 0
      ? 0
      : x === 1
        ? 1
        : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4);
  },
  easeOutElastic: (x: number): number => {
    const c4 = (2 * pi) / 3;

    return x === 0
      ? 0
      : x === 1
        ? 1
        : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
  },
  easeInBounce: (x: number): number => 1 - easeOutBounce(1 - x),
  easeOutBounce: easeOutBounce,
  easeInOutElastic: (x: number): number => {
    const c5 = (2 * pi) / 4.5;

    return x === 0
      ? 0
      : x === 1
        ? 1
        : x < 0.5
          ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
          : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
  },
  easeInOutBounce: (x: number): number => (x < 0.5
    ? (1 - easeOutBounce(1 - 2 * x)) / 2
    : (1 + easeOutBounce(2 * x - 1)) / 2)
};