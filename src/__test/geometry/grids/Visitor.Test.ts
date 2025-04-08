import expect from 'expect';
import * as Grids from '../../../geometry/grid/index.js';
import { As } from '../../../geometry/grid/index.js';

test(`step-row`, () => {
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
  //const visitorSteps = (steps: number) => Grids.Visit.step(grid, start, steps, visitor);

  expect(() => stepper(0.5)).toThrow();
  expect(() => stepper(NaN)).toThrow();

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

test(`step-column`, () => {
  const grid: Grids.Grid = { cols: 5, rows: 5 };
  const start = { x: 2, y: 2 };
  //const visitor = Grids.Visit.create(`column`);

  /**
   * 0,0 1,0 2,0 3,0 4,0
   * 0,1 1,1 2,1 3,1 4,1
   * 0,2 1,2 2,2 3,2 4,2
   * 0,3 1,3 2,3 3,3 4,3
   * 0,4 1,4 2,4 3,4 4,4
   */
  const visitor = Grids.Visit.create(`column`);
  const stepper = Grids.Visit.stepper(grid, visitor, start);

  //const visitorSteps = (steps: number) => Grids.Visit.step(grid, start, steps, visitor);

  expect(() => stepper(0.5)).toThrow();
  expect(() => stepper(NaN)).toThrow();

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