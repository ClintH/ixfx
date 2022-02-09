export * as Geometry from './geometry/index.js';
export * as Flow from './flow/index.js';

/**
 * Canvas drawing functions.
 */
export * as Drawing from './visual/Drawing.js';

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


/**
 * The Modulation module contains functions for, well, modulating data.
 * 
 * Overview:
 * * {@link adsr}: Modulate over a series of ADSR stages.
 * * {@link easeOverTime}: Ease from `0` to `1` over a specified duration.
 * 
 * @example Import examples
 * ```
 * // If library is stored two directories up under `ixfx/`
 * import {adsr, defaultAdsrOpts} from '../../ixfx/modulation.js';
 * 
 * // Import from web
 * import {adsr, defaultAdsrOpts} from 'TODO'
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

/**
 * Generators produce values on demand.
 */
export * as Generators from './Generators.js';
export * as Random from './Random.js';
export * as KeyValues from './KeyValue.js';

// Loose functions

export * from './Util.js';

/**
 * Run code at intervals or with a delay
 * 
 * Overview:
 * * {@link continuously} Run code in a loop, as fast as possible or with a delay between each execution
 * * {@link timeout} Run code after a specified time delay
 * * {@link sleep} Using `async await`, delay execution for a period
 * * {@link delay} Using `async await`, run a given callback after a period
 */
export * as Timers from './Timer.js';


// Classes
export { KeyValue } from './KeyValue.js';
export {frequencyMutable, FrequencyMutable} from './FrequencyMutable.js';
