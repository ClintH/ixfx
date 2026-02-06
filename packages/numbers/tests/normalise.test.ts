import { expect, describe, test } from 'vitest';
import * as N from '../src/normalise.js';
import { mean } from '../src/average.js';
import { standardDeviation } from '../src/standard-deviation.js';

describe('normalise', () => {
  test(`minmax-stream`, () => {
  // Since each value is getting higher
  const s1 = N.MinMax.streamWithContext();
  const r1 = [ 0, 1, 2, 3, 4 ].map(v => s1.seen(v));
  expect(s1.min).toBe(0);
  expect(s1.max).toBe(4);
  expect(s1.range).toBe(4);
  expect(r1).toStrictEqual([ 1, 1, 1, 1, 1 ]);

  // Since each value is getting lower
  const s2 = N.MinMax.streamWithContext();

  const r2 = [ 4, 3, 2, 1, 0 ].map(v => s2.seen(v));
  expect(s2.min).toBe(0);
  expect(s2.max).toBe(4);
  expect(s2.range).toBe(4);
  expect(r2).toStrictEqual([ 1, 0, 0, 0, 0 ]);

  const s3 = N.MinMax.streamWithContext();
  const r3 = [ 20, 10, 40, 5, 30 ].map(v => s3.seen(v));
  expect(s3.min).toBe(5);
  expect(s3.max).toBe(40);
  expect(s3.range).toBe(35);
  expect(r3).toStrictEqual([ 1, 0, 1, 0, 0.7142857142857143 ]);
});

test(`minmax-array`, () => {
  // Since each value is getting higher
  const s1 = N.MinMax.arrayWithContext([ 0, 1, 2, 3, 4 ]);
  expect(s1.min).toBe(0);
  expect(s1.max).toBe(4);
  expect(s1.range).toBe(4);
  expect(s1.original).toStrictEqual([ 0, 1, 2, 3, 4 ]);
  expect(s1.values).toStrictEqual([ 0, 0.25, 0.5, 0.75, 1 ]);

  // Since each value is getting lower
  const s2 = N.MinMax.arrayWithContext([ 4, 3, 2, 1, 0 ]);
  expect(s2.min).toBe(0);
  expect(s2.max).toBe(4);
  expect(s2.range).toBe(4);
  expect(s2.original).toStrictEqual([ 4, 3, 2, 1, 0 ]);
  expect(s2.values).toStrictEqual([ 1, 0.75, 0.5, 0.25, 0 ]);

  const s3 = N.MinMax.arrayWithContext([ 20, 10, 40, 5, 30 ]);
  expect(s3.min).toBe(5);
  expect(s3.max).toBe(40);
  expect(s3.range).toBe(35);
  expect(s3.original).toStrictEqual([ 20, 10, 40, 5, 30 ]);
  expect(s3.values).toStrictEqual([ 0.42857142857142855, 0.14285714285714285, 1, 0, 0.7142857142857143 ]);
});

  test(`zscore-single`, () => {
    const raw = [ 0, 0, 2.49, 0, 1.83, 2.08, 1.15, 1.55, 2.64, 0, 1.3, 0, 1.12, 0, 1.66, 1.92, 0, 1.22, 1.9, 0, 1.45, 0, 1.6, 1.3, 1.58, 0, 3.33, 1.2, 1.66, 0, 2.03 ];
    const expectedStandardize = [ -1.173816142, -1.173816142, 1.414212079, -1.173816142, 0.728228695, 0.988070886, 0.021457936, 0.437205441, 1.570117393, -1.173816142, 0.17736325, -1.173816142, -0.009723127, -1.173816142, 0.551536005, 0.821771884, -1.173816142, 0.094213749, 0.800984508, -1.173816142, 0.333268565, -1.173816142, 0.489173879, 0.17736325, 0.468386504, -1.173816142, 2.28728184, 0.073426374, 0.551536005, -1.173816142, 0.936102447 ];

    const calcMean = mean(raw);
    const calcStdDevelopment = standardDeviation(raw);
    const fn = N.ZScore.compute(calcMean, calcStdDevelopment);
    for (let index = 0; index < raw.length; index++) {
      const c = fn(raw[ index ]);
      expect(c.toPrecision(7)).toEqual(expectedStandardize[ index ].toPrecision(7));
    }
  });

  test('array with all strategies', () => {
    const data = [1, 2, 3, 4, 5];
    
    const minmax = N.array('minmax', data);
    expect(minmax).toEqual([0, 0.25, 0.5, 0.75, 1]);
    
    const zscore = N.array('zscore', data);
    expect(zscore[2]).toBeCloseTo(0, 5);
    
    const robust = N.array('robust', data);
    expect(robust.length).toBe(5);
  });

  test('throws on unknown strategy', () => {
    expect(() => N.array('unknown' as any, [1, 2, 3])).toThrow();
    expect(() => N.stream('unknown' as any)).toThrow();
  });

  test('Robust handles edge cases', () => {
    const ctx = N.Robust.arrayWithContext([1, 2, 3, 4, 5]);
    expect(ctx.median).toBe(3);
    expect(ctx.original).toEqual([1, 2, 3, 4, 5]);
  });

  test('ZScore with forced values', () => {
    const ctx = N.ZScore.arrayWithContext([1, 2, 3], { 
      meanForced: 0, 
      standardDeviationForced: 1 
    });
    expect(ctx.mean).toBe(0);
    expect(ctx.standardDeviation).toBe(1);
  });
});