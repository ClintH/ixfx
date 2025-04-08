import { test, expect } from 'vitest';
import * as Random from '@ixfxfun/random';
import * as Numbers from '@ixfxfun/numbers';

test(`averageWeighted-gaussian`, () => {
  const r = Numbers.round(2, Numbers.averageWeighted([ 1, 2, 3 ], Random.gaussian)); // 2.0
  expect(r).toBe(2.01);
});


test('weight-gaussian', () => {
  // Six items
  let r1 = Numbers.weight([ 1, 1, 1, 1, 1, 1 ], Random.gaussian);
  r1 = r1.map(r => Numbers.round(2, r));
  expect(r1).toEqual([ 0.02, 0.24, 0.85, 0.85, 0.24, 0.02 ]);
});