import { expect, describe, test } from 'vitest';
import * as N from '../src/normalise.js';

test(`stream`, () => {
  // Since each value is getting higher
  const s1 = N.streamWithContext();
  const r1 = [ 0, 1, 2, 3, 4 ].map(v => s1.seen(v));
  expect(r1).toStrictEqual([ 1, 1, 1, 1, 1 ]);
  expect(s1.min).toBe(0);
  expect(s1.max).toBe(4);
  expect(s1.range).toBe(4);

  // Since each value is getting lower
  const s2 = N.streamWithContext();
  const r2 = [ 4, 3, 2, 1, 0 ].map(v => s2.seen(v));
  expect(r2).toStrictEqual([ 1, 0, 0, 0, 0 ]);
  expect(s2.min).toBe(0);
  expect(s2.max).toBe(4);
  expect(s2.range).toBe(4);

  const s3 = N.streamWithContext();
  const r3 = [ 20, 10, 40, 5, 30 ].map(v => s3.seen(v));
  expect(r3).toStrictEqual([ 1, 0, 1, 0, 0.7142857142857143 ]);
  expect(s3.min).toBe(5);
  expect(s3.max).toBe(40);
  expect(s3.range).toBe(35);
});

test(`array`, () => {
  // Since each value is getting higher
  const s1 = N.arrayWithContext([ 0, 1, 2, 3, 4 ]);
  expect(s1.original).toStrictEqual([ 0, 1, 2, 3, 4 ]);
  expect(s1.values).toStrictEqual([ 0, 0.25, 0.5, 0.75, 1 ]);
  expect(s1.min).toBe(0);
  expect(s1.max).toBe(4);
  expect(s1.range).toBe(4);

  // Since each value is getting lower
  const s2 = N.arrayWithContext([ 4, 3, 2, 1, 0 ]);
  expect(s2.original).toStrictEqual([ 4, 3, 2, 1, 0 ]);
  expect(s2.values).toStrictEqual([ 1, 0.75, 0.5, 0.25, 0 ]);
  expect(s2.min).toBe(0);
  expect(s2.max).toBe(4);
  expect(s2.range).toBe(4);

  const s3 = N.arrayWithContext([ 20, 10, 40, 5, 30 ]);
  expect(s3.original).toStrictEqual([ 20, 10, 40, 5, 30 ]);
  expect(s3.values).toStrictEqual([ 0.42857142857142855, 0.14285714285714285, 1, 0, 0.7142857142857143 ]);
  expect(s3.min).toBe(5);
  expect(s3.max).toBe(40);
  expect(s3.range).toBe(35);
});