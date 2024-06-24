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

export * from './Clamp.js';
export * from './Compare.js';
export * as Correlate from './Correlate.js';
export * from './Flip.js';
export * from './FrequencyMutable.js';
export * from './Interpolate.js';
export * from './IntervalTracker.js';
export * from './KeysToNumbers.js';
export * from './MapObject.js';
export * from './MovingAverage.js';
export * from './NumberTracker.js';
/**
 * Normalise module
 * * {@link array}: Normalises the contents of an array of known values.
 * * {@link stream}: Normalises a stream of unknown values.
 */
export * as Normalise from './Normalise.js';

/**
 * Means of accessing, creating and comparing objects
 * based on 'paths'. This is useful for serialisation.
 * 
 */
export * as Pathed from './Pathed.js'
export * from './MonitorChanges.js';
export * from './PointTracker.js';
export * as Pool from './Pool.js';
export * from './PrimitiveTracker.js';
export * from './Process.js';
export * from './Proportion.js';
export * from './ResolveFields.js';
export * from './Scale.js';
export * from './Softmax.js';
export * from './Table.js';
export * from './TrackedValue.js';
export * from './TrackerBase.js';
export * from './TrackUnique.js';
export * from './Types.js';
export * from './Util.js';
export * from './Wrap.js';

export * as Graphs from './graphs/index.js'

export const piPi = Math.PI * 2;
