import { expect, test } from '@jest/globals';
import * as Grids from '../../geometry/Grid.js';

test(`indexFromCell`, () => {
  expect(Grids.indexFromCell(2, { x: 1, y: 1 })).toEqual(3);
  expect(Grids.indexFromCell(2, { x: 0, y: 0 })).toEqual(0);
  expect(Grids.indexFromCell(2, { x: 0, y: 1 })).toEqual(2);
});

test(`cellFromIndex`, () => {
  expect(Grids.cellFromIndex(2, 3)).toEqual({ x:1, y:1 });
  expect(Grids.cellFromIndex(2, 0)).toEqual({ x: 0, y: 0 });
  expect(Grids.cellFromIndex(2, 2)).toEqual({ x: 0, y: 1 });
});

test(`visitArray`, () => {
  const data = [1, 2, 3, 4, 5, 6];
  const cols = 2;

  // Test data checking
  // @ts-ignore
  expect(() => Array.from(Grids.visitArray(null, 2))).toThrow();
  // @ts-ignore
  expect(() => Array.from(Grids.visitArray(undefined, 2))).toThrow();
  // @ts-ignore
  expect(() => Array.from(Grids.visitArray(`string`, 2))).toThrow();
  expect(() => Array.from(Grids.visitArray([], -1))).toThrow();

  // Test default visitor: left-to-right, top-to-bottom
  const r1 = Array.from(Grids.visitArray(data, cols));
  expect(r1).toEqual([[1, 0], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5]]);


});


test(`cells`, () => {
  const g = { rows: 3, cols: 3 };
  const expected = [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x:2, y:0 },
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x:2, y:1 },
    { x: 0, y: 2 }, { x: 1, y: 2 }, { x:2, y:2 }
  ];
  const r = [...Grids.cells(g, { x:0, y:0 })];
  expect(r).toEqual(expected);
});

test(`rows`, () => {
  const g = { rows: 3, cols: 3 };
  const expected = [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x:2, y:0 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x:2, y:1 }],
    [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x:2, y:2 }]
  ];
  const r = [...Grids.rows(g, { x:0, y:0 })];
  expect(r).toEqual(expected);
});

test(`getVectorFromCardinal`, () => {
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

test(`offset`, () => {
  const grid:Grids.Grid = { cols: 5, rows: 5 };
  const start = { x: 2, y: 2 };

  expect(Grids.offset(grid, start, { x: 1, y: 1 })).toEqual({ x: 3, y: 3 });
  expect(Grids.offset(grid, start, { x: -1, y: -1 })).toEqual({ x: 1, y: 1 });
  expect(Grids.offset(grid, start, { x: 0, y: 0 })).toEqual({ x: 2, y: 2 });

  // Wrap from top left corner to bottom-right
  expect(Grids.offset(grid, { x: 0, y: 0 }, { x: -1, y: -1 },  `wrap`)).toEqual({ x: 4, y: 4 });
  expect(Grids.offset(grid, { x: 0, y: 0 }, { x: -5, y: -5 },  `wrap`)).toEqual({ x: 0, y: 0 });

  // Wrap from bottom right to top-left
  expect(Grids.offset(grid, { x: 4, y: 4 }, { x: 1, y: 1 }, `wrap`)).toEqual({ x: 0, y: 0 });
  expect(Grids.offset(grid, { x: 4, y: 4 }, { x: 10, y: 10 },  `wrap`)).toEqual({ x: 4, y: 4 });

  // Wrap along horizontal & vertical axis
  expect(Grids.offset(grid, start, { x: -5, y: 0 },  `wrap`)).toEqual({ x: 2, y: 2 });
  expect(Grids.offset(grid, start, { x: 0, y: -10 },  `wrap`)).toEqual({ x: 2, y: 2 });

  // Stop at edge
  expect(Grids.offset(grid, start, { x: -5, y: 0 },  `stop`)).toEqual({ x: 0, y: 2 });
  expect(Grids.offset(grid, start, { x: 0, y: 5 },  `stop`)).toEqual({ x: 2, y: 4 });
  expect(Grids.offset(grid, start, { x: -5, y: -5 },  `stop`)).toEqual({ x: 0, y: 0 });


  // Undefined
  expect(Grids.offset(grid, start, { x: -5, y: 0 },  `undefined`)).toBeUndefined();
  expect(Grids.offset(grid, start, { x: 0, y: 5 },  `undefined`)).toBeUndefined();
  expect(Grids.offset(grid, start, { x: -5, y: -5 },  `undefined`)).toBeUndefined();

});

test(`visitForRow`, () => {
  const grid:Grids.Grid = { cols: 5, rows: 5 };
  const start = { x: 2, y: 2 };

  const visitor = Grids.visitorRow;

  const visitorSteps = (steps:number) => Grids.visitFor(grid, start, steps, visitor);

  expect(() => visitorSteps(0.5)).toThrow();
  expect(() => visitorSteps(NaN)).toThrow();

  // Go nowhere
  expect(visitorSteps(0)).toEqual({ x: 2, y: 2 });

  // Easy case - move to right
  expect(visitorSteps(1)).toEqual({ x: 3, y: 2 });

  // Wrap to next/prev row
  expect(visitorSteps(3)).toEqual({ x: 0, y: 3 });
  expect(visitorSteps(-3)).toEqual({ x: 4, y: 1 });

  // To corners
  expect(visitorSteps(12)).toEqual({ x: 4, y: 4 });
  expect(visitorSteps(-12)).toEqual({ x: 0, y: 0 });

  // Past corners
  expect(visitorSteps(13)).toEqual({ x: 0, y: 0 });
  expect(visitorSteps(-13)).toEqual({ x: 4, y: 4 });
 
  // Full loop
  expect(visitorSteps(-25)).toEqual({ x: 2, y: 2 });
  expect(visitorSteps(25)).toEqual({ x: 2, y: 2 });

  // Full loop and a bit
  expect(visitorSteps(-30)).toEqual({ x: 2, y: 1 });
  expect(visitorSteps(30)).toEqual({ x: 2, y: 3 });
});

test(`visitForCol`, () => {
  const grid:Grids.Grid = { cols: 5, rows: 5 };
  const start = { x: 2, y: 2 };

  const visitor = Grids.visitorColumn;

  const visitorSteps = (steps:number) => Grids.visitFor(grid, start, steps, visitor);

  expect(() => visitorSteps(0.5)).toThrow();
  expect(() => visitorSteps(NaN)).toThrow();

  // Go nowhere
  expect(visitorSteps(0)).toEqual({ x: 2, y: 2 });

  // Easy case - move down/up
  expect(visitorSteps(1)).toEqual({ x: 2, y: 3 });
  expect(visitorSteps(-1)).toEqual({ x: 2, y: 1 });

  // Wrap to next/prev row
  expect(visitorSteps(3)).toEqual({ x: 3, y: 0 });
  expect(visitorSteps(-3)).toEqual({ x: 1, y: 4 });

  // To corners
  expect(visitorSteps(12)).toEqual({ x: 4, y: 4 });
  expect(visitorSteps(-12)).toEqual({ x: 0, y: 0 });

  // Past corners
  expect(visitorSteps(13)).toEqual({ x: 0, y: 0 });
  expect(visitorSteps(-13)).toEqual({ x: 4, y: 4 });
 
  // Full loop
  expect(visitorSteps(-25)).toEqual({ x: 2, y: 2 });
  expect(visitorSteps(25)).toEqual({ x: 2, y: 2 });

  // Full loop and a bit
  expect(visitorSteps(-30)).toEqual({ x: 1, y: 2 });
  expect(visitorSteps(30)).toEqual({ x: 3, y: 2 });
});

