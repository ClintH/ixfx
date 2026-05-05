import type { Grid, JaggedGrid } from '../../src/grid/index.js';
import { expect, it } from 'vitest';
import { cells } from '../../src/grid/enumerators/index.js';
import { As } from '../../src/grid/index.js';

it(`rows`, () => {
  const g = { rows: 3, cols: 3 };
  const expected = [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
  ];
  const r = [...As.rows(g, { x: 0, y: 0 })];
  expect(r).toEqual(expected);
});

it(`cells`, () => {
  // Uniform
  const g: Grid = { rows: 3, cols: 3 };
  const r1r = [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
  ];
  expect([...cells(g, { x: 0, y: 0 })]).toEqual(r1r.flat());

  // Jagged
  // 0, 1
  // 2, 3, 4
  // 5
  const jg: JaggedGrid = { rows: [2, 3, 1] };
  const r2r = [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 0, y: 2 }],
  ];
  expect([...cells(jg, { x: 0, y: 0 })]).toEqual(r2r.flat());
});

it(`columns`, () => {
  // Uniform
  const g: Grid = { rows: 3, cols: 3 };
  const r1r = [
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
    [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
  ];
  expect([...As.columns(g, { x: 0, y: 0 })]).toEqual(r1r);

  // Jagged
  // 0, 1
  // 2, 3, 4
  // 5
  const jg: JaggedGrid = { rows: [2, 3, 1] };
  const r2r = [
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: Number.NaN, y: Number.NaN }],
    [{ x: Number.NaN, y: Number.NaN }, { x: 2, y: 1 }, { x: Number.NaN, y: Number.NaN }],
  ];
  expect([...As.columns(jg, { x: 0, y: 0 })]).toEqual(r2r);
});