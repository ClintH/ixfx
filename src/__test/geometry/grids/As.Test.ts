import expect from 'expect';
import * as Grids from '../../../geometry/grid/index.js';
import { As } from '../../../geometry/grid/index.js';

test(`rows`, () => {
  const g = { rows: 3, cols: 3 };
  const expected = [
    [ { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 } ],
    [ { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 } ],
    [ { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 } ]
  ];
  const r = [ ...As.rows(g, { x: 0, y: 0 }) ];
  expect(r).toEqual(expected);
});

test(`columns`, () => {
  const g = { rows: 3, cols: 3 };
  const expected = [
    [ { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 } ],
    [ { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 } ],
    [ { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 } ]
  ];
  const r = [ ...As.columns(g, { x: 0, y: 0 }) ];
  expect(r).toEqual(expected);
});