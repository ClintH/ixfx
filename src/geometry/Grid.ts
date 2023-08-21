import { Rects, Points } from './index.js';
import { integer as guardInteger, number as guardNumber } from '../Guards.js';
import { clampIndex } from '../data/Clamp.js';
import { randomElement } from '../collections/Arrays.js';
import { type ISetMutable, mutable } from '../collections/set/index.js';
import { zipKeyValue } from '../collections/map/index.js';

export type GridVisual = {
  readonly size: number;
};

export type Grid = {
  readonly rows: number;
  readonly cols: number;
};

export type Cell = {
  readonly x: number;
  readonly y: number;
};

export type Neighbours = {
  readonly n: Cell | undefined;
  readonly e: Cell | undefined;
  readonly s: Cell | undefined;
  readonly w: Cell | undefined;
  readonly ne: Cell | undefined;
  readonly nw: Cell | undefined;
  readonly se: Cell | undefined;
  readonly sw: Cell | undefined;
};

export type CardinalDirection =
  | `n`
  | `ne`
  | `e`
  | `se`
  | `s`
  | `sw`
  | `w`
  | `nw`;
export type CardinalDirectionOptional = CardinalDirection | ``;

export type BoundsLogic = `unbounded` | `undefined` | `stop` | `wrap`;

export type VisitorLogic = {
  readonly options?: IdentifyNeighbours;
  readonly select: NeighbourSelector;
};
export type VisitGenerator = Generator<Readonly<Cell>, void, unknown>;
export type VisitorOpts = {
  readonly visited?: ISetMutable<Cell>;
  readonly reversed?: boolean;
  readonly debug?: boolean;
  readonly boundsWrap?: BoundsLogic;
};

/**
 * Visitor function.
 *
 * Implementations:
 * * {@link cells}: left-to-right, top-to-bottom. Same as {@link visitorRow}
 * * {@link visitorBreadth}, {@link visitorDepth}
 * * {@link visitorColumn}: top-to-bottom, left-to-right.
 * * {@link visitorRandom}: Any unvisited location
 * * {@link visitorRandomContiguous}: A random direct neighbour of current cell
 */
export type Visitor = (
  grid: Grid,
  start: Cell,
  opts?: VisitorOpts
) => VisitGenerator;

export type NeighbourMaybe = readonly [keyof Neighbours, Cell | undefined];
export type Neighbour = readonly [keyof Neighbours, Cell];

/**
 * A function that returns a value (or _undefined_) based on a _cell_
 *
 * Implementations:
 * * {@link access1dArray}: For accessing a single-dimension array as a grid
 */
export type CellAccessor<V> = (cell: Cell, wrap: BoundsLogic) => V | undefined;

/**
 * Neighbour selector logic. For a given set of `neighbours` pick one to visit next.
 */
export type NeighbourSelector = (
  neighbours: ReadonlyArray<Neighbour>
) => Neighbour | undefined;

/**
 * Identify neighbours logic. For a given `grid` and `origin`, return a list of neighbours
 */
export type IdentifyNeighbours = (
  grid: Grid,
  origin: Cell
) => ReadonlyArray<Neighbour>;

/**
 * Returns true if `cell` parameter is a cell with x,y fields.
 * Does not check validity of fields.
 *
 * @param cell
 * @return True if parameter is a cell
 */
const isCell = (cell: Cell | undefined): cell is Cell => {
  if (cell === undefined) return false;
  return `x` in cell && `y` in cell;
};

/**
 * Returns true if `n` is a Neighbour type, eliminating NeighbourMaybe possibility
 *
 * @param n
 * @return
 */
const isNeighbour = (
  n: Neighbour | NeighbourMaybe | undefined
): n is Neighbour => {
  if (n === undefined) return false;
  if (n[1] === undefined) return false;
  return true;
};

/**
 * Returns _true_ if grids `a` and `b` are equal in value.
 * Returns _false_ if either parameter is undefined.
 *
 * @param a
 * @param b
 * @return
 */
export const isEqual = (
  a: Grid | GridVisual,
  b: Grid | GridVisual
): boolean => {
  if (b === undefined) return false;
  if (a === undefined) return false;
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
 *
 * ```js
 * cellKeyString({x:10,y:20});
 * // Yields: "Cell{10,20}";
 * ```
 * @param v
 * @returns
 */
export const cellKeyString = (v: Cell): string => `Cell{${v.x},${v.y}}`;

/**
 * Returns _true_ if two cells equal.
 * Returns _false_ if either cell are undefined
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
export const guardCell = (
  cell: Cell,
  paramName: string = `Param`,
  grid?: Grid
) => {
  if (cell === undefined) {
    throw new Error(paramName + ` is undefined. Expecting {x,y}`);
  }
  if (cell.x === undefined) throw new Error(paramName + `.x is undefined`);
  if (cell.y === undefined) throw new Error(paramName + `.y is undefined`);
  if (Number.isNaN(cell.x)) throw new Error(paramName + `.x is NaN`);
  if (Number.isNaN(cell.y)) throw new Error(paramName + `.y is NaN`);
  if (!Number.isInteger(cell.x)) {
    throw new Error(paramName + `.x is non-integer`);
  }
  if (!Number.isInteger(cell.y)) {
    throw new Error(paramName + `.y is non-integer`);
  }
  if (grid !== undefined) {
    if (!inside(grid, cell)) {
      throw new Error(
        `${paramName} is outside of grid. Cell: ${cell.x},${cell.y} Grid: ${grid.cols}, ${grid.rows}`
      );
    }
  }
};

/**
 * Throws an exception if any of the grid's parameters are invalid
 * @param grid
 * @param paramName
 */
const guardGrid = (grid: Grid, paramName: string = `Param`) => {
  if (grid === undefined) {
    throw new Error(`${paramName} is undefined. Expecting grid.`);
  }
  if (!(`rows` in grid)) throw new Error(`${paramName}.rows is undefined`);
  if (!(`cols` in grid)) throw new Error(`${paramName}.cols is undefined`);

  if (!Number.isInteger(grid.rows)) {
    throw new Error(`${paramName}.rows is not an integer`);
  }
  if (!Number.isInteger(grid.cols)) {
    throw new Error(`${paramName}.cols is not an integer`);
  }
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
 * ```js
 * const cell = { x: 1, y: 0 };
 *
 * // 5x5 grid, each cell 5px in size
 * const grid = { rows: 5, cols: 5, size: 5 }
 *
 * const r = rectangleForCell(cell, grid);
 *
 * // Yields: { x: 5, y: 0, width: 5, height: 5 }
 * ```
 * @param cell
 * @param grid
 * @return
 */
export const rectangleForCell = (
  cell: Cell,
  grid: Grid & GridVisual
): Rects.RectPositioned => {
  guardCell(cell);
  const size = grid.size;
  const x = cell.x * size;
  const y = cell.y * size;
  const r = Rects.fromTopLeft({ x: x, y: y }, size, size);
  return r;
};

/**
 * Generator that returns rectangles for each cell in a grid
 *
 * @example Draw rectangles
 * ```js
 * import { Drawing } from 'visuals.js'
 * const rects = [...Grids.asRectangles(grid)];
 * Drawing.rect(ctx, rects, { strokeStyle: `silver`});
 * ```
 * @param grid
 */
export function* asRectangles(
  grid: GridVisual & Grid
): IterableIterator<Rects.RectPositioned> {
  for (const c of cells(grid)) {
    yield rectangleForCell(c, grid);
  }
}

/**
 * Returns a two-dimensional array according to `grid`
 * size.
 *
 * ```js
 * const a = Grids.toArray({ rows: 3, cols: 2 });
 * Yields:
 * [ [_,_] ]
 * [ [_,_] ]
 * [ [_,_] ]
 * ```
 *
 * `initialValue` can be provided to set the value
 * for all cells.
 * @param grid
 * @param initialValue
 * @returns
 */
//eslint-disable-next-line functional/prefer-readonly-type
export const toArray = <V>(grid: Grid, initialValue?: V): V[][] => {
  const ret = [];
  //eslint-disable-next-line functional/no-let
  for (let row = 0; row < grid.rows; row++) {
    //eslint-disable-next-line functional/immutable-data
    ret[row] = new Array<V>(grid.cols);
    if (initialValue) {
      //eslint-disable-next-line functional/no-let
      for (let col = 0; col < grid.cols; col++) {
        //eslint-disable-next-line functional/immutable-data
        ret[row][col] = initialValue;
      }
    }
  }
  return ret;
};

/**
 * Returns the cell at a specified visual coordinate
 * or _undefined_ if the position is outside of the grid.
 *
 * `position` must be in same coordinate/scale as the grid.
 *
 * @param position Position, eg in pixels
 * @param grid Grid
 * @return Cell at position or undefined if outside of the grid
 */
export const cellAtPoint = (
  grid: Grid & GridVisual,
  position: Points.Point
): Cell | undefined => {
  const size = grid.size;
  guardNumber(size, 'positive', 'grid.size');
  if (position.x < 0 || position.y < 0) return;
  const x = Math.floor(position.x / size);
  const y = Math.floor(position.y / size);
  if (x >= grid.cols) return;
  if (y >= grid.rows) return;
  return { x, y };
};

/**
 * Returns a list of all cardinal directions: n, ne, nw, e, s, se, sw, w
 */
export const allDirections = Object.freeze([
  `n`,
  `ne`,
  `nw`,
  `e`,
  `s`,
  `se`,
  `sw`,
  `w`,
]) as ReadonlyArray<CardinalDirection>;

/**
 * Returns a list of + shaped directions: n, e, s, w
 */
export const crossDirections = Object.freeze([
  `n`,
  `e`,
  `s`,
  `w`,
]) as ReadonlyArray<CardinalDirection>;

/**
 * Returns neighbours for a cell. If no `directions` are provided, it defaults to {@link allDirections}.
 *
 * ```js
 * const grid = { rows: 5, cols: 5 };
 * const cell = { x:2, y:2 };
 *
 * // Get n,ne,nw,e,s,se,sw and w neighbours
 * const n = Grids.neighbours(grid, cell, `wrap`);
 *
 * Yields:
 * {
 *  n: {x: 2, y: 1}
 *  s: {x: 2, y: 3}
 *  ....
 * }
 * ```
 *
 * Returns neighbours without diagonals (ie n, e, s, w):
 * ```js
 * const n = Grids.neighbours(grid, cell, `stop`, Grids.crossDirections);
 * ```
 * @returns Returns a map of cells, keyed by cardinal direction
 * @param grid Grid
 * @param cell Cell
 * @param bounds How to handle edges of grid
 * @param directions Directions to return
 */
export const neighbours = (
  grid: Grid,
  cell: Cell,
  bounds: BoundsLogic = `undefined`,
  directions?: ReadonlyArray<CardinalDirection>
): Neighbours => {
  const dirs = directions ?? allDirections;
  const points = dirs.map((c) =>
    offset(grid, cell, getVectorFromCardinal(c), bounds)
  );
  return zipKeyValue<Cell>(dirs, points) as Neighbours;
};

export function* visitNeigbours(
  grid: Grid,
  cell: Cell,
  bounds: BoundsLogic = `undefined`,
  directions?: ReadonlyArray<CardinalDirection>
) {
  const dirs = directions ?? allDirections;
  const points = dirs.map((c) =>
    offset(grid, cell, getVectorFromCardinal(c), bounds)
  );
  for (const pt of points) {
    if (pt !== undefined) yield pt;
  }
}

/**
 * Returns the visual midpoint of a cell (eg. pixel coordinate)
 *
 * @param cell
 * @param grid
 * @return
 */
export const cellMiddle = (
  cell: Cell,
  grid: Grid & GridVisual
): Points.Point => {
  guardCell(cell);

  const size = grid.size;
  const x = cell.x * size; // + (grid.spacing ? cell.x * grid.spacing : 0);
  const y = cell.y * size; // + (grid.spacing ? cell.y * grid.spacing : 0);
  return Object.freeze({ x: x + size / 2, y: y + size / 2 });
};

/**
 * Returns the cells on the line of `start` and `end`, inclusive
 *
 * ```js
 * // Get cells that connect 0,0 and 10,10
 * const cells = Grids.getLine({x:0,y:0}, {x:10,y:10});
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
  const sx = startX < end.x ? 1 : -1;
  const sy = startY < end.y ? 1 : -1;
  // eslint-disable-next-line functional/no-let
  let err = dx - dy;

  const cells = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line functional/immutable-data
    cells.push(Object.freeze({ x: startX, y: startY }));
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
 * i.e. it projects a line from `start` cell in all cardinal directions and returns the cells at `steps` distance.
 * @param grid Grid
 * @param steps Distance
 * @param start Start poiint
 * @param bound Logic for if bounds of grid are exceeded
 * @returns Cells corresponding to cardinals
 */
export const offsetCardinals = (
  grid: Grid,
  start: Cell,
  steps: number,
  bounds: BoundsLogic = `stop`
): Neighbours => {
  guardGrid(grid, `grid`);
  guardCell(start, `start`);
  guardInteger(steps, `aboveZero`, `steps`);

  const directions = allDirections;
  const vectors = directions.map((d) => getVectorFromCardinal(d, steps));
  const cells = directions.map((d, i) =>
    offset(grid, start, vectors[i], bounds)
  );

  return zipKeyValue(directions, cells) as Neighbours;
};

/**
 * Returns an `{ x, y }` signed vector corresponding to the provided cardinal direction.
 * ```js
 * const n = getVectorFromCardinal(`n`); // {x: 0, y: -1}
 * ```
 *
 * Optional `multiplier` can be applied to vector
 * ```js
 * const n = getVectorFromCardinal(`n`, 10); // {x: 0, y: -10}
 * ```
 *
 * Blank direction returns `{ x: 0, y: 0 }`
 * @param cardinal Direction
 * @param multiplier Multipler
 * @returns Signed vector in the form of `{ x, y }`
 */
export const getVectorFromCardinal = (
  cardinal: CardinalDirectionOptional,
  multiplier: number = 1
): Cell => {
  // eslint-disable-next-line functional/no-let
  let v;
  switch (cardinal) {
    case `n`:
      v = { x: 0, y: -1 * multiplier };
      break;
    case `ne`:
      v = { x: 1 * multiplier, y: -1 * multiplier };
      break;
    case `e`:
      v = { x: 1 * multiplier, y: 0 };
      break;
    case `se`:
      v = { x: 1 * multiplier, y: 1 * multiplier };
      break;
    case `s`:
      v = { x: 0, y: 1 * multiplier };
      break;
    case `sw`:
      v = { x: -1 * multiplier, y: 1 * multiplier };
      break;
    case `w`:
      v = { x: -1 * multiplier, y: 0 };
      break;
    case `nw`:
      v = { x: -1 * multiplier, y: -1 * multiplier };
      break;
    default:
      v = { x: 0, y: 0 };
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
export const simpleLine = function (
  start: Cell,
  end: Cell,
  endInclusive: boolean = false
): ReadonlyArray<Cell> {
  // eslint-disable-next-line functional/prefer-readonly-type
  const cells: Cell[] = [];
  if (start.x === end.x) {
    // Vertical
    const lastY = endInclusive ? end.y + 1 : end.y;
    // eslint-disable-next-line functional/no-let
    for (let y = start.y; y < lastY; y++) {
      // eslint-disable-next-line functional/immutable-data
      cells.push({ x: start.x, y: y });
    }
  } else if (start.y === end.y) {
    // Horizontal
    const lastX = endInclusive ? end.x + 1 : end.x;
    // eslint-disable-next-line functional/no-let
    for (let x = start.x; x < lastX; x++) {
      // eslint-disable-next-line functional/immutable-data
      cells.push({ x: x, y: start.y });
    }
  } else {
    throw new Error(
      `Only does vertical and horizontal: ${start.x},${start.y} - ${end.x},${end.y}`
    );
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
 * Note: x and y wrapping are calculated independently. A large wrapping of x, for example won't shift up/down a line
 * @param grid Grid to traverse
 * @param vector Offset in x/y
 * @param start Start point
 * @param bounds
 * @returns Cell
 */
export const offset = function (
  grid: Grid,
  start: Cell,
  vector: Cell,
  bounds: BoundsLogic = `undefined`
): Cell | undefined {
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
  return Object.freeze({ x, y });
};

const neighbourList = (
  grid: Grid,
  cell: Cell,
  directions: ReadonlyArray<CardinalDirection>,
  bounds: BoundsLogic
): ReadonlyArray<Neighbour> => {
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
 * @param neighbourSelect Select neighbour to visit
 * @param grid Grid to visit
 * @param start Starting cell
 * @param visited Optional tracker of visited cells
 * @returns Cells
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

  const v = opts.visited ?? mutable<Cell>((c) => cellKeyString(c));
  const possibleNeighbours = logic.options
    ? logic.options
    : (g: Grid, c: Cell) => neighbourList(g, c, crossDirections, `undefined`);

  if (!isCell(start)) {
    throw new Error(`'start' parameter is undefined or not a cell`);
  }

  // eslint-disable-next-line functional/no-let
  let cellQueue: Cell[] = [start];
  // eslint-disable-next-line functional/no-let
  let moveQueue: Neighbour[] = [];
  // eslint-disable-next-line functional/no-let
  let current: Cell | null = null;

  while (cellQueue.length > 0) {
    if (current === null) {
      // eslint-disable-next-line functional/immutable-data
      const nv = cellQueue.pop();
      if (nv === undefined) {
        break;
      }
      current = nv;
    }

    if (!v.has(current)) {
      v.add(current);
      yield current;

      const nextSteps = possibleNeighbours(grid, current).filter(
        (step) => !v.has(step[1])
      );

      if (nextSteps.length === 0) {
        // No more moves for this cell
        if (current !== null) {
          cellQueue = cellQueue.filter((cq) => cellEquals(cq, current as Cell));
        }
      } else {
        // eslint-disable-next-line functional/immutable-data
        moveQueue.push(...nextSteps);
      }
    }

    // Remove steps already made
    moveQueue = moveQueue.filter((step) => !v.has(step[1]));

    if (moveQueue.length === 0) {
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

export const visitorDepth = (grid: Grid, start: Cell, opts: VisitorOpts = {}) =>
  visitor(
    {
      select: (nbos) => nbos[nbos.length - 1],
    },
    grid,
    start,
    opts
  );

export const visitorBreadth = (
  grid: Grid,
  start: Cell,
  opts: VisitorOpts = {}
) =>
  visitor(
    {
      select: (nbos) => nbos[0],
    },
    grid,
    start,
    opts
  );

const randomNeighbour = (nbos: readonly Neighbour[]) => randomElement(nbos); // .filter(isNeighbour));

export const visitorRandomContiguous = (
  grid: Grid,
  start: Cell,
  opts: VisitorOpts = {}
) =>
  visitor(
    {
      select: randomNeighbour,
    },
    grid,
    start,
    opts
  );

/**
 * Visit by following rows. Normal order is left-to-right, top-to-bottom.
 * @param grid
 * @param start
 * @param opts
 * @returns
 */
export const visitorRandom = (
  grid: Grid,
  start: Cell,
  opts: VisitorOpts = {}
) =>
  visitor(
    {
      options: (grid, cell) => {
        const t: Neighbour[] = [];
        for (const c of cells(grid, cell)) {
          // eslint-disable-next-line functional/immutable-data
          t.push([`n`, c]);
        }
        return t;
      },
      select: randomNeighbour,
    },
    grid,
    start,
    opts
  );

export const visitorRow = (
  grid: Grid,
  start: Cell = { x: 0, y: 0 },
  opts: VisitorOpts = {}
) => {
  const { reversed = false } = opts;

  const neighbourSelect = (nbos: readonly Neighbour[]) =>
    nbos.find((n) => n[0] === (reversed ? `w` : `e`));

  const possibleNeighbours = (
    grid: Grid,
    cell: Cell
  ): ReadonlyArray<Neighbour> => {
    if (reversed) {
      // WALKING BACKWARD ALONG ROW
      if (cell.x > 0) {
        // All fine, step to the left
        cell = { x: cell.x - 1, y: cell.y };
      } else {
        // At the beginning of a row
        if (cell.y > 0) {
          // Wrap to next row up
          cell = { x: grid.cols - 1, y: cell.y - 1 };
        } else {
          // Wrap to end of grid
          cell = { x: grid.cols - 1, y: grid.rows - 1 };
        }
      }
    } else {
      /*
       * WALKING FORWARD ALONG ROWS
       */
      if (cell.x < grid.rows - 1) {
        // All fine, step to the right
        cell = { x: cell.x + 1, y: cell.y };
      } else {
        // At the end of a row
        if (cell.y < grid.rows - 1) {
          // More rows available, wrap to next row down
          cell = { x: 0, y: cell.y + 1 };
        } else {
          // No more rows available, wrap to start of the grid
          cell = { x: 0, y: 0 };
        }
      }
    }
    return [[reversed ? `w` : `e`, cell]];
  };

  const logic: VisitorLogic = {
    select: neighbourSelect,
    options: possibleNeighbours,
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
export const visitFor = (
  grid: Grid,
  start: Cell,
  steps: number,
  visitor: Visitor
): Cell => {
  guardInteger(steps, ``, `steps`);

  const opts: VisitorOpts = {
    reversed: steps < 0,
  };
  steps = Math.abs(steps);

  // eslint-disable-next-line functional/no-let
  let c = start;
  // eslint-disable-next-line functional/no-let
  let v = visitor(grid, start, opts);
  v.next(); // Burn up starting cell

  // eslint-disable-next-line functional/no-let
  let stepsMade = 0;

  while (stepsMade < steps) {
    stepsMade++;
    const { value } = v.next();
    if (value) {
      c = value;
      if (opts.debug) {
        console.log(
          `stepsMade: ${stepsMade} cell: ${c.x}, ${c.y} reverse: ${opts.reversed}`
        );
      }
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
export const visitorColumn = (
  grid: Grid,
  start: Cell,
  opts: VisitorOpts = {}
): VisitGenerator => {
  const { reversed = false } = opts;
  const logic: VisitorLogic = {
    select: (nbos) => nbos.find((n) => n[0] === (reversed ? `n` : `s`)),
    options: (grid, cell): ReadonlyArray<Neighbour> => {
      if (reversed) {
        // WALK UP COLUMN, RIGHT-TO-LEFT
        if (cell.y > 0) {
          // Easy case
          cell = { x: cell.x, y: cell.y - 1 };
        } else {
          // Top of column
          if (cell.x === 0) {
            // Top-left corner, need to wrap
            cell = { x: grid.cols - 1, y: grid.rows - 1 };
          } else {
            cell = { x: cell.x - 1, y: grid.rows - 1 };
          }
        }
      } else {
        // WALK DOWN COLUMNS, LEFT-TO-RIGHT
        if (cell.y < grid.rows - 1) {
          // Easy case, move down by one
          cell = { x: cell.x, y: cell.y + 1 };
        } else {
          // End of column
          if (cell.x < grid.cols - 1) {
            // Move to next column and start at top
            cell = { x: cell.x + 1, y: 0 };
          } else {
            // Move to start of grid
            cell = { x: 0, y: 0 };
          }
        }
      }
      return [[reversed ? `n` : `s`, cell]];
    },
  };
  return visitor(logic, grid, start, opts);
};

/**
 * Enumerate rows of grid, returning all the cells in the row
 * as an array
 *
 * ```js
 * for (const row of Grid.rows(shape)) {
 *  // row is an array of Cells.
 *  // [ {x:0, y:0}, {x:1, y:0} ... ]
 * }
 * ```
 * @param grid
 * @param start
 */
export const rows = function* (grid: Grid, start: Cell = { x: 0, y: 0 }) {
  //eslint-disable-next-line functional/no-let
  let row = start.y;
  //eslint-disable-next-line functional/no-let
  let rowCells: Cell[] = [];

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
 * @param grid
 * @param start
 */
export const cells = function* (grid: Grid, start: Cell = { x: 0, y: 0 }) {
  guardGrid(grid, `grid`);
  guardCell(start, `start`, grid);

  // eslint-disable-next-line functional/no-let
  let { x, y } = start;
  // eslint-disable-next-line functional/no-let
  let canMove = true;
  do {
    yield { x, y };
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

export const access1dArray = <V>(
  array: readonly V[],
  cols: number
): CellAccessor<V> => {
  const grid = { cols, rows: Math.ceil(array.length / cols) };
  const fn: CellAccessor<V> = (
    cell: Cell,
    wrap: BoundsLogic
  ): V | undefined => {
    const index = indexFromCell(grid, cell, wrap);
    if (index === undefined) return undefined;
    return array[index];
  };
  return fn;
};

/**
 * Returns a function that updates a 2D array representation
 * of a grid. Array is mutated.
 *
 * ```js
 * const m = Grids.array2dUpdater(grid, array);
 * m(someValue, { x:2, y:3 });
 * ```
 * @param grid
 * @param array
 * @returns
 */
//eslint-disable-next-line functional/prefer-readonly-type
export const array2dUpdater = <V>(grid: Grid & GridVisual, array: V[][]) => {
  const fn = (v: V, position: Points.Point) => {
    const pos = cellAtPoint(grid, position);
    if (pos === undefined) {
      throw new Error(
        `Position does not exist. Pos: ${JSON.stringify(
          position
        )} Grid: ${JSON.stringify(grid)}`
      );
    }
    //eslint-disable-next-line functional/immutable-data
    array[pos.y][pos.x] = v;
  };
  return fn;
};

/**
 * Visits a grid packed into an array.
 *
 * @example By default visits left-to-right, top-to-bottom:
 * ```js
 * const data = [1, 2, 3, 4, 5, 6];
 * const cols = 2;
 * for (const [value,index] of visitArray(data, cols)) {
 *  // Yields: 1, 2, 3, 4, 5, 6
 * }
 * ```
 *
 * @example
 * ```js
 * ```
 * @param array
 * @param cols
 * @param iteratorFn
 */
export function* visitArray<V>(
  array: readonly V[],
  cols: number,
  iteratorFn?: Visitor,
  opts?: VisitorOpts
): IterableIterator<readonly [data: V, index: number]> {
  if (typeof array === `undefined`) {
    throw Error(`First parameter is undefined, expected an array`);
  }
  if (array === null) throw Error(`First parameter is null, expected an array`);
  if (!Array.isArray(array)) throw Error(`First parameter should be an array`);

  guardInteger(cols, `aboveZero`, `cols`);
  if (array.length === 0) return;

  const wrap = opts?.boundsWrap ?? `stop`;
  const rows = Math.ceil(array.length / cols);
  const grid: Grid = {
    cols,
    rows,
  };

  if (iteratorFn === undefined) iteratorFn = cells;
  const iter = iteratorFn(grid, { x: 0, y: 0 }, opts);
  for (const cell of iter) {
    const index = indexFromCell(grid, cell, wrap);
    if (index === undefined) return undefined;
    yield [array[index], index];
  }
}

/**
 * Returns the index for a given cell.
 * This is useful if a grid is stored in an array.
 *
 * ```js
 * const data = [
 *  1, 2,
 *  3, 4,
 *  5, 6 ];
 * const cols = 2; // Grid of 2 columns wide
 * const index = indexFromCell(cols, {x: 1, y: 1});
 * // Yields an index of 3
 * console.log(data[index]); // Yields 4
 * ```
 *
 * Bounds logic is applied to cell.x/y separately. Wrapping
 * only ever happens in same col/row.
 * @see cellFromIndex
 * @param colsOrGrid
 * @param cell
 * @returns
 */
export const indexFromCell = (
  grid: Grid,
  cell: Cell,
  wrap: BoundsLogic
): number | undefined => {
  guardGrid(grid, `grid`);

  //eslint-disable-next-line functional/no-let

  if (cell.x < 0) {
    switch (wrap) {
      case `stop`:
        cell = { ...cell, x: 0 };
        break;
      case `unbounded`:
        throw new Error(`unbounded not supported`);
      case `undefined`:
        return undefined;
      case `wrap`:
        //cell = { ...cell, x: grid.cols + cell.x };
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cell = offset(grid, { x: 0, y: cell.y }, { x: cell.x, y: 0 }, `wrap`)!;
        break;
    }
  }
  if (cell.y < 0) {
    switch (wrap) {
      case `stop`:
        cell = { ...cell, y: 0 };
        break;
      case `unbounded`:
        throw new Error(`unbounded not supported`);
      case `undefined`:
        return undefined;
      case `wrap`:
        cell = { ...cell, y: grid.rows + cell.y };
        break;
    }
  }
  if (cell.x >= grid.cols) {
    switch (wrap) {
      case `stop`:
        cell = { ...cell, x: grid.cols - 1 };
        break;
      case `unbounded`:
        throw new Error(`unbounded not supported`);
      case `undefined`:
        return undefined;
      case `wrap`:
        cell = { ...cell, x: cell.x % grid.cols };
        break;
    }
  }
  if (cell.y >= grid.rows) {
    switch (wrap) {
      case `stop`:
        cell = { ...cell, y: grid.rows - 1 };
        break;
      case `unbounded`:
        throw new Error(`unbounded not supported`);
      case `undefined`:
        return undefined;
      case `wrap`:
        cell = { ...cell, y: cell.y % grid.rows };
        break;
    }
  }

  const index = cell.y * grid.cols + cell.x;

  return index;
};

/**
 * Returns x,y from an array index.
 *
 * ```js
 *  const data = [
 *   1, 2,
 *   3, 4,
 *   5, 6 ];
 *
 * // Cols of 2, index 2 (ie. data[2] == 3)
 * const cell = cellFromIndex(2, 2);
 * // Yields: {x: 0, y: 1}
 * ```
 * @see indexFromCell
 * @param colsOrGrid
 * @param index
 * @returns
 */
export const cellFromIndex = (
  colsOrGrid: number | Grid,
  index: number
): Cell => {
  //eslint-disable-next-line functional/no-let
  let cols = 0;
  if (typeof colsOrGrid === `number`) {
    cols = colsOrGrid;
  } else {
    cols = colsOrGrid.cols;
  }
  guardInteger(cols, `aboveZero`, `colsOrGrid`);

  return {
    x: index % cols,
    y: Math.floor(index / cols),
  };
};
