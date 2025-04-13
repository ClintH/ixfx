import { test, expect, describe } from 'vitest';
import * as Modulation from '../src/index.js';
import * as Numbers from '@ixfxfun/numbers';

describe(`weighted`, () => {
  test(`averageWeighted-gaussian`, () => {
    const r = Numbers.round(2, Numbers.averageWeighted([ 1, 2, 3 ], Modulation.gaussian())); // 2.0
    expect(r).toBe(2.01);
  });


  test('static', () => {
    let r1 = Numbers.weight([ 1, 1, 1, 1, 1, 1 ], (_relativePos) => 0.5);
    r1 = r1.map(r => Numbers.round(2, r));
    expect(r1).toEqual([ 0.5, 0.5, 0.5, 0.5, 0.5, 0.5 ]);
  });

  test('relative', () => {
    let r1 = Numbers.weight([ 1, 1, 1, 1, 1, 1 ], (relativePos) => relativePos);
    r1 = r1.map(r => Numbers.round(2, r));
    expect(r1).toEqual([ 0, 0.2, 0.4, 0.6, 0.8, 1 ]);
  });

  test('gaussian', () => {
    let r1 = Numbers.weight([ 1, 1, 1, 1, 1, 1 ], Modulation.gaussian());
    r1 = r1.map(r => Numbers.round(2, r));
    expect(r1).toEqual([ 0.02, 0.24, 0.85, 0.85, 0.24, 0.02 ]);
  });
});
