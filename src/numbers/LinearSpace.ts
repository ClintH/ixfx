import { numberTest, throwFromResult } from "../Guards.js";
import { round } from "./Round.js";

/**
 * Generates a `step`-length series of values between `start` and `end` (inclusive).
 * Each value will be equally spaced.
 *
 * ```js
 * for (const v of linearSpace(1, 5, 6)) {
 *  // Yields: [ 1, 1.8, 2.6, 3.4, 4.2, 5 ]
 * }
 * ```
 *
 * Numbers can be produced from large to small as well
 * ```js
 * const values = [...linearSpace(10, 5, 3)];
 * // Yields: [10, 7.5, 5]
 * ```
 * @param start Start number (inclusive)
 * @param end  End number (inclusive)
 * @param steps How many steps to make from start -> end
 * @param precision Number of decimal points to round to
 */
export function* linearSpace(
  start: number,
  end: number,
  steps: number,
  precision?: number
): IterableIterator<number> {
  throwFromResult(numberTest(start, ``, `start`));
  throwFromResult(numberTest(end, ``, `end`));

  throwFromResult(numberTest(steps, ``, `steps`));
  const r = precision ? round(precision) : (v: number) => v;
  const step = (end - start) / (steps - 1);

  throwFromResult(numberTest(step, ``, `step`));
  if (!Number.isFinite(step)) {
    throw new TypeError(`Calculated step value is infinite`);
  }

  //eslint-disable-next-line functional/no-let
  for (let index = 0; index < steps; index++) {
    const v = start + step * index;
    yield r(v);
  }
}
