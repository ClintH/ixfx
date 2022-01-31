import * as Grid from '../../geometry/Grid.js';

test(`getVectorFromCardinal`, () => {
  expect(Grid.getVectorFromCardinal(`e`)).toEqual({x: 1, y: 0});
  expect(Grid.getVectorFromCardinal(``)).toEqual({x: 0, y: 0});
  expect(Grid.getVectorFromCardinal(`ne`)).toEqual({x: 1, y: -1});
});

test(`offset`, () => {
  const grid: Grid.Grid = {cols: 5, rows: 5};
  const origin = {x: 2, y: 2};

  expect(Grid.offset(grid, origin, {x: 1, y: 1})).toEqual({x: 3, y: 3});
  expect(Grid.offset(grid, origin, {x: -1, y: -1})).toEqual({x: 1, y: 1});
  expect(Grid.offset(grid, origin, {x: 0, y: 0})).toEqual({x: 2, y: 2});

  // Wrap from top left corner to bottom-right
  expect(Grid.offset(grid, {x: 0, y: 0}, {x: -1, y: -1},  `wrap`)).toEqual({x: 4, y: 4});
  expect(Grid.offset(grid, {x: 0, y: 0}, {x: -5, y: -5},  `wrap`)).toEqual({x: 0, y: 0});

  // Wrap from bottom right to top-left
  expect(Grid.offset(grid, {x: 4, y: 4}, {x: 1, y: 1}, `wrap`)).toEqual({x: 0, y: 0});
  expect(Grid.offset(grid, {x: 4, y: 4}, {x: 10, y: 10},  `wrap`)).toEqual({x: 4, y: 4});

  // Wrap along horizontal & vertical axis
  expect(Grid.offset(grid, origin, {x: -5, y: 0},  `wrap`)).toEqual({x: 2, y: 2});
  expect(Grid.offset(grid, origin, {x: 0, y: -10},  `wrap`)).toEqual({x: 2, y: 2});

  // Stop at edge
  expect(Grid.offset(grid, origin, {x: -5, y: 0},  `stop`)).toEqual({x: 0, y: 2});
  expect(Grid.offset(grid, origin, {x: 0, y: 5},  `stop`)).toEqual({x: 2, y: 4});
  expect(Grid.offset(grid, origin, {x: -5, y: -5},  `stop`)).toEqual({x: 0, y: 0});


  // Undefined
  expect(Grid.offset(grid, origin, {x: -5, y: 0},  `undefined`)).toBeUndefined();
  expect(Grid.offset(grid, origin, {x: 0, y: 5},  `undefined`)).toBeUndefined();
  expect(Grid.offset(grid, origin, {x: -5, y: -5},  `undefined`)).toBeUndefined();

});

test(`offsetStepsByRow`, () => {
  const grid: Grid.Grid = {cols: 5, rows: 5};
  const origin = {x: 2, y: 2};

  expect(() => Grid.offsetStepsByRow(grid, origin, 0.5)).toThrow();
  expect(() => Grid.offsetStepsByRow(grid, origin, NaN)).toThrow();

  // Go nowhere
  expect(Grid.offsetStepsByRow(grid, origin, 0)).toEqual({x: 2, y: 2});

  // Easy case - move to right
  expect(Grid.offsetStepsByRow(grid, origin, 1)).toEqual({x: 3, y: 2});

  // Wrap to new row
  expect(Grid.offsetStepsByRow(grid, origin, 3)).toEqual({x: 0, y: 3});

  // Wrap back a row
  expect(Grid.offsetStepsByRow(grid, origin, -3)).toEqual({x: 4, y: 1});

  // Should hit bottom-right
  expect(Grid.offsetStepsByRow(grid, origin, 12)).toEqual({x: 4, y: 4});

  // Test walking one step past bottom-right corner
  expect(Grid.offsetStepsByRow(grid, origin, 13,  `wrap`)).toEqual({x: 0, y: 0});
  expect(Grid.offsetStepsByRow(grid, origin, 13,  `undefined`)).toBeUndefined();
  expect(Grid.offsetStepsByRow(grid, origin, 13,  `stop`)).toEqual({x: 4, y: 4});

  // Test walking back one step from top-left corner
  expect(Grid.offsetStepsByRow(grid, origin, -13,  `wrap`)).toEqual({x: 4, y: 4});
  expect(Grid.offsetStepsByRow(grid, origin, -13,  `undefined`)).toBeUndefined();
  expect(Grid.offsetStepsByRow(grid, origin,  -13,  `stop`)).toEqual({x: 0, y: 0});

  // Test full walk cycle
  expect(Grid.offsetStepsByRow(grid, origin,  -25,  `wrap`)).toEqual({x: 2, y: 2});
  expect(Grid.offsetStepsByRow(grid, origin, 25,  `wrap`)).toEqual({x: 2, y: 2});
});


test(`offsetStepsByCol`, () => {
  const grid: Grid.Grid = {cols: 5, rows: 5};
  const origin = {x: 2, y: 2};

  expect(() => Grid.offsetStepsByCol(grid, origin, 0.5)).toThrow();
  expect(() => Grid.offsetStepsByCol(grid, origin,  NaN)).toThrow();

  // Go nowhere
  expect(Grid.offsetStepsByCol(grid, origin, 0)).toEqual({x: 2, y: 2});

  // Easy case - move down
  expect(Grid.offsetStepsByCol(grid, origin, 1)).toEqual({x: 2, y: 3});

  // Wrap to new col
  expect(Grid.offsetStepsByCol(grid, origin, 3)).toEqual({x: 3, y: 0});

  // Wrap back a row
  expect(Grid.offsetStepsByCol(grid, origin, -3)).toEqual({x: 1, y: 4});

  // Should hit bottom-right
  expect(Grid.offsetStepsByCol(grid, origin, 12)).toEqual({x: 4, y: 4});

  // Top-right
  expect(Grid.offsetStepsByCol(grid, origin, -12)).toEqual({x: 0, y: 0});

  // Test walking one step past bottom-right corner
  expect(Grid.offsetStepsByCol(grid, origin, 13,  `wrap`)).toEqual({x: 0, y: 0});
  expect(Grid.offsetStepsByCol(grid, origin, 13,  `undefined`)).toBeUndefined();
  expect(Grid.offsetStepsByCol(grid, origin, 13,  `stop`)).toEqual({x: 4, y: 4});

  // Test walking back one step from top-left corner
  expect(Grid.offsetStepsByCol(grid, origin, -13,  `wrap`)).toEqual({x: 4, y: 4});
  expect(Grid.offsetStepsByCol(grid, origin, -13,  `undefined`)).toBeUndefined();
  expect(Grid.offsetStepsByCol(grid, origin, -13,  `stop`)).toEqual({x: 0, y: 0});

  // Test full walk cycle
  expect(Grid.offsetStepsByCol(grid, origin, -25,  `wrap`)).toEqual({x: 2, y: 2});
  expect(Grid.offsetStepsByCol(grid, origin, 25,  `wrap`)).toEqual({x: 2, y: 2});
});
