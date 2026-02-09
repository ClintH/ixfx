import { test, expect, describe } from 'vitest';
import * as Array2d from '../../src/grid/array-2d.js';

describe('grid/array-2d', () => {
  describe('create', () => {
    test('creates grid from 2D array', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      
      const grid = Array2d.create(data);
      
      expect(grid.rows).toBe(2);
      expect(grid.cols).toBe(3);
    });

    test('creates grid from single row', () => {
      const data = [[1, 2, 3]];
      
      const grid = Array2d.create(data);
      
      expect(grid.rows).toBe(1);
      expect(grid.cols).toBe(3);
    });

    test('creates grid from single column', () => {
      const data = [[1], [2], [3]];
      
      const grid = Array2d.create(data);
      
      expect(grid.rows).toBe(3);
      expect(grid.cols).toBe(1);
    });

    test('throws for non-uniform row lengths', () => {
      const data = [
        [1, 2, 3],
        [4, 5]
      ];
      
      expect(() => Array2d.create(data)).toThrow('uniform column length');
    });

    test('handles empty array', () => {
      const data: number[][] = [];
      
      const grid = Array2d.create(data);
      
      expect(grid.rows).toBe(0);
      expect(grid.cols).toBe(NaN);
    });
  });

  describe('access', () => {
    test('returns value at valid cell', () => {
      const data = [
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ];
      
      const accessor = Array2d.access(data);
      
      expect(accessor({ x: 0, y: 0 })).toBe('a');
      expect(accessor({ x: 1, y: 0 })).toBe('b');
      expect(accessor({ x: 2, y: 0 })).toBe('c');
      expect(accessor({ x: 0, y: 1 })).toBe('d');
      expect(accessor({ x: 1, y: 1 })).toBe('e');
      expect(accessor({ x: 2, y: 1 })).toBe('f');
    });

    test('returns undefined for out of bounds (default)', () => {
      const data = [[1, 2], [3, 4]];
      
      const accessor = Array2d.access(data);
      
      expect(accessor({ x: -1, y: 0 })).toBeUndefined();
      expect(accessor({ x: 0, y: -1 })).toBeUndefined();
      expect(accessor({ x: 2, y: 0 })).toBeUndefined();
      expect(accessor({ x: 0, y: 2 })).toBeUndefined();
    });

    test('supports wrap bounds logic', () => {
      const data = [[1, 2], [3, 4]];
      
      const accessor = Array2d.access(data);
      
      expect(accessor({ x: 2, y: 0 }, 'wrap')).toBe(1);
      expect(accessor({ x: 0, y: 2 }, 'wrap')).toBe(1);
      expect(accessor({ x: -1, y: 0 }, 'wrap')).toBe(2);
    });

    test('supports stop bounds logic', () => {
      const data = [[1, 2], [3, 4]];
      
      const accessor = Array2d.access(data);
      
      expect(accessor({ x: 5, y: 0 }, 'stop')).toBe(2);
      expect(accessor({ x: 0, y: 5 }, 'stop')).toBe(3);
      expect(accessor({ x: -5, y: 0 }, 'stop')).toBe(1);
    });
  });

  describe('setMutate', () => {
    test('sets value at valid cell', () => {
      const data = [
        [1, 2],
        [3, 4]
      ];
      
      const setter = Array2d.setMutate(data);
      setter(99, { x: 0, y: 0 });
      
      expect(data[0][0]).toBe(99);
    });

    test('mutates array in place', () => {
      const data = [
        [1, 2],
        [3, 4]
      ];
      
      const setter = Array2d.setMutate(data);
      setter(99, { x: 1, y: 1 });
      
      expect(data[1][1]).toBe(99);
    });

    test('throws for out of bounds (default)', () => {
      const data = [[1, 2], [3, 4]];
      
      const setter = Array2d.setMutate(data);
      
      expect(() => setter(99, { x: 5, y: 0 })).toThrow('out of range');
    });

    test('supports wrap bounds logic', () => {
      const data = [[1, 2], [3, 4]];
      
      const setter = Array2d.setMutate(data);
      setter(99, { x: 2, y: 0 }, 'wrap');
      
      expect(data[0][0]).toBe(99);
    });

    test('supports stop bounds logic', () => {
      const data = [[1, 2], [3, 4]];
      
      const setter = Array2d.setMutate(data);
      setter(99, { x: 5, y: 0 }, 'stop');
      
      expect(data[0][1]).toBe(99);
    });
  });

  describe('set', () => {
    test('returns new array without mutating original', () => {
      const original = [
        [1, 2],
        [3, 4]
      ];
      
      const setter = Array2d.set(original);
      const result = setter(99, { x: 0, y: 0 }, 'undefined');
      
      expect(result).not.toBe(original);
      expect(original[0][0]).toBe(1);
      expect(result[0][0]).toBe(99);
    });

    test('preserves other values', () => {
      const original = [
        [1, 2],
        [3, 4]
      ];
      
      const setter = Array2d.set(original);
      const result = setter(99, { x: 0, y: 0 }, 'undefined');
      
      expect(result[0][1]).toBe(2);
      expect(result[1][0]).toBe(3);
      expect(result[1][1]).toBe(4);
    });

    test('throws for out of bounds (default)', () => {
      const data = [[1, 2], [3, 4]];
      
      const setter = Array2d.set(data);
      
      expect(() => setter(99, { x: 5, y: 0 }, 'undefined')).toThrow('out of range');
    });

    test('supports wrap bounds logic', () => {
      const data = [[1, 2], [3, 4]];
      
      const setter = Array2d.set(data);
      const result = setter(99, { x: 2, y: 0 }, 'wrap');
      
      expect(result[0][0]).toBe(99);
    });
  });

  describe('wrapMutable', () => {
    test('returns ArrayGrid with grid dimensions', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      
      const grid = Array2d.wrapMutable(data);
      
      expect(grid.rows).toBe(2);
      expect(grid.cols).toBe(3);
    });

    test('provides get accessor', () => {
      const data = [[1, 2], [3, 4]];
      
      const grid = Array2d.wrapMutable(data);
      
      expect(grid.get({ x: 0, y: 0 })).toBe(1);
      expect(grid.get({ x: 1, y: 1 })).toBe(4);
    });

    test('provides set accessor that mutates', () => {
      const data = [[1, 2], [3, 4]];
      
      const grid = Array2d.wrapMutable(data);
      grid.set(99, { x: 0, y: 0 }, 'undefined');
      
      expect(data[0][0]).toBe(99);
    });

    test('provides array getter', () => {
      const data = [[1, 2], [3, 4]];
      
      const grid = Array2d.wrapMutable(data);
      
      expect(grid.array).toBe(data);
    });
  });

  describe('wrap', () => {
    test('returns ArrayGrid with grid dimensions', () => {
      const data = [
        [1, 2, 3],
        [4, 5, 6]
      ];
      
      const grid = Array2d.wrap(data);
      
      expect(grid.rows).toBe(2);
      expect(grid.cols).toBe(3);
    });

    test('provides get accessor', () => {
      const data = [[1, 2], [3, 4]];
      
      const grid = Array2d.wrap(data);
      
      expect(grid.get({ x: 0, y: 0 })).toBe(1);
      expect(grid.get({ x: 1, y: 1 })).toBe(4);
    });

    test('set with bounds parameter', () => {
      const data = [[1, 2], [3, 4]];
      
      const grid = Array2d.wrap(data);
      // The set function returns a new grid when using wrap()
      const newGrid = (grid.set as any)(99, { x: 2, y: 0 }, 'wrap');
      
      // newGrid should have the updated value
      expect(newGrid.get({ x: 0, y: 0 })).toBe(99);
      // Both grids share the same underlying array reference in this implementation
      expect(grid.get({ x: 0, y: 0 })).toBe(99);
    });

    test('provides array getter', () => {
      const data = [[1, 2], [3, 4]];
      
      const grid = Array2d.wrap(data);
      
      expect(Array.isArray(grid.array)).toBe(true);
    });
  });
});
