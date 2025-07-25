import { expect, describe, test } from 'vitest';
import * as N from '../src/index.js';

test(`flip`, () => {
  expect(N.flip(1)).toEqual(0);
  expect(N.flip(0.5)).toEqual(0.5);
  expect(N.flip(0.75)).toEqual(0.25);
  expect(N.flip(0)).toEqual(1);
});
