A rough changelog between NPM releases

- Collections.Trees: BinarySearchTree, Tree, basic traversal
- Geometry.quadTree
- Geometry.Intersects: centralise a bunch of geometry logic
- Geometry.Layout: CirclePacking.random
- SurfacePoints: generate a Vogel spiral and distribution of points on a sphere.
- SurfacePoints: distribute points on rings
- Numbers.linearSpace: Generate x number of values from start->end, with linear distribution
- Numbers.rounder: Returns a function to round numbers. Numbers.round() wraps this.
- Collections.mutableStack: fixed bug with pop

# 0.7.1 22.11.04

- Util.mapObject: Like a regular map function, but for object properties.
- Arrays.pushUnique: add items to an array, but only if they don't already exist
- Maps.fromObject: create a map based on an object's properties
- Maps.addObject: add property-value pairs of an object to a map
- Collections.SetImmutable: immutable Set

# 0.7.0 22.11.02

- Collections.ExpiringMap: a map which can automatically drop elements which
  aren't updated/set after some period
- Data.Pool: Manage a pool of resources
- Io.VideoFile: Use a video file as a source for a frame grabber
- Io.FrameProcessor: Update to support VideoFile
- Collections.Maps.sortByValue/sortByValueProperty: return entries sorted by
  values, or property of values
- Collections.Maps.deleteByValue: delete by value rather than key
- Geometry.Scaler: convert to and from relative/absolute Cartesian coordinates
  easily
- Circle/Rects/Points.multiplyScalar / Points.multiplyScalar: multiply all
  components by a value
- Flow.repeatReduce: call a function repeatedly, reducing down to a single value
- Util.defaultComparer: follow default semantics for Array.sort

# 0.6.7 22.10.18

- Bug fix for Correlate.align

# 0.6.6 22.10.17

- Arrays.mergeByKey: merge two arrays with a custom key-generation function and
  reconciler.
- Arrays.reducePairwise: reduce-style function but pairwise
- Maps.fromIterable: create a map from an iterable, such as an array
- Maps.mergeByKey: merge two maps using a reconcile function
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

# 0.6.5 22.10.13

- Bug fix for accessing camera on iOS

# 0.6.4 22.10.09

- Flow.StateMachine.drive: 'driver' for changing states somewhat automatically.
  Each state has a set of handler(s) which are executed whilst the machine is in
  that state. If multiple handlers are provided, there are some options for how
  to handle this: either the first valid response is used, the highest-rating or
  lowest-rating. In additional there are some fallback handlers.
- Dom.DragDrop: generic drag and drop handler
- Flow.Timer.hasElapsedMs / completionMs: returns functions that yield whether a
  timer is done, or the percentage done
- Geometry.Polar: additional functions for handling polar coordinates
- Geometry.Vector: wrapper for Points.Point and Polar.Coords for vector
  (magnitude/direction) processing

# 0.6.3 22.09.27

- Added type guards for Normalise.stream
- EspruinoSerialDevice: Use USB.println instead of Serial.println for reporting
  eval results

# 0.6.2 22.09.18

- Bug fix for Espruino eval

# 0.6.1 22.09.14

dom/Util - cycleCssClass

- Cycle between different applied CSS classes

Numbers - quantiseEvery

- Quantise a value by every x steps
- quantiseEvery(11,10) = 10, for example, since we're quantising to every 10
  steps.

geometry/Point - quantiseEvery

- Uses Numbers.quantiseEvery to quantise x and y

# 0.6.0 22.08.31

data/MovingAverage

- Moving average with timed automatic decay.

# 0.5.8 22.08.20

visual/Plot2

- Bug fix

flow/Continuously

- Bug fix so it works in a worker

# 0.5.5 22.08.19

io/EspruinoBleDevice

- Name-based filtering
- Auto-reconnect stub

# 0.5.4 22.08.19

geometry/Lines

- interpolate bug fix

io/FrameProcessor

- Allow pre-existing canvas element to be used as capture buffer

# 0.5.3 22.08.17

data/Scale

- Added 'scaleClamped' to scale & clamp

geometry/Points

- relation() tracks speed

data

- Refactoring of trackers

geometry/Point

- centroid() skips undefined points

# 0.5.0 22.08.15

IterableSync helper functions

Numbers module

# 0.4.0 22.08.13

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

# 0.3.01 22.08.01

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

# 0.3.00 22.07.12

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

# 0.1.00 22.06.22

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

# 0.0.24 22.06.17

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

# 0.0.22 22.05.22
