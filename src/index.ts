/**
 * Processing streams of data. [Read more in the docs]{@link https://clinth.github.io/ixfx-docs/temporal/normalising/}
 * 
 * * {@link movingAverage}: Calculates an average-over-time ({@link movingAverageLight} is a coarser, less memory-intensive version)
 * * {@link frequencyMutable}: Count occurences of a value
 * * {@link Normalise.stream}: Normalises a stream of values
 * * {@link Normalise.array}: Normalises an array of values
 */
export * as Temporal from './temporal/index.js';

/**
 * Functions for different shapes, paths and coordinate spaces
 */
export * as Geometry from './geometry/index.js';

/**
 * Text processing
 */
export * as Text from './Text.js';

/**
 * Input and output to devices, sensors and actuators
 */
export * as Io from './io/index.js';

/**
 * Control execution
 * 
 * Overview:
 * * {@link continuously} Run code in a loop, as fast as possible or with a delay between each execution
 * * {@link timeout} Run code after a specified time delay
 * * {@link sleep} Using `async await`, delay execution for a period
 * * {@link delay} Using `async await`, run a given callback after a period
 * * {@link forEach} / {@link forEachAsync} Loop over an iterable or array, with the possibility of early exit
 * * {@link StateMachine} Manage state transitions
 */
export * as Flow from './flow/index.js';

/**
 * Generators produce values on demand.
 * 
 * Overview
 * * {@link count} Generate a set numbers, counting by one
 * * {@link numericPercent} Generate a range of numbers on the percentage scale of 0-1
 * * {@link numericRange} Generate a range of numbers
 * * {@link pingPong} / {@link pingPongPercent} Generate numbers that repeat up and down between the set limits
 * 
 */
export * as Generators from './Generators.js';

/**
 * @module
 * Visuals
 * 
 * Overview:
 * * {@link Colour}: Colour interpolation, scale generation and parsing
 * * {@link Palette}: Colour palette managment
 * * {@link Svg}: SVG helper
 * * {@link Drawing}: Canvas drawing helper
 * 
 */
export * as Visual from './visual/index.js';

/**
 * DOM module has some functions for easing DOM manipulation.
 * 
 * * {@link log} - log to DOM
 * * {@link rx} - keep track of event data
 * * {@link resolveEl} - resolve an element by query
 * * Create DOM elements: {@link createAfter}, {@link createIn}
 * 
 * 
 */
export * as Dom from './dom/index.js';

export * as Events from './Events.js';

/**
 * The Modulation module contains functions for, well, modulating data.
 * 
 * Overview:
 * * {@link adsr} - Modulate over a series of ADSR stages.
 * * {@link Easings} - Ease from `0` to `1` over a specified duration.
 * * {@link jitter} - Jitter a value
 * * {@link Oscillators} - Waveforms
 * * {@link Forces} - Forces such as bouncing, gravity, attraction/repulsion, springs
 * 
 * @example Importing
 * ```
 * // If library is stored two directories up under `ixfx/`
 * import {adsr, defaultAdsrOpts} from '../../ixfx/dist/modulation.js';
 * 
 * // Import from web
 * import {adsr, defaultAdsrOpts} from 'https://unpkg.com/ixfx/dist/modulation.js'
 * ```
 * 
 */
export * as Modulation from './modulation/index.js';

/**
 * This module includes a variety of techniques for storing and retrieving data.
 * 
 * In short:
 * * {@link Maps}: store/retrieve a value by a _key_. {@link MapOfMutable |MapOfs} allow storing multiple values under the same key.
 * * {@link Arrays}: a list of data
 * * {@link Sets}: a list of data with no duplicates
 * * {@link Queues}: a list of ordered data, like a bakery queue
 * * {@link Stacks}: a list of ordered data, like a stack of plates
 */
export * as Collections from './collections/index.js';

// -----------------------------
// Minor modules
// -----------------------------


export * as Random from './Random.js';
export * as KeyValues from './KeyValue.js';

// Loose functions

export * from './Util.js';
import * as Util from './Util.js';

// Classes
export { KeyValue } from './KeyValue.js';
