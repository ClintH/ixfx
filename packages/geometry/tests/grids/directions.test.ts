import { test, expect } from 'vitest';
import * as Grids from '../../src/grid/index.js';

test(`offset-1`, () => {
  const grid = { rows: 3, cols: 3 };
  const start = { x: 0, y: 0 }
  const r1 = Grids.offsetCardinals(grid, start, 1, `undefined`);
  expect(r1).toEqual({
    n: undefined,
    ne: undefined,
    nw: undefined,
    e: { x: 1, y: 0 },
    s: { x: 0, y: 1 },
    se: { x: 1, y: 1 },
    sw: undefined,
    w: undefined
  });

  const r2 = Grids.offsetCardinals(grid, start, 1, `wrap`);
  expect(r2).toEqual({
    n: { x: 0, y: 2 },
    ne: { x: 1, y: 2 },
    nw: { x: 2, y: 2 },
    e: { x: 1, y: 0 },
    s: { x: 0, y: 1 },
    se: { x: 1, y: 1 },
    sw: { x: 2, y: 1 },
    w: { x: 2, y: 0 }
  });

  const r3 = Grids.offsetCardinals(grid, start, 1, `unbounded`);
  expect(r3).toEqual({
    n: { x: 0, y: -1 },
    ne: { x: 1, y: -1 },
    nw: { x: -1, y: -1 },
    e: { x: 1, y: 0 },
    s: { x: 0, y: 1 },
    se: { x: 1, y: 1 },
    sw: { x: -1, y: 1 },
    w: { x: -1, y: 0 }
  });

  const r4 = Grids.offsetCardinals(grid, start, 1, `stop`);
  expect(r4).toEqual({
    n: { x: 0, y: 0 },
    ne: { x: 1, y: 0 },
    nw: { x: 0, y: 0 },
    e: { x: 1, y: 0 },
    s: { x: 0, y: 1 },
    se: { x: 1, y: 1 },
    sw: { x: 0, y: 1 },
    w: { x: 0, y: 0 }
  });
});

test(`offset-2`, () => {
  const grid = { rows: 3, cols: 3 };
  const start = { x: 1, y: 1 }
  const r1 = Grids.offsetCardinals(grid, start, 2, `undefined`);
  expect(r1).toEqual({
    n: undefined,
    ne: undefined,
    nw: undefined,
    e: undefined,
    s: undefined,
    se: undefined,
    sw: undefined,
    w: undefined
  });


  const r2 = Grids.offsetCardinals(grid, start, 2, `wrap`);
  expect(r2).toEqual({
    n: { x: 1, y: 2 },
    ne: { x: 0, y: 2 },
    nw: { x: 2, y: 2 },
    e: { x: 0, y: 1 },
    s: { x: 1, y: 0 },
    se: { x: 0, y: 0 },
    sw: { x: 2, y: 0 },
    w: { x: 2, y: 1 }
  });

  const r3 = Grids.offsetCardinals(grid, start, 2, `unbounded`);
  expect(r3).toEqual({
    n: { x: 1, y: -1 },
    ne: { x: 3, y: -1 },
    nw: { x: -1, y: -1 },
    e: { x: 3, y: 1 },
    s: { x: 1, y: 3 },
    se: { x: 3, y: 3 },
    sw: { x: -1, y: 3 },
    w: { x: -1, y: 1 }
  });

  const r4 = Grids.offsetCardinals(grid, start, 2, `stop`);
  expect(r4).toEqual({
    n: { x: 1, y: 0 },
    ne: { x: 2, y: 0 },
    nw: { x: 0, y: 0 },
    e: { x: 2, y: 1 },
    s: { x: 1, y: 2 },
    se: { x: 2, y: 2 },
    sw: { x: 0, y: 2 },
    w: { x: 0, y: 1 }
  });
});