import { integerTest, numberTest, resultThrow } from "@ixfx/guards";

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
 * Also works with decimals
 * ```js
 * quantiseEvery(1.123, 0.1); // 1.1
 * quantiseEvery(1.21, 0.1);  // 1.2
 * ```
 *
 * @param v Value to quantise
 * @param every Number to quantise to
 * @param middleRoundsUp If _true_ (default), the exact middle rounds up to next step.
 * @returns
 */
export const quantiseEvery = (
  v: number,
  every: number,
  middleRoundsUp = true
): number => {

  const everyString = every.toString();
  const decimal = everyString.indexOf(`.`);
  let multiplier = 1;
  if (decimal >= 0) {
    const d = everyString.substring(decimal + 1).length;
    multiplier = 10 * d;
    every = Math.floor(multiplier * every);
    v = v * multiplier;
  }

  resultThrow(
    numberTest(v, ``, `v`),
    integerTest(every, ``, `every`)
  );

  let div = v / every;
  const divModule = div % 1;
  div = Math.floor(div);
  if ((divModule === 0.5 && middleRoundsUp) || divModule > 0.5) div++;
  const vv = (every * div) / multiplier;
  return vv;
};