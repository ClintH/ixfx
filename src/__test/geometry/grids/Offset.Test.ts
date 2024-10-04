import test from 'ava';
import * as Grids from '../../../geometry/grid/index.js';
test(`offset`, (t) => {
  const grid: Grids.Grid = { cols: 5, rows: 5 };
  const start = { x: 2, y: 2 };

  t.deepEqual(Grids.offset(grid, start, { x: 1, y: 1 }), { x: 3, y: 3 });
  t.deepEqual(Grids.offset(grid, start, { x: -1, y: -1 }), { x: 1, y: 1 });
  t.deepEqual(Grids.offset(grid, start, { x: 0, y: 0 }), { x: 2, y: 2 });

  // Wrap from top left corner to bottom-right
  t.deepEqual(Grids.offset(grid, { x: 0, y: 0 }, { x: -1, y: -1 }, `wrap`), { x: 4, y: 4 });
  t.deepEqual(Grids.offset(grid, { x: 0, y: 0 }, { x: -5, y: -5 }, `wrap`), { x: 0, y: 0 });

  // Wrap from bottom right to top-left
  t.deepEqual(Grids.offset(grid, { x: 4, y: 4 }, { x: 1, y: 1 }, `wrap`), { x: 0, y: 0 });
  t.deepEqual(Grids.offset(grid, { x: 4, y: 4 }, { x: 10, y: 10 }, `wrap`), { x: 4, y: 4 });

  // Wrap along horizontal & vertical axis
  t.deepEqual(Grids.offset(grid, start, { x: -5, y: 0 }, `wrap`), { x: 2, y: 2 });
  t.deepEqual(Grids.offset(grid, start, { x: 0, y: -10 }, `wrap`), { x: 2, y: 2 });

  // Stop at edge
  t.deepEqual(Grids.offset(grid, start, { x: -5, y: 0 }, `stop`), { x: 0, y: 2 });
  t.deepEqual(Grids.offset(grid, start, { x: 0, y: 5 }, `stop`), { x: 2, y: 4 });
  t.deepEqual(Grids.offset(grid, start, { x: -5, y: -5 }, `stop`), { x: 0, y: 0 });


  // Undefined
  t.falsy(Grids.offset(grid, start, { x: -5, y: 0 }, `undefined`));
  t.falsy(Grids.offset(grid, start, { x: 0, y: 5 }, `undefined`));
  t.falsy(Grids.offset(grid, start, { x: -5, y: -5 }, `undefined`));
});