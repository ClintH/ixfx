---
title: Circle
setup: |
  import {Markdown} from 'astro/components';
  import Layout from '../../layouts/MainLayout.astro';
---

A circle.

[API docs](/ixfx/api/modules/Geometry.Circles.html)

## Type

```typescript
type Circle = {
  radius: number
}
```

`CirclePositioned` also includes `x` and `y` fields.


## Geometry

Get the points of intersection between a line and circle. 

```js
const circle = { radius: 10, x: 100, y: 100};
const line = {a: {x: 0, y: 0}, b: { x: 100, y: 100 } };
const pts = Circles.intersectionLine(circle, line);
// pts could be empty for no intersections, or up to two points
```

Get the points of intersection between two circles.

```js
const pts = Circles.intersections(circleA, circleB);
// pts will be empty if there are no intersections
//  this can also be the case if circles are identical, or one completely encloses the other
```

Check whether `circleB` is completely contained by `circleA`:

```js
Circles.isContainedBy(circleA, circleB);
```

## Conversions

Return a [Path](path) instance, which wraps up some functions together with the circle:

```js
const p = Circles.toPath(circle);
p.length();
p.bbox();
p.compute(0.5);
p.toString();
```

## Other functions

Get the x,y coordinate of a point at specified angle

```js
// Circles.point(circle, angleRadian, origin?);
const p = Circles.point(arc, Math.PI);
```

Get the x,y coordinate at a relative distance along circle

```js
// Get x,y at 50% along circle
const p = Circles.compute(circle, 0.5);
```

Equality

```js
// Returns true if `a` and `b` circles have the same value
Circles.isEqual(a, b);
```

Dimensions/distances

```js
Circles.bbox(arc);   // Get a rectangle that encompasses circle
Circles.length(arc); // Get the perimeter of circle
Circles.distanceCenter(a, b); // Distance between the centers of two circle 
```
