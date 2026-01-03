
import { test, expect } from 'vitest';
import * as G from '../src/generate.js';

test(`numericRangeRaw`, () => {
  const t1: number[] = [];
  for (const v of G.numericRangeRaw(1)) {
    t1.push(v);
    if (t1.length === 5) break;
  }
  expect(t1).toStrictEqual([ 0, 1, 2, 3, 4 ]);

  const t2: number[] = [];
  for (const v of G.numericRangeRaw(1, 5)) {
    t2.push(v);
    if (t2.length === 5) break;
  }
  expect(t2).toStrictEqual([ 5, 6, 7, 8, 9 ]);

  const t3 = [ ...G.numericRangeRaw(1, 5, 10) ]
  expect(t3).toStrictEqual([ 5, 6, 7, 8, 9, 10 ]);

  expect(() => [ ...G.numericRangeRaw(-1) ]).toThrow();

});

test(`numericRange`, () => {
  const t1: number[] = [];
  for (const v of G.numericRange(1)) {
    t1.push(v);
    if (t1.length === 5) break;
  }
  expect(t1).toStrictEqual([ 0, 1, 2, 3, 4 ]);

  const t2: number[] = [];
  for (const v of G.numericRange(1, 5)) {
    t2.push(v);
    if (t2.length === 5) break;
  }
  expect(t2).toStrictEqual([ 5, 6, 7, 8, 9 ]);

  const t3 = [ ...G.numericRange(1, 5, 10) ]
  expect(t3).toStrictEqual([ 5, 6, 7, 8, 9, 10 ]);

  expect(() => [ ...G.numericRange(0) ]).toThrow();

  const t4: number[] = [ ...G.numericRange(-1, 5, 0) ]
  expect(t4).toStrictEqual([ 5, 4, 3, 2, 1, 0 ]);

  // Can't do negative interval while start is less than end
  expect(() => [ ...G.numericRange(-1, 0, 10) ]).toThrow();
  // Can't do positive interval while end is less than start
  expect(() => [ ...G.numericRange(1, 10, 0) ]).toThrow();

});

test(`numericPercent`, () => {
  const t0 = [ ...G.numericPercent(1) ]
  expect(t0).toStrictEqual([ 0, 1 ]);

  const t1: number[] = [];
  for (const v of G.numericPercent(0.1)) {
    t1.push(v);
    if (t1.length === 5) break;
  }
  expect(t1).toStrictEqual([ 0, 0.1, 0.2, 0.3, 0.4 ]);


  expect(() => [ ...G.numericPercent(0) ]).toThrow();

});

