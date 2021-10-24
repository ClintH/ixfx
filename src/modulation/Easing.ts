// Easings from https://easings.net/

import {clamp} from "../util";

const sqrt = Math.sqrt;
const pow = Math.pow;

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
    elapsed: () => {
      return clamp((performance.now() - start) / upperBound);
    },
    isDone: () => {
      return (performance.now() - start) >= upperBound;
    }
  }
}

const tickRelativeTimer = function (upperBound: number): RelativeTimer {
  let start = 0;
  return {
    reset: () => {
      start = 0;
    },
    elapsed: () => {
      return clamp(start++ / upperBound);
    },
    isDone: () => {
      return start >= upperBound;
    }
  }
}

type EasingFn = (x: number) => number;

export const timer = function (easingName: string, durationMs: number) {
  return create(easingName, durationMs, msRelativeTimer);
}

export const tick = function (easingName: string, durationTicks: number) {
  return create(easingName, durationTicks, tickRelativeTimer);
}

export type Easing = {
  compute(): number
  reset(): void
  isDone(): boolean
}

export const create = function (easingName: string, duration: number, timerSource: TimerSource): Easing {
  let fn = resolveEasing(easingName);
  let timer = timerSource(duration);

  return {
    isDone: () => {
      return timer.isDone();
    },
    compute: () => {
      let relative = timer.elapsed();
      return fn(relative);
    },
    reset: () => {
      timer.reset();
    }
  }
}

const resolveEasing = function (easingName: string): EasingFn {
  let name = easingName.toLowerCase();
  for (const [k, v] of Object.entries(easings)) {
    if (k.toLowerCase() === name) {
      console.log('Found: ' + k);
      return v as EasingFn;

    }
  }
  throw Error(`Easing '${easingName}' not found.`);
}

const cos = Math.cos;
const PI = Math.PI;
const sin = Math.sin;

const easeOutBounce = function (x: number): number {
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
}

const easings = {

  easeInSine: (x: number): number => {
    return 1 - cos((x * PI) / 2);
  },
  easeOutSine: (x: number): number => {
    return sin((x * PI) / 2);
  },
  easeInQuad: (x: number): number => {
    return x * x;
  },
  easeOutQuad: (x: number): number => {
    return 1 - (1 - x) * (1 - x);
  },
  easeInOutSine: (x: number): number => {
    return -(cos(PI * x) - 1) / 2;
  },
  easeInOutQuad: (x: number): number => {
    return x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2;
  },
  easeInCubic: (x: number): number => {
    return x * x * x;
  },
  easeOutCubic: (x: number): number => {
    return 1 - pow(1 - x, 3);
  },
  easeInQuart: (x: number): number => {
    return x * x * x * x;
  },
  easeOutQuart: (x: number): number => {
    return 1 - pow(1 - x, 4);
  },
  easeInQuint: (x: number): number => {
    return x * x * x * x * x;
  },
  easeOutQuint: (x: number): number => {
    return 1 - pow(1 - x, 5);
  },
  easeInExpo: (x: number): number => {
    return x === 0 ? 0 : pow(2, 10 * x - 10);
  },
  easeOutExpo: (x: number): number => {
    return x === 1 ? 1 : 1 - pow(2, -10 * x);
  },
  easeInOutQuint: (x: number): number => {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2;
  },
  easeInOutExpo: (x: number): number => {
    return x === 0
      ? 0
      : x === 1
        ? 1
        : x < 0.5 ? pow(2, 20 * x - 10) / 2
          : (2 - pow(2, -20 * x + 10)) / 2;
  },
  easeInCirc: (x: number): number => {
    return 1 - sqrt(1 - pow(x, 2));
  },
  easeOutCirc: (x: number): number => {
    return sqrt(1 - pow(x - 1, 2));
  },
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
  easeInOutCirc: (x: number): number => {
    return x < 0.5
      ? (1 - sqrt(1 - pow(2 * x, 2))) / 2
      : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2;
  },
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
  easeInBounce: (x: number): number => {
    return 1 - easeOutBounce(1 - x);
  },
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
  easeInOutBounce: (x: number): number => {
    return x < 0.5
      ? (1 - easeOutBounce(1 - 2 * x)) / 2
      : (1 + easeOutBounce(2 * x - 1)) / 2;
  }
}