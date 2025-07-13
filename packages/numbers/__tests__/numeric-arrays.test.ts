import { expect, describe, test } from 'vitest';
import * as N from '../src/index.js';

describe(`numeric-arrays`, async () => {

  test(`numberArrayCompute`, () => {
    const r1 = N.numberArrayCompute([ 1, 2, 3, 4, 5 ]);
    expect(r1.min).eq(1);
    expect(r1.max).eq(5);
    expect(r1.total).eq(15);
    expect(r1.avg).eq(3);

    const r3 = N.numberArrayCompute([ 5, 6, 7 ]);
    expect(r3.avg).eq(6);
    expect(r3.total).eq(18);
    expect(r3.min).eq(5);
    expect(r3.max).eq(7);
  });


});