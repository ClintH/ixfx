import type { NormaliseStreamContext, MinMaxStreamOptions, NormalisationArrayOptions, NormalisationStrategy, NormalisationStreamOptions, NormalisationStreamStrategy, ZScoreArrayOptions, MinMaxArrayOptions, RobustArrayOptions } from './normalise-types.js';
import * as MinMax from './normalise-minmax.js';
import * as ZScore from './normalise-zscore.js';
import * as Robust from './normalise-robust.js';
export * as MinMax from './normalise-minmax.js';
export * as ZScore from './normalise-zscore.js';
export * as Robust from './normalise-robust.js';
export type * from './normalise-types.js';
/**
 * Normalises numbers with additional context on the range.
 * 
 * For more details, see:
 * * {@link MinMax.streamWithContext}
 * 
 * @param strategy 
 * @param options 
 * @returns 
 */
export const streamWithContext = (strategy: NormalisationStreamStrategy, options: Partial<NormalisationStreamOptions> = {}): NormaliseStreamContext => {
  switch (strategy) {
    case `minmax`:
      return MinMax.streamWithContext(options as MinMaxStreamOptions);
    default:
      throw new Error(`Param 'strategy' has an unknown value: '${ strategy }'. Expected: minmax`);
  }
}

/**
 * Normalises numbers. Return values will be in the range of 0-1 (inclusive).
 *
 * [ixfx Guide on Normalising](https://ixfx.fun/cleaning/normal/)
 *
 * Use {@link streamWithContext} if you want to be able to check the min/max or reset the normaliser.
 * 
 * @example
 * ```js
 * const s = Normalise.stream(`minmax`);
 * s(2);    // 1 (because 2 is highest seen)
 * s(1);    // 0 (because 1 is the lowest so far)
 * s(1.5);  // 0.5 (50% of range 1-2)
 * s(0.5);  // 0 (because it's the new lowest)
 * ```
 *
 * For more details, see:
 * * {@link MinMax.stream}
 * @returns
 */
export const stream = (strategy: NormalisationStreamStrategy = `minmax`, options: Partial<NormalisationStreamOptions> = {}): (value: number) => number => {
  switch (strategy) {
    case `minmax`:
      return MinMax.stream(options as MinMaxStreamOptions);
    default:
      throw new Error(`Param 'strategy' has an unknown value: '${ strategy }'. Expected: minmax`);
  }
}

/**
 * Normalise an array of values with added context, depending on strategy.
 * 
 * Strategies are available: minmax, zscore & robust
 * 
 * [ixfx Guide on Normalising](https://ixfx.fun/cleaning/normal/)
 *
 * Use {@link array} to get back the min/max/range and original values
 * 
 * ```js
 * const { values, min, max, range } = Normalise.arrayWithContext(`minmax`, [5,1,0,9,10]);
 * // values will be normalised output
 * ```
 * 
 * For more details, see:
 * * {@link MinMax.array}
 * * {@link ZScore.array}
 * * {@link Robust.array}
 * @param strategy 
 * @param values 
 * @param options 
 * @returns 
 */
export const arrayWithContext = (strategy: NormalisationStrategy, values: readonly number[], options: Partial<NormalisationArrayOptions> = {}
): {
  mean: number;
  standardDeviation: number;
  values: number[];
  original: readonly number[] | number[];
} | {
  values: number[];
  original: any[];
  min: number;
  max: number;
  range: number;
} | {
  median: number;
  iqr: number;
  values: number[];
  original: number[];
} => {
  switch (strategy) {
    case `minmax`:
      return MinMax.arrayWithContext(values, options as MinMaxArrayOptions);
    case `zscore`:
      return ZScore.arrayWithContext(values, options as ZScoreArrayOptions);
    case `robust`:
      return Robust.arrayWithContext(values, options as RobustArrayOptions);
    default:
      throw new Error(`Param 'strategy' has an unknown value: '${ strategy }'. Expected: minmax|zscore`);
  }
}

/**
 * Normalise an array of values.
 * 
 * Strategies are available: minmax, zscore & robust
 * 
 * [ixfx Guide on Normalising](https://ixfx.fun/cleaning/normal/)
 *
 * Use {@link arrayWithContext} to get back the min/max/range and original values
 * 
 * ```js
 * // Yields: [0.5, 0.1, 0.0, 0.9, 1]
 * Normalise.array(`minmax`, [5,1,0,9,10]);
 * ```
 * 
 * For more details, see:
 * * {@link MinMax.array} [Wikipedia](https://en.wikipedia.org/wiki/Feature_scaling#Rescaling_(min-max_normalization))
 * * {@link ZScore.array} [Wikipedia](https://en.wikipedia.org/wiki/Feature_scaling#Standardization_(Z-score_Normalization))
 * * {@link Robust.array} [Wikipedia](https://en.wikipedia.org/wiki/Feature_scaling#Robust_Scaling)
 * 
 * @param strategy 
 * @param values 
 * @param options 
 * @returns 
 */
export const array = (strategy: NormalisationStrategy, values: readonly number[], options: Partial<NormalisationArrayOptions> = {}
): number[] => arrayWithContext(strategy, values, options).values;
