A rough changelog between NPM releases

2025.11.11

+ Core.isDateObject
+ Core.Records.prefixProperties, .enumerateNumericalValues, .zipRecords
+ Numbers.equalWithPrecisionTest, .median, .mean, .interquartileRange, .filterOutliers, .getQuantile, .standardDeviation
+ Numbers.normalise: selectable normalisation techniques: minmax (previous default), standardise and robust

# 1.17.0 2025.10.23

+ Collections.MapWithEvents: wraps a regular Map, but fires events when values are changed
+ Trackers.GatedFrequencyTracker: wraps a FrequencyTracker, but only counts once per a source
+ Arrays.removeByFilter: removes items by a predicate
+ Core.parseUrParameters: access URL parameters with fallbacks
+ Geometry.angleRadianThreePoint
+ Numbers.trackSimple: Track min, max, total and average over a stream of values
+ Normalise.streamWithContext: normalises a stream of values, but allows acess to min, max, range and ability to reset
+ Numbers.Ranges: functions for working with {min,max}: rangeIsEqual, rangeIsWithin, rangeStream, rangeMergeValue, rangeMergeRange, rangeScalar
+ Trackers.Changes: functions for simply tracking if a value has changed
+ Io.Midi: Basic MIDI data parsing
+ Arrays.mapWithEmptyFallback: Map over an array like usual, but uses a fallback value if array is undefined
* DispatchList: if a handler returns true, other handlers are not invoked
* Trackers: added 'timespan' property
* Geometry.PointTracker/Geometry.length/Point.distance: added options for working with points only as 2D coordinates, ignoring Z
* Arrays.ensureLength: takes options for how to truncate array if needed

# 0.34.0 2025.02.27

* Refactored Visual.Svg, Visual.Colour, Geometry.Polar
+ Geometry.Polar.Ray: a line based in polar coordinates

# 0.33.7 2025.01.02

+ Arrays.Sorted
 + Functions for working with sorted arrays

# 0.33.6 2024.10.25

Geometry
* Points.bbox3d: Calculate 3d bounding box
* Rects3d, Rect3dPositioned: 3d rectangles

# 0.33.4 2024.10.21

Dom.Css
+ getComputedPixels: returns parsed pixel values for a set of CSS properties via getComputedStyle

Geometry.Rects
+ subtractSize: keep x & y, just change size

# 0.33.3 2024.10.13

Numbers
+ clamper: function that clamps between min/max
+ scalerTwoWay: function that scales back and forth between ranges
* NumericArrays.total: fixed bug

Visual
+ CanvasRegion: manage a patch of drawing area
 
# 0.33.0 2024.10.04

Iterables
+ iterableController: use an iterator with start/pause/restart semantics and a callback for values.
  
Numbers
+ differenceFromLast: compare against the previous value
+ differenceFromFixed: compare against a fixed value

Geometry.Points
+ fromString: parse 'x,y,z' string as a Point

Geometry.Grids
* Large refactor
+ Grids.Array1d, Grids.Array2d for array-backed grids and array access using {x,y} coordinates 
Rx
+ domForm: reactive that emits value when form element(s) change
+ merged: output a value from any source stream

Colour
* .opacity renamed to .multiplyOpacity
+ Random.mersenneTwister for repeatable random numbers using

# 0.31.0 2024.09.22

Io.Audio
+ Added simple audio graph creation from an oscillator or AUDIO element

Geometry
+ radiansSum/degreesSum: add angles with wrap-around logic
+ radianArc/degreeArc: calculate span of angles with wrap-around logic

Geometry.Arcs
+ getStartEnd: calculate x,y of arc start & end
+ angularSize: calculate angular size of arc
+ fromCircle: using a circle as input, make an arc
+ fromCircleAmount: using a circle, start angle and span of arc, make an arc
* Made 'clockwise' explicit on arcs to avoid confusion

Geometry.Points
+ averager: calculate average of points, with selectable algorithm
+ angleRadianCircle: angle between point(s) based on a circle, rather than bipolar -180...180 range of angleRadian
  
# 0.30.2 2024.09.10

Data
+ resolveFieldsSync: synchronous version of Data.resolveFields

Rx
* Ops.tapProcess: fixed bug
  
Modulation
* Envelope: fixed 'shouldLoop' bug
+ timingSourceFactory: returns a function which creates one of the relative timers

Trackers
+ rate: Tracks the rate of events, eg clicks per second

# 0.30.0 2024.09.08

Collections
+ MapOfSimpleMutable.setValues: set all values for a key
* ExpiringMap: bug fix for expiry logic

Data
* Arrays.atWrap - access array by index, wrapping around if need be

Dom
* DragDrop: lots of improvements
* DataTable: improved formatting of numbers to avoid layout jumping

Geometry
+ Rects.encompass: return a rectangle as least as big as input, but also big enough to encompass provided point(s)
+ Rects.dividerByLargestDimension: returns a function that divides a number or point by largest dimension of a rect
+ Rects.nearestInternal: nearest point within or on perimeter of rectangle to a point
+ Bezier.interpolator: Function to interpolate along bezier 
+ Points.to2d, Points.to3d
* Wider support for Point3d in Points module

Modulation
+ line: Easing based on warping of a line

Numbers
* round: takes round up/down option

Visuals
+ Plot.CartesianCanvasPlot: plot x,y coordinates
* Drawing.rect takes 'crossed' option to draw diagonals of a rectangle

Trackers
* Added manual 'mark' for ObjectTracker and PointTracker for explicit comparison points.
  

# 0.29.0 2024.08.23

+ Numbers.difference
+ Rx.writable
+ Rx.timeoutPing: ping a source if it hasn't emitted a value lately
+ Rx.valueToPing: ping a target if a source emits any value
+ ImageDataGrid.byRow / byColumn
* Rx.From.func: integrated manual pingable logic, obsoleting Rx.from.pinged 
* Renamed Rx.Ops.batch to Rx.Ops.chunk
* Renamed Rx.Ops.timeoutTrigger to Rx.Ops.timeoutValue

# 0.27.2 2024.07.28

Flow.interval/Flow.repeat: integrated into one: Flow.repeat

Data
+ resolveSync: Synchronous version of Data.resolve

Events
+ Added .dispose

Numbers.Normalise / Numbers.weigh
* Fixed bugs

Geometry
* Renamed Points.angle to Points.angleRadian

Modulation
* Unified easings, waveforms. Lots of other re-factoring
+ mix: mix modulators

# 0.24.3 2024.07.19

Rx
* Rx.From.object: onField event can subscribe with a wildcard
+ Rx.Ops.interpolate: slowly converge on upstream value
+ Rx.Ops.computeWithPrevious: generate value based on current and previous

Data.mapObjectByObject: Remap properties of an object using a second map as a structured set of functions.


# 0.24.0 2024.07.14

Rx
+ Sources.derived: calculate and emit a value when one of many dependency values change

Modulation
+ 'Sources' sub-module with alternative implementations of waves (sine,saw,tri,sqr). These use a simpler clock mechanism at the cost of not being able to track completion or resetting.


# 0.23.2 2024.07.04

Collections/Data
* Try to keep 'Collections' module as collection data structures, moving array/map helper functions to Data module.

Data
* Broke out functions from Immutable module. Functions about pathed access live under 'Pathed'
 
Visuals
* Drawing.dot options
* Made Hsl and Rgb have opacity fields  

# 0.22.0 2024.06.17

Data
+ reactiveUpdate: given start object and a Record<string,Resolvable>, it can produce an updated merged object on demand. For example for state.

Rx
+ Several new ops: min, max, average, sum, tally, rank, drop
+ 'tap' to do parallel processing
+ Reworked annotation op and added 'annotationWithOp'

# 0.21.0 2024.06.07

Collections
+ QueueMutable: Added events for changes.
+ Arrays.piecewise: Combine array elements into piecewise pairs.
+ Queue.asResponsive: wrap a QueueMutable as a Responsive object.

Visual
* Colour: use Color.js instead of d3 libraries for interpolation & colour parsing
* Colour.resolveToString(): convert some kind of colour representation into a CSS string. Support CSS variables too.
* BipolarView: Option to show recent values as a trail and flip y axis

Flow
+ TaskQueueMutable: queue a bunch of functions and have them be run in sequence
+ SyncWait: simple synchronisation object that waits until a signal happens
* updateOutdated: Use Interval type instead of millis

# 0.20.3

Data
* Interpolate: Custom behaviour for what to do at limits of range
* Changed movingAverage et al to return a function rather than object with add, clear, compute functions.
+ Collections.MassiveSet: The inbuilt JS Set has a size limitation. MassiveSet has similar semantics but with more storage.
  
Modulation
+ cycler
  
Flow
+ rateMinimum: maintain a minimum rate of calling a function
* Sleep: improved used of AbortSignal
* Debounce: use Interval instead of ms

# 0.20.0 2024.04.06

* Refactor to remove 'Generators' module. Functions moved to Numbers, Text & Iterables modules.
* Data.ResolveFields: given a Record<string,v>, returns a Record<string,x>. Where v is a value,function,reactive,iterable and x is a primitive value or object. Essentially it resolve each field where there are dynamic fields to a value.

Iterables
* Rather than having to use Sync or Async sub-modules, there's a 'front-end' function which calls the right one 
* Improved parity of Sync/Async versions

Collections.Maps
  + some: returns _true_ for any value in map

Flow
 * repeat: refactor to allow async callback values
 * continuously: added support for AbortSignal
* 
Rx
 + count: produce incrementing values
 + fromFunction: yield values based on calling a function repeatedy
 + pinged: trigger a function and yield a value whenever an upstream reactive produces a value
 + fromObject: Yield values based on change to an object
 + fromProxy: Intercept changes to an object and use that to produce values (uses fromObject)
 + fromEvent: produce values based on events firing
 + wrap: Produce a fluent wrapper arounds Reactive functions
 + isReactive: return true if input value looks like a reactive
 + mergeToObject: from an input of Record<string,Reactive>, yield object values with same keys as map of input reactives
 + mergeToArray: from an input set of Reactives, yield array values in same order as input reactives
 + sync: Only emit values when all input reactives produce a value, yielding an array of values
 + syncToObject: Only emit values when all input reactives produce a value, yield an object
 + cache: Guarantee a value from a readable reactive
+ 
# 0.19.0 2024.03.24

Dom
+ CanvasHelper class instead of 'fullScreenCanvas' function


# 0.18.6 2024.03.07

Io
+ reconnectingWebSocket: handle reconnecting a websocket

Flow
+ RequestResponseMatch: house-keeping of matching a responses to requests, with timeout 
+ interpolatorStepped & interpolatorInterval: step from A to B over a given number of steps or a duration
  
# 0.18.3 2024.03.04

Generators
* stringSegmentsStartToStart et al.: step through a 'segments' of a string. Unlike .split(), segments are generated on demand

Text.wildcard: simple *-style matching

Flow
* Avoid using window. for timeout stuff, using globalThis instead for NodeJs compat
Collections
* ExpiringMap.clear(): clear all values

# 0.18.2

Collections.Maps
* getFromKeys: returns first value in a map that matches an Iterable of keys

Data
* trackUniqueInstances: track by instance, not value

Refactoring of reactive module

# 0.17.5

Data
* Improvements to Reactive

Dom
* cssVariables: sync DOM attributes with CSS variable values
* Forms.button improvements

Collections
* QueueMutable gains .at, .removeWhere, .remove

# 0.17.0 2024.02.02

Data
* Improved unit tests of reactive module
* Added 'Reactive.Dom' sub-module for updating HTML elements based on reactive instances
* Added 'Reactive.to', for passing values between reactives with a transform function

# 0.16.0 2023.11.23

Text.untilMatch: options for how to handle when there is no match. Before the source string is returned. Now it can optionally throw an error or yield a fallback.

Geometry
* Circles.interiorIntegerPoints: iterate integer points within a circle
* Circles.exteriorIntegerPoints: iterate integer points that define the circumference

IterableSync
* unique: changed to compare by object reference
* uniqueByValue: compare by value

Modulation
* jitter: Bug fix with min/max value polarity

# 0.15.0 2023.11.09

Collections
* Major changes to Trees module
* Arrays.cycle: cycle through elements of array

Data
* trackUnique: Returns _true_ when a new value is seen
 
# 0.14.2 2023.10.23

* Bug fixes with Plot2 and SceneGraph, StringWriteBuffer
* Immutable.getPaths has option to only return leaf fields

* Renamed Chains.chain to Chains.run
* Added Chains.prepare to decouple data source and chain

# 0.14.0 2023.10.17

* Util.isPlainObjectOrPrimitive: returns false if it's something like 'window' or 'document'
* Util.isPlainObject: returns true if it's a simple {...} object
* Improvements to Reactive
* IQueueMutable.toArray() to copy contents
* Dom.elRequery: Dynamic wrapper that re-queries matching element(s)
* Immutable.isEqualContextString: use JSON5 rather than JSON.toString
* Immutable.compareData has open to 'deep probe'. This picks up fields which are not iterable. Eg. for things on PointerEvents.
* Unit testings: Arrays.flatten, Arrays.without, Modulation.jitter
* Geometry.Point: improve parameter guarding for Points.angle and Points.distance
* Data.Pool: ability to mutate resource-associated data
* Bipolar.random & Bipolar.randomSource
* Moved Arrays.compareValueEqual. compareValues to Iterables
* Vector.fromRadians, Vector.toRadians

# 0.12.1 2023.09.17

* Dom.DataDisplay: easily display state
* Data.noiseFilter wip
  
# 0.12.0 2023.09.16

* Data.Chains: process a series of async generators
* Data.Pipes: Stream-like data processing
* Data.Table: simple table-style of data structure
* Data.Graphs - directed & undirected graph structures
  * Directed has a bunch of functions for detecting cycles, paths, topological sorts etc
* Geometry.Points.round
* Collections.NumberMap: work with Map<string,number>. Eg adding, multiplying
* Collections.Queue.PriorityMutable: priority queue
* Async iterables: Async.fromArray, Async.fromIterable
* Util.isMap, Util.isSet

# 0.11.7 2023.09.04

* Dom.inlineConsole(): adds a DIV that captures and displays unhandled errors, console.log, console.warn & console.error
* Export Envelopes as sub-module of modulation
* Easing.smoothstep

# 0.11.5 2023.08.26

* PlotBipolar
* Data.Bipolar module
  
# 0.10.5 2023.08.25

* Linting
 
# 0.10.1 2023.08.19

Small fixes

# 0.10.0 2023.08.17

Flow/

- StateMachine: Lightweight, pure function state machine implementation (no events, immutable)
- StateMachineWithEvents wraps this and provides events like the old class implementation
- Execute: runs a set of async functions in series, returning results as an array. Possibility to rank results or stop execution early
- StateMachineDriver: Using StateMachine & Execute, run different functions depending on current state. With low amounts of code it's possible to cycle between different states

Arrays/

- containsDuplicateValues: returns _true_ if array contains repeated values
- additionalValues: yields the values of one iterable which are not present in the source array.

# 0.9.0 2023.07.23

Lots of refactors and minor improvements

- Modulation/adsrIterable: iterate over envelope values over time
- Abort Signal support through Flow module
- Preferring a style that returns functions, and takes single arguments
- Map.getClosestIntegerKey: Assuming a Map with number keys, returns the closest key for a given value

# 0.8.9 2023.06.09

Random/

- Test refactor so all functions take a single parameter
- generateIntegerUnique: randomly walk a range of integers without repeating

# 0.8.6 2023.05.06

Guards/integerParse: Parse a value to an integer that follows given bounds, or return a default value

Collections/Trees: Improved path-based iteration and tree-building

Text/

- afterMatch: Return everything after a matched sub-string, or return the original if not found
- untilMatch: Use same opts type as new afterMatch
- Unit tests for both

IterableSync

- first/last: return first or last item of an iterable
-

# 0.8.5 2023.05.05

Collections/TreeNode

- Broke some tree stuff into pure functions which the new TreeNodeMutable uses
- Added support for tree-like operations over objects and Maps

Collections/TreeNodeMutable

- Basic implementation and test

text

- betweenChomp: Return part of string before a given start and end match, eg '[' and ']', as well as a copy of the string with all of that removed.
- Improved test coverage

# 0.8.4 2023.03.06

Collections/MultiValue

- Favour iterables rather than array return values

# 0.8.3 2023.02.25

Collections/Array

- Functions changed to take readonly or mutable array (although none mutate an input)
- filterAB: Array.filter, but returns items that return false as well as true

Collections/MapMulti

- Added 'removeValue' function that remove value regardless of key it is stored under

# 0.8.2 2023.02.19

Collections/Array

- removed readonly from the return value of arrays where applicable
- added `unique`, combining values from one or more arrays, only keeping unique values

# 0.8.1

- Random/minuteMs/secondMs: Generate random times (in ms) from minute or second ranges

Flow/

- runOnce: only run a closure once
- TaskQueue: serial task processing
- sleep & interval: support for an AbortSignal to cancel sleep
- continuously: now takes an options object:
  - `fireBeforeWait`: if true, callback is run before waiting, rather than the default of after the initial wait
  - `onStartCalled`: return value determines whether a call to .start() continues as normal, cancels, resets or disposes loop
  - disposable: if true, the loop will throw an error if a start is attempted

# 0.8.0 2023.02.03

Geometry/

- quadTree
- Intersects: centralise a bunch of geometry logic
- Layout: CirclePacking.random
- Convolve2d: Kernel convolution
- Grid.toArray: return a 2D array form of a grid
- Grid.array2dUpdater: allows setting values to a 2D array with grid coordinates

Collections/

- Trees: BinarySearchTree, Tree, basic traversal
- mutableStack: fixed bug with pop
- MapOfMutable: added iteration over values stored under key

- Visuals/ImageDataGrid: Access the DOM's ImageData array as a virtual grid of RGBA values
- SurfacePoints: generate a Vogel spiral and distribution of points on a sphere.
- SurfacePoints: distribute points on rings
- Numbers/linearSpace: Generate x number of values from start->end, with linear distribution
- Numbers/rounder: Returns a function to round numbers. Numbers.round() wraps this.
- Debug/logger / Deubg/logSet: can provide a colour key instead of colouring based on prefix

# 0.7.1 2022.11.04

- Util/mapObject: Like a regular map function, but for object properties.
- Arrays/pushUnique: add items to an array, but only if they don't already exist
- Maps/fromObject: create a map based on an object's properties
- Maps/addObject: add property-value pairs of an object to a map
- Collections/SetImmutable: immutable Set

# 0.7.0 2022.11.02

- Collections/ExpiringMap: a map which can automatically drop elements which
  aren't updated/set after some period
- Data/Pool: Manage a pool of resources
- Io/VideoFile: Use a video file as a source for a frame grabber
- Io/FrameProcessor: Update to support VideoFile
- Collections/Maps.sortByValue/sortByValueProperty: return entries sorted by
  values, or property of values
- Collections/Maps.deleteByValue: delete by value rather than key
- Geometry/Scaler: convert to and from relative/absolute Cartesian coordinates
  easily
- Circle/Rects/Points.multiplyScalar / Points.multiplyScalar: multiply all
  components by a value
- Flow/repeatReduce: call a function repeatedly, reducing down to a single value
- Util/defaultComparer: follow default semantics for Array.sort

# 0.6.7 2022.10.18

- Bug fix for Correlate.align

# 0.6.6 2022.10.17

- Arrays/mergeByKey: merge two arrays with a custom key-generation function and
  reconciler.
- Arrays/reducePairwise: reduce-style function but pairwise
- Maps/fromIterable: create a map from an iterable, such as an array
- Maps/mergeByKey: merge two maps using a reconcile function
- data/Correlate: Attempts to correlate two data sets by id and a supplied
  similarity function. Used for matching pose data from TensorFlow.js
- flow/Timer.relativeTimerTicks: compute progression based on ticks instead of
  time
- flow/everyNth: returns true every nth invocation.
- Refactor of trackers. Rather than `id` being a first parameter, its an
  optional part of the options object. Intermediate storage turned on
  automatically if one of the buffering options is set (resetAfterSample or
  sampleLimit)
- PointTracker.lineStartEnd: return line from initial to last point
- PointTracker.vectorPolar / vectorCartesian: return vector from initial to last
  point
- Arrays.until Returns all items in source array until predicate returns true

# 0.6.5 2022.10.13

- Bug fix for accessing camera on iOS

# 0.6.4 2022.10.09

- Flow.StateMachine.drive: 'driver' for changing states somewhat automatically.
  Each state has a set of handler(s) which are executed whilst the machine is in
  that state. If multiple handlers are provided, there are some options for how
  to handle this: either the first valid response is used, the highest-rating or
  lowest-rating. In additional there are some fallback handlers.
- Dom/DragDrop: generic drag and drop handler
- Flow/Timer.hasElapsedMs / Elapsed.progress: returns functions that yield whether a
  timer is done, or the percentage done
- Geometry/Polar: additional functions for handling polar coordinates
- Geometry/Vector: wrapper for Points.Point and Polar.Coords for vector
  (magnitude/direction) processing

# 0.6.3 2022.09.27

- Added type guards for Normalise.stream
- EspruinoSerialDevice: Use USB.println instead of Serial.println for reporting
  eval results

# 0.6.2 2022.09.18

- Bug fix for Espruino eval

# 0.6.1 2022.09.14

dom/Util - cycleCssClass

- Cycle between different applied CSS classes

Numbers - quantiseEvery

- Quantise a value by every x steps
- quantiseEvery(11,10) = 10, for example, since we're quantising to every 10
  steps.

geometry/Point - quantiseEvery

- Uses Numbers.quantiseEvery to quantise x and y

# 0.6.0 2022.08.31

data/MovingAverage

- Moving average with timed automatic decay.

# 0.5.8 2022.08.20

visual/Plot2

- Bug fix

flow/Continuously

- Bug fix so it works in a worker

# 0.5.5 2022.08.19

io/EspruinoBleDevice

- Name-based filtering
- Auto-reconnect stub

# 0.5.4 2022.08.19

geometry/Lines

- interpolate bug fix

io/FrameProcessor

- Allow pre-existing canvas element to be used as capture buffer

# 0.5.3 2022.08.17

data/Scale

- Added 'scaleClamped' to scale & clamp

geometry/Points

- relation() tracks speed

data

- Refactoring of trackers

geometry/Point

- centroid() skips undefined points

# 0.5.0 2022.08.15

IterableSync helper functions

Numbers module

# 0.4.0 2022.08.13

geometry/Rects

- sum()

geometry/Line, Circle, Arc

- Renamed 'equals' to 'isEqual' for consistency

geometry/Points

- abs()

modulation/Forces

- targetForce
- orientationForce

modulation/Oscillator

- spring

geometry/Shape, Circle

- center()

# 0.3.01 2022.08.01

io/Camera

- Added timeout possibility when waiting for camera connection
- DeviceId & resolution-based constraint

geometry/Rect

- toArray(), fromNumbers()
- normaliseByRect()

io/FrameProcessor class

- Generic 'frame grabber' type of functionality

visual/Video

- manualCapture() to capture from a source video element

flow/Continuously

- Allow rate to change dynamically

geometry/TriangleIsosceles

# 0.3.00 2022.07.12

geometry/Triangle, TriangleEquilateral, TriangleRight

geometry/Shapes

- arrow()

geometry/Point

- project()
- refactoring

modulation/Envelope

- adsrSample now an async generator

collections/Arrays

- interleave()

dom/ErrorHandler

- defaultErrorHandler() - show errors on screen

# 0.1.00 2022.06.22

dom/PointerVisualise

dom/Util

- reconcileChildren()
- clear()

geometry/Point

- relation()

temporal/Trackers

- Use common foundation

relativeDifference()

IterableAsync helper functions

# 0.0.24 2022.06.17

modulation/Envelope

- adsrSample - sample automatically from envelope

collection/Arrays

- sample() - sub sample

io/EspruinoSerialDevice

collections/NumericArrays

- dotProduct()

geometry/Triangle

geometry/Circle

- area, circumference

geometry/Line

- directionVector, directionVectorNormalised, perpendicularPoint, parallel,
  scaleFromMidpoint

geometry/Point

- reduce, normalise, rotate

geometry/Shape

- starburst

visual/Drawing

- triangle()

temporal/MovingAverage

- movingAverageLight

# 0.0.22 2022.05.22
