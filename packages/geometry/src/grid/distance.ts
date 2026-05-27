import type { Grid, GridCell } from "./types.js";
import { compareRowwise } from "../point/compare.js";
import { isJaggedGrid } from "./guards.js";

export function distance(a: GridCell, b: GridCell, grid: Grid, logic = `rowwise`): number {
  switch (logic) {
    case `rowwise`: return distanceRowwise(a, b, grid);
    default: throw new Error(`Unknown logic '${logic}'. Expected 'rowwise'`);
  }
}

function distanceRowwise(a: GridCell, b: GridCell, grid: Grid): number {
  if (isJaggedGrid(grid)) {
    throw new Error(`Jagged grids are not supported yet`);
  } else {
    const rows = b.y - a.y;
    const cols = b.x - a.x;
    const d = Math.abs(rows) * grid.cols + Math.abs(cols);
    if (compareRowwise(a, b) > 0) {
      // A is after B
      return Math.abs(d - grid.rows * grid.cols);
    }
    return d;
  }
}