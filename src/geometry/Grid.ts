import * as Rect from "./Rect.js";
import * as Point from './Point.js';
import {integer as guardInteger} from '../Guards.js';
import {clampZeroBounds} from "../util.js";
import {randomElement } from  '../collections/Lists.js';
import {mutableStringSet, MutableStringSet} from "../collections/Set.js";
import {zipKeyValue} from "../collections/util.js";

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
  readonly n: Cell|undefined,
  readonly e: Cell|undefined,
  readonly s: Cell|undefined,
  readonly w: Cell|undefined,
  readonly ne: Cell|undefined,
  readonly nw: Cell|undefined,
  readonly se: Cell|undefined,
  readonly sw: Cell|undefined
}>


export type CardinalDirection = `` | `n` | `ne` | `e` | `se` | `s` | `sw` | `w` | `nw`;

export type BoundsLogic = `unbounded` | `undefined`| `stop` | `wrap`;

type VisitorLogic = {
  readonly options?:IdentifyNeighbours;
  readonly select:NeighbourSelector
}
export type VisitGenerator = Generator<Readonly<Cell>, void, unknown>
export type VisitorOpts = {
  readonly visited?:MutableStringSet<Cell>
  readonly reversed?:boolean
  readonly debug?:boolean
}
export type Visitor = (grid:Grid, start:Cell, opts?:VisitorOpts) => VisitGenerator;

export type NeighbourMaybe = readonly [keyof Neighbours, Cell|undefined];
export type Neighbour = readonly [keyof Neighbours, Cell];
type NeighbourSelector =  (neighbours: ReadonlyArray<Neighbour>) => Neighbour|undefined;
type IdentifyNeighbours = (grid:Grid, origin:Cell) => ReadonlyArray<Neighbour>;

/**
 * Returns true if `c` parameter is a cell with x,y fields.
 * Does not check validity of fields.
 *
 * @param {(Cell|undefined)} c
 * @return {*}  {c is Cell}
 */
const isCell = (c:Cell|undefined): c is Cell => {
  if (c === undefined) return false;
  return (`x` in c && `y` in c);
};

/**
 * Returns true if `n` is a Neighbour type, eliminating NeighbourMaybe possibility
 *
 * @param {(Neighbour|NeighbourMaybe|undefined)} n
 * @return {*}  {n is Neighbour}
 */
const isNeighbour = (n:Neighbour|NeighbourMaybe|undefined): n is Neighbour => {
  if (n === undefined) return false;
  if (n[1] === undefined) return false;
  return true;
};

/**
 * Returns true if grids `a` and `b` are equal in value
 *
 * @param {(Grid|GridVisual)} a
 * @param {(Grid|GridVisual)} b
 * @return {*}  {boolean}
 */
export const isEqual = (a:Grid|GridVisual, b:Grid|GridVisual):boolean => {
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
 * @param {Cell} v
 * @returns {string}
 */
export const cellKeyString = (v: Cell): string => `Cell{${v.x},${v.y}}`;

/**
 * Returns true if two cells equal. Returns false if either cell (or both) are undefined
 *
 * @param {Cell} a
 * @param {Cell} b
 * @returns {boolean}
 */
export const cellEquals = (a: Cell, b: Cell): boolean => {
  if (b === undefined) return false;
  if (a === undefined) return false;
  return a.x === b.x && a.y === b.y;
};

export const guard =  (a: Cell, paramName: string = `Param`, grid?:Grid) => {
  if (a === undefined) throw new Error(paramName + ` is undefined. Expecting {x,y}`);
  if (a.x === undefined) throw new Error(paramName + `.x is undefined`);
  if (a.y === undefined) throw new Error(paramName + `.y is undefined`);
  if (!Number.isInteger(a.x)) throw new Error(paramName + `.x is non-integer`);
  if (!Number.isInteger(a.y)) throw new Error(paramName + `.y is non-integer`);
  if (grid !== undefined) {
    if (!inside(grid, a)) throw new Error(`${paramName} is outside of grid. Cell: ${a.x},${a.y} Grid: ${grid.cols}, ${grid.rows}`);
  }
};

const guardGrid = (g:Grid, paramName:string = `Param`) => {
  if (g === undefined) throw new Error(`${paramName} is undefined. Expecting grid.`);
  if (!(`rows` in g)) throw new Error(`${paramName}.rows is undefined`);
  if (!(`cols` in g)) throw new Error(`${paramName}.cols is undefined`);

  if (!Number.isInteger(g.rows)) throw new Error(`${paramName}.rows is not an integer`);
  if (!Number.isInteger(g.cols)) throw new Error(`${paramName}.cols is not an integer`);
};

/**
 * Returns true if cell coordinates are above zero and within bounds of grid
 *
 * @param {Grid} grid
 * @param {Cell} cell
 * @return {*}  {boolean}
 */
export const inside = (grid:Grid, cell:Cell):boolean => {
  if (cell.x < 0 || cell.y < 0) return false;
  if (cell.x >= grid.cols || cell.y >= grid.rows) return false;
  return true; 
};
/**
 * Returns a rect of the cell, positioned from the top-left corner
 *
 * @param {Cell} cell
 * @param {(Grid & GridVisual)} grid
 * @return {*}  {Rect.RectPositioned}
 */
export const rectangleForCell = (cell: Cell, grid: Grid & GridVisual): Rect.RectPositioned => {
  guard(cell);
  const size = grid.size;
  const x = cell.x * size; // + (grid.spacing ? cell.x * grid.spacing : 0);
  const y = cell.y * size;// + (grid.spacing ? cell.y * grid.spacing : 0);
  const r = Rect.fromTopLeft({x: x, y: y}, size, size);
  return r;
};

/**
 * Returns the cell at a specified visual coordinate
 *
 * @param {Point.Point} position Position, eg in pixels
 * @param {(Grid & GridVisual)} grid Grid
 * @return {*}  {(Cell | undefined)} Cell at position or undefined if outside of the grid
 */
export const cellAtPoint = (position: Point.Point, grid: Grid & GridVisual): Cell | undefined => {
  const size = grid.size;
  if (position.x < 0 || position.y < 0) return;
  const x = Math.floor(position.x / size);
  const y = Math.floor(position.y / size);
  if (x >= grid.cols) return;
  if (y >= grid.rows) return;
  return {x, y};
};

export const allDirections = Object.freeze([`n`, `ne`, `nw`, `e`, `s`, `se`, `sw`, `w`]) as ReadonlyArray<CardinalDirection>;
export const crossDirections = Object.freeze([`n`, `e`, `s`,  `w`]) as ReadonlyArray<CardinalDirection>;

export const neighbours = (grid: Grid, cell: Cell, bounds: BoundsLogic = `undefined`, directions?:ReadonlyArray<CardinalDirection>): Neighbours => {
  const dirs = directions ?? allDirections;
  /*
   * return directions
   *   .map(c => offset(grid, getVectorFromCardinal(c), cell, bounds))
   *   .filter(GuardIsDefined);
   */
  const points = dirs.map(c => offset(grid, cell, getVectorFromCardinal(c), bounds));
  return zipKeyValue<Cell>(dirs, points) as Neighbours;
};

/**
 * Returns the pixel midpoint of a cell
 *
 * @param {Cell} cell
 * @param {(Grid & GridVisual)} grid
 * @return {*}  {Point.Point}
 */
export const cellMiddle = (cell: Cell, grid: Grid & GridVisual): Point.Point => {
  guard(cell);

  const size = grid.size;
  const x = cell.x * size; // + (grid.spacing ? cell.x * grid.spacing : 0);
  const y = cell.y * size; // + (grid.spacing ? cell.y * grid.spacing : 0);
  return Object.freeze({x: x + size / 2, y: y + size / 2});
};

/**
 * Returns the cells on the line of start and end, inclusive
 *
 * @param {Cell} start Starting cel
 * @param {Cell} end End cell
 * @returns {Cell[]}
 */
export const getLine = (start: Cell, end: Cell): ReadonlyArray<Cell> => {
  // https://stackoverflow.com/a/4672319
  guard(start);
  guard(end);

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
 * @param grid Griod
 * @param steps Distance
 * @param start Start poiint
 * @param bound Logic for if bounds of grid are exceeded
 * @returns Cells corresponding to cardinals
 */
export const offsetCardinals = (grid: Grid, start: Cell, steps: number, bounds:BoundsLogic = `stop`): Neighbours => {
  guardInteger(steps, `steps`, true);
  if (steps < 1) throw new Error(`steps should be above zero`);

  const directions = allDirections;
  const vectors = directions.map(d => getVectorFromCardinal(d, steps));
  const cells = directions.map((d, i) => offset(grid, start, vectors[i], bounds));

  return zipKeyValue(directions, cells) as Neighbours;
};

/**
 * Returns an {x,y} signed vector corresponding to the provided cardinal direction.
 * ```
 * const n = getVectorFromCardinal(`n`); // {x: 0, y: -1}
 * ```
 * Optional `multiplier` can be applied to vector
 * ```
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
 * @return {*}  {ReadonlyArray<Cell>}
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
 * @param {Grid} grid Grid to traverse
 * @param {Cell} vector Offset in x/y
 * @param {Cell} start Start point
 * @param {BoundsLogic} [bounds=`undefined`]
 * @returns {(Cell | undefined)}
 */
export const offset = function (grid: Grid, start: Cell, vector: Cell, bounds: BoundsLogic = `undefined`): Cell | undefined {
  guard(start, `start`, grid);
  guard(vector);
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
    x = clampZeroBounds(x, grid.cols);
    y = clampZeroBounds(y, grid.rows);
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

const neighbourList = (grid:Grid, cell:Cell, directions:ReadonlyArray<CardinalDirection>, bounds:BoundsLogic):ReadonlyArray<Neighbour> => {
  // Get neighbours for cell
  const cellNeighbours = neighbours(grid, cell, bounds, directions);

  // Filter out undefined cells
  const entries = Object.entries(cellNeighbours);
  return (entries as Array<NeighbourMaybe>).filter(isNeighbour);
};


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
  logic:VisitorLogic, 
  grid: Grid, 
  start: Cell, 
  opts: VisitorOpts = {}
):VisitGenerator {
  
  guardGrid(grid, `grid`);
  guard(start, `start`, grid);
  

  const v = opts.visited ?? mutableStringSet<Cell>(c => cellKeyString(c));
  const possibleNeighbours = logic.options ? logic.options : (g:Grid, c:Cell) => neighbourList(g, c, crossDirections, `undefined`);

  if (!isCell(start)) throw new Error(`'start' parameter is undefined or not a cell`);

  // eslint-disable-next-line functional/no-let
  let cellQueue:Cell[] = [start]; 
  // eslint-disable-next-line functional/no-let
  let moveQueue:Neighbour[] = [];
  // eslint-disable-next-line functional/no-let
  let current:Cell|null = null;

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
      yield(current);

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

export const visitorDepth = (grid:Grid, start:Cell, opts:VisitorOpts = {}) => visitor({
  select: (nbos) => nbos[nbos.length-1]},
grid,
start,
opts);

export const visitorBreadth = (grid:Grid, start:Cell, opts:VisitorOpts = {}) => visitor({
  select: (nbos) => nbos[0]},
grid,
start,
opts);

const randomNeighbour = (nbos: readonly Neighbour[]) => randomElement(nbos); // .filter(isNeighbour));

export const visitorRandomContiguous = (grid:Grid, start:Cell, opts:VisitorOpts = {}) => visitor({
  select: randomNeighbour},
grid,
start,
opts);

export const visitorRandom = (grid:Grid, start:Cell, opts:VisitorOpts = {}) => visitor({
  options: (grid, cell) => {
    const t:Neighbour[] = [];
    // eslint-disable-next-line functional/no-loop-statement
    for (const c of cells(grid, cell)) {
      // eslint-disable-next-line functional/immutable-data
      t.push([`n`, c]);
    }
    return t;
  },
  select: randomNeighbour},
grid,
start,
opts);
  

export const visitorRow =(grid:Grid, start:Cell, opts:VisitorOpts = {}) => {
  const { reversed = false } = opts;

  const neighbourSelect = (nbos:readonly Neighbour[]) => nbos.find(n => n[0] === (reversed ? `w` : `e`));

  const possibleNeighbours = (grid:Grid, cell:Cell):ReadonlyArray<Neighbour> => {
    if (reversed) {
      // WALKING BACKWARD ALONG RONG
      if (cell.x > 0) {
        // All fine, step to the left
        cell = {x: cell.x - 1, y: cell.y};
      } else {
        // At the beginning of a row
        if (cell.y > 0) {
          // Wrap to next row up
          cell = {x: grid.cols-1, y: cell.y - 1};
        } else {
          // Wrap to end of grid
          cell = {x: grid.cols-1, y: grid.rows-1};
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
          cell = {x:0, y: cell.y + 1};
        } else {
          // No more rows available, wrap to start of the grid
          cell = {x:0, y: 0};
        }
      }
    }
    return [[(reversed ? `w` : `e`), cell]];
  };

  const logic:VisitorLogic = {
    select: neighbourSelect,
    options: possibleNeighbours
  };

  return visitor(logic, grid, start, opts);
};

export const visitFor = (grid:Grid, start:Cell, steps:number, visitor:Visitor):Cell => {
  guardInteger(steps, `steps`);

  const opts:VisitorOpts = {
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

export const visitorColumn =(grid:Grid, start:Cell, opts:VisitorOpts = {}) => {
  const { reversed = false } = opts;
  const logic:VisitorLogic = {
    select: (nbos) => nbos.find(n => n[0] === (reversed ? `n`:`s`)),
    options: (grid, cell):ReadonlyArray<Neighbour> => {
      if (reversed) {
        // WALK UP COLUMN, RIGHT-TO-LEFT
        if (cell.y > 0) {
          // Easy case
          cell = {x: cell.x, y: cell.y - 1};
        } else {
          // Top of column
          if (cell.x === 0) {
            // Top-left corner, need to wrap
            cell = {x:grid.cols-1, y:grid.rows-1};
          } else {
            cell = {x:cell.x-1, y:grid.rows-1};
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
            cell = {x:cell.x+1, y:0};
          } else {
            // Move to start of grid
            cell = {x:0, y:0};
          }
        }
      }
      return [[reversed ? `n`:`s`, cell]];
    }
  };
  return visitor(logic, grid, start, opts);
};

/**
 * Enumerate all cells in an efficient manner. If end of grid is reached, iterator will wrap to ensure all are visited.
 *
 * @param {Grid} grid
 * @param {Cell} [start={x:0, y:0}]
 */
export const cells = function* (grid:Grid, start:Cell = {x:0, y:0}) {
  guardGrid(grid, `grid`);
  guard(start, `start`, grid);

  // eslint-disable-next-line functional/no-let
  let {x, y} = start;
  // eslint-disable-next-line functional/no-let
  let canMove = true;
  // eslint-disable-next-line functional/no-loop-statement
  do {
    yield {x, y};
    x++;
    if (x  === grid.cols) {
      y++;
      x = 0;
    }
    if (y  === grid.rows) {
      y = 0;
      x = 0;
    }
    if (x === start.x && y === start.y) canMove = false; // Complete
  } while (canMove);
};