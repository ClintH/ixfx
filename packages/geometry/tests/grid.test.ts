import { describe, it, expect } from 'vitest';
import * as Grid from '../src/grid/index.js';

describe('grid', () => {
  describe('guards', () => {
    describe('isCell', () => {
      it('returns true for valid cell', () => {
        expect(Grid.isCell({ x: 0, y: 0 })).toBe(true);
        expect(Grid.isCell({ x: 5, y: 10 })).toBe(true);
      });

      it('returns false for undefined', () => {
        expect(Grid.isCell(undefined)).toBe(false);
      });

      it('returns false for null', () => {
        expect(() => Grid.isCell(null as any)).toThrow();
      });

      it('returns false for non-cell objects', () => {
        expect(() => Grid.isCell({ x: 0 } as any)).not.toThrow();
        expect(Grid.isCell({ x: 0 } as any)).toBe(false);
        expect(Grid.isCell({ y: 0 } as any)).toBe(false);
        expect(Grid.isCell({} as any)).toBe(false);
      });
    });

    describe('guardCell', () => {
      it('does not throw for valid cell', () => {
        expect(() => Grid.guardCell({ x: 0, y: 0 })).not.toThrow();
        expect(() => Grid.guardCell({ x: 5, y: 10 })).not.toThrow();
      });

      it('throws for undefined cell', () => {
        expect(() => Grid.guardCell(undefined as any)).toThrow('is undefined');
      });

      it('throws for NaN values', () => {
        expect(() => Grid.guardCell({ x: NaN, y: 0 })).toThrow('is NaN');
        expect(() => Grid.guardCell({ x: 0, y: NaN })).toThrow('is NaN');
      });

      it('throws for non-integer values', () => {
        expect(() => Grid.guardCell({ x: 0.5, y: 0 })).toThrow('non-integer');
        expect(() => Grid.guardCell({ x: 0, y: 0.5 })).toThrow('non-integer');
      });

      it('throws for cell outside grid', () => {
        const grid = { rows: 5, cols: 5 };
        expect(() => Grid.guardCell({ x: 10, y: 0 }, 'cell', grid)).toThrow('outside of grid');
        expect(() => Grid.guardCell({ x: 0, y: 10 }, 'cell', grid)).toThrow('outside of grid');
      });
    });

    describe('guardGrid', () => {
      it('does not throw for valid grid', () => {
        expect(() => Grid.guardGrid({ rows: 5, cols: 5 })).not.toThrow();
        expect(() => Grid.guardGrid({ rows: 1, cols: 1 })).not.toThrow();
      });

      it('throws for undefined grid', () => {
        expect(() => Grid.guardGrid(undefined as any)).toThrow('is undefined');
      });

      it('throws for missing rows', () => {
        expect(() => Grid.guardGrid({ cols: 5 } as any)).toThrow('rows is undefined');
      });

      it('throws for missing cols', () => {
        expect(() => Grid.guardGrid({ rows: 5 } as any)).toThrow('cols is undefined');
      });

      it('throws for non-integer rows/cols', () => {
        expect(() => Grid.guardGrid({ rows: 5.5, cols: 5 })).toThrow('not an integer');
        expect(() => Grid.guardGrid({ rows: 5, cols: 5.5 })).toThrow('not an integer');
      });
    });
  });

  describe('directions', () => {
    describe('allDirections', () => {
      it('returns all 8 cardinal directions', () => {
        const directions = Grid.allDirections;
        expect(directions).toEqual(['n', 'ne', 'nw', 'e', 's', 'se', 'sw', 'w']);
      });

      it('is frozen', () => {
        expect(Object.isFrozen(Grid.allDirections)).toBe(true);
      });
    });

    describe('crossDirections', () => {
      it('returns 4 cardinal directions', () => {
        const directions = Grid.crossDirections;
        expect(directions).toEqual(['n', 'e', 's', 'w']);
      });
    });

    describe('getVectorFromCardinal', () => {
      it('returns {x: 0, y: -1} for n', () => {
        expect(Grid.getVectorFromCardinal('n')).toEqual({ x: 0, y: -1 });
      });

      it('returns {x: 0, y: 1} for s', () => {
        expect(Grid.getVectorFromCardinal('s')).toEqual({ x: 0, y: 1 });
      });

      it('returns {x: 1, y: 0} for e', () => {
        expect(Grid.getVectorFromCardinal('e')).toEqual({ x: 1, y: 0 });
      });

      it('returns {x: -1, y: 0} for w', () => {
        expect(Grid.getVectorFromCardinal('w')).toEqual({ x: -1, y: 0 });
      });

      it('returns diagonal vectors', () => {
        expect(Grid.getVectorFromCardinal('ne')).toEqual({ x: 1, y: -1 });
        expect(Grid.getVectorFromCardinal('nw')).toEqual({ x: -1, y: -1 });
        expect(Grid.getVectorFromCardinal('se')).toEqual({ x: 1, y: 1 });
        expect(Grid.getVectorFromCardinal('sw')).toEqual({ x: -1, y: 1 });
      });

      it('returns {x: 0, y: 0} for empty string', () => {
        expect(Grid.getVectorFromCardinal('')).toEqual({ x: 0, y: 0 });
      });

      it('applies multiplier', () => {
        expect(Grid.getVectorFromCardinal('n', 5)).toEqual({ x: 0, y: -5 });
        expect(Grid.getVectorFromCardinal('e', 10)).toEqual({ x: 10, y: 0 });
      });
    });

    describe('offsetCardinals', () => {
      const grid = { rows: 10, cols: 10 };

      it('returns neighbours at specified distance', () => {
        const neighbours = Grid.offsetCardinals(grid, { x: 5, y: 5 }, 1);
        expect(neighbours.n).toEqual({ x: 5, y: 4 });
        expect(neighbours.s).toEqual({ x: 5, y: 6 });
        expect(neighbours.e).toEqual({ x: 6, y: 5 });
        expect(neighbours.w).toEqual({ x: 4, y: 5 });
      });

    it('respects bounds stop logic', () => {
      const neighbours = Grid.offsetCardinals(grid, { x: 0, y: 0 }, 1, 'stop');
      expect(neighbours.n).toEqual({ x: 0, y: 0 });
      expect(neighbours.w).toEqual({ x: 0, y: 0 });
      expect(neighbours.e).toEqual({ x: 1, y: 0 });
      expect(neighbours.s).toEqual({ x: 0, y: 1 });
    });
    });
  });

  describe('geometry', () => {
    describe('getLine', () => {
      it('returns cells on diagonal line', () => {
        const cells = Grid.getLine({ x: 0, y: 0 }, { x: 4, y: 4 });
        expect(cells.length).toBe(5);
        expect(cells[0]).toEqual({ x: 0, y: 0 });
        expect(cells[4]).toEqual({ x: 4, y: 4 });
      });

      it('returns cells on horizontal line', () => {
        const cells = Grid.getLine({ x: 0, y: 0 }, { x: 4, y: 0 });
        expect(cells.length).toBe(5);
        expect(cells[0]).toEqual({ x: 0, y: 0 });
        expect(cells[4]).toEqual({ x: 4, y: 0 });
      });

      it('returns cells on vertical line', () => {
        const cells = Grid.getLine({ x: 0, y: 0 }, { x: 0, y: 4 });
        expect(cells.length).toBe(5);
        expect(cells[0]).toEqual({ x: 0, y: 0 });
        expect(cells[4]).toEqual({ x: 0, y: 4 });
      });

      it('handles reverse direction', () => {
        const cells = Grid.getLine({ x: 4, y: 4 }, { x: 0, y: 0 });
        expect(cells.length).toBe(5);
        expect(cells[0]).toEqual({ x: 4, y: 4 });
        expect(cells[4]).toEqual({ x: 0, y: 0 });
      });
    });

    describe('simpleLine', () => {
    it('returns cells on horizontal line', () => {
      const cells = Grid.simpleLine({ x: 0, y: 0 }, { x: 4, y: 0 });
      expect(cells.length).toBe(4);
      expect(cells[0]).toEqual({ x: 0, y: 0 });
      expect(cells[3]).toEqual({ x: 3, y: 0 });
    });

    it('returns cells on vertical line', () => {
      const cells = Grid.simpleLine({ x: 0, y: 0 }, { x: 0, y: 4 });
      expect(cells.length).toBe(4);
    });

      it('throws for diagonal line', () => {
        expect(() => Grid.simpleLine({ x: 0, y: 0 }, { x: 4, y: 4 })).toThrow('Only does vertical and horizontal');
      });

    it('excludes end by default', () => {
      const cells = Grid.simpleLine({ x: 0, y: 0 }, { x: 4, y: 0 });
      expect(cells.length).toBe(4);
      expect(cells[3].x).toBe(3);
    });

      it('includes end with endInclusive', () => {
        const cells = Grid.simpleLine({ x: 0, y: 0 }, { x: 4, y: 0 }, true);
        expect(cells.length).toBe(5);
      });
    });
  });

  describe('inside', () => {
    const grid = { rows: 5, cols: 5 };

    it('returns true for cell inside grid', () => {
      expect(Grid.inside(grid, { x: 0, y: 0 })).toBe(true);
      expect(Grid.inside(grid, { x: 4, y: 4 })).toBe(true);
      expect(Grid.inside(grid, { x: 2, y: 2 })).toBe(true);
    });

    it('returns false for cell outside grid', () => {
      expect(Grid.inside(grid, { x: 5, y: 0 })).toBe(false);
      expect(Grid.inside(grid, { x: 0, y: 5 })).toBe(false);
      expect(Grid.inside(grid, { x: -1, y: 0 })).toBe(false);
    });
  });

  describe('offset', () => {
    const grid = { rows: 5, cols: 5 };

    it('returns offset cell', () => {
      expect(Grid.offset(grid, { x: 0, y: 0 }, { x: 1, y: 1 })).toEqual({ x: 1, y: 1 });
    });

    it('returns undefined with undefined bounds', () => {
      expect(Grid.offset(grid, { x: 0, y: 0 }, { x: 10, y: 0 }, 'undefined')).toBeUndefined();
    });

    it('stops at edge with stop bounds', () => {
      expect(Grid.offset(grid, { x: 0, y: 0 }, { x: -1, y: 0 }, 'stop')).toEqual({ x: 0, y: 0 });
    });

    it('wraps with wrap bounds', () => {
      expect(Grid.offset(grid, { x: 0, y: 0 }, { x: -1, y: 0 }, 'wrap')).toEqual({ x: 4, y: 0 });
    });
  });

  describe('applyBounds', () => {
    const grid = { rows: 5, cols: 5 };

    it('returns cell within bounds', () => {
      expect(Grid.applyBounds(grid, { x: 2, y: 2 })).toEqual({ x: 2, y: 2 });
    });

    it('clamps cell to grid edges', () => {
      expect(Grid.applyBounds(grid, { x: 10, y: 10 })).toBeUndefined();
      expect(Grid.applyBounds(grid, { x: -10, y: -10 })).toBeUndefined();
    });
  });

  describe('isEqual', () => {
    it('returns true for same grids', () => {
      const a = { rows: 5, cols: 10 };
      const b = { rows: 5, cols: 10 };
      expect(Grid.isEqual(a, b)).toBe(true);
    });

    it('returns false for different grids', () => {
      const a = { rows: 5, cols: 10 };
      const b = { rows: 5, cols: 5 };
      expect(Grid.isEqual(a, b)).toBe(false);
    });
  });

  describe('Array2d', () => {
    it('creates a grid from 2D array', () => {
      const array = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      const grid = Grid.Array2d.wrap(array);
      expect(grid.rows).toBe(2);
      expect(grid.cols).toBe(3);
      expect(grid.get({ x: 0, y: 0 })).toBe(1);
      expect(grid.get({ x: 1, y: 0 })).toBe(2);
      expect(grid.get({ x: 0, y: 1 })).toBe(4);
    });

    it('handles out of bounds with undefined', () => {
      const grid = Grid.Array2d.wrap([[1, 2]]);
      expect(grid.get({ x: 10, y: 0 }, 'undefined')).toBeUndefined();
    });
  });

  describe('Array1d', () => {
    it('creates a grid from 1D array', () => {
      const array = [1, 2, 3, 4, 5, 6];
      const grid = Grid.Array1d.wrap(array, 3);
      expect(grid.rows).toBe(2);
      expect(grid.cols).toBe(3);
      expect(grid.get({ x: 0, y: 0 })).toBe(1);
      expect(grid.get({ x: 1, y: 0 })).toBe(2);
      expect(grid.get({ x: 0, y: 1 })).toBe(4);
    });
  });

  describe('By', () => {
    describe('cells', () => {
      it('iterates over all cells', () => {
        const grid = { rows: 2, cols: 3 } as Grid.Grid;
        const cells = [...Grid.By.cells(grid)];
        expect(cells.length).toBe(6);
        expect(cells[0]).toEqual({ x: 0, y: 0 });
        expect(cells[5]).toEqual({ x: 2, y: 1 });
      });
    });
  });

  describe('Visit', () => {
    describe('breadthLogic', () => {
      it('returns neighbour selection logic', () => {
        const logic = Grid.Visit.breadthLogic();
        expect(logic.select).toBeDefined();
      });
    });

    describe('depthLogic', () => {
      it('returns neighbour selection logic', () => {
        const logic = Grid.Visit.depthLogic();
        expect(logic.select).toBeDefined();
      });
    });

    describe('randomLogic', () => {
      it('returns neighbour selection logic', () => {
        const logic = Grid.Visit.randomLogic();
        expect(logic.select).toBeDefined();
      });
    });

    describe('withLogic', () => {
      it('creates a visitor from logic', () => {
        const logic = Grid.Visit.breadthLogic();
        const visitor = Grid.Visit.withLogic(logic);
        expect(visitor).toBeDefined();
      });
    });
  });
});
