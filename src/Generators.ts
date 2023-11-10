import { throwIntegerTest, throwNumberTest } from './Guards.js';
export { pingPong, pingPongPercent } from './modulation/PingPong.js';
export * as Async from './IterableAsync.js';
export * as Sync from './IterableSync.js';

export { interval } from './flow/Interval.js';
export { delayLoop, type DelayOpts } from './flow/Delay.js';

/**
 * Generates a range of numbers, starting from `start` and counting by `interval`.
 * If `end` is provided, generator stops when reached.
 *
 * Unlike {@link numericRange}, numbers might contain rounding errors
 *
 * ```js
 * for (const c of numericRangeRaw(10, 100)) {
 *  // 100, 110, 120 ...
 * }
 * ```
 * @param interval Interval between numbers
 * @param start Start
 * @param end End (if undefined, range never ends)
 */
export const numericRangeRaw = function* (
  interval: number,
  start = 0,
  end?: number,
  repeating = false
) {
  if (interval <= 0) throw new Error(`Interval is expected to be above zero`);
  if (end === undefined) end = Number.MAX_SAFE_INTEGER;
  let v = start;
  do {
    while (v < end) {
      yield v;
      v += interval;
    }
  } while (repeating);
};

/**
 * Generates a range of numbers, with a given interval.
 *
 * @example For-loop
 * ```
 * let loopForever = numericRange(0.1); // By default starts at 0 and counts upwards forever
 * for (v of loopForever) {
 *  console.log(v);
 * }
 * ```
 *
 * @example If you want more control over when/where incrementing happens...
 * ```js
 * let percent = numericRange(0.1, 0, 1);
 *
 * let percentResult = percent.next().value;
 * ```
 *
 * Note that computations are internally rounded to avoid floating point math issues. So if the `interval` is very small (eg thousandths), specify a higher rounding
 * number.
 *
 * @param interval Interval between numbers
 * @param start Start. Defaults to 0
 * @param end End (if undefined, range never ends)
 * @param repeating Range loops from start indefinately. Default _false_
 * @param rounding A rounding that matches the interval avoids floating-point math hikinks. Eg if the interval is 0.1, use a rounding of 10
 */
export const numericRange = function* (
  interval: number,
  start = 0,
  end?: number,
  repeating = false,
  rounding?: number
) {
  throwNumberTest(interval, `nonZero`);

  const negativeInterval = interval < 0;
  if (end === undefined) {
    /* no op */
  } else {
    if (negativeInterval && start < end) {
      throw new Error(
        `Interval of ${ interval } will never go from ${ start } to ${ end }`
      );
    }
    if (!negativeInterval && start > end) {
      throw new Error(
        `Interval of ${ interval } will never go from ${ start } to ${ end }`
      );
    }
  }

  rounding = rounding ?? 1000;
  if (end === undefined) end = Number.MAX_SAFE_INTEGER;
  else end *= rounding;
  interval = interval * rounding;

  do {
    let v = start * rounding;
    while ((!negativeInterval && v <= end) || (negativeInterval && v >= end)) {
      yield v / rounding;
      v += interval;
    }
  } while (repeating);
};

/**
 * Yields `amount` integers, counting by one from zero. If a negative amount is used,
 * count decreases. If `offset` is provided, this is added to the return result.
 * @example
 * ```js
 * const a = [...count(5)]; // Yields five numbers: [0,1,2,3,4]
 * const b = [...count(-5)]; // Yields five numbers: [0,-1,-2,-3,-4]
 * for (const v of count(5, 5)) {
 *  // Yields: 5, 6, 7, 8, 9
 * }
 * const c = [...count(5,1)]; // Yields [1,2,3,4,5]
 * ```
 *
 * @example Used with forEach
 * ```js
 * // Prints `Hi` 5x
 * forEach(count(5), () => // do something);
 * ```
 *
 * If you want to accumulate return values, consider using
 * {@link Flow.repeat}.
 *
 * @example Run some code every 100ms, 10 times:
 * ```js
 * import { interval } from 'https://unpkg.com/ixfx/dist/flow.js'
 * import { count } from 'https://unpkg.com/ixfx/dist/generators.js'
 * const counter = count(10);
 * for await (const v of interval(counter, { fixedIntervalMs: 100 })) {
 *  // Do something
 * }
 * ```
 * @param amount Number of integers to yield
 * @param offset Added to result
 */
export const count = function* (amount: number, offset = 0) {
  // Unit tested.
  throwIntegerTest(amount, ``, `amount`);
  throwIntegerTest(offset, ``, `offset`);

  if (amount === 0) return;

  let index = 0;
  do {
    yield (amount < 0 ? -index + offset : index + offset);
  } while (index++ < Math.abs(amount) - 1);
};

/**
 * Returns a number range between 0.0-1.0.
 *
 * ```
 * // Yields: [0, 0.2, 0.4, 0.6, 0.8, 1]
 * const a = [...numericPercent(0.2)];
 *
 * // Repeating flag set to true:
 * for (const v of numericPercent(0.2, true)) {
 *  // Infinite loop. V loops back to 0 after hitting 1
 * }
 * ```
 *
 * If `repeating` is true, it loops back to 0 after reaching 1
 * @param interval Interval (default: 0.01, ie. 1%)
 * @param repeating Whether generator should loop (default: false)
 * @param start Start (default: 0)
 * @param end End (default: 1)
 * @returns
 */
export const numericPercent = function (
  interval = 0.01,
  repeating = false,
  start = 0,
  end = 1
) {
  throwNumberTest(interval, `percentage`, `interval`);
  throwNumberTest(start, `percentage`, `start`);
  throwNumberTest(end, `percentage`, `end`);
  return numericRange(interval, start, end, repeating);
};

export { integerUniqueGen as randomUniqueInteger } from './random/index.js';