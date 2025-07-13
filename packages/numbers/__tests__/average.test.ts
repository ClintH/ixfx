import { expect, describe, test } from 'vitest';
import * as N from '../src/index.js';

test(`average`, () => {
  const a = [ 1 ];
  expect(N.average(a)).toBe(1);

  const b = [ 1, 2, 3, 4, 5 ];
  expect(N.average(b)).toBe(3);

  const c = [ -5, 5 ];
  expect(N.average(c)).toBe(0);

  const d = [ 1, 0, null, undefined, NaN ];
  // @ts-ignore
  expect(N.average(d)).toBe(0.5);

  const e = [ 1, 1.4, 0.9, 0.1 ];
  expect(N.average(e)).toBe(0.85);
});
