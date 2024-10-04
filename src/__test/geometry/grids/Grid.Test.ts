import test from 'ava';
import * as Grids from '../../../geometry/grid/index.js';

test(`values`, t => {
  const readable: Grids.GridReadable<string> = {
    get: (cell, wrap) => {
      return `${ cell.x }-${ cell.y }`
    },
    cols: 3,
    rows: 3
  }

  const r1 = [ ...Grids.values(readable, Grids.As.rows(readable)) ];
  t.deepEqual(r1, [
    [ `0-0`, `1-0`, `2-0` ],
    [ `0-1`, `1-1`, `2-1` ],
    [ `0-2`, `1-2`, `2-2` ]
  ])

})

test(`index-from-cell`, (t) => {
  const wrap = `undefined`;
  const grid = { cols: 2, rows: 2 };
  t.is(Grids.indexFromCell(grid, { x: 1, y: 1 }, wrap), 3);
  t.is(Grids.indexFromCell(grid, { x: 0, y: 0 }, wrap), 0);
  t.is(Grids.indexFromCell(grid, { x: 0, y: 1 }, wrap), 2);

  // Wrapping: undefined
  t.falsy(Grids.indexFromCell(grid, { x: -1, y: 1 }, `undefined`));
  t.falsy(Grids.indexFromCell(grid, { x: 1, y: -1 }, `undefined`));
  t.falsy(Grids.indexFromCell(grid, { x: 2, y: 1 }, `undefined`));
  t.falsy(Grids.indexFromCell(grid, { x: 1, y: 2 }, `undefined`));

  // Wrapping: stop
  t.is(Grids.indexFromCell(grid, { x: -1, y: 1 }, `stop`), 2);
  t.is(Grids.indexFromCell(grid, { x: 1, y: -1 }, `stop`), 1);
  t.is(Grids.indexFromCell(grid, { x: 2, y: 1 }, `stop`), 3);
  t.is(Grids.indexFromCell(grid, { x: 1, y: 2 }, `stop`), 3);

  // Wrapping: unbounded
  t.throws(() => Grids.indexFromCell(grid, { x: -1, y: 1 }, `unbounded`));
  t.throws(() => Grids.indexFromCell(grid, { x: 1, y: -1 }, `unbounded`));
  t.throws(() => Grids.indexFromCell(grid, { x: 2, y: 1 }, `unbounded`));
  t.throws(() => Grids.indexFromCell(grid, { x: 1, y: 2 }, `unbounded`));


  // Wrapping: wrap
  const grid2 = { cols: 3, rows: 3 };
  t.is(Grids.indexFromCell(grid2, { x: -1, y: 1 }, `wrap`), 5);
  t.is(Grids.indexFromCell(grid2, { x: 1, y: -1 }, `wrap`), 7);
  t.is(Grids.indexFromCell(grid2, { x: 3, y: 1 }, `wrap`), 3);
  t.is(Grids.indexFromCell(grid2, { x: 1, y: 3 }, `wrap`), 1);
});

test(`cell-from-index`, (t) => {
  t.deepEqual(Grids.cellFromIndex(2, 3), { x: 1, y: 1 });
  t.deepEqual(Grids.cellFromIndex(2, 0), { x: 0, y: 0 });
  t.deepEqual(Grids.cellFromIndex(2, 2), { x: 0, y: 1 });
});

test(`get-vector-from-cardinal`, (t) => {
  t.deepEqual(Grids.getVectorFromCardinal(`e`), { x: 1, y: 0 });
  t.deepEqual(Grids.getVectorFromCardinal(``), { x: 0, y: 0 });
  t.deepEqual(Grids.getVectorFromCardinal(`ne`), { x: 1, y: -1 });
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







