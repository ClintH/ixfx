import { describe, expect, it } from 'vitest';
import * as Grids from '../../src/grid/index.js';

describe(`distance`, () => {
  it(`uniform`, () => {
    const grid = { cols: 5, rows: 5 };

    // Forwards
    expect(Grids.distance({ x: 0, y: 0 }, { x: 0, y: 0 }, grid)).toBe(0);
    expect(Grids.distance({ x: 0, y: 0 }, { x: 1, y: 0 }, grid)).toBe(1);
    expect(Grids.distance({ x: 0, y: 0 }, { x: 4, y: 0 }, grid)).toBe(4);
    expect(Grids.distance({ x: 0, y: 0 }, { x: 0, y: 1 }, grid)).toBe(5);
    expect(Grids.distance({ x: 0, y: 0 }, { x: 0, y: 2 }, grid)).toBe(10);
    expect(Grids.distance({ x: 0, y: 0 }, { x: 4, y: 4 }, grid)).toBe(24);

    expect(Grids.distance({ x: 2, y: 2 }, { x: 2, y: 3 }, grid)).toBe(5);

    // With wrapping
    expect(Grids.distance({ x: 4, y: 4 }, { x: 0, y: 0 }, grid)).toBe(1);
    expect(Grids.distance({ x: 3, y: 3 }, { x: 3, y: 2 }, grid)).toBe(20);
  });
});