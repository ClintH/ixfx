export type * from './PrimitiveTypes.js';

/**
 * Select a namespace below for more
 *
 * * {@link Collections}: Working with lists, sets, maps
 * * {@link Data}: Scaling, clamping, interpolating, averaging data
 * * {@link Dom}: DOM manipulation
 * * {@link Flow}: Delays, loops, State Machine, deboucing, throttling, timers
 * * {@link Geometry}: Working with various kinds of shapes and spatial calcuations
 * * {@link Iterables}: Work with iterables/generators
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
 * Sub-modules:
 * * {@link Data.Arrays} helpers for working with arrays
 * * {@link Data.Correlate} simple data correlation
 * * {@link Data.Maps} helpers for working with maps
 * * {@link Data.Pathed}: compare objects, access value by string path
 * * {@link Data.Pool}: allocate resources within a pool
 * * {@link Data.Process}: process values
 * 
 * Comparing
 * * {@link Data.changedDataFields}: set of fields that have changed between two objects
 * * {@link Data.compareData}: produce a list of changes between two objects
 * * {@link Data.compareArrays}: compare contents of an array
 * * {@link Data.compareKeys}: compare keys of two objects
 * 
 * Etc
 * * {@link keysToNumbers}: Convert keys of an object to number data type
 * * {@link mapObjectByObject}: Map values of an object using a structured set of map functions. Allows you to use different map functions for different keys.
 * * {@link mapObjectShallow}: Maps top-level values of an object through a common function.
 * * {@link resolve}: For an input value, iterator/generator or function, it will return a value
 * * {@link resolveFields}: Like {@link resolve} but works on all the top-level values of an object.
 * 
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import { resolve } from '../../ixfx/dist/data.js';
 * // Import from web
 * import { resolve } from 'https://unpkg.com/ixfx/dist/data.js'
 * ```
 */
export * as Data from './data/index.js';

/**
 * A few functions for helping with debugging
 * * {@link fpsCounter}: Compute frames-per-second
 * * {@link getErrorMessage}: Get an error as a string
 * * {@link logger}: Log to console
 * * {@link logSet}: log, warn and error loggers
 */
export * as Debug from './debug/index.js';

export * as Rx from './rx/index.js';

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
 * * {@link beforeMatch}: Returns from the start of a string until match has been found
 * * {@link afterMatch}: As above, but returns part of string after match
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
 * Input and output to devices, sensors and actuators.
 * 
 * Modules:
 * * {@link AudioAnalysers}: Process audio
 * * {@link AudioVisualisers}: Visualise audio
 * * {@link Bluetooth}: Connect to devices via BLE
 * * {@link Camera}: Get frames from the device's camera
 * * {@link Espruino}: Connect to Espruino devices via USB or BLE
 * * {@link Serial}: Connect to devices via USB serial
 * * {@link VideoFile}: Get frames from a video file
 * 
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
 * * {@link StateMachine}: Manage state transitions
 * * {@link everyNth}: Returns _true_ for every nth call
 * 
 * Rate-oriented
 * * {@link debounce}: Only handle invocation after a minimum time has elapsed
 * * {@link throttle}: Only handle invocations at a maximum rate
 *
 * Time-oriented
 * * {@link timeout}: Run code after a specified time delay
 * * {@link sleep}: Using `async await`, delay execution for a period
 * * {@link sleepWhile}: Keep sleeping until a predicate returns _true_
 * * {@link delay}: Using `async await`, run a given callback after a period
 * * {@link waitFor}: Calls a function and have the possibility to cancel if it takes too long
 * * {@link rateMinimum}: Ensures that a function is called at a set rate
 * 
 * Iteration over values
 * * {@link forEach} / {@link forEachSync}: Loop over an iterable or array, with the possibility of early exit
 * * {@link repeat} / @{link repeatAwait}: Runs a function a given number of times, yielding results as they come in
 *
 * Monitoring
 * * {@link hasElapsed}: Returns _true_ when certain time has passed
 * * {@link retryFunction}: Keep calling a function until it returns a value
 * * {@link retryTask}: Keep trying a task until it succeeds
 * * {@link waitFor}: Try to run something but take action if it fails or doesn't return
 * * {@link singleItem}: Wait for a single value to be produced
 * * {@link SyncWait}: Simple synchronisation
 * * {@link RequestResponseMatch}: Housekeeping of matching requests from A with responses from B and handling failures
 * 
 * Executing
 * * {@link run}: Run a series of async expressions, returning result / {@link runSingle}
 * * {@link runOnce}: Wrap a function so it only gets called once
 * * {@link DispatchList}: Simple foundation for publish/subscribe events
 * * {@link TaskQueueMutable}: Task queue
 * 
 * Loops
 * * {@link continuously}: Run code in a loop, as fast as possible or with a delay between each execution
 * * {@link delayLoop}: A generator that yields at a given rate
 *
 * Timers
 * * {@link elapsedMillisecondsAbsolute}: Timer that returns elapsed time since initial invocation
 * * {@link elapsedTicksAbsolute}: Timer based on manual 'ticks'
 * * {@link backoffGenerator}: Compute increasingly-larger timeout values
 * 
 * Etc
 * * {@link promiseFromEvent}: Create a promise from an event
 * * {@link promiseWithResolvers}
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
 * A set of functions for working with async generators/iterators.
 * 
 * Functions marked (S) work with endless iterables. That is, they don't require
 * that an iterable finishes.
 * 
 * Conversions
 * * {@link toArray} Copy contents of iterable to an array
 * * {@link map} Yields value from an input iterable transformed (with possible change of type) through a map function. (S)
 * * {@link fromArray} Yields values from an array over time.
 * * {@link fromIterable} Yields values from an input iterable over time.
 * 
 * Comparisons
 * * {@link every} Returns _true_ if predicate is _true_ for every item in iterable
 * * {@link equals} Returns _true_ if values in two iterables are the same at the same location, judged by a provided equality function
 * * {@link max} Yields the currently highest max value from an iterable (S)
 * * {@link min} Yields the currently highest min value from an iterable (S)
 * * {@link unique} Return a set of unique items, compared by reference. (S)
 * * {@link uniqueByValue} Return a set of unique items, compared by value. (S)
 * 
 * Filtering/finding
 * * {@link filter} Yields value from iterator that match a predicate (opposite of `dropWhile`)
 * * {@link dropWhile} Yields values from iterator, except those that meet predicate. Opposite of `filter`
 * * {@link find} Returns first value from iterator that matches predicate (S)
 * * {@link some} Returns _true_ if a value matching a predicate is found. (S)
 * * {@link reduce} Reduce an iterable down to one value using an 'accumulator' function
 * 
 * Reshaping
 * * {@link map} Yields value from an input iterable transformed (with possible change of type) through a map function. (S)
 * * {@link chunks} Yields a certain sized 'chunk' of values from iterable as an array (S)
 * * {@link concat} Yields all the results of each iterable in turn (S)
 * * {@link flatten} For an input iterator of arrays, returns a flattened set of values
 * * {@link slice} Take a slice of an iterable
 * * {@link zip} Combines items at same position from iterables
 * 
 * Values
 * * {@link fill} Yields a fixed value for every value from an iterable
 * * {@link combineLatestToArray} Yield an array of values whenever a source iterable changes
 * * {@link reduce} Reduce an interable
 * 
 * Iterating
 * * {@link forEach} Runs a function for each value of iterable (S)
 * * {@link until} Calls a function for each value of an iterable. Value itself is ignored (unlike a {@link forEach}) (S)
 * 
 *  * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import { map } from '../../ixfx/dist/iterables.js';
 * // Import from web
 * import { map } from 'https://unpkg.com/ixfx/dist/iterables.js'
 * ```
*/
export * as Iterables from './iterables/index.js';

/**
 * 
 * Sub-modules
 * * {@link Numbers.Normalise}: normalise values
 * * {@link Numbers.Bipolar}: helpers for working with -1...1 bipolar values
 * 
 * Working with scalar values
 * * {@link Numbers.Normalise}: normalise values
 * * {@link proportion}: Scales one scalar by another
 * * {@link wrap}: Wraps a value to be within a range
 * * {@link flip}: Flips a percentage-scale number (eg 1 => 0, 0.5 => 0.5, 0 => 1) 
 * 
 * Averaging/rounding
 * * {@link average}: Basic mathematical average
 * * {@link averageWeighted}: Weighted average
 * * {@link movingAverage}: Calculates an average-over-time ({@link movingAverageLight} is a coarser, less memory-intensive version)
 * * {@link movingAverageTimed}: Automatically add values at a given rate
 * * {@link noiseFilter}: Noise filter
 * * {@link round}
 * * {@link quantiseEvery}: Rounds a value to the nearest given value
 * 
 * Calculating
 * * {@link dotProduct}
 * * {@link min}, {@link max}, {@link minIndex}, {@link maxIndex}
 * * {@link total}
 * * {@link relativeDifference}: Returns the relative difference from some initial value
 * * {@link weight} Weighs an array of numbers according to their position
 * 
 * Generators/iterators
 * * {@link count}: Generate a set numbers, counting by one
 * * {@link numericPercent}: Generate a range of numbers on the percentage scale of 0-1
 * * {@link numericRange}: Generate a range of numbers
 * * {@link filter}: Filter a generator, only yielding those which are numbers
 * * {@link linearSpace}: Generates series of values between start and end
 * 
 * Clamping:
 * * {@link clamp}: Restrict a number to a given range
 * * {@link clampIndex}: Restrict a number to be within the size of an array
 * 
 * Scaling:
 * * {@link scale}: Scale a value from an input range to an output range. {@link scaler} returns a function to scale values.
 * * {@link scaleClamped}: Scale a value from an input range to an output range, clamping so that output range is a hard limit
 * * {@link scalePercent}: Scale input percentage to an output range
 * * {@link scalePercentages}: Scale input percentage to an output percentage range
 * 
 * Interpolate
 * * {@link interpolate}: Interpolate from A to B by a given amount
 * * {@link interpolateAngle}: Interpolate angle
 * * {@link interpolatorInterval}: Interpolate automatically over time
 * * {@link interpolatorStepped}: Interpolate automatically stepwise
 * 
 * Etc
 * * {@link applyToValues}: Applies a function to every key of an object which is a number
 * * {@link isApprox}: _True_ if number is roughly within a range
 * * {@link isValid}: _True_ if input is a number, {@link validNumbers}
 */
export * as Numbers from './numbers/index.js';


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
 * * {@link fullSizeCanvas}: Keeps a canvas element at maximum size
 * * {@link pointerVisualise}: Shows pointer events for debugging purposes
*
* Components
* * {@link DataTable}: Creates a HTML table from an object/map of objects
* * {@link log}: log to DOM
*
* Basic DOM manipulation
* * {@link clear}: remove all child nodes from a parent
* * Create DOM elements: {@link createAfter}, {@link createIn}
* 
* Position/size
* * {@link cardinalPosition}: Get the corner x,y of an element
* * {@link parentSize}: Sets width/height of an element according to size of parent
 * * {@link getTranslation}: Returns the CSS translation of an element
 * 
 * Etc
 * * {@link copyToClipboard}: Attempt to copy a string representation to clipboard
 * * {@link cycleCssClass}: Given an array of css classes cycle between them each time function is called
 * 
 * Getting DOM references
 * * {@link resolveEl}: resolve an element by query or instance
 * * {@link byId}: Gets an element by id, or throws an error
 * 
 */
export * as Dom from './dom/index.js';

export * as Events from './Events.js';


/**
 * The Modulation module contains functions for, well, modulating data.
 *
 * @example Importing
 * ```
 * // If library is stored two directories up under `ixfx/`
 * import * as Modulation from '../../ixfx/dist/modulation.js';
 *
 * // Import from web
 * import * as Modulation from 'https://unpkg.com/ixfx/dist/modulation.js'
 * ```
 *
 */
export * as Modulation from './modulation/index.js';

export * from './TsUtil.js';

/**
 * This module includes a variety of techniques for storing and retrieving data.
 *
 * ## Ranked collections
 * 
 * ### Queues
 * A queue has the logic of waiting in line at the bakery. First in, first out.
 * * {@link Queues.immutable}: Create a {@link Queues.IQueueImmutable immutable queue}.
 * * {@link Queues.mutable}: Create a {@link Queues.IQueueMutable mutable queue}. Has events that fire when queue is manipulated.
 * * {@link Queues.priority}: Create a {@link Queues.IPriorityQueueMutable priority queue}
 * 
 * ### Stacks
 * A stack has the logic of stacked plates. First in, last out.
 * * {@link Stacks.immutable}: Create a {@link Stacks.IStackImmutable immutable queue}.
 * * {@link Stacks.mutable}: Create a {@link Stacks.IStackMutable mutable stack}.
 * 
 * ## Sets
 * Like a regular array, a set can store many items. However, duplicate items are ignored - it
 * only keeps unique items. ixfx's {@link Sets.ISetMutable} allows for considering items as identical by value, not
 * just by reference as the default JS Set operates
 *
 * * {@link Sets.mutable}: Create a {@link Sets.ISetMutable mutable set}.
 * * {@link Sets.immutable}: Create an {@link Sets.ISetImmutable immutable set}.
 * * {@link Sets.MassiveSet}: Regular JS sets have a restriction on capacity. This implementation can store more.
 *
 * ## Maps
 * * {@link Maps.immutable}: Create a {@link Maps.IMapImmutable immutable map}.
 * * {@link Maps.mutable}: Create a {@link Maps.IMapMutable mutable map}.
 * * {@link ExpiringMap}: A map that can have a capacity limit and automatically expire key/value pairs.
 * * {@link Maps.NumberMap}: A map that associates keys with numeric values, including some helper functions.
 * * {@link Maps.ofArrayMutable}: Stores multiple values for a key in an array.
 * * {@link Maps.ofCircularMutable}: Stores multiple values for a key in a circular array.
 * * {@link Maps.ofSetMutable}: Stores multiple values for a key in a Set.
 * 
 * ## Trees
 * * {@link Trees.Mutable.root}: Create a root tree node
 * * {@link Trees.Mutable.rootWrapped}: Create a root tree node for object-oriented access
 * * {@link Trees.FromObject.create}: Create a tree structure from the basis of an object's structure.
 * * {@link Trees.FromObject.createWrapped}: Create a tree structure from the basis of an object's structure, wrapped for object-oriented access.
 * 
 * ## Graphs
 * * {@link Graphs.Directed}
 * * {@link Graphs.Undirected}
 * 
 * ## Etc
 * * {@link Table}
 * * {@link circularArray}
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {map} from '../../ixfx/dist/collections.js';
 * // Import from web
 * import {map} from 'https://unpkg.com/ixfx/dist/collections.js'
 * ```
 */
export * as Collections from './collections/index.js';

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
export * as Random from './random/index.js';
export * as Util from './util/index.js';

/**
 * Trackers are useful for tracking a series of data over time.
 * * {@link number}: Tracks min, max and average of a stream of numbers
 * * {@link interval}: Tracks min, max and average time interval between events
 * * {@link point}: Tracks the spatial change of x,y coordinates. Useful for tracking a mouse cursor, for example.
 * * {@link points}: Tracks changes in multiple x,y coordinates. Useful for tracking each finger touch on a screen, for example.
 * * {@link frequency}: Count occurences of a value
 */
export * as Trackers from './trackers/index.js';
