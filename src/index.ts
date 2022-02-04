// Major modules
export * as Geometry from './geometry/index.js';
export * as Visual from './visual/index.js';
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

// Minor modules
export * as Generators from './Generators.js';
export * as Random from './Random.js';
export * as KeyValues from './KeyValue.js';

// Loose functions
export * from './util.js';
export * from './Timer.js';

// Types and interfaces
export * from './Interfaces.js';

// Classes
export { KeyValue } from './KeyValue.js';
export {mutableFrequency, MutableFrequency} from './MutableFrequency.js';
export {StateMachine} from './StateMachine.js';
