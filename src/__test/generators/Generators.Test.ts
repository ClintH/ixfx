/* eslint-disable */
import test from 'ava';
import { count, stringSegmentsEndToEnd, stringSegmentsEndToStart, stringSegmentsStartToStart, stringSegmentsStartToEnd } from '../../generators/index.js';

test(`stringSegmentsEndToStart`, t => {
  const result = [ ...stringSegmentsEndToStart(`a.b.c.d`, `.`) ];
  t.deepEqual(result, [
    `d`,
    `c.d`,
    `b.c.d`,
    `a.b.c.d`
  ]);
});

test(`stringSegmentsStartToEnd`, t => {
  const result = [ ...stringSegmentsStartToEnd(`a.b.c.d`, `.`) ];
  t.deepEqual(result, [
    `a`,
    `a.b`,
    `a.b.c`,
    `a.b.c.d`
  ]);
});

test(`stringSegmentsStartToStart`, t => {
  const result = [ ...stringSegmentsStartToStart(`a.b.c.d`, `.`) ];
  t.deepEqual(result, [
    `a.b.c.d`,
    `a.b.c`,
    `a.b`,
    `a`,
  ]);
});

test(`stringSegmentsEndToEnd`, t => {
  const result = [ ...stringSegmentsEndToEnd(`a.b.c.d`, `.`) ];
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
