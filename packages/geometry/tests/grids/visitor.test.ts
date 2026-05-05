import { expect, it } from 'vitest';
import * as Grids from '../../src/grid/index.js';
import * as V from '../../src/grid/visitors/index.js';

it (`row-logic-reverse`, () => {
  // Visitor is pure function, so it can be reused
  const l1 = V.rowLogic({ reversed: true });

  // Uniform grid
  // 0 1 2
  // 3 4 5
  // 6 7 8
  const g: Grids.UniformGrid = { cols: 3, rows: 3 };
  expect(l1.getNeighbours(g, { x: 2, y: 2 })).toStrictEqual([
    [`w`, { x: 1, y: 2 }],
  ]);
  expect(l1.getNeighbours(g, { x: 1, y: 2 })).toStrictEqual([
    [`w`, { x: 0, y: 2 }],
  ]);
  expect(l1.getNeighbours(g, { x: 0, y: 2 })).toStrictEqual([
    [`w`, { x: 2, y: 1 }],
  ]);
  expect(l1.getNeighbours(g, { x: 0, y: 0 })).toStrictEqual([
    [`w`, { x: 2, y: 2 }],
  ]);

  // Jagged grid
  // 0, 1
  // 2, 3, 4
  // 5
  const jg: Grids.JaggedGrid = { rows: [2, 3, 1] };
  expect(l1.getNeighbours(jg, { x: 0, y: 2 })).toStrictEqual([
    [`w`, { x: 2, y: 1 }],
  ]);
  expect(l1.getNeighbours(jg, { x: 2, y: 1 })).toStrictEqual([
    [`w`, { x: 1, y: 1 }],
  ]);
  expect(l1.getNeighbours(jg, { x: 1, y: 1 })).toStrictEqual([
    [`w`, { x: 0, y: 1 }],
  ]);
  expect(l1.getNeighbours(jg, { x: 0, y: 1 })).toStrictEqual([
    [`w`, { x: 1, y: 0 }],
  ]);
  expect(l1.getNeighbours(jg, { x: 0, y: 0 })).toStrictEqual([
    [`w`, { x: 0, y: 2 }],
  ]);
});

it (`row-logic`, () => {
  // Visitor is pure function, so it can be reused
  const l1 = V.rowLogic();

  // Uniform grid
  // 0 1 2
  // 3 4 5
  // 6 7 8
  const g: Grids.UniformGrid = { cols: 3, rows: 3 };
  expect(l1.getNeighbours(g, { x: 0, y: 0 })).toStrictEqual([
    [`e`, { x: 1, y: 0 }],
  ]);
  expect(l1.getNeighbours(g, { x: 1, y: 0 })).toStrictEqual([
    [`e`, { x: 2, y: 0 }],
  ]);
  expect(l1.getNeighbours(g, { x: 2, y: 0 })).toStrictEqual([
    [`e`, { x: 0, y: 1 }],
  ]);
  expect(l1.getNeighbours(g, { x: 2, y: 2 })).toStrictEqual([
    [`e`, { x: 0, y: 0 }],
  ]);

  // Jagged grid
  // 0, 1
  // 2, 3, 4
  // 5
  const jg: Grids.JaggedGrid = { rows: [2, 3, 1] };
  expect(l1.getNeighbours(jg, { x: 0, y: 0 })).toStrictEqual([
    [`e`, { x: 1, y: 0 }],
  ]);
  expect(l1.getNeighbours(jg, { x: 1, y: 0 })).toStrictEqual([
    [`e`, { x: 0, y: 1 }],
  ]);
  expect(l1.getNeighbours(jg, { x: 2, y: 1 })).toStrictEqual([
    [`e`, { x: 0, y: 2 }],
  ]);
  expect(l1.getNeighbours(jg, { x: 0, y: 2 })).toStrictEqual([
    [`e`, { x: 0, y: 0 }],
  ]);
});

it (`column-logic`, () => {
  // Visitor is pure function, so it can be reused
  const l1 = V.columnLogic();

  // Uniform grid
  const g: Grids.UniformGrid = { cols: 3, rows: 3 };
  expect(l1.getNeighbours(g, { x: 0, y: 0 })).toStrictEqual([
    [`s`, { x: 0, y: 1 }],
  ]);
  expect(l1.getNeighbours(g, { x: 0, y: 1 })).toStrictEqual([
    [`s`, { x: 0, y: 2 }],
  ]);
  // Wrap around to top of next column
  expect(l1.getNeighbours(g, { x: 0, y: 2 })).toStrictEqual([
    [`s`, { x: 1, y: 0 }],
  ]);

  // Jagged grid
  // 0, 1
  // 2, 3, 4
  // 5
  const jg: Grids.JaggedGrid = { rows: [2, 3, 1] };
  expect(l1.getNeighbours(jg, { x: 0, y: 0 })).toStrictEqual([
    [`s`, { x: 0, y: 1 }],
  ]);
  expect(l1.getNeighbours(jg, { x: 0, y: 1 })).toStrictEqual([
    [`s`, { x: 0, y: 2 }],
  ]);
  expect(l1.getNeighbours(jg, { x: 0, y: 2 })).toStrictEqual([
    [`s`, { x: 1, y: 0 }],
  ]);
  expect(l1.getNeighbours(jg, { x: 2, y: 1 })).toStrictEqual([
    [`s`, { x: 0, y: 0 }],
  ]);
});

it(`column-logic-reverse`, () => {
  const l1 = V.columnLogic({ reversed: true });

  // 0 1 2
  // 3 4 5
  // 6 7 8
  const g: Grids.Grid = { cols: 3, rows: 3 };
  expect(l1.getNeighbours(g, { x: 2, y: 2 })).toStrictEqual([
    [`n`, { x: 2, y: 1 }], // From pos 8 to 5
  ]);
  expect(l1.getNeighbours(g, { x: 2, y: 1 })).toStrictEqual([
    [`n`, { x: 2, y: 0 }], // From pos 5 to 2
  ]);
  expect(l1.getNeighbours(g, { x: 2, y: 0 })).toStrictEqual([
    [`n`, { x: 1, y: 2 }], // From pos 2 to 7
  ]);
  expect(l1.getNeighbours(g, { x: 0, y: 0 })).toStrictEqual([
    [`n`, { x: 2, y: 2 }], // From pos 0 to 8
  ]);

  // Jagged grid
  // 0, 1
  // 2, 3, 4
  // 5
  const jg: Grids.JaggedGrid = { rows: [2, 3, 1] };
  expect(l1.getNeighbours(jg, { x: 2, y: 1 })).toStrictEqual([
    [`n`, { x: 1, y: 1 }], // From pos 4 to pos 3
  ]);
  expect(l1.getNeighbours(jg, { x: 1, y: 1 })).toStrictEqual([
    [`n`, { x: 1, y: 0 }], // From pos 3 to to pos 1
  ]);
  expect(l1.getNeighbours(jg, { x: 1, y: 0 })).toStrictEqual([
    [`n`, { x: 0, y: 2 }], // From pos 1 to pos 5
  ]);
  expect(l1.getNeighbours(jg, { x: 0, y: 2 })).toStrictEqual([
    [`n`, { x: 0, y: 1 }], // From pos 5 to pos 2
  ]);
  expect(l1.getNeighbours(jg, { x: 0, y: 1 })).toStrictEqual([
    [`n`, { x: 0, y: 0 }], // From pos 2 to pos 0
  ]);
  expect(l1.getNeighbours(jg, { x: 0, y: 0 })).toStrictEqual([
    [`n`, { x: 2, y: 1 }], // From pos 0 to pos 4
  ]);
});

it(`step-row`, () => {
  const grid: Grids.Grid = { cols: 5, rows: 5 };
  const start = { x: 2, y: 2 };
  /**
   * 0,0 1,0 2,0 3,0 4,0
   * 0,1 1,1 2,1 3,1 4,1
   * 0,2 1,2 2,2 3,2 4,2
   * 0,3 1,3 2,3 3,3 4,3
   * 0,4 1,4 2,4 3,4 4,4
   */
  const visitor = Grids.Visit.create(`row`);
  const stepper = Grids.Visit.stepper(grid, visitor, start);
  // const visitorSteps = (steps: number) => Grids.Visit.step(grid, start, steps, visitor);

  expect(() => stepper(0.5)).toThrow();
  expect(() => stepper(Number.NaN)).toThrow();

  // Go nowhere
  expect(stepper(0)).toEqual({ x: 2, y: 2 });

  // Easy case - move to right
  expect(stepper(1)).toEqual({ x: 3, y: 2 });

  // Wrap to next/prev row
  expect(stepper(3)).toEqual({ x: 1, y: 3 });
  expect(stepper(-3)).toEqual({ x: 3, y: 2 });

  // To corners
  expect(stepper(12)).toEqual({ x: 0, y: 0 });
  expect(stepper(-12)).toEqual({ x: 3, y: 2 });

  // Past corners
  expect(stepper(13)).toEqual({ x: 1, y: 0 });
  expect(stepper(-13)).toEqual({ x: 3, y: 2 });

  // Full loop
  expect(stepper(-25)).toEqual({ x: 3, y: 2 });
  expect(stepper(25)).toEqual({ x: 3, y: 2 });

  // Full loop and a bit
  expect(stepper(-30, true)).toEqual({ x: 2, y: 1 });
  expect(stepper(30)).toEqual({ x: 2, y: 2 });
});

it(`step-column`, () => {
  const grid: Grids.Grid = { cols: 5, rows: 5 };
  const start = { x: 2, y: 2 };
  // const visitor = Grids.Visit.create(`column`);

  /**
   * 0,0 1,0 2,0 3,0 4,0
   * 0,1 1,1 2,1 3,1 4,1
   * 0,2 1,2 2,2 3,2 4,2
   * 0,3 1,3 2,3 3,3 4,3
   * 0,4 1,4 2,4 3,4 4,4
   */
  const visitor = Grids.Visit.create(`column`);
  const stepper = Grids.Visit.stepper(grid, visitor, start);

  // const visitorSteps = (steps: number) => Grids.Visit.step(grid, start, steps, visitor);

  expect(() => stepper(0.5)).toThrow();
  expect(() => stepper(Number.NaN)).toThrow();

  // Go nowhere
  expect(stepper(0)).toEqual({ x: 2, y: 2 });

  // Easy case - move down/up
  expect(stepper(1)).toEqual({ x: 2, y: 3 });
  expect(stepper(-1)).toEqual({ x: 2, y: 2 });

  // Wrap to next/prev row
  expect(stepper(3)).toEqual({ x: 3, y: 0 });
  expect(stepper(-3)).toEqual({ x: 2, y: 2 });

  // To corners
  expect(stepper(12)).toEqual({ x: 4, y: 4 });
  expect(stepper(-12)).toEqual({ x: 2, y: 2 });

  // Past corners
  expect(stepper(13)).toEqual({ x: 0, y: 0 });
  expect(stepper(-13)).toEqual({ x: 2, y: 2 });

  // Full loop
  expect(stepper(-25)).toEqual({ x: 2, y: 2 });
  expect(stepper(25)).toEqual({ x: 2, y: 2 });

  // Full loop and a bit
  expect(stepper(-30)).toEqual({ x: 1, y: 2 });
  expect(stepper(30)).toEqual({ x: 2, y: 2 });
});