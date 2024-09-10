/**
 * Easings module
 *
 * [See the ixfx Guide](https://ixfx.fun/modulation/easings/introduction/)
 *
 * Overview:
 * * {@link Easings.create}: Create an easing with provided settings
 * * {@link Easings.time}: Ease by time
 * * {@link Easings.ticks}: Ease by tick
 * * {@link Easings.get}: Get an easing function by name
 * * {@link Easings.line}: Get an easing function that uses a warped line
 * 
 * @example Importing
 * ```js
 * import { Easings } from 'ixfx/modulation.js';
 * Easings.time(...);
 *
 * // Import from web
 * import { Easings } from 'https://unpkg.com/ixfx/dist/modulation.js'
 * Easings.time(...);
 * ```
 */
export * as Easings from './easing/index.js';

/**
 * Envelopes module.
 * [See the ixfx Guide](https://ixfx.fun/modulation/overview/).
 * 
 * Quick overview:
 * * {@link Adsr}: Create an envelope object for maximum control
 * * {@link adsr}: A function that yields values as envelope runs
 * * {@link adsrIterable}: A generator that yields values over an envelope
 */
export * as Envelopes from './envelope/index.js';
export * as Sources from './source/index.js';

export * from './CubicBezier.js'
export * from './Drift.js';


/**
 * Forces module can help to compute basic physical forces like gravity, friction, springs etc.
 * [See the ixfx Guide](https://ixfx.fun/modulation/forces/introduction/).
 * 
 * @example Importing
 * ```js
 * import { Forces } from 'ixfx/modulation.js';
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
 * * {@link saw}: 'Sawtooth' wave
 * * {@link sine}: Sine wave
 * * {@link sineBipolar}: Sine wave with range of -1 to 1
 * * {@link square}: Square wave
 * * {@link triangle}: Triangle wave
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
 * import { Oscillators } from 'ixfx/modulation.js';
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
export * from './TimingSourceFactory.js';

export type * from './Types.js';
export * from './Waveforms.js';
export * from './WeightedAverage.js';
