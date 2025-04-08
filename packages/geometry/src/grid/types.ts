import type { ISetMutable } from "@ixfxfun/collections/set";

export type GridVisual = Grid & {
  readonly size: number;
};

export type Grid = {
  readonly rows: number;
  readonly cols: number;
};

export type GridCell = {
  readonly x: number;
  readonly y: number;
};

export type GridNeighbours = {
  readonly n: GridCell | undefined;
  readonly e: GridCell | undefined;
  readonly s: GridCell | undefined;
  readonly w: GridCell | undefined;
  readonly ne: GridCell | undefined;
  readonly nw: GridCell | undefined;
  readonly se: GridCell | undefined;
  readonly sw: GridCell | undefined;
};

export type GridCardinalDirection =
  | `n`
  | `ne`
  | `e`
  | `se`
  | `s`
  | `sw`
  | `w`
  | `nw`;
export type GridCardinalDirectionOptional = GridCardinalDirection | ``;

export type GridArray1d<T> = GridReadable<T> & GridWritable<T> & {
  array: Array<T>
}

/**
 * Bounds logic
 * * Unbounded: attempts to read beyond limits
 * * Undefined: returns _undefined_ when reading beyond limits
 * * Stop: returns cell value at edge of limits
 * * Wrap: Wrap-around cell positions
 * 
 */
export type GridBoundsLogic =
  /**
   * Unbounded: attempts to read beyond limits
   */
  `unbounded` |
  /**
   * Undefined: returns _undefined_ when reading beyond limits
   */
  `undefined` |
  /**
   * Stop: returns cell value at edge of limits
   */
  `stop` |
  /**
   * Wrap-around cell positions
   */
  `wrap`;

/**
 * Logic to select the next cell based on a list of neighbours
 */
export type GridNeighbourSelectionLogic = {
  /**
   * Returns neighbours for a given cell in a grid
   */
  readonly getNeighbours?: GridIdentifyNeighbours;
  /**
   * Select a neighbour from given list
   */
  readonly select: GridNeighbourSelector;
};


export type GridVisitorOpts = Readonly<{
  start: GridCell
  visited: ISetMutable<GridCell>
  reversed: boolean
  debug: boolean
  boundsWrap: GridBoundsLogic
}>;


export type GridCreateVisitor = (
  grid: Grid,
  opts?: Partial<GridVisitorOpts>
) => Generator<GridCell>;

// export type VisitGrid = (grid: Grid) => Generator<Cell, void>;

export type GridCellAndValue<T> = {
  cell: GridCell
  value: T | undefined
}

export type GridNeighbourMaybe = readonly [ keyof GridNeighbours, GridCell | undefined ];
export type GridNeighbour = readonly [ keyof GridNeighbours, GridCell ];

/**
 * A function that returns a value (or _undefined_) based on a _cell_
 *
 * Implementations:
 * * {@link Array1d.access}: For accessing a single-dimension array as a grid
 * * {@link Array2d.access}: For accessing a two-dimension array as a grid
 * 
 */
export type GridCellAccessor<TValue> = (cell: GridCell, wrap?: GridBoundsLogic) => TValue | undefined;

/**
 * A function that sets the value of a cell.
 */
export type GridCellSetter<TValue> = (value: TValue, cell: GridCell, wrap?: GridBoundsLogic) => void;

/**
 * Shape of a grid and a function to read values from it, based on
 * cell location.
 * 
 * These functions create a GridReadable:
 * * {@link Grids.Array1d.wrap}: wrap an array and read as a grid
 * * {@link Grids.Array1d.wrapMutable}: wrap and modify an array as a grid
 * * {@link Grids.Array2d.wrap}: wrap a two-dimensional grid
 * * {@link Grids.Array2d.wrapMutable}
 */
export type GridReadable<T> = Grid & {
  get: GridCellAccessor<T>
}

export type GridWritable<T> = Grid & {
  set: GridCellSetter<T>
}

/**
 * Neighbour selector logic. For a given set of `neighbours` pick one to visit next.
 */
export type GridNeighbourSelector = (
  neighbours: ReadonlyArray<GridNeighbour>
) => GridNeighbour | undefined;

/**
 * Identify neighbours logic. For a given `grid` and `origin`, return a list of neighbours
 */
export type GridIdentifyNeighbours = (
  grid: Grid,
  origin: GridCell
) => ReadonlyArray<GridNeighbour>;
