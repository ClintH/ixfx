import { describe, expect, it } from 'vitest';
import * as Grid from '../../src/grid/index.js';

describe(`tests`, () => {
  it(`testCell`, () => {
    expect(Grid.testCell({ x: 0, y: 0 })).toStrictEqual({ success: true, value: { x: 0, y: 0 } });
    expect(Grid.testCell({ x: 5, y: 10 })).toStrictEqual({ success: true, value: { x: 5, y: 10 } });
    expect(Grid.testCell(undefined as any)).toStrictEqual({ success: false, error: `Param is undefined. Expecting {x,y}` });
    expect(Grid.testCell({ x: Number.NaN, y: 0 })).toStrictEqual({ success: false, error: `Param.x is NaN` });
    expect(Grid.testCell({ x: 0, y: Number.NaN })).toStrictEqual({ success: false, error: `Param.y is NaN` });
    expect(Grid.testCell({ x: 0.5, y: 0 })).toStrictEqual({ success: false, error: `Param.x is non-integer` });
    expect(Grid.testCell({ x: 0, y: 0.5 })).toStrictEqual({ success: false, error: `Param.y is non-integer` });
    const grid = { rows: 5, cols: 5 };
    expect(Grid.testCell({ x: 10, y: 0 }, `cell`, grid)).toStrictEqual({ success: false, error: `cell is outside of grid. Cell: 10,0 Grid: { cols: 5 rows: 5}` });
    expect(Grid.testCell({ x: 0, y: 10 }, `cell`, grid)).toStrictEqual({ success: false, error: `cell is outside of grid. Cell: 0,10 Grid: { cols: 5 rows: 5}` });
  });

  it(`testGrid`, () => {
    expect(Grid.testGrid({ rows: 5, cols: 5 })).toStrictEqual({ success: true, value: { rows: 5, cols: 5 } });
    expect(Grid.testGrid({ rows: 1, cols: 1 })).toStrictEqual({ success: true, value: { rows: 1, cols: 1 } });
    expect(Grid.testGrid(undefined as any)).toStrictEqual({ success: false, error: `Param is undefined. Expecting Grid or JaggedGrid` });
    expect(Grid.testGrid({ cols: 5 } as any)).toStrictEqual({ success: false, error: `Param.rows is missing` });
    expect(Grid.testGrid({ rows: 5 } as any)).toStrictEqual({ success: false, error: `Param.cols is missing` });
    expect(Grid.testGrid({ rows: 5.5, cols: 5 })).toStrictEqual({ success: false, error: `Param.rows is not an integer` });
  });

  it(`isCell`, () => {
    expect(Grid.isCell({ x: 0, y: 0 })).toBe(true);
    expect(Grid.isCell({ x: 5, y: 10 })).toBe(true);
    expect(Grid.isCell(undefined)).toBe(false);
    expect(() => Grid.isCell(null as any)).toThrow();
    expect(() => Grid.isCell({ x: 0 } as any)).not.toThrow();
    expect(Grid.isCell({ x: 0 } as any)).toBe(false);
    expect(Grid.isCell({ y: 0 } as any)).toBe(false);
    expect(Grid.isCell({} as any)).toBe(false);
  });
});