import { expect, it } from "vitest";
import * as Arrays from '../src/index.js';

it(`compare-to-backward`, () => {
  const d1 = [1, 2, 3, 4, 5];
  const r1a = [...Arrays.compareTo(d1, -1, (a, b) => a - b)];
  expect(r1a).toStrictEqual([1, 1, 1, 1]);

  const d2 = [1, 2, 4, 8, 16];
  const r2 = [...Arrays.compareTo(d2, -1, (a, b) => a - b)];
  expect(r2).toStrictEqual([1, 2, 4, 8]);

  const r3 = [...Arrays.compareTo(d2, -2, (a, b) => a - b)];
  expect(r3).toStrictEqual([3, 6, 12]);
});

it(`compare-to-forward`, () => {
  const d1 = [1, 2, 3, 4, 5];

  const r1 = [...Arrays.compareTo(d1, 1, (a, b) => a - b)];
  expect(r1).toStrictEqual([-1, -1, -1, -1]);

  const d2 = [1, 2, 4, 8, 16];

  const r2 = [...Arrays.compareTo(d2, 2, (a, b) => a - b)];
  expect(r2).toStrictEqual([-3, -6, -12]);
});