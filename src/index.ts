// Major modules
export * as Geometry from './geometry/index.js';
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
export * from './util.js';
export * as Timers from './Timer.js';

// Types and interfaces
export * from './Interfaces.js';

// Classes
export { KeyValue } from './KeyValue.js';
export {frequencyMutable, FrequencyMutable} from './MutableFrequency.js';
export {StateMachine} from './StateMachine.js';
