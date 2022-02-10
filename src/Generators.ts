// import {sleep} from "./Timer.js";
import {number as guardNumber} from "./Guards.js";
export {pingPong, pingPongPercent} from './modulation/PingPong.js';

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
  //eslint-disable-next-line functional/no-let
  let v = start;
  //eslint-disable-next-line functional/no-loop-statement
  do {
    //eslint-disable-next-line functional/no-loop-statement
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
 * @param repeating If true, range loops from start indefinately
 * @param rounding A rounding that matches the interval avoids floating-point math hikinks. Eg if the interval is 0.1, use a rounding of 10
 */
export const numericRange = function* (interval: number, start: number = 0, end?: number, repeating: boolean = false, rounding?: number) {
  guardNumber(interval,  `nonZero`);
  
  const negativeInterval = interval < 0;
  if (end === undefined) {
    /* no op */
  } else {
    if (negativeInterval && start < end) throw new Error(`Interval of ${interval} will never go from ${start} to ${end}`);
    if (!negativeInterval && start > end) throw new Error(`Interval of ${interval} will never go from ${start} to ${end}`);
  }

  rounding = rounding ?? 1000;
  if (end === undefined) end = Number.MAX_SAFE_INTEGER;
  else end *= rounding;
  interval = interval * rounding;

  //eslint-disable-next-line functional/no-loop-statement
  do {
    //eslint-disable-next-line functional/no-let
    let v = start * rounding;
    //eslint-disable-next-line functional/no-loop-statement
    while ((!negativeInterval && v <= end) || (negativeInterval && v >= end)) {
      yield v / rounding;
      v += interval;
    }

  } while (repeating);
};

/**
 * Returns a number range between 0.0-1.0. By default it loops back to 0 after reaching 1
 * @param interval Interval (defaults to 0.01 or 1%)
 * @param repeating Whether generator should loop (default false)
 * @param start Start
 * @param end End
 * @returns 
 */
export const rangePercent = function (interval:number = 0.01, repeating:boolean = false, start:number = 0, end = 1) {
  guardNumber(interval, `percentage`, `interval`);
  guardNumber(start, `percentage`, `start`);
  guardNumber(end, `percentage`, `end`);
  return numericRange(interval, start, end, repeating);
};