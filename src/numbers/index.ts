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
export * from './NumericArrays.js';
export * from './Quantise.js';
export * from './RelativeDifference.js';
export * from './Round.js';
export * from '../modulation/PingPong.js';
export * from '../modulation/Jitter.js';
export { integer as randomInteger, integerUniqueGen as randomUniqueInteger } from '../random/Integer.js';

/**
 * Alias for [Data.numberTracker](https://clinth.github.io/ixfx/classes/Data.numberTracker-1.html)
 */
export const tracker = (options?: TrackedValueOptions) => numberTracker(options);