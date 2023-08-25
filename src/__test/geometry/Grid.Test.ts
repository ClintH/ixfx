import test from 'ava';
import * as Grids from '../../geometry/Grid.js';

test(`indexFromCell`, (t) => {
  const wrap = `undefined`;
  const grid = {cols: 2, rows: 2};
  t.is(Grids.indexFromCell(grid, {x: 1, y: 1}, wrap), 3);
  t.is(Grids.indexFromCell(grid, {x: 0, y: 0}, wrap), 0);
  t.is(Grids.indexFromCell(grid, {x: 0, y: 1}, wrap), 2);

  // Wrapping: undefined
  t.falsy(Grids.indexFromCell(grid, {x: -1, y: 1}, `undefined`));
  t.falsy(Grids.indexFromCell(grid, {x: 1, y: -1}, `undefined`));
  t.falsy(Grids.indexFromCell(grid, {x: 2, y: 1}, `undefined`));
  t.falsy(Grids.indexFromCell(grid, {x: 1, y: 2}, `undefined`));

  // Wrapping: stop
  t.is(Grids.indexFromCell(grid, {x: -1, y: 1}, `stop`), 2);
  t.is(Grids.indexFromCell(grid, {x: 1, y: -1}, `stop`), 1);
  t.is(Grids.indexFromCell(grid, {x: 2, y: 1}, `stop`), 3);
  t.is(Grids.indexFromCell(grid, {x: 1, y: 2}, `stop`), 3);

  // Wrapping: unbounded
  t.throws(() => Grids.indexFromCell(grid, {x: -1, y: 1}, `unbounded`));
  t.throws(() => Grids.indexFromCell(grid, {x: 1, y: -1}, `unbounded`));
  t.throws(() => Grids.indexFromCell(grid, {x: 2, y: 1}, `unbounded`));
  t.throws(() => Grids.indexFromCell(grid, {x: 1, y: 2}, `unbounded`));


  // Wrapping: wrap
  const grid2 = {cols: 3, rows: 3};
  t.is(Grids.indexFromCell(grid2, {x: -1, y: 1}, `wrap`), 5);
  t.is(Grids.indexFromCell(grid2, {x: 1, y: -1}, `wrap`), 7);
  t.is(Grids.indexFromCell(grid2, {x: 3, y: 1}, `wrap`), 3);
  t.is(Grids.indexFromCell(grid2, {x: 1, y: 3}, `wrap`), 1);

});

test(`cellFromIndex`, (t) => {
  t.deepEqual(Grids.cellFromIndex(2, 3), {x: 1, y: 1});
  t.deepEqual(Grids.cellFromIndex(2, 0), {x: 0, y: 0});
  t.deepEqual(Grids.cellFromIndex(2, 2), {x: 0, y: 1});
});

test(`visitArray`, (t) => {
  const data = [1, 2, 3, 4, 5, 6];
  const cols = 2;

  // Test data checking
  // @ts-ignore
  t.throws(() => Array.from(Grids.visitArray(null, 2)));
  // @ts-ignore
  t.throws(() => Array.from(Grids.visitArray(undefined, 2)));
  // @ts-ignore
  t.throws(() => Array.from(Grids.visitArray(`string`, 2)));
  t.throws(() => Array.from(Grids.visitArray([], -1)));

  // Test default visitor: left-to-right, top-to-bottom
  const r1 = Array.from(Grids.visitArray(data, cols));
  t.deepEqual(r1, [[1, 0], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5]]);
});

test(`cells`, (t) => {
  const g = {rows: 3, cols: 3};
  const expected = [
    {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0},
    {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1},
    {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}
  ];
  const r = [...Grids.cells(g, {x: 0, y: 0})];
  t.deepEqual(r, expected);
});

test(`rows`, (t) => {
  const g = {rows: 3, cols: 3};
  const expected = [
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],
    [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}],
    [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}]
  ];
  const r = [...Grids.rows(g, {x: 0, y: 0})];
  t.deepEqual(r, expected);
});

test(`getVectorFromCardinal`, (t) => {
  t.deepEqual(Grids.getVectorFromCardinal(`e`), {x: 1, y: 0});
  t.deepEqual(Grids.getVectorFromCardinal(``), {x: 0, y: 0});
  t.deepEqual(Grids.getVectorFromCardinal(`ne`), {x: 1, y: -1});
});

// test(`offsetCardinal`, () => {
//   const grid: Grids.Grid = {cols: 10, rows: 10};

//   // Middle of last row.
//   expect(Grids.offsetCardinals(grid, {x: 5, y: 9}, 5, `wrap`)).toEqual({
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

test(`offset`, (t) => {
  const grid: Grids.Grid = {cols: 5, rows: 5};
  const start = {x: 2, y: 2};

  t.deepEqual(Grids.offset(grid, start, {x: 1, y: 1}), {x: 3, y: 3});
  t.deepEqual(Grids.offset(grid, start, {x: -1, y: -1}), {x: 1, y: 1});
  t.deepEqual(Grids.offset(grid, start, {x: 0, y: 0}), {x: 2, y: 2});

  // Wrap from top left corner to bottom-right
  t.deepEqual(Grids.offset(grid, {x: 0, y: 0}, {x: -1, y: -1}, `wrap`), {x: 4, y: 4});
  t.deepEqual(Grids.offset(grid, {x: 0, y: 0}, {x: -5, y: -5}, `wrap`), {x: 0, y: 0});

  // Wrap from bottom right to top-left
  t.deepEqual(Grids.offset(grid, {x: 4, y: 4}, {x: 1, y: 1}, `wrap`), {x: 0, y: 0});
  t.deepEqual(Grids.offset(grid, {x: 4, y: 4}, {x: 10, y: 10}, `wrap`), {x: 4, y: 4});

  // Wrap along horizontal & vertical axis
  t.deepEqual(Grids.offset(grid, start, {x: -5, y: 0}, `wrap`), {x: 2, y: 2});
  t.deepEqual(Grids.offset(grid, start, {x: 0, y: -10}, `wrap`), {x: 2, y: 2});

  // Stop at edge
  t.deepEqual(Grids.offset(grid, start, {x: -5, y: 0}, `stop`), {x: 0, y: 2});
  t.deepEqual(Grids.offset(grid, start, {x: 0, y: 5}, `stop`), {x: 2, y: 4});
  t.deepEqual(Grids.offset(grid, start, {x: -5, y: -5}, `stop`), {x: 0, y: 0});


  // Undefined
  t.falsy(Grids.offset(grid, start, {x: -5, y: 0}, `undefined`));
  t.falsy(Grids.offset(grid, start, {x: 0, y: 5}, `undefined`));
  t.falsy(Grids.offset(grid, start, {x: -5, y: -5}, `undefined`));
});

test(`visitForRow`, (t) => {
  const grid: Grids.Grid = {cols: 5, rows: 5};
  const start = {x: 2, y: 2};

  const visitor = Grids.visitorRow;

  const visitorSteps = (steps: number) => Grids.visitFor(grid, start, steps, visitor);

  t.throws(() => visitorSteps(0.5));
  t.throws(() => visitorSteps(NaN));

  // Go nowhere
  t.deepEqual(visitorSteps(0), {x: 2, y: 2});

  // Easy case - move to right
  t.deepEqual(visitorSteps(1), {x: 3, y: 2});

  // Wrap to next/prev row
  t.deepEqual(visitorSteps(3), {x: 0, y: 3});
  t.deepEqual(visitorSteps(-3), {x: 4, y: 1});

  // To corners
  t.deepEqual(visitorSteps(12), {x: 4, y: 4});
  t.deepEqual(visitorSteps(-12), {x: 0, y: 0});

  // Past corners
  t.deepEqual(visitorSteps(13), {x: 0, y: 0});
  t.deepEqual(visitorSteps(-13), {x: 4, y: 4});

  // Full loop
  t.deepEqual(visitorSteps(-25), {x: 2, y: 2});
  t.deepEqual(visitorSteps(25), {x: 2, y: 2});

  // Full loop and a bit
  t.deepEqual(visitorSteps(-30), {x: 2, y: 1});
  t.deepEqual(visitorSteps(30), {x: 2, y: 3});
});

test(`visitForCol`, (t) => {
  const grid: Grids.Grid = {cols: 5, rows: 5};
  const start = {x: 2, y: 2};

  const visitor = Grids.visitorColumn;

  const visitorSteps = (steps: number) => Grids.visitFor(grid, start, steps, visitor);

  t.throws(() => visitorSteps(0.5));
  t.throws(() => visitorSteps(NaN));

  // Go nowhere
  t.deepEqual(visitorSteps(0), {x: 2, y: 2});

  // Easy case - move down/up
  t.deepEqual(visitorSteps(1), {x: 2, y: 3});
  t.deepEqual(visitorSteps(-1), {x: 2, y: 1});

  // Wrap to next/prev row
  t.deepEqual(visitorSteps(3), {x: 3, y: 0});
  t.deepEqual(visitorSteps(-3), {x: 1, y: 4});

  // To corners
  t.deepEqual(visitorSteps(12), {x: 4, y: 4});
  t.deepEqual(visitorSteps(-12), {x: 0, y: 0});

  // Past corners
  t.deepEqual(visitorSteps(13), {x: 0, y: 0});
  t.deepEqual(visitorSteps(-13), {x: 4, y: 4});

  // Full loop
  t.deepEqual(visitorSteps(-25), {x: 2, y: 2});
  t.deepEqual(visitorSteps(25), {x: 2, y: 2});

  // Full loop and a bit
  t.deepEqual(visitorSteps(-30), {x: 1, y: 2});
  t.deepEqual(visitorSteps(30), {x: 3, y: 2});
});

