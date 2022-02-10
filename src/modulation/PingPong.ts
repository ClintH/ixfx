import {number as guardNumber} from "../Guards.js";

/**
 * Continually loops up and down between 0 and 1 by a specified interval.
 * Looping returns start value, and is inclusive of 0 and 1.
 * 
 * @example Usage
 * ```js
 * for (let v of percentPingPong(0.1)) {
 *  // v will go up and down. Make sure you have a break somewhere because it is infinite
 * }
 * ```
 * 
 * @example Alternative:
 * ```js
 * let pp = pingPongPercent(0.1, 0.5); // Setup generator one time
 * let v = pp.next().value; // Call .next().value whenever a new value is needed
 * ```
 * 
 * Because limits are capped to 0 and 1, using large intervals can produce uneven distribution. Eg an interval of 0.8 yields 0, 0.8, 1
 *
 * @param interval Amount to increment by. Defaults to 10%
 * @param offset Starting point within range. Defaults to 0 using a positive interval or 1 for negative intervals
 * @param rounding Rounding to apply. Defaults to 1000. This avoids floating-point rounding errors.
 */
export const pingPongPercent = function (interval: number = 0.1, start: number = 0, end: number = 1, offset: number = 0, rounding: number = 1000) {
  // if (offset === undefined && interval > 0) offset = 0;
  // else if (offset === undefined && interval < 0) offset = 1;
  // else offset = offset as number;
  // if (offset > 1 || offset < 0) throw new Error(`offset must be between 0 and 1`);

  guardNumber(interval, `bipolar`, `interval`);
  guardNumber(end, `bipolar`, `end`);
  guardNumber(offset, `bipolar`, `offset`);
  guardNumber(start, `bipolar`, `start`);

  return pingPong(interval, start, end, offset, rounding);
};

/**
 * Ping-pongs continually back and forth `start` and `end` with a given `interval`. Use `pingPongPercent` for 0-1 ping-ponging
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
 * @param offset Starting point within bounds (defaults to `lower`)
 * @param rounding Rounding is off by default. Use say 1000 if interval is a fractional amount to avoid rounding errors.
 */
export const pingPong = function* (interval: number, lower: number, upper: number, offset?: number, rounding: number = 1) {
  if (Number.isNaN(interval)) throw new Error(`interval parameter is NaN`);
  if (Number.isNaN(lower)) throw new Error(`lower parameter is NaN`);
  if (Number.isNaN(upper)) throw new Error(`upper parameter is NaN`);
  if (Number.isNaN(offset)) throw new Error(`upper parameter is NaN`);

  if (lower >= upper) throw new Error(`lower must be less than upper`);
  if (interval === 0) throw new Error(`Interval cannot be zero`);
  const distance = upper - lower;
  if (Math.abs(interval) >= distance) throw new Error(`Interval should be between -${distance} and ${distance}`);

  //eslint-disable-next-line functional/no-let
  let incrementing = interval > 0;

  // Scale up values by rounding factor
  upper = Math.floor(upper * rounding);
  lower = Math.floor(lower * rounding);
  interval = Math.floor(Math.abs(interval * rounding));

  if (offset === undefined) offset = lower;
  else offset = Math.floor(offset * rounding);
  if (offset > upper || offset < lower) throw new Error(`Offset must be within lower and upper`);

  //eslint-disable-next-line functional/no-let
  let v = offset;
  yield v / rounding;
  //eslint-disable-next-line functional/no-let
  let firstLoop = true;
  //eslint-disable-next-line functional/no-loop-statement
  while (true) {
    v = v + (incrementing ? interval : -interval);
    if (incrementing && v >= upper) {
      incrementing = false;
      v = upper;
      if (v === upper && firstLoop) {
        // Edge case where we start at upper bound and increment
        v = lower; incrementing = true;
      }
    } else if (!incrementing && v <= lower) {
      incrementing = true;
      v = lower;
      if (v === lower && firstLoop) {
        // Edge case where we start at lower bound and decrement
        v = upper; incrementing = false;
      }
    }
    yield v / rounding;
    firstLoop = false;
  }
};
