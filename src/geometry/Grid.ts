import {Rects, Points} from './index.js';
import {integer as guardInteger} from '../Guards.js';
import {clampIndex} from "../Util.js";
import {randomElement} from '../collections/Arrays.js';
import {SetMutable} from '../collections/Interfaces.js';
import {setMutable, } from "../collections/Set.js";
import {zipKeyValue} from "../collections/Map.js";

export type GridVisual = Readonly<{
  readonly size: number,
}>

export type Grid = Readonly<{
  readonly rows: number
  readonly cols: number
}>;

export type Cell = Readonly<{
  readonly x: number
  readonly y: number
}>;

export type Neighbours = Readonly<{
  readonly n: Cell | undefined,
  readonly e: Cell | undefined,
  readonly s: Cell | undefined,
  readonly w: Cell | undefined,
  readonly ne: Cell | undefined,
  readonly nw: Cell | undefined,
  readonly se: Cell | undefined,
  readonly sw: Cell | undefined
}>

export type CardinalDirection = `` | `n` | `ne` | `e` | `se` | `s` | `sw` | `w` | `nw`;

export type BoundsLogic = `unbounded` | `undefined` | `stop` | `wrap`;

export type VisitorLogic = {
  readonly options?: IdentifyNeighbours;
  readonly select: NeighbourSelector
}
export type VisitGenerator = Generator<Readonly<Cell>, void, unknown>
export type VisitorOpts = {
  readonly visited?: SetMutable<Cell>
  readonly reversed?: boolean
  readonly debug?: boolean
}
export type Visitor = (grid: Grid, start: Cell, opts?: VisitorOpts) => VisitGenerator;

export type NeighbourMaybe = readonly [keyof Neighbours, Cell | undefined];
export type Neighbour = readonly [keyof Neighbours, Cell];

/**
 * Neighbour selector logic. For a given set of `neighbours` pick one to visit next.
 */
export type NeighbourSelector = (neighbours: ReadonlyArray<Neighbour>) => Neighbour | undefined;

/**
 * Identify neighbours logic. For a given `grid` and `origin`, return a list of neighbours
 */
export type IdentifyNeighbours = (grid: Grid, origin: Cell) => ReadonlyArray<Neighbour>;

/**
 * Returns true if `cell` parameter is a cell with x,y fields.
 * Does not check validity of fields.
 *
 * @param cell
 * @return True if parameter is a cell
 */
const isCell = (cell: Cell | undefined): cell is Cell => {
  if (cell === undefined) return false;
  return (`x` in cell && `y` in cell);
};

/**
 * Returns true if `n` is a Neighbour type, eliminating NeighbourMaybe possibility
 *
 * @param n
 * @return
 */
const isNeighbour = (n: Neighbour | NeighbourMaybe | undefined): n is Neighbour => {
  if (n === undefined) return false;
  if (n[1] === undefined) return false;
  return true;
};

/**
 * Returns _true_ if grids `a` and `b` are equal in value
 *
 * @param a
 * @param b
 * @return
 */
export const isEqual = (a: Grid | GridVisual, b: Grid | GridVisual): boolean => {
  if (`rows` in a && `cols` in a) {
    if (`rows` in b && `cols` in b) {
      if (a.rows !== b.rows || a.cols !== b.cols) return false;
    } else return false;
  }
  if (`size` in a) {
    if (`size` in b) {
      if (a.size !== b.size) return false;
    } else return false;
  }
  return true;
};

/**
 * Returns a key string for a cell instance
 * A key string allows comparison of instances by value rather than reference
 * @param v
 * @returns
 */
export const cellKeyString = (v: Cell): string => `Cell{${v.x},${v.y}}`;

/**
 * Returns true if two cells equal. Returns false if either cell (or both) are undefined
 *
 * @param a
 * @param b
 * @returns
 */
export const cellEquals = (a: Cell, b: Cell): boolean => {
  if (b === undefined) return false;
  if (a === undefined) return false;
  return a.x === b.x && a.y === b.y;
};

/**
 * Throws an exception if any of the cell's parameters are invalid
 * @private
 * @param cell 
 * @param paramName 
 * @param grid 
 */
export const guardCell = (cell: Cell, paramName: string = `Param`, grid?: Grid) => {
  if (cell === undefined) throw new Error(paramName + ` is undefined. Expecting {x,y}`);
  if (cell.x === undefined) throw new Error(paramName + `.x is undefined`);
  if (cell.y === undefined) throw new Error(paramName + `.y is undefined`);
  if (!Number.isInteger(cell.x)) throw new Error(paramName + `.x is non-integer`);
  if (!Number.isInteger(cell.y)) throw new Error(paramName + `.y is non-integer`);
  if (grid !== undefined) {
    if (!inside(grid, cell)) throw new Error(`${paramName} is outside of grid. Cell: ${cell.x},${cell.y} Grid: ${grid.cols}, ${grid.rows}`);
  }
};

/**
 * Throws an exception if any of the grid's parameters are invalid
 * @param grid
 * @param paramName 
 */
const guardGrid = (grid: Grid, paramName: string = `Param`) => {
  if (grid === undefined) throw new Error(`${paramName} is undefined. Expecting grid.`);
  if (!(`rows` in grid)) throw new Error(`${paramName}.rows is undefined`);
  if (!(`cols` in grid)) throw new Error(`${paramName}.cols is undefined`);

  if (!Number.isInteger(grid.rows)) throw new Error(`${paramName}.rows is not an integer`);
  if (!Number.isInteger(grid.cols)) throw new Error(`${paramName}.cols is not an integer`);
};

/**
 * Returns _true_ if cell coordinates are above zero and within bounds of grid
 *
 * @param grid
 * @param cell
 * @return
 */
export const inside = (grid: Grid, cell: Cell): boolean => {
  if (cell.x < 0 || cell.y < 0) return false;
  if (cell.x >= grid.cols || cell.y >= grid.rows) return false;
  return true;
};
/**
 * Returns a visual rectangle of the cell, positioned from the top-left corner
 *
 * @param cell
 * @param grid
 * @return
 */
export const rectangleForCell = (cell: Cell, grid: Grid & GridVisual): Rects.RectPositioned => {
  guardCell(cell);
  const size = grid.size;
  const x = cell.x * size;
  const y = cell.y * size;
  const r = Rects.fromTopLeft({x: x, y: y}, size, size);
  return r;
};

/**
 * Returns the cell at a specified visual coordinate
 *
 * @param position Position, eg in pixels
 * @param grid Grid
 * @return Cell at position or undefined if outside of the grid
 */
export const cellAtPoint = (position: Points.Point, grid: Grid & GridVisual): Cell | undefined => {
  const size = grid.size;
  if (position.x < 0 || position.y < 0) return;
  const x = Math.floor(position.x / size);
  const y = Math.floor(position.y / size);
  if (x >= grid.cols) return;
  if (y >= grid.rows) return;
  return {x, y};
};

/**
 * Returns a list of all cardinal directions
 */
export const allDirections = Object.freeze([`n`, `ne`, `nw`, `e`, `s`, `se`, `sw`, `w`]) as ReadonlyArray<CardinalDirection>;

/**
 * Returns a list of + shaped directions (ie. excluding diaganol)
 */
export const crossDirections = Object.freeze([`n`, `e`, `s`, `w`]) as ReadonlyArray<CardinalDirection>;

/**
 * Returns neighbours for a cell. If no `directions` are provided, it defaults to all.
 * 
 * ```js
 * const n = neighbours = ({rows: 5, cols: 5}, {x:2, y:2} `wrap`);
 * {
 *  n: {x: 2, y: 1}
 *  s: {x: 2, y: 3}
 *  ....
 * }
 * ```
 * @returns Returns a map of cells, keyed by cardinal direction
 * @param grid Grid
 * @param cell Cell
 * @param bounds How to handle edges of grid
 * @param directions Directions to return
 */
export const neighbours = (grid: Grid, cell: Cell, bounds: BoundsLogic = `undefined`, directions?: ReadonlyArray<CardinalDirection>): Neighbours => {
  const dirs = directions ?? allDirections;
  const points = dirs.map(c => offset(grid, cell, getVectorFromCardinal(c), bounds));
  return zipKeyValue<Cell>(dirs, points) as Neighbours;
};

/**
 * Returns the visual midpoint of a cell (eg pixel coordinate)
 *
 * @param cell
 * @param grid
 * @return 
 */
export const cellMiddle = (cell: Cell, grid: Grid & GridVisual): Points.Point => {
  guardCell(cell);

  const size = grid.size;
  const x = cell.x * size; // + (grid.spacing ? cell.x * grid.spacing : 0);
  const y = cell.y * size; // + (grid.spacing ? cell.y * grid.spacing : 0);
  return Object.freeze({x: x + size / 2, y: y + size / 2});
};

/**
 * Returns the cells on the line of start and end, inclusive
 *
 * ```js
 * // Get cells that connect 0,0 and 10,10
 * const cells = getLine({x:0,y:0}, {x:10,y:10});
 * ```
 * 
 * This function does not handle wrapped coordinates.
 * @param start Starting cell
 * @param end End cell
 * @returns
 */
export const getLine = (start: Cell, end: Cell): ReadonlyArray<Cell> => {
  // https://stackoverflow.com/a/4672319
  guardCell(start);
  guardCell(end);

  // eslint-disable-next-line functional/no-let
  let startX = start.x;
  // eslint-disable-next-line functional/no-let
  let startY = start.y;
  const dx = Math.abs(end.x - startX);
  const dy = Math.abs(end.y - startY);
  const sx = (startX < end.x) ? 1 : -1;
  const sy = (startY < end.y) ? 1 : -1;
  // eslint-disable-next-line functional/no-let
  let err = dx - dy;

  const cells = [];
  // eslint-disable-next-line functional/no-loop-statement,no-constant-condition
  while (true) {
    // eslint-disable-next-line functional/immutable-data
    cells.push(Object.freeze({x: startX, y: startY}));
    if (startX === end.x && startY === end.y) break;
    const e2 = 2 * err;
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
};

/**
 * Returns cells that correspond to the cardinal directions at a specified distance
 *
 * @param grid Grid
 * @param steps Distance
 * @param start Start poiint
 * @param bound Logic for if bounds of grid are exceeded
 * @returns Cells corresponding to cardinals
 */
export const offsetCardinals = (grid: Grid, start: Cell, steps: number, bounds: BoundsLogic = `stop`): Neighbours => {
  guardGrid(grid, `grid`);
  guardCell(start, `start`);
  guardInteger(steps, `aboveZero`, `steps`);

  const directions = allDirections;
  const vectors = directions.map(d => getVectorFromCardinal(d, steps));
  const cells = directions.map((d, i) => offset(grid, start, vectors[i], bounds));

  return zipKeyValue(directions, cells) as Neighbours;
};

/**
 * Returns an {x,y} signed vector corresponding to the provided cardinal direction.
 * ```js
 * const n = getVectorFromCardinal(`n`); // {x: 0, y: -1}
 * ```
 * 
 * Optional `multiplier` can be applied to vector
 * ```js
 * const n = getVectorFromCardinal(`n`, 10); // {x: 0, y: -10}
 * ```
 * 
 * Blank direction returns {x: 0, y: 0}
 * @param cardinal Direction
 * @param multiplier Multipler
 * @returns Signed vector in the form of {x,y}
 */
export const getVectorFromCardinal = (cardinal: CardinalDirection, multiplier: number = 1): Cell => {
  // eslint-disable-next-line functional/no-let
  let v;
  switch (cardinal) {
  case `n`:
    v = {x: 0, y: -1 * multiplier};
    break;
  case `ne`:
    v = {x: 1 * multiplier, y: -1 * multiplier};
    break;
  case `e`:
    v = {x: 1 * multiplier, y: 0};
    break;
  case `se`:
    v = {x: 1 * multiplier, y: 1 * multiplier};
    break;
  case `s`:
    v = {x: 0, y: 1 * multiplier};
    break;
  case `sw`:
    v = {x: -1 * multiplier, y: 1 * multiplier};
    break;
  case `w`:
    v = {x: -1 * multiplier, y: 0};
    break;
  case `nw`:
    v = {x: -1 * multiplier, y: -1 * multiplier};
    break;
  default:
    v = {x: 0, y: 0};
  }
  return Object.freeze(v);
};

/**
 * Returns a list of cells from `start` to `end`.
 * 
 * Throws an error if start and end are not on same row or column.
 *
 * @param start Start cell
 * @param end end clel
 * @param endInclusive
 * @return Array of cells
 */
export const simpleLine = function (start: Cell, end: Cell, endInclusive: boolean = false): ReadonlyArray<Cell> {
  // eslint-disable-next-line functional/prefer-readonly-type
  const cells: Cell[] = [];
  if (start.x === end.x) {
    // Vertical
    const lastY = endInclusive ? end.y + 1 : end.y;
    // eslint-disable-next-line functional/no-loop-statement,functional/no-let
    for (let y = start.y; y < lastY; y++) {
      // eslint-disable-next-line functional/immutable-data
      cells.push({x: start.x, y: y});
    }
  } else if (start.y === end.y) {
    // Horizontal
    const lastX = endInclusive ? end.x + 1 : end.x;
    // eslint-disable-next-line functional/no-loop-statement,functional/no-let
    for (let x = start.x; x < lastX; x++) {
      // eslint-disable-next-line functional/immutable-data
      cells.push({x: x, y: start.y});
    }
  } else {
    throw new Error(`Only does vertical and horizontal: ${start.x},${start.y} - ${end.x},${end.y}`);
  }
  return cells;
};

/**
 *
 * Returns a coordinate offset from `start` by `vector` amount.
 * 
 * Different behaviour can be specified for how to handle when coordinates exceed the bounds of the grid
 * 
 * 
 * Note: x and y wrapping are calculated independently. A large wrapping of x, for example won't shift down a line 
 * @param grid Grid to traverse
 * @param vector Offset in x/y
 * @param start Start point
 * @param bounds
 * @returns Cell
 */
export const offset = function (grid: Grid, start: Cell, vector: Cell, bounds: BoundsLogic = `undefined`): Cell | undefined {
  guardCell(start, `start`, grid);
  guardCell(vector);
  guardGrid(grid, `grid`);

  // eslint-disable-next-line functional/no-let
  let x = start.x;
  // eslint-disable-next-line functional/no-let
  let y = start.y;
  switch (bounds) {
  case `wrap`:
    x += vector.x % grid.cols;
    y += vector.y % grid.rows;
    if (x < 0) x = grid.cols + x;
    else if (x >= grid.cols) {
      x -= grid.cols;
    }
    if (y < 0) y = grid.rows + y;
    else if (y >= grid.rows) {
      y -= grid.rows;
    }
    break;
  case `stop`:
    x += vector.x;
    y += vector.y;
    x = clampIndex(x, grid.cols);
    y = clampIndex(y, grid.rows);
    break;
  case `undefined`:
    x += vector.x;
    y += vector.y;
    if (x < 0 || y < 0) return;
    if (x >= grid.cols || y >= grid.rows) return;
    break;
  case `unbounded`:
    x += vector.x;
    y += vector.y;
    break;
  default:
    throw new Error(`Unknown BoundsLogic case ${bounds}`);
  }
  return Object.freeze({x, y});
};

const neighbourList = (grid: Grid, cell: Cell, directions: ReadonlyArray<CardinalDirection>, bounds: BoundsLogic): ReadonlyArray<Neighbour> => {
  // Get neighbours for cell
  const cellNeighbours = neighbours(grid, cell, bounds, directions);

  // Filter out undefined cells
  const entries = Object.entries(cellNeighbours);
  return (entries as Array<NeighbourMaybe>).filter(isNeighbour);
};

/**
 * Visits every cell in grid using supplied selection function
 * In-built functions to use: visitorDepth, visitorBreadth, visitorRandom,
 * visitorColumn, visitorRow.
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
 *  let visited = new mutableValueSet<Grids.Cell>(c => Grids.cellKeyString(c));
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
 * @param {(neighbourSelect: NeighbourSelector} neighbourSelect Select neighbour to visit
 * @param {Grid} grid Grid to visit
 * @param {Cell} start Starting cell
 * @param {MutableStringSet<Cell>} [visited] Optional tracker of visited cells
 * @returns {Iterable<Cell>}
 */
// eslint-disable-next-line functional/prefer-readonly-type
export const visitor = function* (
  logic: VisitorLogic,
  grid: Grid,
  start: Cell,
  opts: VisitorOpts = {}
): VisitGenerator {

  guardGrid(grid, `grid`);
  guardCell(start, `start`, grid);


  const v = opts.visited ?? setMutable<Cell>(c => cellKeyString(c));
  const possibleNeighbours = logic.options ? logic.options : (g: Grid, c: Cell) => neighbourList(g, c, crossDirections, `undefined`);

  if (!isCell(start)) throw new Error(`'start' parameter is undefined or not a cell`);

  // eslint-disable-next-line functional/no-let
  let cellQueue: Cell[] = [start];
  // eslint-disable-next-line functional/no-let
  let moveQueue: Neighbour[] = [];
  // eslint-disable-next-line functional/no-let
  let current: Cell | null = null;

  // eslint-disable-next-line functional/no-loop-statement
  while (cellQueue.length > 0) {
    // console.log(`cell queue: ${cellQueue.length} move queue: ${moveQueue.length} current: ${JSON.stringify(current)}` );
    if (current === null) {
      // eslint-disable-next-line functional/immutable-data
      const nv = cellQueue.pop();
      if (nv === undefined) {
        // console.log(`cellQueue drained`);
        break;
      }
      current = nv;
    }

    if (!v.has(current)) {
      v.add(current);
      yield (current);

      const nextSteps = possibleNeighbours(grid, current)
        .filter(step => !v.has(step[1]));

      if (nextSteps.length === 0) {
        // No more moves for this cell
        if (current !== null) {
          cellQueue = cellQueue.filter(cq => cellEquals(cq, current as Cell));
        }
      } else {
        // eslint-disable-next-line functional/immutable-data
        moveQueue.push(...nextSteps);
      }
    }

    // Remove steps already made
    moveQueue = moveQueue.filter(step => !v.has(step[1]));

    if (moveQueue.length === 0) {
      // console.log(`moveQueue empty`);
      current = null;
    } else {
      // Pick move
      const potential = logic.select(moveQueue);
      if (potential !== undefined) {
        // eslint-disable-next-line functional/immutable-data
        cellQueue.push(potential[1]);
        current = potential[1];
      }
    }
  }
};

export const visitorDepth = (grid: Grid, start: Cell, opts: VisitorOpts = {}) => visitor({
  select: (nbos) => nbos[nbos.length - 1]
},
grid,
start,
opts);

export const visitorBreadth = (grid: Grid, start: Cell, opts: VisitorOpts = {}) => visitor({
  select: (nbos) => nbos[0]
},
grid,
start,
opts);

const randomNeighbour = (nbos: readonly Neighbour[]) => randomElement(nbos); // .filter(isNeighbour));

export const visitorRandomContiguous = (grid: Grid, start: Cell, opts: VisitorOpts = {}) => visitor({
  select: randomNeighbour
},
grid,
start,
opts);

export const visitorRandom = (grid: Grid, start: Cell, opts: VisitorOpts = {}) => visitor({
  options: (grid, cell) => {
    const t: Neighbour[] = [];
    // eslint-disable-next-line functional/no-loop-statement
    for (const c of cells(grid, cell)) {
      // eslint-disable-next-line functional/immutable-data
      t.push([`n`, c]);
    }
    return t;
  },
  select: randomNeighbour
},
grid,
start,
opts);

export const visitorRow = (grid: Grid, start: Cell, opts: VisitorOpts = {}) => {
  const {reversed = false} = opts;

  const neighbourSelect = (nbos: readonly Neighbour[]) => nbos.find(n => n[0] === (reversed ? `w` : `e`));

  const possibleNeighbours = (grid: Grid, cell: Cell): ReadonlyArray<Neighbour> => {
    if (reversed) {
      // WALKING BACKWARD ALONG RONG
      if (cell.x > 0) {
        // All fine, step to the left
        cell = {x: cell.x - 1, y: cell.y};
      } else {
        // At the beginning of a row
        if (cell.y > 0) {
          // Wrap to next row up
          cell = {x: grid.cols - 1, y: cell.y - 1};
        } else {
          // Wrap to end of grid
          cell = {x: grid.cols - 1, y: grid.rows - 1};
        }
      }
    } else {
      /*
       * WALKING FORWARD ALONG ROWS
       * console.log(`${cell.x}, ${cell.y}`);
       */
      if (cell.x < grid.rows - 1) {
        // All fine, step to the right
        cell = {x: cell.x + 1, y: cell.y};
      } else {
        // At the end of a row
        if (cell.y < grid.rows - 1) {
          // More rows available, wrap to next row down
          cell = {x: 0, y: cell.y + 1};
        } else {
          // No more rows available, wrap to start of the grid
          cell = {x: 0, y: 0};
        }
      }
    }
    return [[(reversed ? `w` : `e`), cell]];
  };

  const logic: VisitorLogic = {
    select: neighbourSelect,
    options: possibleNeighbours
  };

  return visitor(logic, grid, start, opts);
};

/**
 * Runs the provided `visitor` for `steps`, returning the cell we end at
 * 
 * ```js
 * // Get a cell 10 steps away (row-wise) from start
 * const cell = visitFor(grid, start, 10, visitorRow);
 * ```
 * @param grid Grid to traverse
 * @param start Start point
 * @param steps Number of steps
 * @param visitor Visitor function
 * @returns 
 */
export const visitFor = (grid: Grid, start: Cell, steps: number, visitor: Visitor): Cell => {
  guardInteger(steps, ``, `steps`);

  const opts: VisitorOpts = {
    reversed: steps < 0
  };
  steps = Math.abs(steps);

  // eslint-disable-next-line functional/no-let
  let c = start;
  // eslint-disable-next-line functional/no-let
  let v = visitor(grid, start, opts);
  v.next(); // Burn up starting cell

  // eslint-disable-next-line functional/no-let
  let stepsMade = 0;

  // eslint-disable-next-line functional/no-loop-statement
  while (stepsMade < steps) {
    stepsMade++;
    const {value} = v.next();
    if (value) {
      c = value;
      if (opts.debug) console.log(`stepsMade: ${stepsMade} cell: ${c.x}, ${c.y} reverse: ${opts.reversed}`);
    } else {
      if (steps >= grid.cols * grid.rows) {
        steps -= grid.cols * grid.rows;
        stepsMade = 0;
        v = visitor(grid, start, opts);
        v.next();
        c = start;
        if (opts.debug) console.log(`resetting visitor to ${steps}`);
      } else throw new Error(`Value not received by visitor`);
    }
  }
  return c;
};

/**
 * Visits cells running down columns, left-to-right.
 * @param grid Grid to traverse
 * @param start Start cell
 * @param opts Options
 * @returns Visitor generator
 */
export const visitorColumn = (grid: Grid, start: Cell, opts: VisitorOpts = {}):VisitGenerator => {
  const {reversed = false} = opts;
  const logic: VisitorLogic = {
    select: (nbos) => nbos.find(n => n[0] === (reversed ? `n` : `s`)),
    options: (grid, cell): ReadonlyArray<Neighbour> => {
      if (reversed) {
        // WALK UP COLUMN, RIGHT-TO-LEFT
        if (cell.y > 0) {
          // Easy case
          cell = {x: cell.x, y: cell.y - 1};
        } else {
          // Top of column
          if (cell.x === 0) {
            // Top-left corner, need to wrap
            cell = {x: grid.cols - 1, y: grid.rows - 1};
          } else {
            cell = {x: cell.x - 1, y: grid.rows - 1};
          }
        }
      } else {
        // WALK DOWN COLUMNS, LEFT-TO-RIGHT
        if (cell.y < grid.rows - 1) {
          // Easy case, move down by one
          cell = {x: cell.x, y: cell.y + 1};
        } else {
          // End of column
          if (cell.x < grid.cols - 1) {
            // Move to next column and start at top
            cell = {x: cell.x + 1, y: 0};
          } else {
            // Move to start of grid
            cell = {x: 0, y: 0};
          }
        }
      }
      return [[reversed ? `n` : `s`, cell]];
    }
  };
  return visitor(logic, grid, start, opts);
};

/**
 * Enumerate rows of grid, returning all the cells in the row
 * ```js
 * for (const row of Grid.rows(shape)) {
 *  // row is an array of Cells.
 * }
 * ```
 * @param grid 
 * @param start 
 */
export const rows = function* (grid: Grid, start: Cell = {x: 0, y: 0}) {
  //eslint-disable-next-line functional/no-let
  let row = start.y;
  //eslint-disable-next-line functional/no-let
  let rowCells: Cell[] = [];
  //eslint-disable-next-line functional/no-loop-statement
  for (const c of cells(grid, start)) {
    if (c.y !== row) {
      yield rowCells;
      rowCells = [c];
      row = c.y;
    } else {
      //eslint-disable-next-line functional/immutable-data
      rowCells.push(c);
    }
  }
  if (rowCells.length > 0) yield rowCells;
};

/**
 * Enumerate all cells in an efficient manner. Runs left-to-right, top-to-bottom.
 * If end of grid is reached, iterator will wrap to ensure all are visited.
 *
 * @param {Grid} grid
 * @param {Cell} [start={x:0, y:0}]
 */
export const cells = function* (grid: Grid, start: Cell = {x: 0, y: 0}) {
  guardGrid(grid, `grid`);
  guardCell(start, `start`, grid);

  // eslint-disable-next-line functional/no-let
  let {x, y} = start;
  // eslint-disable-next-line functional/no-let
  let canMove = true;
  // eslint-disable-next-line functional/no-loop-statement
  do {
    yield {x, y};
    x++;
    if (x === grid.cols) {
      y++;
      x = 0;
    }
    if (y === grid.rows) {
      y = 0;
      x = 0;
    }
    if (x === start.x && y === start.y) canMove = false; // Complete
  } while (canMove);
};