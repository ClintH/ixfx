---
  title: Point
  setup: |
    import {Markdown} from 'astro/components';
    import Layout from '../../layouts/MainLayout.astro';
---

A point is an _x_ and _y_ coordinate; the basic building block for lines, arcs, rectangles and paths.

[API docs](/ixfx/api/modules/Geometry.Points.html)

## Type

Points consist of an _x_ and _y_:

```typescript
type Point = {
  x: number
  y: number
}
```

Points are agnostic about the units of _x_ and _y_, but typically it would be pixel coordinates.

## Distances and geometry

```js
const a = {x: 10, y: 10};
const b = {x: 20, y: 20};

// Calculates distance between point a and b
const distance = Points.distance(a, b); 

// Calculate a Point between `a` and `b` using a relative progress amount (0-1)
// 0 = a, 0.5 = halfway between the two, 1 = b, and so on.
const p = Points.lerp(0.5, a, b);
```

Calculates a rectangle which can include all the provided points
```js
const points = [a, b];
const rect = Points.bbox(...points);  // eg {x:0, y:0, width:10, height:10}
```

## Conversions

```js
const p = {x: 5, y: 10};

// To an array [x, y]
Points.toArray(p); // [5, 10]

// Human-readable representation:
Points.toString(p); // "(5, 5)"
```

```js
// Convert from two numeric parameters
Points.from(10, 15);    // { x: 10, y: 15}

// Convert from an array
Points.from([10, 15]);  // {x: 10, y: 15}

// Convert an array of arrays
Points.fromNumbers([ [10, 15], [5, 5]]); // [{x:10, y:15}, {x:5, y:5}]
```

## Helper functions

`findMinimum` allows you to compare an array of points, keeping the one which satisfies the provided comparer function over all others.

Example:

```js
// Find the point closest to the {x:100, y:100}
const points = [/* data ... */];
const center = {x: 100, y: 100};
 
const closestToCenter = findMinimum((a, b) => {
  const aDist = distance(a, center);
  const bDist = distance(b, center);
  if (aDistance < bDistance) return a;
  return b;
}, points);
```

## Math

```js
// Returns a * b
Points.multiply(a, b);

// Returns point a scaled by 2 x and 0.5 for y
Points.multiply(a, 2, 0.5);

// Returns a + b
Points.sum(a, b);

// Returns a - b;
Points.diff(a, b);
```