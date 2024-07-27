/**
 * Easings module
 *
 * [See the guide](https://clinth.github.io/ixfx-docs/modulation/easing/)
 *
 * Overview:
 * * {@link Easings.create}: Create an easing with provided settings
 * * {@link Easings.time}: Ease by time
 * * {@link Easings.ticks}: Ease by tick
 * * {@link Easings.get}: Get an easing function by name
 *
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import { Easings } from '../../ixfx/dist/modulation.js';
 * Easings.time(...);
 *
 * // Import from web
 * import { Easings } from 'https://unpkg.com/ixfx/dist/modulation.js'
 * Easings.time(...);
 * ```
 */
export * as Easings from './easing/index.js';
export * as Envelopes from './envelope/index.js';
export * as Sources from './source/index.js';

export * from './CubicBezier.js'
export * from './Drift.js';

/**
 * Forces module can help to compute basic physical forces like gravity, friction, springs etc.
 *
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import { Forces } from '../../ixfx/dist/modulation.js';
 * Forces.attractionForce(...);
 *
 * // Import from web
 * import { Forces } from 'https://unpkg.com/ixfx/dist/modulation.js'
 * Forces.attractionForce(...);
 * ```
 *
 */
export * as Forces from './Forces.js';
export * from './Gaussian.js';
export * from './Jitter.js';
export * from './Mix.js';
export * from './ModulatorTimed.js';
export * from './Noop.js';
/**
 * Oscillators module has waveshapes for producing values with a specified frequency.
 *
 * Overview
 * * {@link Oscillators.saw}: 'Sawtooth' wave
 * * {@link Oscillators.sine}: Sine wave
 * * {@link Oscillators.sineBipolar}: Sine wave with range of -1 to 1
 * * {@link Oscillators.square}: Square wave
 * * {@link Oscillators.triangle}: Triangle wave
 *
 * @example On-demand sampling
 * ```js
 * // Saw wave with frequency of 0.10hZ
 * const osc = Oscillators.saw(0.1);
 *
 * // Whever we need to sample from the oscillator...
 * const v = osc.next().value;
 * ```
 *
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import { Oscillators } from '../../ixfx/dist/modulation.js';
 * Oscillators.saw(...);
 *
 * // Import from web
 * import { Oscillators } from 'https://unpkg.com/ixfx/dist/modulation.js'
 * Oscillators.saw(...);
 * ```
 *
 */
export * as Oscillators from './Oscillator.js';
export * from './PingPong.js';
export * from './Spring.js';
export type * from './Types.js';
//import * as Easings from './easing/index.js';
//import * as Envelopes from './envelope/index.js';
//import * as Forces from './Forces.js';
export * from './Waveforms.js';
export * from './WeightedAverage.js';
