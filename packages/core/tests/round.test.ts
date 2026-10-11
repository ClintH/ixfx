import { expect, it } from 'vitest';
import { round } from '../src/util/round.js';

it(`rounds down by default`, () => {
  const r = round(2);
  expect(r(10.12355)).toBe(10.12);
  expect(r(10.129)).toBe(10.12);
});

it(`roundUp rounds toward ceiling`, () => {
  const r = round(2, true);
  expect(r(10.121)).toBe(10.13);
  expect(r(10.1)).toBe(10.1);
});

it(`direct value form`, () => {
  expect(round(2, 10.129)).toBe(10.12);
  expect(round(2, 10.121, true)).toBe(10.13);
});

it(`zero decimal places uses Math.round`, () => {
  expect(round(0)(10.4)).toBe(10);
  expect(round(0)(10.6)).toBe(11);
});

it(`invalid decimal places throws`, () => {
  expect(() => round(-1)(10)).toThrow();
  expect(() => round(0.5 as any)(10)).toThrow();
});
