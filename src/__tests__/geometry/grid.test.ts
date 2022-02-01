import * as Grid from '../../geometry/Grid.js';

test(`getVectorFromCardinal`, () => {
  expect(Grid.getVectorFromCardinal(`e`)).toEqual({x: 1, y: 0});
  expect(Grid.getVectorFromCardinal(``)).toEqual({x: 0, y: 0});
  expect(Grid.getVectorFromCardinal(`ne`)).toEqual({x: 1, y: -1});
});

// test(`offsetCardinal`, () => {
//   const grid: Grid.Grid = {cols: 10, rows: 10};

//   // Middle of last row.
//   expect(Grid.offsetCardinals(grid, {x: 5, y: 9}, 5, `wrap`)).toEqual({
//     e: {x: 0, y: 9},
//     w: {x: 0, y: 9},
//     ne: {x: 0, y: 4},
//     nw: {x:0, y:4},
//     n: {x: 5, y: 4},
//     s: {x: 5, y: 4},
//     se: {x:0, y:4},
//     sw:{x: 0, y: 9}
//   });
// });

test(`offset`, () => {
  const grid: Grid.Grid = {cols: 5, rows: 5};
  const start = {x: 2, y: 2};

  expect(Grid.offset(grid, start, {x: 1, y: 1})).toEqual({x: 3, y: 3});
  expect(Grid.offset(grid, start, {x: -1, y: -1})).toEqual({x: 1, y: 1});
  expect(Grid.offset(grid, start, {x: 0, y: 0})).toEqual({x: 2, y: 2});

  // Wrap from top left corner to bottom-right
  expect(Grid.offset(grid, {x: 0, y: 0}, {x: -1, y: -1},  `wrap`)).toEqual({x: 4, y: 4});
  expect(Grid.offset(grid, {x: 0, y: 0}, {x: -5, y: -5},  `wrap`)).toEqual({x: 0, y: 0});

  // Wrap from bottom right to top-left
  expect(Grid.offset(grid, {x: 4, y: 4}, {x: 1, y: 1}, `wrap`)).toEqual({x: 0, y: 0});
  expect(Grid.offset(grid, {x: 4, y: 4}, {x: 10, y: 10},  `wrap`)).toEqual({x: 4, y: 4});

  // Wrap along horizontal & vertical axis
  expect(Grid.offset(grid, start, {x: -5, y: 0},  `wrap`)).toEqual({x: 2, y: 2});
  expect(Grid.offset(grid, start, {x: 0, y: -10},  `wrap`)).toEqual({x: 2, y: 2});

  // Stop at edge
  expect(Grid.offset(grid, start, {x: -5, y: 0},  `stop`)).toEqual({x: 0, y: 2});
  expect(Grid.offset(grid, start, {x: 0, y: 5},  `stop`)).toEqual({x: 2, y: 4});
  expect(Grid.offset(grid, start, {x: -5, y: -5},  `stop`)).toEqual({x: 0, y: 0});


  // Undefined
  expect(Grid.offset(grid, start, {x: -5, y: 0},  `undefined`)).toBeUndefined();
  expect(Grid.offset(grid, start, {x: 0, y: 5},  `undefined`)).toBeUndefined();
  expect(Grid.offset(grid, start, {x: -5, y: -5},  `undefined`)).toBeUndefined();

});

test(`visitForRow`, () => {
  const grid: Grid.Grid = {cols: 5, rows: 5};
  const start = {x: 2, y: 2};

  const visitor = Grid.visitorRow;

  const visitorSteps = (steps:number) => Grid.visitFor(grid, start, steps, visitor);

  expect(() => visitorSteps(0.5)).toThrow();
  expect(() => visitorSteps(NaN)).toThrow();

  // Go nowhere
  expect(visitorSteps(0)).toEqual({x: 2, y: 2});

  // Easy case - move to right
  expect(visitorSteps(1)).toEqual({x: 3, y: 2});

  // Wrap to next/prev row
  expect(visitorSteps(3)).toEqual({x: 0, y: 3});
  expect(visitorSteps(-3)).toEqual({x: 4, y: 1});

  // To corners
  expect(visitorSteps(12)).toEqual({x: 4, y: 4});
  expect(visitorSteps(-12)).toEqual({x: 0, y: 0});

  // Past corners
  expect(visitorSteps(13)).toEqual({x: 0, y: 0});
  expect(visitorSteps(-13)).toEqual({x: 4, y: 4});
 
  // Full loop
  expect(visitorSteps(-25)).toEqual({x: 2, y: 2});
  expect(visitorSteps(25)).toEqual({x: 2, y: 2});

  // Full loop and a bit
  expect(visitorSteps(-30)).toEqual({x: 2, y: 1});
  expect(visitorSteps(30)).toEqual({x: 2, y: 3});
});

test(`visitForCol`, () => {
  const grid: Grid.Grid = {cols: 5, rows: 5};
  const start = {x: 2, y: 2};

  const visitor = Grid.visitorColumn;

  const visitorSteps = (steps:number) => Grid.visitFor(grid, start, steps, visitor);

  expect(() => visitorSteps(0.5)).toThrow();
  expect(() => visitorSteps(NaN)).toThrow();

  // Go nowhere
  expect(visitorSteps(0)).toEqual({x: 2, y: 2});

  // Easy case - move down/up
  expect(visitorSteps(1)).toEqual({x: 2, y: 3});
  expect(visitorSteps(-1)).toEqual({x: 2, y: 1});

  // Wrap to next/prev row
  expect(visitorSteps(3)).toEqual({x: 3, y: 0});
  expect(visitorSteps(-3)).toEqual({x: 1, y: 4});

  // To corners
  expect(visitorSteps(12)).toEqual({x: 4, y: 4});
  expect(visitorSteps(-12)).toEqual({x: 0, y: 0});

  // Past corners
  expect(visitorSteps(13)).toEqual({x: 0, y: 0});
  expect(visitorSteps(-13)).toEqual({x: 4, y: 4});
 
  // Full loop
  expect(visitorSteps(-25)).toEqual({x: 2, y: 2});
  expect(visitorSteps(25)).toEqual({x: 2, y: 2});

  // Full loop and a bit
  expect(visitorSteps(-30)).toEqual({x: 1, y: 2});
  expect(visitorSteps(30)).toEqual({x: 3, y: 2});
});

