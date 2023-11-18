

/**
 * Normalise module
 * * {@link array}: Normalises the contents of an array of known values.
 * * {@link stream}: Normalises a stream of unknown values.
 */
export * as Normalise from './Normalise.js';

export * from './FrequencyMutable.js';
export * from './MovingAverage.js';
export * from './NumberTracker.js';
export * from './IntervalTracker.js';
export * from './PointTracker.js';
export * from './TrackedValue.js';
export * from './TrackerBase.js';
export * from './PrimitiveTracker.js';

export * from './Clamp.js';
export * from './Scale.js';
export * from './Flip.js';

export * as Reactive from './Reactive.js';
export * as Chains from './Chain.js';
export * as Graphs from './graphs/index.js'
export * from './TrackUnique.js';
export * from './Table.js';

/**
 * Work with bipolar values (-1...1)
 * 
 * Import:
 * ```js
 * import { Bipolar } from 'https://unpkg.com/ixfx/dist/data.js';
 * ```
 * 
 * Overview:
 * * {@link immutable}: Immutable wrapper around a value
 * * {@link clamp}: Clamp on -1..1 scale
 * * {@link scale}: Scale a value to -1..1
 * * {@link toScalar}: Convert -1..1 to 0..1
 * * {@link fromScalar}: Convert from 0..1 to -1..1
 * * {@link towardZero}: Nudge a bipolar value towards zero
 */
export * as Bipolar from './Bipolar.js';
export * from './Interpolate.js';
export * from './Wrap.js';
export * as Correlate from './Correlate.js';
export * as Pool from './Pool.js';
export * from './Types.js';
export const piPi = Math.PI * 2;

