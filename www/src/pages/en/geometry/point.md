---
  title: Point
  setup: |
    import {Markdown} from 'astro/components';
    import Layout from '../../../layouts/MainLayout.astro';
---

A point is an _x_ and _y_ coordinate; the basic building block for lines, arcs, rectangles and paths.

## Type

Points are _immutable_ (cannot be modified), consisting of an _x_ and _y_:

```typescript
export type Point = Readonly<{
  x: number
  y: number
}>
```

## Functions


```js
import * as Points from 'ixfx/geometry'
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

Assuming you've imported the functions like this:

```js
import * as Points from 'ixfx/geometry'
```

```js

```

`compareTo` allows you to compare an array of points, keeping the one which satisfies the provided comparer function over all others.

```js
// Returns a if it's x and y is smaller than b
const smaller = (a, b) => (a.x < b.x && a.y < b.y) ? a : b;
const points = [{x:0, y:0}, {x:100, y:100}];

// Compare all the Points in the `points` array using `comparer`
const smallest = Points.compareTo(comparer, ...points); 
// `smallest` will contain the winning Point from the comparisons
```