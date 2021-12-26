
/**
 * Generates a range of numbers, with a given interval.
 * Unlike numericRange, numbers might contain rounding errors
 * @param {number} interval Interval between numbers
 * @param {number} [start=0] Start
 * @param {number} [end] End (if undefined, range never ends)
 */
export const rawNumericRange = function* (interval: number, start: number = 0, end?: number, repeating: boolean = false) {
  if (interval <= 0) throw Error(`Interval is expected to be above zero`);
  if (end === undefined) end = Number.MAX_SAFE_INTEGER;
  let v = start;
  do {
    while (v < end) {
      yield v;
      v += interval;
    }
  } while (repeating);
}

/**
 * Generates a range of numbers, with a given interval. Numbers are rounded so they behave more expectedly.
 *
 * For-loop example:
 * 
 * let loopForever = numericRange(0.1); // By default starts at 0 and continues forever
 * for (v of loopForever) {
 *  console.log(v);
 * }
 * 
 * If you want more control over when/where incrementing happens...
 * 
 * let percent = numericRange(0.1, 0, 1);
 * let percentResult = percent.next();
 * while (!percentResult.done) {
 *  let v = percentResult.value;
 *  percentResult = percent.next();
 * }
 * @param {number} interval Interval between numbers
 * @param {number} [start=0] Start
 * @param {number} [end] End (if undefined, range never ends)
 * @param {number} [rounding] A rounding that matches the interval avoids floating-point math hikinks. Eg if the interval is 0.1, use a rounding of 10
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
}