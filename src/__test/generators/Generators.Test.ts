/* eslint-disable */
import test from 'ava';
import { count, stringSegmentsFromEnd, stringSegmentsFromStart } from '../../generators/index.js';

test(`stringSegmentsFromStart`, t => {
  const result = [ ...stringSegmentsFromStart(`a.b.c.d`, `.`) ];
  t.deepEqual(result, [
    `d`,
    `c.d`,
    `b.c.d`,
    `a.b.c.d`
  ]);
});

test(`stringSegmentsFromEnd`, t => {
  const result = [ ...stringSegmentsFromEnd(`a.b.c.d`, `.`) ];
  t.deepEqual(result, [
    `a.b.c.d`,
    `b.c.d`,
    `c.d`,
    `d`
  ]);
});

test(`count`, (t) => {
  t.throws(() => [ ...count(0.5) ]);
  t.throws(() => [ ...count(Number.NaN) ]);

  t.like([ ...count(5) ], [ 0, 1, 2, 3, 4 ]);
  t.like([ ...count(5, 5) ], [ 5, 6, 7, 8, 9 ]);
  t.like([ ...count(5, -5) ], [ -5, -4, -3, -2, -1 ]);

  t.like([ ...count(1) ], [ 0 ]);
  t.is([ ...count(0) ].length, 0);
  t.like([ ...count(-5) ], [ 0, -1, -2, -3, -4 ]);
  t.like([ ...count(-5, 5) ], [ 5, 4, 3, 2, 1 ]);
  t.like([ ...count(-5, -5) ], [ -5, -6, -7, -8, -9 ]);
});
