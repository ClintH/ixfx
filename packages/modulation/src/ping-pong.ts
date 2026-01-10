import { resultThrow, numberTest } from '@ixfx/guards';

/**
 * Continually loops up and down between 0 and 1 by a specified interval.
 * Looping returns start value, and is inclusive of 0 and 1.
 *
 * @example Usage
 * ```js
 * for (const v of percentPingPong(0.1)) {
 *  // v will go up and down. Make sure you have a break somewhere because it is infinite
 * }
 * ```
 *
 * @example Alternative:
 * ```js
 * const pp = pingPongPercent(0.1, 0.5); // Setup generator one time
 * const v = pp.next().value; // Call .next().value whenever a new value is needed
 * ```
 *
 * Because limits are capped to -1 to 1, using large intervals can produce uneven distribution. Eg an interval of 0.8 yields 0, 0.8, 1
 *
 * `upper` and `lower` define the percentage range. Eg to ping pong between 40-60%:
 * ```
 * const pp = pingPongPercent(0.1, 0.4, 0.6);
 * ```
 * @param interval Amount to increment by. Defaults to 10%
 * @param start Starting point within range. Defaults to 0 using a positive interval or 1 for negative intervals
 * @param rounding Rounding to apply. This avoids floating-point rounding errors.
 */
export const pingPongPercent = function (
  interval = 0.1,
  lower?: number,
  upper?: number,
  start?: number,
  rounding?: number
): Generator<number, never, unknown> {
  if (typeof lower === `undefined`) lower = 0;
  if (typeof upper === `undefined`) upper = 1;
  if (typeof start === `undefined`) start = lower;

  resultThrow(
    numberTest(interval, `bipolar`, `interval`),
    numberTest(upper, `bipolar`, `end`),
    numberTest(start, `bipolar`, `offset`),
    numberTest(lower, `bipolar`, `start`)
  );
  return pingPong(interval, lower, upper, start, rounding);
};

/**
 * Ping-pongs continually back and forth a `lower` and `upper` value (both inclusive) by a given `interval`. Use `pingPongPercent` for 0-1 ping-ponging
 *
 * In a loop:
 * ```
 * for (const c of pingPong(10, 0, 100)) {
 *  // 0, 10, 20 .. 100, 90, 80, 70 ...
 * }
 * ```
 *
 * Manual:
 * ```
 * const pp = pingPong(10, 0, 100);
 * let v = pp.next().value; // Call .next().value whenever a new value is needed
 * ```
 * @param interval Amount to increment by. Use negative numbers to start counting down
 * @param lower Lower bound (inclusive)
 * @param upper Upper bound (inclusive, must be greater than start)
 * @param start Starting point within bounds (defaults to `lower`)
 * @param rounding Rounding is off by default. Use say 1000 if interval is a fractional amount to avoid rounding errors.
 */
export const pingPong = function* (
  interval: number,
  lower: number,
  upper: number,
  start?: number,
  rounding?: number
): Generator<number, never, unknown> {
  if (lower === undefined) throw new Error(`Parameter 'lower' is undefined`);
  if (interval === undefined) {
    throw new Error(`Parameter 'interval' is undefined`);
  }
  if (upper === undefined) throw new Error(`Parameter 'upper' is undefined`);

  if (rounding === undefined && interval <= 1 && interval >= 0) {
    rounding = 10 / interval;
  } else if (typeof rounding === `undefined`) rounding = 1234;

  if (Number.isNaN(interval)) throw new Error(`interval parameter is NaN`);
  if (Number.isNaN(lower)) throw new Error(`lower parameter is NaN`);
  if (Number.isNaN(upper)) throw new Error(`upper parameter is NaN`);
  if (Number.isNaN(start)) throw new Error(`upper parameter is NaN`);

  if (lower >= upper) throw new Error(`lower must be less than upper`);
  if (interval === 0) throw new Error(`Interval cannot be zero`);
  const distance = upper - lower;
  if (Math.abs(interval) >= distance) {
    throw new Error(`Interval should be between -${ distance } and ${ distance }`);
  }

  let incrementing = interval > 0;

  // Scale up values by rounding factor
  upper = Math.floor(upper * rounding);
  lower = Math.floor(lower * rounding);
  interval = Math.floor(Math.abs(interval * rounding));

  if (interval === 0) {
    throw new Error(`Interval is zero (rounding: ${ rounding })`);
  }
  start = start === undefined ? lower : Math.floor(start * rounding);
  if (start > upper || start < lower) {
    throw new Error(
      `Start (${ start / rounding }) must be within lower (${ lower / rounding
      }) and upper (${ upper / rounding })`
    );
  }

  let v = start;
  yield v / rounding;
  let firstLoop = true;
  while (true) {
    v = v + (incrementing ? interval : -interval);
    if (incrementing && v >= upper) {
      incrementing = false;
      v = upper;
      if (v === upper && firstLoop) {
        // Edge case where we start at upper bound and increment
        v = lower;
        incrementing = true;
      }
    } else if (!incrementing && v <= lower) {
      incrementing = true;
      v = lower;
      if (v === lower && firstLoop) {
        // Edge case where we start at lower bound and decrement
        v = upper;
        incrementing = false;
      }
    }
    yield v / rounding;
    firstLoop = false;
  }
};
