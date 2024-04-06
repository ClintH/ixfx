import { integerTest, numberTest, throwFromResult } from "../Guards.js";

/**
 * Rounds `v` by `every`. Middle values are rounded up by default.
 *
 * ```js
 * quantiseEvery(11, 10);  // 10
 * quantiseEvery(25, 10);  // 30
 * quantiseEvery(0, 10);   // 0
 * quantiseEvery(4, 10);   // 0
 * quantiseEvery(100, 10); // 100
 * ```
 *
 * @param v
 * @param every
 * @param middleRoundsUp
 * @returns
 */
export const quantiseEvery = (
  v: number,
  every: number,
  middleRoundsUp = true
) => {
  // Unit tested!
  throwFromResult(numberTest(v, ``, `v`));
  throwFromResult(integerTest(every, ``, `every`));

  //eslint-disable-next-line functional/no-let
  let div = v / every;
  const divModule = div % 1;
  div = Math.floor(div);
  if ((divModule === 0.5 && middleRoundsUp) || divModule > 0.5) div++;
  return every * div;
};