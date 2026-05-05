import { describe, expect, it } from 'vitest';
import * as Grids from '../../src/grid/index.js';

describe(`inside`, () => {
  const grid = { rows: 5, cols: 5 };

  it(`returns true for cell inside grid`, () => {
    expect(Grids.inside(grid, { x: 0, y: 0 })).toBe(true);
    expect(Grids.inside(grid, { x: 4, y: 4 })).toBe(true);
    expect(Grids.inside(grid, { x: 2, y: 2 })).toBe(true);
  });

  it(`returns false for cell outside grid`, () => {
    expect(Grids.inside(grid, { x: 5, y: 0 })).toBe(false);
    expect(Grids.inside(grid, { x: 0, y: 5 })).toBe(false);
    expect(Grids.inside(grid, { x: -1, y: 0 })).toBe(false);
  });
});

describe(`isEqual`, () => {
  it(`returns true for same grids`, () => {
    const a = { rows: 5, cols: 10 };
    const b = { rows: 5, cols: 10 };
    expect(Grids.isEqual(a, b)).toBe(true);
  });

  it(`returns false for different grids`, () => {
    const a = { rows: 5, cols: 10 };
    const b = { rows: 5, cols: 5 };
    expect(Grids.isEqual(a, b)).toBe(false);
  });
});

it(`values`, () => {
  const readable: Grids.GridReadable<string> = {
    get: (cell, _) => {
      return `${cell.x}-${cell.y}`;
    },
    cols: 3,
    rows: 3,
  };

  const r1 = [...Grids.values(readable, Grids.As.rows(readable))];
  expect(r1).toEqual([
    [`0-0`, `1-0`, `2-0`],
    [`0-1`, `1-1`, `2-1`],
    [`0-2`, `1-2`, `2-2`],
  ]);
});

it(`get-vector-from-cardinal`, () => {
  expect(Grids.getVectorFromCardinal(`e`)).toEqual({ x: 1, y: 0 });
  expect(Grids.getVectorFromCardinal(``)).toEqual({ x: 0, y: 0 });
  expect(Grids.getVectorFromCardinal(`ne`)).toEqual({ x: 1, y: -1 });
});

// test(`offsetCardinal`, () => {
//   const grid: Grids.Grid = {cols: 10, rows: 10};

//   // Middle of last row.
//   expect(Grids.offsetCardinals(grid, {x: 5, y: 9}, 5, `wrap`)).toEqual({
//     e: {x: 0, y: 9},
//     w: {x: 0, y: 9},
//     ne: {x: 0, y: 4},
//     nw: {x:0, y:4},
//     n: {x: 5, y: 4},
//     s: {x: 5, y: 4},
//     se: {x:0, y:4},
//     sw:{x: 0, y: 9}
//   });
// });
