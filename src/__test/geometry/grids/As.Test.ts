import test from 'ava';
import * as Grids from '../../../geometry/grid/index.js';
import { As } from '../../../geometry/grid/index.js';

test(`rows`, (t) => {
  const g = { rows: 3, cols: 3 };
  const expected = [
    [ { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 } ],
    [ { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 } ],
    [ { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 } ]
  ];
  const r = [ ...As.rows(g, { x: 0, y: 0 }) ];
  t.deepEqual(r, expected);
});

test(`columns`, (t) => {
  const g = { rows: 3, cols: 3 };
  const expected = [
    [ { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 } ],
    [ { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 } ],
    [ { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 } ]
  ];
  const r = [ ...As.columns(g, { x: 0, y: 0 }) ];
  t.deepEqual(r, expected);
});