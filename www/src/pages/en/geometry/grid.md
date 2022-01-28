---
title: Grid
setup: |
  import { Markdown } from 'astro/components';
  import Layout from '../../../layouts/MainLayout.astro';
  import GridVisitorPlay from './GridVisitorPlay.astro';
  import GridDataPlay from './GridDataPlay.astro';
  import GridSpatialPlay from './GridSpatialPlay.astro';
---

A _grid_ is a rectangular area divided by rows and columns into cells of equal size. A bit like a table or spreadsheet. Each cell has an _x,y_ location with _0,0_ being the top-left corner.

Example: This grid has four rows and three columns.
<div>
  <table style="width:auto; border: 1px solid whitesmoke">
  <tr><td>0,0</td><td>0,1</td><td>2,0</td></tr>
  <tr><td>0,1</td><td>1,1</td><td>2,1</td></tr>
  <tr><td>0,2</td><td>1,2</td><td>2,2</td></tr>
  <tr><td>0,3</td><td>1,3</td><td>2,3</td></tr>
  </table>
</div>

A grid can be useful if your data has grid-like spatial qualities. It's useful for being able to gather data that is 'nearby' based on cell location, traversing space following different rules and so on.

Although there is a natural affinity between the grid and pixel coordinates, the grid isn't specifically tied to pixels. It could be used, for example, to keep track of a game world, where the map is logically divided into cells.

## Types

There are two main types for working with the grid functions:

```typescript
type Grid {
  rows: number,
  cols: number
}
type Cell {
  x: number,
  y: number
}
```

In action, this looks like:
```js
const shape = {rows: 10, cols: 10};
const cell = {x: 0, y: 0};
```

If a grid is going to be mapped to pixels (more on that below) it also need a _size_ field.


## Visiting

For a given starting cell, it's possible to _visit_ all cells once and only once with movement following a spatial logic.

<GridVisitorPlay />

Provided visitor functions are: `visitorDepth, visitorBreadth, visitorRandom, visitorRow,` and `visitorColumn`.

### Usage

The visitor can be used in a `for .. of` loop

```js
import { Grids } from 'ixfx/geometry'
// Start visitor at 5,5
const visitor = Grids.visitorDepth(shape, {x: 5, y: 5});
for (let cell of visitor) {
  // Visited cell..
}
```

Or for more flexibility, you can manually progress the visitor:
```js
import { Grids } from 'ixfx/geometry'
const visitor = Grids.visitorBreadth(shape, {x: 5, y: 5});

// At some other place in your code, call .next whenever you want to move the visitor
const [cell,done] = visitor.next();
if (done) { 
  // Visitor has visited all the cells
  return;
} else {
  // Use cell
  return cell;
}
```

The visitor can have a map passed in to track what cells have been visited. This is useful if you want to check the status of cells during the visitor's journey.

```js
import { Grids } from 'ixfx/geometry'
import { MutableStringSet } from 'ixfx/collections';
const visited = new MutableStringSet();
const visitor = Grids.visitorRandom(shape, {x: 5, y: 5}, visited);

...
if (visited.has(cell)) {
  // Do something if cell has been visited...
}
```

In the interactive demo above, this technique is used to colour cells differently depending on whether they've been visited or not.

## Iterating cells

The `cells` iterator is a simple alternative to the _visitor_ technique if you don't care about how the grid is traversed. This has a lower overhead than the visitor, because it can traverse the grid without having to keep track of every cell it has visited.

```js
for (let cell of Grids.cells(shape)) {
  // do something with cell
}
```

## Spatial relations

<GridSpatialPlay />

## Mapping to data

Grid and cells don't store data. You can't stuff things into it as you would a spreadsheet cell. It is a _virtualised_ data structure in that it gives the appearance of traversing a structure, but it is only created on-demand.

To link a cell to your own data, use its coordinates as a key.

Lets say you want to associate colour with each cell:

```js
// 1. We want a function to create a key for a given cell
// Function takes a cell and returns its coordinates as a string
// eg: {x:10, y:5} => "10-5"
const key = (cell) => `${cell.x}-${cell.y}`;

// 2. We can create some data...
const store = new Map();

const someData = { colour: `red` }
const someMoreData = { color: `pink`};

// 3. Data can be associated using the map:
data.set(key({x: 0, y: 0}), someData);

// 4. And then retrieved from the basis of a cell:
const cellData = data.get(key({x:0, y:0}));
// cellData.colour, etc
```

As a complete example, we can associate a random colour and number to every cell.

```js
import { Grids } from 'ixfx/geometry'
const key = (cell) => `${cell.x}-${cell.y}`;
const store = new Map();
const shape = { rows: 10, cols: 10 };

for (let cell of Grids.cells(shape)) {
  store.set(key(cell), {colour: randomColour(), funk: randomNumber()});
}

// Fetch data associated with a given cell:
const val = store.get(key({x:5, y:5}));
// {colour: '...', funk: 0.235}
```

<GridDataPlay />

## Mapping to pixels

Although the grid is not meant to be a literal visual grid, it can be used as such.

Drawing the grid is pretty simple:

```js
import { Grids } from 'ixfx/geometry'
const ctx = document.getElementById(`myCanvas`).getContext(`2d`);
const shape = {rows: 100, cols: 100, size: 5};

for (const cell of Grids.cells(shape)) {
  let rect = Grids.rectangleForCell(cell, shape);
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
}
```

To map a grid to pixel coordinates, the cell size (assumed pixels) needs to be provided:
```js
const shape = {rows: 10, cols: 10, size: 5};
```

To get the position and rectangle for a cell:

```js
const shape = { rows: 10, cols: 10, size: 10 };

// Get rectangle for cell at position 5,5
const rect = rectangleForCell({x: 5, y: 5}, shape); 
//> { x: 100, y: 100, width: 10, height: 10}
```

Or to go from coordinate to cell:

```js
const cell = cellAtPoint({evt.offsetX, evt.offsetY}, shape);
```



