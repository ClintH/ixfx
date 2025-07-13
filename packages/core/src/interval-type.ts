import { numberTest } from '@ixfx/guards';
import { round } from './util/round.js';
import type { Interval } from './types.js';

// export function intervalToMs(interval: Interval | undefined): number | undefined;
// export function intervalToMs(
//   interval: Interval | undefined,
//   defaultNumber: number
// ): number;


/**
 * Return the millisecond value of an Interval.
 * 
 * ```js
 * intervalToMs(100); // 100
 * intervalToMs({ millis: 100 }); // 100
 * ```
 *
 * Use `defaultNumber` to return a default in the case of
 * _undefined_ or invalid input.
 *
 * ```js
 * intervalToMs(undefined);      // throws error
 * intervalToMs(undefined, 100); // 100
 * ```
 *
 * If no default is provided, an exception is thrown.
 * @param interval Interval
 * @param defaultNumber Default value if `interval` is _undefined_ or invalid
 * @returns Milliseconds
 */
export function intervalToMs(
  interval: Interval | undefined,
  defaultNumber?: number
): number {
  if (isInterval(interval)) {
    // Number given, must be millis?
    if (typeof interval === `number`) return interval;

    let ms = interval.millis ?? 0;
    ms += (interval.hours ?? 0) * 60 * 60 * 1000;
    ms += (interval.mins ?? 0) * 60 * 1000;
    ms += (interval.secs ?? 0) * 1000;
    return ms;
  } else {
    if (typeof defaultNumber !== `undefined`) return defaultNumber;
    throw new Error(`Not a valid interval: ${ JSON.stringify(interval) }`);
  }
}

/**
 * Returns _true_ if `interval` matches the {@link Interval} type.
 * @param interval 
 * @returns _True_ if `interval` is an {@link Interval}.
 */
export function isInterval(interval: number | Interval | undefined): interval is Interval {
  if (typeof interval === `undefined`) return false;
  if (interval === null) return false;
  if (typeof interval === `number`) {
    if (Number.isNaN(interval)) return false;
    if (!Number.isFinite(interval)) return false;
    return true;
  }
  if (typeof interval !== `object`) return false;
  const hasMillis = `millis` in interval;
  const hasSecs = `secs` in interval;
  const hasMins = `mins` in interval;
  const hasHours = `hours` in interval;
  if (hasMillis && !numberTest(interval.millis).success) return false;
  if (hasSecs && !numberTest(interval.secs).success) return false;
  if (hasMins && !numberTest(interval.mins).success) return false;
  if (hasHours && !numberTest(interval.hours).success) return false;
  if (hasMillis || hasSecs || hasHours || hasMins) return true;
  return false;
}

/**
 * Returns a human-readable representation
 * of some elapsed milliseconds
 * 
 * @example
 * ```js
 * elapsedToHumanString(10);      // `10ms`
 * elapsedToHumanString(2000);    // `2s`
 * elapsedToHumanString(65*1000); // `1mins`
 * ```
 * @param millisOrFunction Milliseconds as a number, {@link Interval} or function that resolve to a number
 * @param rounding Rounding (default: 2)
 * @returns 
 */
export const elapsedToHumanString = (millisOrFunction: number | (() => number) | Interval, rounding = 2): string => {
  let interval: number | undefined = 0;
  if (typeof millisOrFunction === `function`) {
    const intervalResult = millisOrFunction();
    return elapsedToHumanString(intervalResult);
  } else if (typeof millisOrFunction === `number`) {
    interval = millisOrFunction;
  } else if (typeof millisOrFunction === `object`) {
    interval = intervalToMs(interval);
  }

  let ms = intervalToMs(interval);
  if (typeof ms === `undefined`) return `(undefined)`;
  if (ms < 1000) return `${ round(rounding, ms) }ms`;
  ms /= 1000;
  if (ms < 120) return `${ ms.toFixed(1) }secs`;
  ms /= 60;
  if (ms < 60) return `${ ms.toFixed(2) }mins`;
  ms /= 60;
  return `${ ms.toFixed(2) }hrs`;
};