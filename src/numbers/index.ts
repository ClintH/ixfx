/**
 * * {@link average}, {@link max}, {@link min}, {@link total}: Calculate average/max/min/total
 * * {@link averageWeighted}: Calculate average, but applies a weighting function, eg to favour items at beginning of array
 * * {@link minMaxAvg}: Find smallest, largest and average
 * * {@link maxIndex}, {@link minIndex}: Return index of largest/smallest value
 * * {@link dotProduct}: Returns the dot-product between two arrays
 * * {@link weight}: Applies a weighting function to all values based on their index
 * * See also {@link Numbers} module for working with numbers in general.
 * @module
 */

import { numberTracker } from '../data/NumberTracker.js';
import { type TrackedValueOpts as TrackedValueOptions } from '../data/TrackedValue.js';
export * from './ApplyToValues.js';
export * from './AverageWeighted.js'
export * from './Count.js';
export * from './Filter.js';
export * from './Generate.js';
export * from './Guard.js';
export * from './IsApproximately.js';
export * from './LinearSpace.js';
export * from './MinMaxAvg.js';
export * from './NumericArrays.js';
export * from './Quantise.js';
export * from './RelativeDifference.js';
export * from './Round.js';
export type * from './Types.js';
export * from '../modulation/PingPong.js';
export * from '../modulation/Jitter.js';
export { integer as randomInteger, integerUniqueGen as randomUniqueInteger } from '../random/Integer.js';

/**
 * Alias for [Data.numberTracker](https://clinth.github.io/ixfx/classes/Data.numberTracker-1.html)
 */
export const tracker = (options?: TrackedValueOptions) => numberTracker(options);