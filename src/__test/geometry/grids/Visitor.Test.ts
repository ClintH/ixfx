import test from 'ava';
import * as Grids from '../../../geometry/grid/index.js';
import { As } from '../../../geometry/grid/index.js';

test(`step-row`, (t) => {
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

  t.throws(() => stepper(0.5));
  t.throws(() => stepper(NaN));

  // Go nowhere
  t.deepEqual(stepper(0), { x: 2, y: 2 });

  // Easy case - move to right
  t.deepEqual(stepper(1), { x: 3, y: 2 });

  // Wrap to next/prev row
  t.deepEqual(stepper(3), { x: 1, y: 3 });
  t.deepEqual(stepper(-3), { x: 3, y: 2 });

  // To corners
  t.deepEqual(stepper(12), { x: 0, y: 0 });
  t.deepEqual(stepper(-12), { x: 3, y: 2 });

  // Past corners
  t.deepEqual(stepper(13), { x: 1, y: 0 });
  t.deepEqual(stepper(-13), { x: 3, y: 2 });

  // Full loop
  t.deepEqual(stepper(-25), { x: 3, y: 2 });
  t.deepEqual(stepper(25), { x: 3, y: 2 });

  // Full loop and a bit
  t.deepEqual(stepper(-30, true), { x: 2, y: 1 });
  t.deepEqual(stepper(30), { x: 2, y: 2 });
});

test(`step-column`, (t) => {
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

  t.throws(() => stepper(0.5));
  t.throws(() => stepper(NaN));

  // Go nowhere
  t.deepEqual(stepper(0), { x: 2, y: 2 });

  // Easy case - move down/up
  t.deepEqual(stepper(1), { x: 2, y: 3 });
  t.deepEqual(stepper(-1), { x: 2, y: 2 });

  // Wrap to next/prev row
  t.deepEqual(stepper(3), { x: 3, y: 0 });
  t.deepEqual(stepper(-3), { x: 2, y: 2 });

  // To corners
  t.deepEqual(stepper(12), { x: 4, y: 4 });
  t.deepEqual(stepper(-12), { x: 2, y: 2 });

  // Past corners
  t.deepEqual(stepper(13), { x: 0, y: 0 });
  t.deepEqual(stepper(-13), { x: 2, y: 2 });

  // Full loop
  t.deepEqual(stepper(-25), { x: 2, y: 2 });
  t.deepEqual(stepper(25), { x: 2, y: 2 });

  // Full loop and a bit
  t.deepEqual(stepper(-30), { x: 1, y: 2 });
  t.deepEqual(stepper(30), { x: 2, y: 2 });
});