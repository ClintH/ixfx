import { expect, describe, test } from 'vitest';
import * as N from '../src/index.js';

test(`is-close-to-any`, () => {
  const c1 = N.isCloseToAny(0.1, 10, 20, 30, 40);
  expect(c1(10)).toBeTruthy();
  expect(c1(9)).toBeTruthy();
  expect(c1(21)).toBeTruthy();
  expect(c1(19)).toBeTruthy();
  expect(c1(30)).toBeTruthy();
  expect(c1(39)).toBeTruthy();

  expect(c1(50)).toBeFalsy();
  expect(c1(0)).toBeFalsy();

  expect(c1(0, 50, 10)).toBeTruthy();
});
