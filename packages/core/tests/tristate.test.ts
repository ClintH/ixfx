import type { Tristate } from '../src/tristate.js';
import { expect, it } from 'vitest';
import { comparer } from '../src/tristate.js';

it(`comparer orders yes > maybe > no`, () => {
  const order: Array<[ Tristate, Tristate ]> = [
    [`yes`, `maybe`],
    [`yes`, `no`],
    [`maybe`, `no`],
  ];
  for (const [a, b] of order) {
    expect(comparer(a, b)).toBeLessThan(0);
    expect(comparer(b, a)).toBeGreaterThan(0);
  }
});

it(`comparer: equal values sort as 0`, () => {
  expect(comparer(`yes`, `yes`)).toBe(0);
  expect(comparer(`no`, `no`)).toBe(0);
  expect(comparer(`maybe`, `maybe`)).toBe(0);
});
