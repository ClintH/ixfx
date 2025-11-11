import { expect, describe, test } from 'vitest';
import * as Stdev from '../src/standard-deviation.js';

test(`standard-deviation`, () => {
  const raw = [ 0, 0, 2.49, 0, 1.83, 2.08, 1.15, 1.55, 2.64, 0, 1.3, 0, 1.12, 0, 1.66, 1.92, 0, 1.22, 1.9, 0, 1.45, 0, 1.6, 1.3, 1.58, 0, 3.33, 1.2, 1.66, 0, 2.03 ];
  const expectedStdDevelopment = 0.962122429783483;
  expect(Stdev.standardDeviation(raw)).toEqual(expectedStdDevelopment);
});