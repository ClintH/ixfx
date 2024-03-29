import { afterMatch, beforeAfterMatch, beforeMatch } from '../Text.js';
import { throwIntegerTest, throwNumberTest } from '../Guards.js';
export { pingPong, pingPongPercent } from '../modulation/PingPong.js';
export * as Async from './IterableAsync.js';
export * as Sync from './IterableSync.js';
export * as Chain from './chain/index.js';

export { interval } from '../flow/Interval.js';
export { delayLoop, type DelayOpts } from '../flow/Delay.js';

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
 * Returns chunks of `source`, broken up by `delimiter` (default '.').
 * 
 * If `delimiter` is not found, no results are yielded.
 * 
 * ````js
 * stringSegmentsEndToEnd(`a.b.c.d`);
 * // Yields:
 * // `a.b.c.d`
 * // `b.c.d`
 * // `c.d`
 * // `d`
 * ```
 * @param source 
 * @param delimiter 
 */
export function* stringSegmentsEndToEnd(source: string, delimiter = `.`) {
  while (source.length > 0) {
    yield source;
    const trimmed = afterMatch(source, delimiter);
    if (trimmed === source) {
      // Delimiter not found
      break;
    }
    source = trimmed;
  }
}

/**
 * Returns chunks of `source`, broken up by `delimiter` (default '.').
 * 
 * If `delimiter` is not found, no results are yielded.
 * 
 * ````js
 * stringSegmentsEndToStart(`a.b.c.d`);
 * // Yields:
 * // `d`
 * // `c.d`
 * // `b.c.d`
 * // `a.b.c.d`
 * ```
 * @param source 
 * @param delimiter 
 */
export function* stringSegmentsEndToStart(source: string, delimiter = `.`) {
  let accumulator = ``;
  const orig = source;
  while (source.length > 0) {
    const ba = beforeAfterMatch(source, delimiter, { fromEnd: true, ifNoMatch: `original` });
    if (ba[ 0 ] === ba[ 1 ] && ba[ 1 ] === source) {
      // Delimiter not found
      break;
    }
    const v = ba[ 1 ] + accumulator;
    yield v;
    accumulator = delimiter + v;
    source = ba[ 0 ];
  }
  yield orig;
}

/**
 * Returns chunks of `source`, broken up by `delimiter` (default '.').
 * 
 * If `delimiter` is not found, no results are yielded.
 * 
 * ```js
 * stringSegmentsStartToEnd(`a.b.c.d`);
 * // Yields:
 * // `a`
 * // `a.b`
 * // `a.b.c`
 * // `a.b.c.d`
 * ```
 * @param source 
 * @param delimiter 
 */
export function* stringSegmentsStartToEnd(source: string, delimiter = `.`) {
  let accumulator = ``;
  const orig = source;
  while (source.length > 0) {
    const ba = beforeAfterMatch(source, delimiter, { ifNoMatch: `original` });
    if (ba[ 0 ] === source && ba[ 1 ] === source) break;
    accumulator += ba[ 0 ];
    yield accumulator;
    accumulator += delimiter;
    source = ba[ 1 ];
  }
  yield orig;
}

/**
 * ```js
 * stringSegmentsStartToStart(`a.b.c.d`);
 * // Yields:
 * // `a.b.c.d`
 * // `a.b.c`,
 * // `a.b`,
 * // `a`,
 * ```
 * @param source 
 * @param delimiter 
 */
export function* stringSegmentsStartToStart(source: string, delimiter = `.`) {
  const orig = source;
  while (source.length > 0) {
    yield source;

    const b = beforeMatch(source, delimiter, { ifNoMatch: `original`, fromEnd: true });
    if (b === source) break;
    source = b;
  }
}


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

export { integerUniqueGen as randomUniqueInteger } from '../random/index.js';