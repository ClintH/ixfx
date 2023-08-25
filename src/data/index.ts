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

export * from './Clamp.js';
export * from './Scale.js';
export * from './Flip.js';
export * from './Interpolate.js';
export * from './Wrap.js';
export * as Correlate from './Correlate.js';
export * as Pool from './Pool.js';

export const piPi = Math.PI * 2;
export type NumberFunction = () => number;
