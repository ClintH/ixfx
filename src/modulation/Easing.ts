// Easings from https://easings.net/
import {clamp} from '../util';

const sqrt = Math.sqrt;
const pow = Math.pow;
const cos = Math.cos;
const PI = Math.PI;
const sin = Math.sin;

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

type EasingFn = (x: number) => number;
/**
 * Creates an easing based on clock time
 *
 * @param {string} easingName Name of easing
 * @param {number} durationMs Duration in milliseconds
 * @returns Easing
 */
export const timer = function (easingName: string, durationMs: number):Easing {
  return create(easingName, durationMs, msRelativeTimer);
};
/**
 * Creates an easing based on ticks
 *
 * @param {string} easingName Name of easing
 * @param {number} durationTicks Duration in ticks
 * @returns {Easing}
 */
export const tick = function (easingName: string, durationTicks: number):Easing {
  return create(easingName, durationTicks, tickRelativeTimer);
};

export type Easing = {
  /**
   * Computes the current value of the easing
   *
   * @returns {number}
   */
  compute(): number

  /**
   * Reset the easing
   *
   */
  reset(): void
  /**
   * Returns true if the easing is complete
   *
   * @returns {boolean}
   */
  isDone(): boolean
};

/**
 * Creates a new easing by name
 *
 * @param {string} easingName Name of easing
 * @param {number} duration Duration (meaning depends on timer source)
 * @param {TimerSource} timerSource Timer source: use timer() or tick()
 * @returns {Easing}
 */
const create = function (easingName: string, duration: number, timerSource: TimerSource): Easing {
  const fn = resolveEasing(easingName);
  const timer = timerSource(duration);

  return {
    isDone: () => timer.isDone(),
    compute: () => {
      const relative = timer.elapsed();
      return fn(relative);
    },
    reset: () => {
      timer.reset();
    }
  };
};

const resolveEasing = function (easingName: string): EasingFn {
  const name = easingName.toLowerCase();
  for (const [k, v] of Object.entries(easings)) {
    if (k.toLowerCase() === name) {
      console.log('Found: ' + k);
      return v as EasingFn;
    }
  }
  throw Error(`Easing '${easingName}' not found.`);
};
/**
 * Return list of available easings
 *
 * @returns {string[]}
 */
export const getEasings = function ():string[] {
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
  easeInSine: (x: number): number => 1 - cos((x * PI) / 2),
  easeOutSine: (x: number): number => sin((x * PI) / 2),
  easeInQuad: (x: number): number => x * x,
  easeOutQuad: (x: number): number => 1 - (1 - x) * (1 - x),
  easeInOutSine: (x: number): number => -(cos(PI * x) - 1) / 2,
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
    const c4 = (2 * PI) / 3;

    return x === 0
      ? 0
      : x === 1
        ? 1
        : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4);
  },
  easeOutElastic: (x: number): number => {
    const c4 = (2 * PI) / 3;

    return x === 0
      ? 0
      : x === 1
        ? 1
        : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
  },
  easeInBounce: (x: number): number => 1 - easeOutBounce(1 - x),
  easeOutBounce: easeOutBounce,
  easeInOutElastic: (x: number): number => {
    const c5 = (2 * PI) / 4.5;

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