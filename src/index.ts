/**
 * Select a namespace below for more
 *
 * * {@link Collections}: Working with lists, sets, maps
 * * {@link Data}: Scaling, clamping, interpolating, averaging data
 * * {@link Dom}: DOM manipulation
 * * {@link Flow}: Delays, loops, State Machine, deboucing, throttling, timers
 * * {@link Generators}: Generate data
 * * {@link Geometry}: Working with various kinds of shapes and spatial calcuations
 * * {@link Io}: Connect to Espruino, Arduino, sound and video inputs
 * * {@link Modulation}: Envelopes, oscillators, jittering, forces
 * * {@link Numbers}: A few number-processing functions
 * * {@link Random}: Compute various forms of random numbers
 * * {@link Text}: A few string processing functions
 * * {@link Visual}: Colour, drawing, SVG and video
 * @module
 */

/**
 * Processing streams of data. [Read more in the docs](https://clinth.github.io/ixfx-docs/temporal/normalising/)
 *
 * * {@link clamp}: Restrict a number to a given range
 * * {@link clampIndex}: Restrict a number to be within the size of an array
 * * {@link flip}: Invert a relative number
 * * {@link interpolate}: Mix between two numbers by an amount
 * * {@link interpolateAngle}: Mix between two angles by an amount
 * * {@link scale}: Scale a value from an input range to an output range
 * * {@link wrap}: Wraps a value to be within a range
 * * {@link wrapInteger}: Wraps an integer to be within a range
 *
 * ### Averaging
 * * {@link movingAverage}: Calculates an average-over-time ({@link movingAverageLight} is a coarser, less memory-intensive version)
 *
 * ### Normalise sub-module
 * * {@link Normalise.stream | Normalise.stream}: Normalises a stream of values
 * * {@link Normalise.array | Normalise.array}: Normalises an array of values
 *
 * ### Trackers
 * Trackers are useful for tracking a series of data over time.
 * * {@link numberTracker}: Tracks min, max and average of a stream of numbers
 * * {@link intervalTracker}: Tracks min, max and average time interval between events
 * * {@link pointTracker}: Tracks the spatial change of x,y coordinates. Useful for tracking a mouse cursor, for example.
 * * {@link pointsTracker}: Tracks changes in multiple x,y coordinates. Useful for tracking each finger touch on a screen, for example.
 * * {@link frequencyMutable}: Count occurences of a value
 *
 * * {@link Pool.Pool}: Manage a shared set of resources
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {movingAverage} from '../../ixfx/dist/data.js';
 * // Import from web
 * import {movingAverage} from 'https://unpkg.com/ixfx/dist/data.js'
 * ```
 */
export * as Data from './data/index.js';

/**
 * Functions for different shapes, paths and coordinate spaces.
 *
 * A foundation module is {@link Points} for working with x, y (and maybe z).
 * It has the top-level helper functions: {@link degreeToRadian} and {@link radianToDegree}
 *
 * Basic shapes: {@link Arcs}, {@link Circles}, {@link Ellipses}, {@link Lines}, {@link Rects}, {@link Triangles}
 *
 * Curves & paths: {@link Beziers}, {@link Paths}, {@link Compound}
 *
 * Util:
 * * {@link Polar}: Polar coordinates
 * * {@link Scaler}: Simplify back and forth conversion between absolute/relative Cartesian coordinates
 * * {@link Shapes}: Generates a few shapes like arrows
 * * {@link SurfacePoints}: Generate points within a shape. Useful for creating patterns
 * * {@link Vectors}: Vector operations working on either Cartesian or polar coordinates
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {Lines, Points} from '../../ixfx/dist/geometry.js';
 * // Import from web
 * import {Lines, Points} from 'https://unpkg.com/ixfx/dist/geometry.js'
 * ```
 */
export * as Geometry from './geometry/index.js';

/**
 * Text processing
 *
 * Overview:
 * * {@link between}: Return text between a start and end match
 * * {@link countCharsFromStart}: Count the number of times a given set of characters appear at the beginning of a string
 * * {@link omitChars}: Returns source with a given number of characters removed
 * * {@link splitByLength}: Splits up a source string into x-charcter sized chunks
 * * {@link startsEnds}: Returns true if a string starts and end with the given strings
 * * {@link unwrap}: 'Unwraps' a string, removing characters if they appear at beginning and end
 * * {@link untilMatch}: Returns from the start of a string until match has been found
 *
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {between} from '../../ixfx/dist/text.js';
 * // Import from web
 * import {between} from 'https://unpkg.com/ixfx/dist/text.js'
 * ```
 */
export * as Text from './Text.js';

/**
 * Number processing
 *
 * Note though that 'number processing' is all over the place. This is
 * added mostly as a semantic aliasing where it makes sense.
 * Overview
 * * {@link average}: Average numbers
 */
export * as Numbers from './Numbers.js';

/**
 * Input and output to devices, sensors and actuators
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {Camera, Espruino} from '../../ixfx/dist/io.js';
 * // Import from web
 * import {Camera, Espruino} from 'https://unpkg.com/ixfx/dist/io.js'
 * ```
 */
export * as Io from './io/index.js';

/**
 * Control execution
 *
 * Logic-oriented
 *  * {@link StateMachine}: Manage state transitions
 *
 * Rate-oriented
 * * {@link debounce}: Only handle invocation after a minimum time has elapsed
 * * {@link throttle}: Only handle invocations at a maximum rate
 *
 * Time-oriented
 * * {@link timeout}: Run code after a specified time delay
 * * {@link sleep}: Using `async await`, delay execution for a period
 * * {@link delay}: Using `async await`, run a given callback after a period
 * * {@link interval}: Generates values from a given function with a given delay
 * * {@link waitFor}: Calls a function and have the possibility to cancel if it takes too long
 *
 * Iteration over values
 * * {@link forEach} / {@link forEachAsync}: Loop over an iterable or array, with the possibility of early exit
 * * {@link repeat}: Runs a function a given number of times, collating results
 *
 * Monitoring
 * * {@link Elapsed.progress}: Track completion of a time duration
 *
 * Loops
 * * {@link continuously}: Run code in a loop, as fast as possible or with a delay between each execution
 * * {@link delayLoop}: A generator that yields at a given rate
 *
 * Timers
 * * {@link msElapsedTimer}: Timer that returns elapsed time since initial invocation
 * * {@link ticksElapsedTimer}: Timer based on manual 'ticks'
 *
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {continuously, stateMachine} from '../../ixfx/dist/flow.js';
 * // Import from web
 * import {continuosly, stateMachine} from 'https://unpkg.com/ixfx/dist/flow.js'
 * ```
 */
export * as Flow from './flow/index.js';

/**
 * Generators produce values on demand.
 *
 * Overview:
 * * {@link count}: Generate a set numbers, counting by one
 * * {@link numericPercent}: Generate a range of numbers on the percentage scale of 0-1
 * * {@link numericRange}: Generate a range of numbers
 * * {@link pingPong} / {@link pingPongPercent}: Generate numbers that repeat up and down between the set limits
 *
 * Aliases:
 * * {@link delayLoop}: A generator that yields at a given rate
 * * {@link interval}: Generates values from a given function with a given delay
 * * {@link randomUniqueInteger}: Random unique integer
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {count, interval} from '../../ixfx/dist/generators.js';
 * // Import from web
 * import {count, interval} from 'https://unpkg.com/ixfx/dist/generators.js'
 * ```
 */
export * as Generators from './Generators.js';

/**
 * Visuals
 *
 * Sub-modules:
 * * {@link Video}: Working with video, either playback from a file or stream from a video camera.
 * * {@link Drawing}: Canvas drawing helper
 * * {@link Colour}: Colour interpolation, scale generation and parsing
 * * {@link Palette}: Colour palette managment
 * * {@link Svg}: SVG helper
 *
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {Colour} from '../../ixfx/dist/visual.js';
 * // Import from web
 * import {Colour} from 'https://unpkg.com/ixfx/dist/visual.js'
 * ```
 */
export * as Visual from './visual/index.js';

/**
 * DOM module has some functions for easing DOM manipulation.
 *
 * * {@link copyToClipboard}: Attempt to copy a string representation to clipboard
 * * {@link fullSizeCanvas}: Keeps a canvas element at maximum size
 * * {@link parentSize}: Sets width/height of an element according to size of parent
 * * {@link getTranslation}: Returns the CSS translation of an element
 * * {@link pointerVisualise}: Shows pointer events for debugging purposes
 *
 * Components
 * * {@link dataTable}: Creates a HTML table from an object
 * * {@link dataTableList}: Create a list of tables from a Map of data
 * * {@link log}: log to DOM
 * * {@link rx}: keep track of event data
 *
 * Basic DOM manipulation
 * * {@link clear}: remove all child nodes from a parent
 * * {@link resolveEl}: resolve an element by query or instance
 * * Create DOM elements: {@link createAfter}, {@link createIn}
 */
export * as Dom from './dom/index.js';

export * as Events from './Events.js';

/**
 * The Modulation module contains functions for, well, modulating data.
 *
 * Sub-modules:
 * * {@link Easings}: Ease from `0` to `1` over a specified duration.
 * * {@link Oscillators}: Waveforms
 * * {@link Forces}: Forces such as bouncing, gravity, attraction/repulsion, springs
 *
 * Functions:
 * * {@link adsr}: Modulate over a series of ADSR stages (ie. an envelope)
 * * {@link jitter}: Jitter a value
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
 * Helper functions for working with in-built Javascript collections
 * * {@link Maps}
 * * {@link Arrays}
 *
 * ### MutableSet
 * Like a regular array, a set can store many items. However, duplicate items are ignored - it
 * only keeps unique items. ixfx's {@link Sets.ISetMutable | MutableSet} allows for considering items as identical by value, not
 * just by reference as the default JS Set operates
 *
 * * {@link Sets.mutable}: Create a {@link Sets.ISetMutable}
 *
 * ### CircularArray
 * {@link circularArray} extends a regular array, but only keeps the last _x_ number of items.
 *
 * ## Ordered collections
 *
 * {@link Queues}: a list of ordered data, like a bakery queue
 * * Create with {@link Queues.immutable} or {@link Queues.mutable}
 *
 * {@link Stacks}: a list of ordered data, like a stack of plates
 * * Create with {@link Stacks.immutable} or {@link Stacks.mutable}
 *
 * Both queue and stack come in mutable and immutable varieties and can limit items
 * stored in varies ways.
 *
 * ### Map
 *
 * {@link Maps.IMapImmutable} is a slight variant of the usual JS Map. It allows for a custom logic for computing keys
 * for items based on a function.
 *
 * * Create with {@link Maps.immutable} or {@link Maps.mutable}
 *
 * {@link Maps.ExpiringMap} has the same semantics as a regular map, but can automatically remove items if they haven't been set/get for a given interval, and/or if a capacity limit is reached.
 *
 * * Create with {@link Maps.expiringMap}
 *
 * ### Map-of
 *
 * {@link Maps.IMapOf} allows for several values to be stored under a single key. Unlike a regular JS Map
 * which only allows a single value per key. IMapOfMutable also has events for listening to changes
 * in the data.
 *
 * * {@link Maps.ofArrayMutable}: Holds any number of items under a given key
 * * {@link Maps.ofSetMutable}: Holds any number of **unique** items under a given key
 * * {@link Maps.ofCircularMutable}: Holds the most recent _x_ items under a given key
 *
 * For cases where events are not needed consider {@link Maps.mapOfSimpleMutable}. This is a bit more lightweight.
 *
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {map} from '../../ixfx/dist/collections.js';
 * // Import from web
 * import {map} from 'https://unpkg.com/ixfx/dist/collections.js'
 * ```
 */
export * as Collections from './collections/index.js';

// -----------------------------
// Minor modules
// -----------------------------

/**
 * Totally rando.
 *
 * Numbers
 * * {@link float} Random floating point number within a given range
 * * {@link integer} Random whole number within a given range
 * Arrays
 * * {@link arrayElement} Random item from an array (alias of `Arrays.randomElement`)
 * * {@link arrayIndex} Random index of an array (alias of `Arrays.randomIndex`)
 *
 * Time
 * * {@link minutesMs} Random range of minutes, value in milliseconds
 * * {@link secondsMs} Random range of seconds, value in milliseconds
 *
 * Weighted random numbers:
 * * {@link weighted} Weigh distribution with an easing function
 * * {@link weightedInteger} As above, but whole numbers
 * * {@link gaussian} Gaussian (bell curve-like) distribution
 *
 * More
 * * {@link hue} Random hue - 0..359 number (alias of `Visual.Colour.randomHue`)
 * * {@link string} Random string made up of letters and numbers
 * * {@link shortGuid} Quasi-unique id generator
 *
 *
 * @example Importing (with aliasing)
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {hue as randomHue, string as randomString} from '../../ixfx/dist/random.js';
 * // Import from web
 * import {hue as randomHue, string as randomString} from 'https://unpkg.com/ixfx/dist/random.js'
 * ```
 */
export * as Random from './Random.js';
export * as KeyValues from './KeyValue.js';

export * as Util from './Util.js';
