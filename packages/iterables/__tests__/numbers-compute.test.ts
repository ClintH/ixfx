import { expect, describe, test } from 'vitest';
import * as N from '../src/index.js';
import { count } from '@ixfx/core';


describe(`numbers-compute`, async () => {

  test(`numbersCompute-1`, () => {
    const r1 = N.numbersCompute([ 1, 2, 3, 4, 5 ]);
    expect(r1.min).toBe(1);
    expect(r1.max).toBe(5);
    expect(r1.total).toBe(15);
    expect(r1.avg).toBe(3);

    const r1Gen = N.numbersCompute(count(5, 1));
    expect(r1Gen.avg).toBe(r1.avg);
    expect(r1Gen.min).toBe(r1.min);
    expect(r1Gen.max).toBe(r1.max);
    expect(r1Gen.total).toBe(r1.total);
  });

  test(`numbersCompute-0`, () => {
    const startIndex = 5;

    const r2 = N.numbersCompute([ 6, 7, 8, 9, 10 ]);
    expect(r2.count).toBe(5);

    const r2Gen = N.numbersCompute(count(5, 6));
    expect(r2Gen.count).toBe(5);

    const r2StartAt5 = N.numbersCompute([ 6, 7, 8, 9, 10 ]);
    expect(r2StartAt5.count).toBe(5);

    expect(r2Gen).toEqual(r2);
    expect(r2StartAt5).toEqual(r2);

    // console.log(r2StartAt5);
    // console.log(r2);
    // expect(r2.avg).toBe(r2StartAt5.avg);
    // expect(r2.min).toBe(r2StartAt5.min);
    // expect(r2.max).toBe(r2StartAt5.max);
    // expect(r2.total).toBe(r2StartAt5.total);

    // expect(r2.avg).toBe(r2Gen.avg);
    // expect(r2.min).toBe(r2Gen.min);
    // expect(r2.max).toBe(r2Gen.max);
    // expect(r2.total).toBe(r2Gen.total);


  });

  test(`computeAverage`, () => {
    const a = [ 1 ];
    expect(N.computeAverage(a)).toBe(1);

    const b = [ 1, 2, 3, 4, 5 ];
    expect(N.computeAverage(b)).toBe(3);

    const c = [ -5, 5 ];
    expect(N.computeAverage(c)).toBe(0);

    const d = [ 1, 0, null, undefined, NaN ];
    // @ts-ignore
    expect(N.computeAverage(d, { nonNumbers: `nan` })).NaN;
    // @ts-ignore
    expect(N.computeAverage(d, { nonNumbers: `ignore` })).toBe(0.5);

    const e = [ 1, 1.4, 0.9, 0.1 ];
    expect(N.computeAverage(e)).toBe(0.85);
  });
});