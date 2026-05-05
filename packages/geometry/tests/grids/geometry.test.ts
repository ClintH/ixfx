import { describe, expect, it } from 'vitest';
import * as Grids from '../../src/grid/index.js';

describe(`geometry`, () => {
  describe(`getLine`, () => {
    it(`returns cells on diagonal line`, () => {
      const cells = Grids.getLine({ x: 0, y: 0 }, { x: 4, y: 4 });
      expect(cells.length).toBe(5);
      expect(cells[0]).toEqual({ x: 0, y: 0 });
      expect(cells[4]).toEqual({ x: 4, y: 4 });
    });

    it(`returns cells on horizontal line`, () => {
      const cells = Grids.getLine({ x: 0, y: 0 }, { x: 4, y: 0 });
      expect(cells.length).toBe(5);
      expect(cells[0]).toEqual({ x: 0, y: 0 });
      expect(cells[4]).toEqual({ x: 4, y: 0 });
    });

    it(`returns cells on vertical line`, () => {
      const cells = Grids.getLine({ x: 0, y: 0 }, { x: 0, y: 4 });
      expect(cells.length).toBe(5);
      expect(cells[0]).toEqual({ x: 0, y: 0 });
      expect(cells[4]).toEqual({ x: 0, y: 4 });
    });

    it(`handles reverse direction`, () => {
      const cells = Grids.getLine({ x: 4, y: 4 }, { x: 0, y: 0 });
      expect(cells.length).toBe(5);
      expect(cells[0]).toEqual({ x: 4, y: 4 });
      expect(cells[4]).toEqual({ x: 0, y: 0 });
    });
  });

  describe(`simpleLine`, () => {
    it(`returns cells on horizontal line`, () => {
      const cells = Grids.simpleLine({ x: 0, y: 0 }, { x: 4, y: 0 });
      expect(cells.length).toBe(4);
      expect(cells[0]).toEqual({ x: 0, y: 0 });
      expect(cells[3]).toEqual({ x: 3, y: 0 });
    });

    it(`returns cells on vertical line`, () => {
      const cells = Grids.simpleLine({ x: 0, y: 0 }, { x: 0, y: 4 });
      expect(cells.length).toBe(4);
    });

    it(`throws for diagonal line`, () => {
      expect(() => Grids.simpleLine({ x: 0, y: 0 }, { x: 4, y: 4 })).toThrow(`Only does vertical and horizontal`);
    });

    it(`excludes end by default`, () => {
      const cells = Grids.simpleLine({ x: 0, y: 0 }, { x: 4, y: 0 });
      expect(cells.length).toBe(4);
      expect(cells[3].x).toBe(3);
    });

    it(`includes end with endInclusive`, () => {
      const cells = Grids.simpleLine({ x: 0, y: 0 }, { x: 4, y: 0 }, true);
      expect(cells.length).toBe(5);
    });
  });

  it(`last-cell-rowwise`, () => {
    const g: Grids.Grid = { cols: 3, rows: 3 };
    expect(Grids.lastCellRowwise(g)).toEqual({ x: 2, y: 2 });

    // 0, 1
    // 2, 3, 4
    // 5
    expect(Grids.lastCellRowwise({ rows: [2, 3, 1] })).toEqual({ x: 0, y: 2 });
  });

  it (`last-cell-columnwise`, () => {
    const g: Grids.Grid = { cols: 3, rows: 3 };
    expect(Grids.lastCellColumnwise(g)).toEqual({ x: 2, y: 2 });

    // 0 1
    // 2 3 4
    // 5 6 7
    // 8
    expect(Grids.lastCellColumnwise({ rows: [2, 3, 3, 1] })).toEqual({ x: 2, y: 2 });

    // 0 1 2
    // 3 4
    // 5
    expect(Grids.lastCellColumnwise({ rows: [3, 2, 1] })).toEqual({ x: 2, y: 0 });
  });
});
