
/**
 * Generates a range of numbers, with a given interval.
 *
 * @param {number} interval Interval between numbers
 * @param {number} [start=0] Start
 * @param {number} [end] End (if undefined, range never ends)
 */
export const rawNumericRange = function* (interval: number, start: number = 0, end?: number) {
  if (interval <= 0) throw Error(`Interval is expected to be above zero`);
  if (end === undefined) end = Number.MAX_SAFE_INTEGER;
  let v = start;
  while (v < end) {
    yield v;
    v += interval;
  }
}

/**
 * Generates a range of numbers, with a given interval. Numbers are rounded so they behave more expectedly.
 *
 * @param {number} interval Interval between numbers
 * @param {number} [start=0] Start
 * @param {number} [end] End (if undefined, range never ends)
 * @param {number} [rounding] A rounding that matches the interval avoids floating-point math hikinks. Eg if the interval is 0.1, use a rounding of 10
 */
export const numericRange = function* (interval: number, start: number = 0, end?: number, rounding?: number) {
  if (interval <= 0) throw Error(`Interval is expected to be above zero`);
  rounding = rounding ?? 1000;
  if (end === undefined) end = Number.MAX_SAFE_INTEGER;
  else end *= rounding;
  interval = interval * rounding;
  let v = start * rounding;
  while (v <= end) {
    yield v / rounding;
    v += interval;
  }
}