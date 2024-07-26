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


export * from './ApplyToValues.js';
export * from './AverageWeighted.js'
/**
 * Work with bipolar values (-1...1)
 * 
 * Import:
 * ```js
 * import { Bipolar } from 'https://unpkg.com/ixfx/dist/data.js';
 * ```
 * 
 * Overview:
 * * {@link clamp}: Clamp on -1..1 scale
 * * {@link fromScalar}: Convert from 0..1 to -1..1
 * * {@link immutable}: Immutable wrapper around a value
 * * {@link random}: Create a random bipolar value
 * * {@link scale}: Scale a value to -1..1 (clamped)
 * * {@link scaleUnclamped} As {@link scale} but allowed to go outside of -1...1 range
 * * {@link toScalar}: Convert -1..1 to 0..1
 * * {@link towardZero}: Nudge a bipolar value towards zero
 */
export * as Bipolar from './Bipolar.js';

export * from './Clamp.js';
export * from './Count.js';
export * from './Filter.js';
export * from './Flip.js';
export * from './Generate.js';
export * from './Guard.js';
export * from './Interpolate.js';
export * from './IsApprox.js';
export * from './LinearSpace.js';
export * from './MinMaxAvg.js';
export * from './MovingAverage.js';

/**
 * Normalise module
 * * {@link array}: Normalises the contents of an array of known values.
 * * {@link stream}: Normalises a stream of unknown values.
 */
export * as Normalise from './Normalise.js';
export * from './NumericArrays.js';
export * from './Proportion.js';
export * from './Quantise.js';
export * from './RelativeDifference.js';
export * from './Round.js';
export * from './Scale.js';
export * from './Softmax.js';
export type * from './Types.js';
export * from './Wrap.js';
