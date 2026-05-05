import { describe, expect, it } from 'vitest';
import * as Array2d from '../../src/grid/array-2d.js';

describe(`grid/array-2d`, () => {
  it(`creates a grid from 2D array`, () => {
    const array = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const grid = Array2d.wrap(array);
    expect(grid.rows).toBe(2);
    expect(grid.cols).toBe(3);
    expect(grid.get({ x: 0, y: 0 })).toBe(1);
    expect(grid.get({ x: 1, y: 0 })).toBe(2);
    expect(grid.get({ x: 0, y: 1 })).toBe(4);
  });

  it(`handles out of bounds with undefined`, () => {
    const grid = Array2d.wrap([[1, 2]]);
    expect(grid.get({ x: 10, y: 0 }, `undefined`)).toBeUndefined();
  });

  describe(`create`, () => {
    it(`creates grid from 2D array`, () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
      ];

      const grid = Array2d.createUniformGrid(data);

      expect(grid.rows).toBe(2);
      expect(grid.cols).toBe(3);
    });

    it(`creates grid from single row`, () => {
      const data = [[1, 2, 3]];

      const grid = Array2d.createUniformGrid(data);

      expect(grid.rows).toBe(1);
      expect(grid.cols).toBe(3);
    });

    it(`creates grid from single column`, () => {
      const data = [[1], [2], [3]];

      const grid = Array2d.createUniformGrid(data);

      expect(grid.rows).toBe(3);
      expect(grid.cols).toBe(1);
    });

    it(`throws for non-uniform row lengths`, () => {
      const data = [
        [1, 2, 3],
        [4, 5],
      ];

      expect(() => Array2d.createUniformGrid(data)).toThrow(`uniform column length`);
    });

    it(`handles empty array`, () => {
      const data: number[][] = [];

      const grid = Array2d.createUniformGrid(data);

      expect(grid.rows).toBe(0);
      expect(grid.cols).toBe(Number.NaN);
    });
  });

  describe(`access`, () => {
    it(`returns value at valid cell`, () => {
      const data = [
        [`a`, `b`, `c`],
        [`d`, `e`, `f`],
      ];

      const accessor = Array2d.access(data);

      expect(accessor({ x: 0, y: 0 })).toBe(`a`);
      expect(accessor({ x: 1, y: 0 })).toBe(`b`);
      expect(accessor({ x: 2, y: 0 })).toBe(`c`);
      expect(accessor({ x: 0, y: 1 })).toBe(`d`);
      expect(accessor({ x: 1, y: 1 })).toBe(`e`);
      expect(accessor({ x: 2, y: 1 })).toBe(`f`);
    });

    it(`returns undefined for out of bounds (default)`, () => {
      const data = [[1, 2], [3, 4]];

      const accessor = Array2d.access(data);

      expect(accessor({ x: -1, y: 0 })).toBeUndefined();
      expect(accessor({ x: 0, y: -1 })).toBeUndefined();
      expect(accessor({ x: 2, y: 0 })).toBeUndefined();
      expect(accessor({ x: 0, y: 2 })).toBeUndefined();
    });

    it(`supports wrap bounds logic`, () => {
      const data = [[1, 2], [3, 4]];

      const accessor = Array2d.access(data);

      expect(accessor({ x: 2, y: 0 }, `wrap`)).toBe(1);
      expect(accessor({ x: 0, y: 2 }, `wrap`)).toBe(1);
      expect(accessor({ x: -1, y: 0 }, `wrap`)).toBe(2);
    });

    it(`supports stop bounds logic`, () => {
      const data = [[1, 2], [3, 4]];

      const accessor = Array2d.access(data);

      expect(accessor({ x: 5, y: 0 }, `stop`)).toBe(2);
      expect(accessor({ x: 0, y: 5 }, `stop`)).toBe(3);
      expect(accessor({ x: -5, y: 0 }, `stop`)).toBe(1);
    });
  });

  describe(`setMutate`, () => {
    it(`sets value at valid cell`, () => {
      const data = [
        [1, 2],
        [3, 4],
      ];

      const setter = Array2d.setMutate(data);
      setter(99, { x: 0, y: 0 });

      expect(data[0][0]).toBe(99);
    });

    it(`mutates array in place`, () => {
      const data = [
        [1, 2],
        [3, 4],
      ];

      const setter = Array2d.setMutate(data);
      setter(99, { x: 1, y: 1 });

      expect(data[1][1]).toBe(99);
    });

    it(`throws for out of bounds (default)`, () => {
      const data = [[1, 2], [3, 4]];

      const setter = Array2d.setMutate(data);

      expect(() => setter(99, { x: 5, y: 0 })).toThrow(`out of range`);
    });

    it(`supports wrap bounds logic`, () => {
      const data = [[1, 2], [3, 4]];

      const setter = Array2d.setMutate(data);
      setter(99, { x: 2, y: 0 }, `wrap`);

      expect(data[0][0]).toBe(99);
    });

    it(`supports stop bounds logic`, () => {
      const data = [[1, 2], [3, 4]];

      const setter = Array2d.setMutate(data);
      setter(99, { x: 5, y: 0 }, `stop`);

      expect(data[0][1]).toBe(99);
    });
  });

  describe(`set`, () => {
    it(`returns new array without mutating original`, () => {
      const original = [
        [1, 2],
        [3, 4],
      ];

      const setter = Array2d.set(original);
      const result = setter(99, { x: 0, y: 0 }, `undefined`);

      expect(result).not.toBe(original);
      expect(original[0][0]).toBe(1);
      expect(result[0][0]).toBe(99);
    });

    it(`preserves other values`, () => {
      const original = [
        [1, 2],
        [3, 4],
      ];

      const setter = Array2d.set(original);
      const result = setter(99, { x: 0, y: 0 }, `undefined`);

      expect(result[0][1]).toBe(2);
      expect(result[1][0]).toBe(3);
      expect(result[1][1]).toBe(4);
    });

    it(`throws for out of bounds (default)`, () => {
      const data = [[1, 2], [3, 4]];

      const setter = Array2d.set(data);

      expect(() => setter(99, { x: 5, y: 0 }, `undefined`)).toThrow(`out of range`);
    });

    it(`supports wrap bounds logic`, () => {
      const data = [[1, 2], [3, 4]];

      const setter = Array2d.set(data);
      const result = setter(99, { x: 2, y: 0 }, `wrap`);

      expect(result[0][0]).toBe(99);
    });
  });

  describe(`wrapMutable`, () => {
    it(`returns ArrayGrid with grid dimensions`, () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
      ];

      const grid = Array2d.wrapMutable(data);

      expect(grid.rows).toBe(2);
      expect(grid.cols).toBe(3);
    });

    it(`provides get accessor`, () => {
      const data = [[1, 2], [3, 4]];

      const grid = Array2d.wrapMutable(data);

      expect(grid.get({ x: 0, y: 0 })).toBe(1);
      expect(grid.get({ x: 1, y: 1 })).toBe(4);
    });

    it(`provides set accessor that mutates`, () => {
      const data = [[1, 2], [3, 4]];

      const grid = Array2d.wrapMutable(data);
      grid.set(99, { x: 0, y: 0 }, `undefined`);

      expect(data[0][0]).toBe(99);
    });

    it(`provides array getter`, () => {
      const data = [[1, 2], [3, 4]];

      const grid = Array2d.wrapMutable(data);

      expect(grid.array).toBe(data);
    });
  });

  describe(`wrap`, () => {
    it(`returns ArrayGrid with grid dimensions`, () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6],
      ];

      const grid = Array2d.wrap(data);

      expect(grid.rows).toBe(2);
      expect(grid.cols).toBe(3);
    });

    it(`provides get accessor`, () => {
      const data = [[1, 2], [3, 4]];

      const grid = Array2d.wrap(data);

      expect(grid.get({ x: 0, y: 0 })).toBe(1);
      expect(grid.get({ x: 1, y: 1 })).toBe(4);
    });

    it(`set with bounds parameter`, () => {
      const data = [[1, 2], [3, 4]];

      const grid = Array2d.wrap(data);
      // The set function returns a new grid when using wrap()
      const newGrid = (grid.set as any)(99, { x: 2, y: 0 }, `wrap`);

      // newGrid should have the updated value
      expect(newGrid.get({ x: 0, y: 0 })).toBe(99);
      // Both grids share the same underlying array reference in this implementation
      expect(grid.get({ x: 0, y: 0 })).toBe(99);
    });

    it(`provides array getter`, () => {
      const data = [[1, 2], [3, 4]];

      const grid = Array2d.wrap(data);

      expect(Array.isArray(grid.array)).toBe(true);
    });
  });
});
