import { expect, it } from 'vitest';
import * as Grids from '../../src/grid/index.js';
import { Array1d } from '../../src/grid/index.js';

it(`creates a grid from 1D array`, () => {
  const array = [1, 2, 3, 4, 5, 6];
  const grid = Grids.Array1d.wrap(array, { rows: 2, cols: 3 });
  expect(grid.rows).toBe(2);
  expect(grid.cols).toBe(3);
  expect(grid.get({ x: 0, y: 0 })).toBe(1);
  expect(grid.get({ x: 1, y: 0 })).toBe(2);
  expect(grid.get({ x: 0, y: 1 })).toBe(4);
});

it(`wrap`, () => {
  const data = [
    1,
    2,
    3,
    4,
    5,
    6,
  ];
  const w = Array1d.wrap(data, { rows: 2, cols: 3 });
  expect(w.cols).toBe(3);
  expect(w.rows).toBe(2);
  expect(w.get({ x: 0, y: 0 })).toBe(1);
  expect(w.get({ x: 0, y: 1 })).toBe(4);

  w.set(10, { x: 0, y: 0 });
  w.set(20, { x: 2, y: 1 });
  expect(w.array).toEqual([10, 2, 3, 4, 5, 20]);
  expect(data === w.array).toBe(false);
});

it(`wrap-mutable`, () => {
  const data = [
    1,
    2,
    3,
    4,
    5,
    6,
  ];
  const w = Array1d.wrapMutable(data, { rows: 2, cols: 3 });
  expect(w.cols).toBe(3);
  expect(w.rows).toBe(2);
  expect(w.get({ x: 0, y: 0 })).toBe(1);
  expect(w.get({ x: 0, y: 1 })).toBe(4);

  w.set(10, { x: 0, y: 0 });
  w.set(20, { x: 2, y: 1 });
  expect(w.array).toEqual([10, 2, 3, 4, 5, 20]);
  expect(data === w.array).toBe(true);
});

it(`visit`, () => {
  const data = [1, 2, 3, 4, 5, 6];

  const g = Array1d.wrap(data, { rows: 3, cols: 2 });
  const it = Grids.values(g, Grids.As.rows(g));

  // Test default visitor: left-to-right, top-to-bottom
  const r1 = [...it];
  // t.deepEqual(r1, [ [ 1, 0 ], [ 2, 1 ], [ 3, 2 ], [ 4, 3 ], [ 5, 4 ], [ 6, 5 ] ]);
  expect(r1).toEqual([[1, 2], [3, 4], [5, 6]]);
});

it(`access`, () => {
  const arr = [
    1,
    2,
    3,
    4,
    5,
    6,
  ];
  const a = Array1d.access(arr, { rows: 2, cols: 3 });
  expect(a({ x: 0, y: 0 }, `undefined`)).toBe(1);
  expect(a({ x: 2, y: 1 }, `undefined`)).toBe(6);

  expect(a({ x: 3, y: 2 }, `undefined`)).toBeFalsy();
  expect(a({ x: 0, y: -1 }, `undefined`)).toBeFalsy();
});

it(`mutate`, () => {
  const arr = [
    1,
    2,
    3,
    4,
    5,
    6,
  ];
  const a = Array1d.setMutate(arr, { rows: 2, cols: 3 });
  a(10, { x: 0, y: 0 }, `undefined`);
  expect(arr).toEqual([
    10,
    2,
    3,
    4,
    5,
    6,
  ]);

  a(20, { x: 2, y: 1 }, `undefined`);
  expect(arr).toEqual([
    10,
    2,
    3,
    4,
    5,
    20,
  ]);
  expect(() => a(10, { x: 3, y: 2 }, `undefined`)).toThrow();
  expect(() => a(10, { x: 3, y: -2 }, `undefined`)).toThrow();
});