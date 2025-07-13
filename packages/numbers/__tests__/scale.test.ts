import { test, expect } from 'vitest';
import { scale } from '../src/scale.js';

test(`scale`, () => {
  expect(scale(50, 0, 100, 0, 1)).toBe(0.5);
  expect(scale(100, 0, 100, 0, 1)).toBe(1);
  expect(scale(0, 0, 100, 0, 1)).toBe(0);

  expect(scale(0, 0, 1, -5, 5)).toBe(-5);
  expect(scale(0.5, 0, 1, -5, 5)).toBe(0);
  expect(scale(1, 0, 1, -5, 5)).toBe(5);

});
