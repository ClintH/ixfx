import test from 'ava';
import * as Grids from '../../../geometry/grid/index.js';
import { Array1d } from '../../../geometry/grid/index.js';
import { By } from '../../../geometry/grid/index.js';

test(`wrap`, t => {
  const data = [
    1, 2, 3,
    4, 5, 6
  ];
  const w = Array1d.wrap(data, 3);
  t.is(w.cols, 3);
  t.is(w.rows, 2);
  t.is(w.get({ x: 0, y: 0 }), 1);
  t.is(w.get({ x: 0, y: 1 }), 4);

  w.set(10, { x: 0, y: 0 });
  w.set(20, { x: 2, y: 1 });
  t.deepEqual(w.array, [ 10, 2, 3, 4, 5, 20 ]);
  t.false(data === w.array);

});

test(`wrap-mutable`, t => {
  const data = [
    1, 2, 3,
    4, 5, 6
  ];
  const w = Array1d.wrapMutable(data, 3);
  t.is(w.cols, 3);
  t.is(w.rows, 2);
  t.is(w.get({ x: 0, y: 0 }), 1);
  t.is(w.get({ x: 0, y: 1 }), 4);

  w.set(10, { x: 0, y: 0 });
  w.set(20, { x: 2, y: 1 });
  t.deepEqual(w.array, [ 10, 2, 3, 4, 5, 20 ]);
  t.true(data === w.array);
});

test(`visit`, (t) => {
  const data = [ 1, 2, 3, 4, 5, 6 ];
  const cols = 2;

  const g = Array1d.wrap(data, cols);
  const it = Grids.values(g, Grids.As.rows(g));

  // Test default visitor: left-to-right, top-to-bottom
  const r1 = Array.from(it);
  //t.deepEqual(r1, [ [ 1, 0 ], [ 2, 1 ], [ 3, 2 ], [ 4, 3 ], [ 5, 4 ], [ 6, 5 ] ]);
  t.deepEqual(r1, [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ] ]);
});

test(`access`, t => {
  const arr = [
    1, 2, 3,
    4, 5, 6
  ]
  const a = Array1d.access(arr, 3);
  t.is(a({ x: 0, y: 0 }, `undefined`), 1);
  t.is(a({ x: 2, y: 1 }, `undefined`), 6);

  t.falsy(a({ x: 3, y: 2 }, `undefined`));
  t.falsy(a({ x: 0, y: -1 }, `undefined`));
});

test(`mutate`, t => {
  const arr = [
    1, 2, 3,
    4, 5, 6
  ]
  const a = Array1d.setMutate(arr, 3);
  a(10, { x: 0, y: 0 }, `undefined`);
  t.deepEqual(arr, [
    10, 2, 3,
    4, 5, 6
  ]);

  a(20, { x: 2, y: 1 }, `undefined`);
  t.deepEqual(arr, [
    10, 2, 3,
    4, 5, 20
  ]);
  t.throws(() => a(10, { x: 3, y: 2 }, `undefined`))
  t.throws(() => a(10, { x: 3, y: -2 }, `undefined`))

});