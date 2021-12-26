import * as Rect from "./Rect"
import * as Point from './Point';
import {clampZeroBounds, randomElement} from "../util";
import {MutableValueSet} from "../collections/Sets";
import {defined as GuardIsDefined} from '../Guards';

export enum CardinalDirection {
  None = 0,
  North = 1,
  NorthEast = 2,
  East = 3,
  SouthEast = 4,
  South = 5,
  SouthWest = 6,
  West = 7,
  NorthWest = 8
}

export enum WrapLogic {
  None = 0,
  Wrap = 1
}

export type GridVisual = {
  size: number,
}

export type Grid = {
  rows: number
  cols: number
}

export type Cell = {
  x: number
  y: number
}

/**
 * Returns a key string for a cell instance
 * A key string allows comparison of instances by value rather than reference
 * @param {Cell} v
 * @returns {string}
 */
export const cellKeyString = function (v: Cell): string {
  return `Cell{${v.x},${v.y}}`
}

/**
 * Returns true if two cells equal. Returns false if either cell (or both) are undefined
 *
 * @param {Cell} a
 * @param {Cell} b
 * @returns {boolean}
 */
export const cellEquals = function (a: Cell, b: Cell): boolean {
  //console.log(`${a.x} ? ${b.x}`);
  if (b === undefined) return false;
  if (a === undefined) return false;
  return a.x === b.x && a.y === b.y;
}

export const guard = function (a: Cell, paramName: string = 'Param') {
  if (a === undefined) throw Error(paramName + ' is undefined');
  if (a.x === undefined) throw Error(paramName + '.x is undefined');
  if (a.y === undefined) throw Error(paramName + '.y is undefined');
  if (Number.isInteger(a.x) === undefined) throw Error(paramName + '.x is non-integer');
  if (Number.isInteger(a.y) === undefined) throw Error(paramName + '.y is non-integer');
}

export const cellCornerRect = function (cell: Cell, grid: Grid & GridVisual): Rect.Rect {
  guard(cell);
  const size = grid.size;
  const x = cell.x * size; // + (grid.spacing ? cell.x * grid.spacing : 0);
  const y = cell.y * size;// + (grid.spacing ? cell.y * grid.spacing : 0);
  let r = Rect.fromTopLeft({x: x, y: y}, size, size);
  return r;
}

export const getCell = function (position: Point.Point, grid: Grid & GridVisual): Cell | undefined {
  const size = grid.size;
  if (position.x < 0 || position.y < 0) return;
  const x = Math.floor(position.x / size);
  const y = Math.floor(position.y / size);
  if (x >= grid.cols) return;
  if (y >= grid.rows) return;
  return {x, y}
}

export const neighbours = function (grid: Grid, cell: Cell, bounds: BoundsLogic = BoundsLogic.Undefined): Cell[] {
  let directions = [
    CardinalDirection.North,
    CardinalDirection.East,
    CardinalDirection.South,
    CardinalDirection.West
  ]

  return directions
    .map(c => offset(grid, getVectorFromCardinal(c), cell, bounds))
    .filter(GuardIsDefined);
}

export const cellMiddle = function (cell: Cell, grid: Grid & GridVisual): Point.Point {
  guard(cell);

  const size = grid.size;
  const x = cell.x * size; // + (grid.spacing ? cell.x * grid.spacing : 0);
  const y = cell.y * size; // + (grid.spacing ? cell.y * grid.spacing : 0);
  return {x: x + size / 2, y: y + size / 2};
}

/**
 * Returns the cells on the line of start and end, inclusive
 *
 * @param {Cell} start Starting cel
 * @param {Cell} end End cell
 * @returns {Cell[]}
 */
export const getLine = function (start: Cell, end: Cell): Cell[] {
  guard(start);
  guard(end);

  // https://stackoverflow.com/a/4672319
  let startX = start.x;
  let startY = start.y;
  let dx = Math.abs(end.x - startX);
  let dy = Math.abs(end.y - startY);
  let sx = (startX < end.x) ? 1 : -1;
  let sy = (startY < end.y) ? 1 : -1;
  let err = dx - dy;

  let cells = [];
  while (true) {
    cells.push({x: startX, y: startY});
    if (startX === end.x && startY === end.y) break;
    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      startX += sx;
    }
    if (e2 < dx) {
      err += dx;
      startY += sy;
    }
  }
  return cells;
}
/**
 * Returns a list of cells that make up a simple square perimeter around
 * a point at a specified distance.
 *
 * @param {Grid} grid
 * @param {number} steps
 * @param {Cell} [start={x: 0, y: 0}]
 * @param {BoundsLogic} [bounds=BoundsLogic.Stop]
 * @returns {Cell[]}
 */
export const getSquarePerimeter = function (grid: Grid, steps: number, start: Cell = {x: 0, y: 0}, bounds: BoundsLogic = BoundsLogic.Stop): Cell[] {
  if (bounds == BoundsLogic.Wrap) throw Error('BoundsLogic Wrap not supported (only Stop and Unbound)');
  if (bounds == BoundsLogic.Undefined) throw Error('BoundsLogic Undefined not supported (only Stop and Unbound)');

  if (Number.isNaN(steps)) throw Error('Steps is NaN');
  if (steps < 0) throw Error('Steps must be positive');
  if (!Number.isInteger(steps)) throw Error('Steps must be a positive integer');

  const cells = new MutableValueSet<Cell>(c => cellKeyString(c));

  let directions = [
    CardinalDirection.North, CardinalDirection.NorthEast,
    CardinalDirection.East, CardinalDirection.SouthEast,
    CardinalDirection.South, CardinalDirection.SouthWest,
    CardinalDirection.West, CardinalDirection.NorthWest
  ];

  let directionCells = directions.map(d => {
    return offset(grid, getVectorFromCardinal(d, steps), start, bounds);
  });

  // NW to NE
  cells.add(...simpleLine(directionCells[7]!, directionCells[1]!, true));
  // NE to SE
  cells.add(...simpleLine(directionCells[1]!, directionCells[3]!, true));
  // SW to SE
  cells.add(...simpleLine(directionCells[5]!, directionCells[3]!, true));
  // NW to SW
  cells.add(...simpleLine(directionCells[7]!, directionCells[5]!, true));

  return cells.toArray();
}

export const getVectorFromCardinal = function (cardinal: CardinalDirection, multiplier: number = 1): Cell {
  switch (cardinal) {
    case CardinalDirection.North:
      return {x: 0, y: -1 * multiplier};
    case CardinalDirection.NorthEast:
      return {x: 1 * multiplier, y: -1 * multiplier};
    case CardinalDirection.East:
      return {x: 1 * multiplier, y: 0};
    case CardinalDirection.SouthEast:
      return {x: 1 * multiplier, y: 1 * multiplier};
    case CardinalDirection.South:
      return {x: 0, y: 1 * multiplier};
    case CardinalDirection.SouthWest:
      return {x: -1 * multiplier, y: 1 * multiplier};
    case CardinalDirection.West:
      return {x: -1 * multiplier, y: 0};
    case CardinalDirection.NorthWest:
      return {x: -1 * multiplier, y: -1 * multiplier};
    default:
      return {x: 0, y: 0};
  }
}

export enum BoundsLogic {
  Unbound = 0,
  Undefined = 1,
  Stop = 2,
  Wrap = 3

}

export const simpleLine = function (start: Cell, end: Cell, endInclusive: boolean = false): Cell[] {
  let cells: Cell[] = [];
  if (start.x == end.x) {
    // Vertical
    let lastY = endInclusive ? end.y + 1 : end.y;
    for (let y = start.y; y < lastY; y++) {
      cells.push({x: start.x, y: y});
    }
  } else if (start.y == end.y) {
    // Horizontal
    let lastX = endInclusive ? end.x + 1 : end.x;
    for (let x = start.x; x < lastX; x++) {
      cells.push({x: x, y: start.y});
    }
  } else {
    throw Error(`Only does vertical and horizontal: ${start.x},${start.y} - ${end.x},${end.y}`);
  }
  return cells;
}

/**
 *
 * Note: x and y wrapping are calculated independently. A large wrapping of x, for example won't shift down a line 
 * @param {Grid} grid
 * @param {Cell} vector
 * @param {Cell} [start={x: 0, y: 0}]
 * @param {BoundsLogic} [bounds=BoundsLogic.Undefined]
 * @returns {(Cell | undefined)}
 */
export const offset = function (grid: Grid, vector: Cell, start: Cell = {x: 0, y: 0}, bounds: BoundsLogic = BoundsLogic.Undefined): Cell | undefined {
  guard(start);

  let x = start.x;
  let y = start.y;
  switch (bounds) {
    case BoundsLogic.Wrap:
      x += vector.x % grid.cols;
      y += vector.y % grid.rows;
      //console.log(`${x},${y} vector: ${vector.x},${vector.y} vectorMod: ${vector.x % grid.cols},${vector.y % grid.rows}`);
      if (x < 0) x = grid.cols + x;
      else if (x >= grid.cols) {
        x -= grid.cols;
      }
      if (y < 0) y = grid.rows + y;
      else if (y >= grid.rows) {
        y -= grid.rows;
      }
      break;
    case BoundsLogic.Stop:
      x += vector.x;
      y += vector.y;
      x = clampZeroBounds(x, grid.cols);
      y = clampZeroBounds(y, grid.rows);
      break;
    case BoundsLogic.Undefined:
      x += vector.x;
      y += vector.y;
      if (x < 0 || y < 0) return;
      if (x >= grid.cols || y >= grid.rows) return;
      break;
    case BoundsLogic.Unbound:
      x += vector.x;
      y += vector.y;
      break;
    default:
      throw 'Unknown BoundsLogic case';
  }
  return {x, y}
}
/**
 * Walks the grid left-to-right, top-to-bottom. Negative steps reverse this.
 *
 * @param {Grid} grid Grid to traverse
 * @param {number} steps Number of steps
 * @param {Cell} [start={x: 0, y: 0}] Start cell
 * @param {BoundsLogic} [bounds=BoundsLogic.Undefined]
 * @returns {(Cell | undefined)}
 */
export const offsetStepsByRow = function (grid: Grid, steps: number, start: Cell = {x: 0, y: 0}, bounds: BoundsLogic = BoundsLogic.Undefined): Cell | undefined {
  if (!Number.isInteger(steps)) throw Error('Steps must be an integer');
  guard(start);

  // Very naive implementation, but code is readable? 😅
  let stepsLeft = Math.abs(steps);
  const dirForward = steps >= 0;
  let x = start.x;
  let y = start.y;
  while (stepsLeft > 0) {
    // Are we at the end of the row?
    if (x == grid.cols - 1 && dirForward) {
      if (y == grid.rows - 1 && bounds !== BoundsLogic.Unbound) {
        // Reached bottom-right corner, end of grid and wanting to go forwards still
        if (bounds == BoundsLogic.Undefined) return;
        if (bounds == BoundsLogic.Stop) return {x, y};
        if (bounds == BoundsLogic.Wrap) y = 0;
      } else {
        y++;
      }
      x = 0;
      stepsLeft--;
      continue;
    }

    // First cell and going backwards
    if (x == 0 && !dirForward) {
      if (y == 0 && bounds !== BoundsLogic.Unbound) {
        // Reached top-left corner, start of grid and wanting to go backwards
        if (bounds == BoundsLogic.Undefined) return;
        if (bounds == BoundsLogic.Stop) return {x, y};
        if (bounds == BoundsLogic.Wrap) y = grid.rows - 1;
      } else {
        y--;
      }
      x = grid.cols - 1;
      stepsLeft--;
      continue;
    }

    if (dirForward) {
      // Step forward to end of row
      let chunk = Math.min(stepsLeft, grid.cols - x - 1);
      x += chunk;
      stepsLeft -= chunk;
    } else {
      // Step back to start of row
      let chunk = Math.min(stepsLeft, x);
      x -= chunk;
      stepsLeft -= chunk;
    }
  }
  return {x, y};
}


export const offsetStepsByCol = function (grid: Grid, steps: number, start: Cell = {x: 0, y: 0}, bounds: BoundsLogic = BoundsLogic.Undefined): Cell | undefined {
  if (!Number.isInteger(steps)) throw Error('Steps must be an integer');
  guard(start);

  // Very naive implementation, but code is readable? 😅
  let stepsLeft = Math.abs(steps);
  const dirForward = steps >= 0;
  let x = start.x;
  let y = start.y;
  while (stepsLeft > 0) {
    // Are we at the end of the column?
    if (y == grid.rows - 1 && dirForward) {
      if (x == grid.cols - 1 && bounds !== BoundsLogic.Unbound) {
        // Reached bottom-right corner, end of grid and wanting to go forwards still
        if (bounds == BoundsLogic.Undefined) return;
        if (bounds == BoundsLogic.Stop) return {x, y};
        if (bounds == BoundsLogic.Wrap) x = 0;
      } else {
        x++;
      }
      y = 0;
      stepsLeft--;
      continue;
    }

    // First cell and going backwards
    if (y == 0 && !dirForward) {
      if (x == 0 && bounds !== BoundsLogic.Unbound) {
        // Reached top-left corner, start of grid and wanting to go backwards
        if (bounds == BoundsLogic.Undefined) return;
        if (bounds == BoundsLogic.Stop) return {x, y};
        if (bounds == BoundsLogic.Wrap) x = grid.cols - 1;
      } else {
        x--;
      }
      y = grid.rows - 1;
      stepsLeft--;
      continue;
    }

    if (dirForward) {
      // Step forward to end of row
      let chunk = Math.min(stepsLeft, grid.rows - y - 1);
      y += chunk;
      stepsLeft -= chunk;
    } else {
      // Step back to start of row
      let chunk = Math.min(stepsLeft, y);
      y -= chunk;
      stepsLeft -= chunk;
    }
  }
  return {x, y};
}

export const walkByFn = function* (offsetFn: (grid: Grid, steps: number, start: Cell, bounds: BoundsLogic) => Cell | undefined, grid: Grid, start: Cell = {x: 0, y: 0}, wrap: boolean = false): Iterable<Cell> {
  guard(start);

  let x = start.x;
  let y = start.y;
  let bounds = wrap ? BoundsLogic.Wrap : BoundsLogic.Undefined;
  while (true) {
    yield {x: x, y: y};
    let pos = offsetFn(grid, 1, {x, y}, bounds);
    if (pos === undefined) return;
    x = pos.x;
    y = pos.y;
    if (x == start.x && y == start.y) return;
  }
}

export const walkByRow = function (grid: Grid, start: Cell = {x: 0, y: 0}, wrap: boolean = false): Iterable<Cell> {
  return walkByFn(offsetStepsByRow, grid, start, wrap);
}

export const walkByCol = function (grid: Grid, start: Cell = {x: 0, y: 0}, wrap: boolean = false): Iterable<Cell> {
  return walkByFn(offsetStepsByCol, grid, start, wrap);
}

export const visitorDepth = function (queue: Cell[]): Cell {
  return queue[0];
}

export const visitorBreadth = function (queue: Cell[]): Cell {
  return queue[queue.length - 1];
}

export const visitorRandom = function (queue: Cell[]): Cell {
  return randomElement(queue);
}

/**
 * Visits every cell in grid using supplied selection function
 * In-built functions to use: visitorDepth, visitorBreadth, visitorRandom
 * 
 * Usage example:
 * ```js
 *  let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell);
 *  for (let cell of visitor) {
 *   // do something with cell
 *  }
 * ```
 *
 * If you want to keep tabs on the visitor, pass in a MutableValueSet. This is
 * updated with visited cells (and is used internally anyway)
 * ```js
 *  let visited = new Sets.MutableValueSet<Grids.Cell>(c => Grids.cellKeyString(c));
 *  let visitor = Grids.visitor(Grids.visitorRandom, grid, startCell, visited);
 * ```
 * 
 * To visit with some delay, try this pattern
 * ```js
 *  const delayMs = 100;
 *  const run = () => {
 *   let cell = visitor.next().value;
 *   if (cell === undefined) return;
 *   // Do something with cell
 *   setTimeout(run, delayMs);
 *  }
 *  setTimeout(run, delayMs);
 * ```
 * @param {(nbos: Cell[]) => Cell} visitFn Visitor function
 * @param {Grid} grid Grid to visit
 * @param {Cell} start Starting cell
 * @param {MutableValueSet<Cell>} [visited] Optional tracker of visited cells
 * @returns {Iterable<Cell>}
 */
export const visitor = function* (visitFn: (nbos: Cell[]) => Cell, grid: Grid, start: Cell, visited?: MutableValueSet<Cell>): Iterable<Cell> {
  if (visited == undefined) visited = new MutableValueSet<Cell>(c => cellKeyString(c));
  let queue: Cell[] = [];
  queue.push(start);
  while (queue.length > 0) {
    const next = visitFn(queue);
    if (!visited.has(next)) {
      visited.add(next);
      yield next;
    }
    const nbos = neighbours(grid, next, BoundsLogic.Undefined);
    queue.push(...nbos);
    queue = queue.filter(c => !visited?.has(c));
  }
}
