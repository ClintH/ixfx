import { expect, it } from 'vitest';
import { cellFromIndexJagged, cellFromIndexUniform, indexFromCell, indexFromCellJagged } from '../../src/grid/index.js';

it (`index-from-cell-jagged`, () => {
  // 0, 1
  // 2, 3, 4
  // 5, 6
  const jg = { rows: [2, 3, 2] };
  expect(indexFromCellJagged(jg, { x: 0, y: 0 }, `undefined`)).toBe(0);
  expect(indexFromCellJagged(jg, { x: 1, y: 0 }, `undefined`)).toBe(1);
  expect(indexFromCellJagged(jg, { x: 0, y: 1 }, `undefined`)).toBe(2);
  expect(indexFromCellJagged(jg, { x: 1, y: 1 }, `undefined`)).toBe(3);
  expect(indexFromCellJagged(jg, { x: 2, y: 1 }, `undefined`)).toBe(4);
  expect(indexFromCellJagged(jg, { x: 0, y: 2 }, `undefined`)).toBe(5);
  expect(indexFromCellJagged(jg, { x: 1, y: 2 }, `undefined`)).toBe(6);
  expect(indexFromCellJagged(jg, { x: 0, y: 3 }, `undefined`)).toBeUndefined();
});

it (`cell-from-index-jagged`, () => {
  const jg = { rows: [2, 3, 2] };
  expect(cellFromIndexJagged(jg, 0)).toEqual({ x: 0, y: 0 });
  expect(cellFromIndexJagged(jg, 1)).toEqual({ x: 1, y: 0 });
  expect(cellFromIndexJagged(jg, 2)).toEqual({ x: 0, y: 1 });
  expect(cellFromIndexJagged(jg, 3)).toEqual({ x: 1, y: 1 });
  expect(cellFromIndexJagged(jg, 4)).toEqual({ x: 2, y: 1 });
  expect(cellFromIndexJagged(jg, 5)).toEqual({ x: 0, y: 2 });
  expect(cellFromIndexJagged(jg, 6)).toEqual({ x: 1, y: 2 });
  expect(cellFromIndexJagged(jg, 7)).toBeUndefined();
});

it(`cell-from-index`, () => {
  expect(cellFromIndexUniform(2, 3)).toEqual({ x: 1, y: 1 });
  expect(cellFromIndexUniform(2, 0)).toEqual({ x: 0, y: 0 });
  expect(cellFromIndexUniform(2, 2)).toEqual({ x: 0, y: 1 });
});
it(`index-from-cell`, () => {
  const wrap = `undefined`;
  const grid = { cols: 2, rows: 2 };
  expect(indexFromCell(grid, { x: 1, y: 1 }, wrap)).toBe(3);
  expect(indexFromCell(grid, { x: 0, y: 0 }, wrap)).toBe(0);
  expect(indexFromCell(grid, { x: 0, y: 1 }, wrap)).toBe(2);

  // Wrapping: undefined
  expect(indexFromCell(grid, { x: -1, y: 1 }, `undefined`)).toBeFalsy();
  expect(indexFromCell(grid, { x: 1, y: -1 }, `undefined`)).toBeFalsy();
  expect(indexFromCell(grid, { x: 2, y: 1 }, `undefined`)).toBeFalsy();
  expect(indexFromCell(grid, { x: 1, y: 2 }, `undefined`)).toBeFalsy();

  // Wrapping: stop
  expect(indexFromCell(grid, { x: -1, y: 1 }, `stop`)).toBe(2);
  expect(indexFromCell(grid, { x: 1, y: -1 }, `stop`)).toBe(1);
  expect(indexFromCell(grid, { x: 2, y: 1 }, `stop`)).toBe(3);
  expect(indexFromCell(grid, { x: 1, y: 2 }, `stop`)).toBe(3);

  // Wrapping: unbounded
  expect(() => indexFromCell(grid, { x: -1, y: 1 }, `unbounded`)).toThrow();
  expect(() => indexFromCell(grid, { x: 1, y: -1 }, `unbounded`)).toThrow();
  expect(() => indexFromCell(grid, { x: 2, y: 1 }, `unbounded`)).toThrow();
  expect(() => indexFromCell(grid, { x: 1, y: 2 }, `unbounded`)).toThrow();

  // Wrapping: wrap
  const grid2 = { cols: 3, rows: 3 };
  expect(indexFromCell(grid2, { x: -1, y: 1 }, `wrap`)).toBe(5);
  expect(indexFromCell(grid2, { x: 1, y: -1 }, `wrap`)).toBe(7);
  expect(indexFromCell(grid2, { x: 3, y: 1 }, `wrap`)).toBe(3);
  expect(indexFromCell(grid2, { x: 1, y: 3 }, `wrap`)).toBe(1);
});