import { test, expect } from 'vitest';
import * as Grids from '../../src/grid/index.js';
test(`offset`, () => {
  const grid: Grids.Grid = { cols: 5, rows: 5 };
  const start = { x: 2, y: 2 };

  expect(Grids.offset(grid, start, { x: 1, y: 1 })).toEqual({ x: 3, y: 3 });
  expect(Grids.offset(grid, start, { x: -1, y: -1 })).toEqual({ x: 1, y: 1 });
  expect(Grids.offset(grid, start, { x: 0, y: 0 })).toEqual({ x: 2, y: 2 });

  // Wrap from top left corner to bottom-right
  expect(Grids.offset(grid, { x: 0, y: 0 }, { x: -1, y: -1 }, `wrap`)).toEqual({ x: 4, y: 4 });
  expect(Grids.offset(grid, { x: 0, y: 0 }, { x: -5, y: -5 }, `wrap`)).toEqual({ x: 0, y: 0 });

  // Wrap from bottom right to top-left
  expect(Grids.offset(grid, { x: 4, y: 4 }, { x: 1, y: 1 }, `wrap`)).toEqual({ x: 0, y: 0 });
  expect(Grids.offset(grid, { x: 4, y: 4 }, { x: 10, y: 10 }, `wrap`)).toEqual({ x: 4, y: 4 });

  // Wrap along horizontal & vertical axis
  expect(Grids.offset(grid, start, { x: -5, y: 0 }, `wrap`)).toEqual({ x: 2, y: 2 });
  expect(Grids.offset(grid, start, { x: 0, y: -10 }, `wrap`)).toEqual({ x: 2, y: 2 });

  // Stop at edge
  expect(Grids.offset(grid, start, { x: -5, y: 0 }, `stop`)).toEqual({ x: 0, y: 2 });
  expect(Grids.offset(grid, start, { x: 0, y: 5 }, `stop`)).toEqual({ x: 2, y: 4 });
  expect(Grids.offset(grid, start, { x: -5, y: -5 }, `stop`)).toEqual({ x: 0, y: 0 });


  // Undefined
  expect(Grids.offset(grid, start, { x: -5, y: 0 }, `undefined`)).toBeFalsy();
  expect(Grids.offset(grid, start, { x: 0, y: 5 }, `undefined`)).toBeFalsy();
  expect(Grids.offset(grid, start, { x: -5, y: -5 }, `undefined`)).toBeFalsy();
});