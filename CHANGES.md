A rough changelog between NPM releases

# 0.6.1 22.09.14

dom/Util - cycleCssClass
* Cycle between different applied CSS classes

Numbers - quantiseEvery
* Quantise a value by every x steps
* quantiseEvery(11,10) = 10, for example, since we're quantising to every 10 steps.

geometry/Point - quantiseEvery
* Uses Numbers.quantiseEvery to quantise x and y

# 0.6.0 22.08.31

data/MovingAverage
* Moving average with timed automatic decay.

# 0.5.8 22.08.20

visual/Plot2
* Bug fix

flow/Continuously
* Bug fix so it works in a worker

# 0.5.5 22.08.19

io/EspruinoBleDevice
* Name-based filtering
* Auto-reconnect stub

# 0.5.4 22.08.19

geometry/Lines
* interpolate bug fix

io/FrameProcessor
* Allow pre-existing canvas element to be used as capture buffer

# 0.5.3 22.08.17

data/Scale
* Added 'scaleClamped' to scale & clamp

geometry/Points
* relation() tracks speed

data
* Refactoring of trackers

geometry/Point
* centroid() skips undefined points

# 0.5.0 22.08.15

IterableSync helper functions

Numbers module

# 0.4.0 22.08.13

geometry/Rects
* sum()

geometry/Line, Circle, Arc
* Renamed 'equals' to 'isEqual' for consistency

geometry/Points
* abs()

modulation/Forces
* targetForce
* orientationForce

modulation/Oscillator
* spring

geometry/Shape, Circle
* center()

# 0.3.01 22.08.01

io/Camera
* Added timeout possibility when waiting for camera connection
* DeviceId & resolution-based constraint

geometry/Rect
* toArray(), fromNumbers()
* normaliseByRect()

io/FrameProcessor class
* Generic 'frame grabber' type of functionality

visual/Video
* manualCapture() to capture from a source video element

flow/Continuously
* Allow rate to change dynamically

geometry/TriangleIsosceles

# 0.3.00 22.07.12

geometry/Triangle, TriangleEquilateral, TriangleRight

geometry/Shapes
* arrow()

geometry/Point
* project()
* refactoring

modulation/Envelope
* adsrSample now an async generator

collections/Arrays
* interleave()

dom/ErrorHandler
* defaultErrorHandler() - show errors on screen

# 0.1.00 22.06.22

dom/PointerVisualise

dom/Util
* reconcileChildren()
* clear()

geometry/Point
* relation()

temporal/Trackers
* Use common foundation

relativeDifference()

IterableAsync helper functions

# 0.0.24 22.06.17

modulation/Envelope
* adsrSample - sample automatically from envelope

collection/Arrays
* sample() - sub sample

io/EspruinoSerialDevice

collections/NumericArrays
* dotProduct()

geometry/Triangle

geometry/Circle
* area, circumference

geometry/Line
* directionVector, directionVectorNormalised, perpendicularPoint, parallel, scaleFromMidpoint

geometry/Point
* reduce, normalise, rotate

geometry/Shape
* starburst

visual/Drawing
* triangle()

temporal/MovingAverage
* movingAverageLight

# 0.0.22 22.05.22