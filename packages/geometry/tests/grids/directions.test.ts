import { describe, expect, it } from 'vitest';
import * as Grid from '../../src/grid/index.js';

describe(`directions`, () => {
  it(`allDirections`, () => {
    // returns all 8 cardinal directions`
    const directions = Grid.allDirections;
    expect(directions).toEqual([`n`, `ne`, `nw`, `e`, `s`, `se`, `sw`, `w`]);

    // `is frozen`
    expect(Object.isFrozen(Grid.allDirections)).toBe(true);
  });

  it(`crossDirections`, () => {
    const directions = Grid.crossDirections;
    expect(directions).toEqual([`n`, `e`, `s`, `w`]);
  });

  describe(`getVectorFromCardinal`, () => {
    it(`returns {x: 0, y: -1} for n`, () => {
      expect(Grid.getVectorFromCardinal(`n`)).toEqual({ x: 0, y: -1 });
    });

    it(`returns {x: 0, y: 1} for s`, () => {
      expect(Grid.getVectorFromCardinal(`s`)).toEqual({ x: 0, y: 1 });
    });

    it(`returns {x: 1, y: 0} for e`, () => {
      expect(Grid.getVectorFromCardinal(`e`)).toEqual({ x: 1, y: 0 });
    });

    it(`returns {x: -1, y: 0} for w`, () => {
      expect(Grid.getVectorFromCardinal(`w`)).toEqual({ x: -1, y: 0 });
    });

    it(`returns diagonal vectors`, () => {
      expect(Grid.getVectorFromCardinal(`ne`)).toEqual({ x: 1, y: -1 });
      expect(Grid.getVectorFromCardinal(`nw`)).toEqual({ x: -1, y: -1 });
      expect(Grid.getVectorFromCardinal(`se`)).toEqual({ x: 1, y: 1 });
      expect(Grid.getVectorFromCardinal(`sw`)).toEqual({ x: -1, y: 1 });
    });

    it(`returns {x: 0, y: 0} for empty string`, () => {
      expect(Grid.getVectorFromCardinal(``)).toEqual({ x: 0, y: 0 });
    });

    it(`applies multiplier`, () => {
      expect(Grid.getVectorFromCardinal(`n`, 5)).toEqual({ x: 0, y: -5 });
      expect(Grid.getVectorFromCardinal(`e`, 10)).toEqual({ x: 10, y: 0 });
    });
  });

  describe(`offsetCardinals`, () => {
    const grid = { rows: 10, cols: 10 };

    it(`returns neighbours at specified distance`, () => {
      const neighbours = Grid.offsetCardinals(grid, { x: 5, y: 5 }, 1);
      expect(neighbours.n).toEqual({ x: 5, y: 4 });
      expect(neighbours.s).toEqual({ x: 5, y: 6 });
      expect(neighbours.e).toEqual({ x: 6, y: 5 });
      expect(neighbours.w).toEqual({ x: 4, y: 5 });
    });

    it(`respects bounds stop logic`, () => {
      const neighbours = Grid.offsetCardinals(grid, { x: 0, y: 0 }, 1, `stop`);
      expect(neighbours.n).toEqual({ x: 0, y: 0 });
      expect(neighbours.w).toEqual({ x: 0, y: 0 });
      expect(neighbours.e).toEqual({ x: 1, y: 0 });
      expect(neighbours.s).toEqual({ x: 0, y: 1 });
    });
  });
});

it(`offset-1`, () => {
  const grid = { rows: 3, cols: 3 };
  const start = { x: 0, y: 0 };
  const r1 = Grid.offsetCardinals(grid, start, 1, `undefined`);
  expect(r1).toEqual({
    n: undefined,
    ne: undefined,
    nw: undefined,
    e: { x: 1, y: 0 },
    s: { x: 0, y: 1 },
    se: { x: 1, y: 1 },
    sw: undefined,
    w: undefined,
  });

  const r2 = Grid.offsetCardinals(grid, start, 1, `wrap`);
  expect(r2).toEqual({
    n: { x: 0, y: 2 },
    ne: { x: 1, y: 2 },
    nw: { x: 2, y: 2 },
    e: { x: 1, y: 0 },
    s: { x: 0, y: 1 },
    se: { x: 1, y: 1 },
    sw: { x: 2, y: 1 },
    w: { x: 2, y: 0 },
  });

  const r3 = Grid.offsetCardinals(grid, start, 1, `unbounded`);
  expect(r3).toEqual({
    n: { x: 0, y: -1 },
    ne: { x: 1, y: -1 },
    nw: { x: -1, y: -1 },
    e: { x: 1, y: 0 },
    s: { x: 0, y: 1 },
    se: { x: 1, y: 1 },
    sw: { x: -1, y: 1 },
    w: { x: -1, y: 0 },
  });

  const r4 = Grid.offsetCardinals(grid, start, 1, `stop`);
  expect(r4).toEqual({
    n: { x: 0, y: 0 },
    ne: { x: 1, y: 0 },
    nw: { x: 0, y: 0 },
    e: { x: 1, y: 0 },
    s: { x: 0, y: 1 },
    se: { x: 1, y: 1 },
    sw: { x: 0, y: 1 },
    w: { x: 0, y: 0 },
  });
});

it(`offset-2`, () => {
  const grid = { rows: 3, cols: 3 };
  const start = { x: 1, y: 1 };
  const r1 = Grid.offsetCardinals(grid, start, 2, `undefined`);
  expect(r1).toEqual({
    n: undefined,
    ne: undefined,
    nw: undefined,
    e: undefined,
    s: undefined,
    se: undefined,
    sw: undefined,
    w: undefined,
  });

  const r2 = Grid.offsetCardinals(grid, start, 2, `wrap`);
  expect(r2).toEqual({
    n: { x: 1, y: 2 },
    ne: { x: 0, y: 2 },
    nw: { x: 2, y: 2 },
    e: { x: 0, y: 1 },
    s: { x: 1, y: 0 },
    se: { x: 0, y: 0 },
    sw: { x: 2, y: 0 },
    w: { x: 2, y: 1 },
  });

  const r3 = Grid.offsetCardinals(grid, start, 2, `unbounded`);
  expect(r3).toEqual({
    n: { x: 1, y: -1 },
    ne: { x: 3, y: -1 },
    nw: { x: -1, y: -1 },
    e: { x: 3, y: 1 },
    s: { x: 1, y: 3 },
    se: { x: 3, y: 3 },
    sw: { x: -1, y: 3 },
    w: { x: -1, y: 1 },
  });

  const r4 = Grid.offsetCardinals(grid, start, 2, `stop`);
  expect(r4).toEqual({
    n: { x: 1, y: 0 },
    ne: { x: 2, y: 0 },
    nw: { x: 0, y: 0 },
    e: { x: 2, y: 1 },
    s: { x: 1, y: 2 },
    se: { x: 2, y: 2 },
    sw: { x: 0, y: 2 },
    w: { x: 0, y: 1 },
  });
});