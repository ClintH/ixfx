import expect from 'expect';
import * as Grids from '../../../geometry/grid/index.js';

test(`values`, () => {
  const readable: Grids.GridReadable<string> = {
    get: (cell, wrap) => {
      return `${ cell.x }-${ cell.y }`
    },
    cols: 3,
    rows: 3
  }

  const r1 = [ ...Grids.values(readable, Grids.As.rows(readable)) ];
  expect(r1).toEqual([
    [ `0-0`, `1-0`, `2-0` ],
    [ `0-1`, `1-1`, `2-1` ],
    [ `0-2`, `1-2`, `2-2` ]
  ])

})

test(`index-from-cell`, () => {
  const wrap = `undefined`;
  const grid = { cols: 2, rows: 2 };
  expect(Grids.indexFromCell(grid, { x: 1, y: 1 }, wrap)).toBe(3);
  expect(Grids.indexFromCell(grid, { x: 0, y: 0 }, wrap)).toBe(0);
  expect(Grids.indexFromCell(grid, { x: 0, y: 1 }, wrap)).toBe(2);

  // Wrapping: undefined
  expect(Grids.indexFromCell(grid, { x: -1, y: 1 }, `undefined`)).toBeFalsy();
  expect(Grids.indexFromCell(grid, { x: 1, y: -1 }, `undefined`)).toBeFalsy();
  expect(Grids.indexFromCell(grid, { x: 2, y: 1 }, `undefined`)).toBeFalsy();
  expect(Grids.indexFromCell(grid, { x: 1, y: 2 }, `undefined`)).toBeFalsy();

  // Wrapping: stop
  expect(Grids.indexFromCell(grid, { x: -1, y: 1 }, `stop`)).toBe(2);
  expect(Grids.indexFromCell(grid, { x: 1, y: -1 }, `stop`)).toBe(1);
  expect(Grids.indexFromCell(grid, { x: 2, y: 1 }, `stop`)).toBe(3);
  expect(Grids.indexFromCell(grid, { x: 1, y: 2 }, `stop`)).toBe(3);

  // Wrapping: unbounded
  expect(() => Grids.indexFromCell(grid, { x: -1, y: 1 }, `unbounded`)).toThrow();
  expect(() => Grids.indexFromCell(grid, { x: 1, y: -1 }, `unbounded`)).toThrow();
  expect(() => Grids.indexFromCell(grid, { x: 2, y: 1 }, `unbounded`)).toThrow();
  expect(() => Grids.indexFromCell(grid, { x: 1, y: 2 }, `unbounded`)).toThrow();


  // Wrapping: wrap
  const grid2 = { cols: 3, rows: 3 };
  expect(Grids.indexFromCell(grid2, { x: -1, y: 1 }, `wrap`)).toBe(5);
  expect(Grids.indexFromCell(grid2, { x: 1, y: -1 }, `wrap`)).toBe(7);
  expect(Grids.indexFromCell(grid2, { x: 3, y: 1 }, `wrap`)).toBe(3);
  expect(Grids.indexFromCell(grid2, { x: 1, y: 3 }, `wrap`)).toBe(1);
});

test(`cell-from-index`, () => {
  expect(Grids.cellFromIndex(2, 3)).toEqual({ x: 1, y: 1 });
  expect(Grids.cellFromIndex(2, 0)).toEqual({ x: 0, y: 0 });
  expect(Grids.cellFromIndex(2, 2)).toEqual({ x: 0, y: 1 });
});

test(`get-vector-from-cardinal`, () => {
  expect(Grids.getVectorFromCardinal(`e`)).toEqual({ x: 1, y: 0 });
  expect(Grids.getVectorFromCardinal(``)).toEqual({ x: 0, y: 0 });
  expect(Grids.getVectorFromCardinal(`ne`)).toEqual({ x: 1, y: -1 });
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







