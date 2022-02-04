import {sleep} from "./Timer.js";

/**
 * Generates values from `produce` with `intervalMs` time delay
 * 
 * @example Produce a random number every 500ms:
 * ```
 * const randomGenerator = atInterval(() => Math.random(), 1000);
 * for await (const r of randomGenerator) {
 *  // Random value every 1 second
 * }
 * ```
 *
 * @template V
 * @param intervalMs Interval between execution
 * @param produce Function to call
 * @template V Data type
 * @returns
 */
 export const interval = async function*<V>(produce: () => Promise<V>, intervalMs: number) {
  let cancelled = false;
  try {
    while (!cancelled) {
      await sleep(intervalMs);
      if (cancelled) return;
      yield await produce();
    }
  } finally {
    cancelled = true;
  }
};

/**
 * Generates a range of numbers, starting from `start` and coutnting by `interval`.
 * If `end` is provided, generator stops when reached.
 * 
 * Unlike numericRange, numbers might contain rounding errors
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
export const numericRangeRaw = function* (interval: number, start: number = 0, end?: number, repeating: boolean = false) {
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
 * @param start Start
 * @param end End (if undefined, range never ends)
 * @param rounding A rounding that matches the interval avoids floating-point math hikinks. Eg if the interval is 0.1, use a rounding of 10
 */
export const numericRange = function* (interval: number, start: number = 0, end?: number, repeating: boolean = false, rounding?: number) {
  if (interval <= 0) throw Error(`Interval is expected to be above zero`);
  rounding = rounding ?? 1000;
  if (end === undefined) end = Number.MAX_SAFE_INTEGER;
  else end *= rounding;
  interval = interval * rounding;

  do {
    let v = start * rounding;
    while (v <= end) {
      yield v / rounding;
      v += interval;
    }
  } while (repeating);
};

/**
 * Continually loops back and forth between 0 and 1 by a specified interval.
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
 * let pp = percentPingPong(0.1, 0.5); // Setup generator one time
 * let v = pp.next().value; // Call .next().value whenever a new value is needed
 * ```
 * 
 * Because limits are capped to 0 and 1, using large intervals can produce uneven distribution. Eg an interval of 0.8 yields 0, 0.8, 1
 *
 * @param {number} interval Amount to increment by. Defaults to 10%
 * @param {number} offset Starting point. Defaults to 0 using a positive interval or 1 for negative intervals
 * @param {number} rounding Rounding to apply. Defaults to 1000. This avoids floating-point rounding errors.
 */
export const pingPongPercent = function (interval: number = 0.1, offset?: number, rounding: number = 1000) {
  if (offset === undefined && interval > 0) offset = 0;
  else if (offset === undefined && interval < 0) offset = 1;
  else offset = offset as number;
  if (offset > 1 || offset < 0) throw new Error(`offset must be between 0 and 1`);
  return pingPong(interval, 0, 1, offset, rounding);
};

/**
 * Ping-pongs continually between `start` and `end` with a given `interval`. Use `pingPongPercent` for 0-1 ping-ponging
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

  let incrementing = interval > 0;

  // Scale up values by rounding factor
  upper = Math.floor(upper * rounding);
  lower = Math.floor(lower * rounding);
  interval = Math.floor(Math.abs(interval * rounding));

  if (offset === undefined) offset = lower;
  else offset = Math.floor(offset * rounding);
  if (offset > upper || offset < lower) throw new Error(`Offset must be within lower and upper`);

  let v = offset;
  yield v / rounding;
  let firstLoop = true;
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
