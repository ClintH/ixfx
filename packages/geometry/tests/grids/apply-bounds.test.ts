import type { GridBoundsLogic } from '../../src/grid/types.js';
import { describe, expect, it } from 'vitest';
import { applyBounds, applyBoundsJagged } from '../../src/grid/apply-bounds.js';

it(`apply-bounds`, () => {
  const logics: GridBoundsLogic[] = [`stop`, `undefined`, `unbounded`, `wrap`];
  const g = { rows: 3, cols: 3 };
  const r1 = logics.map(logic => applyBounds(g, { x: 0, y: 0 }, logic));
  expect(r1).toEqual([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);

  const r2 = logics.map(logic => applyBounds(g, { x: -1, y: 0 }, logic));
  expect(r2).toEqual([{ x: 0, y: 0 }, undefined, { x: -1, y: 0 }, { x: 2, y: 0 }]);

  const r3 = logics.map(logic => applyBounds(g, { x: 2, y: 2 }, logic));
  expect(r3).toEqual([{ x: 2, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 2 }]);

  const r4 = logics.map(logic => applyBounds(g, { x: 2, y: 3 }, logic));
  expect(r4).toEqual([{ x: 2, y: 2 }, undefined, { x: 2, y: 3 }, { x: 2, y: 0 }]);

  const r5 = logics.map(logic => applyBounds(g, { x: 3, y: 3 }, logic));
  expect(r5).toEqual([{ x: 2, y: 2 }, undefined, { x: 3, y: 3 }, { x: 0, y: 0 }]);
});

it(`apply-bounds-jagged`, () => {
  const logics: GridBoundsLogic[] = [`stop`, `undefined`, `unbounded`, `wrap`];
  const g = { rows: [1, 2, 3] };

  // All fine, within range
  const r1a = logics.map(logic => applyBoundsJagged(g, { x: 0, y: 0 }, logic));
  expect(r1a).toEqual([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);
  const r1b = logics.map(logic => applyBoundsJagged(g, { x: 1, y: 1 }, logic));
  expect(r1b).toEqual([{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 }]);
  const r1c = logics.map(logic => applyBoundsJagged(g, { x: 2, y: 2 }, logic));
  expect(r1c).toEqual([{ x: 2, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 2 }]);

  // Past row 0's cols by 1
  const r2a = logics.map(logic => applyBoundsJagged(g, { x: 1, y: 0 }, logic));
  // [`stop`, `undefined`, `unbounded`, `wrap`];
  expect(r2a).toEqual([{ x: 0, y: 0 }, undefined, { x: 1, y: 0 }, { x: 0, y: 0 }]);

  // Past row 0's cols by 2
  const r2b = logics.map(logic => applyBoundsJagged(g, { x: 2, y: 0 }, logic));
  expect(r2b).toEqual([{ x: 0, y: 0 }, undefined, { x: 2, y: 0 }, { x: 0, y: 0 }]);

  // Past row 1's cols by 1
  const r3a = logics.map(logic => applyBoundsJagged(g, { x: 2, y: 1 }, logic));
  expect(r3a).toEqual([{ x: 1, y: 1 }, undefined, { x: 2, y: 1 }, { x: 0, y: 1 }]);

  // Past row 2's cols by 1
  const r3b = logics.map(logic => applyBoundsJagged(g, { x: 3, y: 1 }, logic));
  expect(r3b).toEqual([{ x: 1, y: 1 }, undefined, { x: 3, y: 1 }, { x: 1, y: 1 }]);

  // Past row 2's cols by 2
  const r3c = logics.map(logic => applyBoundsJagged(g, { x: 4, y: 1 }, logic));
  expect(r3c).toEqual([{ x: 1, y: 1 }, undefined, { x: 4, y: 1 }, { x: 0, y: 1 }]);

  // Past rows by 1
  const r4 = logics.map(logic => applyBoundsJagged(g, { x: 0, y: 3 }, logic));
  // [`stop`, `undefined`, `unbounded`, `wrap`];
  expect(r4).toEqual([{ x: 0, y: 2 }, undefined, { x: 0, y: 3 }, { x: 0, y: 0 }]);

  // Past rows by 2
  const r4a = logics.map(logic => applyBoundsJagged(g, { x: 0, y: 4 }, logic));
  expect(r4a).toEqual([{ x: 0, y: 2 }, undefined, { x: 0, y: 4 }, { x: 0, y: 1 }]);

  // Past rows by 2
  const r4b = logics.map(logic => applyBoundsJagged(g, { x: 0, y: 5 }, logic));
  expect(r4b).toEqual([{ x: 0, y: 2 }, undefined, { x: 0, y: 5 }, { x: 0, y: 2 }]);

  // Past rows by 2 and cols by 3
  const r5 = logics.map(logic => applyBoundsJagged(g, { x: 5, y: 4 }, logic));
  expect(r5).toEqual([{ x: 2, y: 2 }, undefined, { x: 5, y: 4 }, { x: 1, y: 1 }]);
});

describe(`applyBounds`, () => {
  const grid = { rows: 5, cols: 5 };

  it(`returns cell within bounds`, () => {
    expect(applyBounds(grid, { x: 2, y: 2 })).toEqual({ x: 2, y: 2 });
  });

  it(`clamps cell to grid edges`, () => {
    expect(applyBounds(grid, { x: 10, y: 10 })).toBeUndefined();
    expect(applyBounds(grid, { x: -10, y: -10 })).toBeUndefined();
  });
});