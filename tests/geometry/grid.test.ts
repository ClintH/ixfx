import * as Grid from '../../src/geometry/Grid.js';

test('getVectorFromCardinal', () => {
  expect(Grid.getVectorFromCardinal(Grid.CardinalDirection.East)).toEqual({x: 1, y: 0});
  expect(Grid.getVectorFromCardinal(Grid.CardinalDirection.None)).toEqual({x: 0, y: 0});
  expect(Grid.getVectorFromCardinal(Grid.CardinalDirection.NorthEast)).toEqual({x: 1, y: -1});
});

test('offset', () => {
  let grid: Grid.Grid = {cols: 5, rows: 5};
  let start = {x: 2, y: 2};

  expect(Grid.offset(grid, {x: 1, y: 1}, start)).toEqual({x: 3, y: 3});
  expect(Grid.offset(grid, {x: -1, y: -1}, start)).toEqual({x: 1, y: 1});
  expect(Grid.offset(grid, {x: 0, y: 0}, start)).toEqual({x: 2, y: 2});

  // Wrap from top left corner to bottom-right
  expect(Grid.offset(grid, {x: -1, y: -1}, {x: 0, y: 0}, Grid.BoundsLogic.Wrap)).toEqual({x: 4, y: 4});
  expect(Grid.offset(grid, {x: -5, y: -5}, {x: 0, y: 0}, Grid.BoundsLogic.Wrap)).toEqual({x: 0, y: 0});

  // Wrap from bottom right to top-left
  expect(Grid.offset(grid, {x: 1, y: 1}, {x: 4, y: 4}, Grid.BoundsLogic.Wrap)).toEqual({x: 0, y: 0});
  expect(Grid.offset(grid, {x: 10, y: 10}, {x: 4, y: 4}, Grid.BoundsLogic.Wrap)).toEqual({x: 4, y: 4});

  // Wrap along horizontal & vertical axis
  expect(Grid.offset(grid, {x: -5, y: 0}, start, Grid.BoundsLogic.Wrap)).toEqual({x: 2, y: 2});
  expect(Grid.offset(grid, {x: 0, y: -10}, start, Grid.BoundsLogic.Wrap)).toEqual({x: 2, y: 2});

  // Stop at edge
  expect(Grid.offset(grid, {x: -5, y: 0}, start, Grid.BoundsLogic.Stop)).toEqual({x: 0, y: 2});
  expect(Grid.offset(grid, {x: 0, y: 5}, start, Grid.BoundsLogic.Stop)).toEqual({x: 2, y: 4});
  expect(Grid.offset(grid, {x: -5, y: -5}, start, Grid.BoundsLogic.Stop)).toEqual({x: 0, y: 0});


  // Undefined
  expect(Grid.offset(grid, {x: -5, y: 0}, start, Grid.BoundsLogic.Undefined)).toBeUndefined();
  expect(Grid.offset(grid, {x: 0, y: 5}, start, Grid.BoundsLogic.Undefined)).toBeUndefined();
  expect(Grid.offset(grid, {x: -5, y: -5}, start, Grid.BoundsLogic.Undefined)).toBeUndefined();

});

test('offsetStepsByRow', () => {
  let grid: Grid.Grid = {cols: 5, rows: 5};
  let start = {x: 2, y: 2};

  expect(() => Grid.offsetStepsByRow(grid, 0.5, start)).toThrow();
  expect(() => Grid.offsetStepsByRow(grid, NaN, start)).toThrow();

  // Go nowhere
  expect(Grid.offsetStepsByRow(grid, 0, start)).toEqual({x: 2, y: 2});

  // Easy case - move to right
  expect(Grid.offsetStepsByRow(grid, 1, start)).toEqual({x: 3, y: 2});

  // Wrap to new row
  expect(Grid.offsetStepsByRow(grid, 3, start)).toEqual({x: 0, y: 3});

  // Wrap back a row
  expect(Grid.offsetStepsByRow(grid, -3, start)).toEqual({x: 4, y: 1});

  // Should hit bottom-right
  expect(Grid.offsetStepsByRow(grid, 12, start)).toEqual({x: 4, y: 4});

  // Test walking one step past bottom-right corner
  expect(Grid.offsetStepsByRow(grid, 13, start, Grid.BoundsLogic.Wrap)).toEqual({x: 0, y: 0});
  expect(Grid.offsetStepsByRow(grid, 13, start, Grid.BoundsLogic.Undefined)).toBeUndefined();
  expect(Grid.offsetStepsByRow(grid, 13, start, Grid.BoundsLogic.Stop)).toEqual({x: 4, y: 4});

  // Test walking back one step from top-left corner
  expect(Grid.offsetStepsByRow(grid, -13, start, Grid.BoundsLogic.Wrap)).toEqual({x: 4, y: 4});
  expect(Grid.offsetStepsByRow(grid, -13, start, Grid.BoundsLogic.Undefined)).toBeUndefined();
  expect(Grid.offsetStepsByRow(grid, -13, start, Grid.BoundsLogic.Stop)).toEqual({x: 0, y: 0});

  // Test full walk cycle
  expect(Grid.offsetStepsByRow(grid, -25, start, Grid.BoundsLogic.Wrap)).toEqual({x: 2, y: 2});
  expect(Grid.offsetStepsByRow(grid, 25, start, Grid.BoundsLogic.Wrap)).toEqual({x: 2, y: 2});
});


test('offsetStepsByCol', () => {
  let grid: Grid.Grid = {cols: 5, rows: 5};
  let start = {x: 2, y: 2};

  expect(() => Grid.offsetStepsByCol(grid, 0.5, start)).toThrow();
  expect(() => Grid.offsetStepsByCol(grid, NaN, start)).toThrow();

  // Go nowhere
  expect(Grid.offsetStepsByCol(grid, 0, start)).toEqual({x: 2, y: 2});

  // Easy case - move down
  expect(Grid.offsetStepsByCol(grid, 1, start)).toEqual({x: 2, y: 3});

  // Wrap to new col
  expect(Grid.offsetStepsByCol(grid, 3, start)).toEqual({x: 3, y: 0});

  // Wrap back a row
  expect(Grid.offsetStepsByCol(grid, -3, start)).toEqual({x: 1, y: 4});

  // Should hit bottom-right
  expect(Grid.offsetStepsByCol(grid, 12, start)).toEqual({x: 4, y: 4});

  // Top-right
  expect(Grid.offsetStepsByCol(grid, -12, start)).toEqual({x: 0, y: 0});

  // Test walking one step past bottom-right corner
  expect(Grid.offsetStepsByCol(grid, 13, start, Grid.BoundsLogic.Wrap)).toEqual({x: 0, y: 0});
  expect(Grid.offsetStepsByCol(grid, 13, start, Grid.BoundsLogic.Undefined)).toBeUndefined();
  expect(Grid.offsetStepsByCol(grid, 13, start, Grid.BoundsLogic.Stop)).toEqual({x: 4, y: 4});

  // Test walking back one step from top-left corner
  expect(Grid.offsetStepsByCol(grid, -13, start, Grid.BoundsLogic.Wrap)).toEqual({x: 4, y: 4});
  expect(Grid.offsetStepsByCol(grid, -13, start, Grid.BoundsLogic.Undefined)).toBeUndefined();
  expect(Grid.offsetStepsByCol(grid, -13, start, Grid.BoundsLogic.Stop)).toEqual({x: 0, y: 0});

  // Test full walk cycle
  expect(Grid.offsetStepsByCol(grid, -25, start, Grid.BoundsLogic.Wrap)).toEqual({x: 2, y: 2});
  expect(Grid.offsetStepsByCol(grid, 25, start, Grid.BoundsLogic.Wrap)).toEqual({x: 2, y: 2});
});
