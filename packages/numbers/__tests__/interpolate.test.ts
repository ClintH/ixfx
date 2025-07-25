/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect } from 'vitest';
import { interpolate, interpolateAngle, interpolatorStepped } from '../src/interpolate.js';
import { round } from '../src/round.js';

test(`basic`, () => {
  expect(interpolate(0, 0, 100)).toBe(0);
  expect(interpolate(0.5, 0, 100)).toBe(50);
  expect(interpolate(1, 0, 100)).toBe(100);

  expect(interpolate(0, 100, 0)).toBe(100);
  expect(interpolate(0.5, 100, 0)).toBe(50);
  expect(interpolate(1, 100, 0)).toBe(0);

  expect(interpolate(0, 0, -100)).toBe(0);
  expect(interpolate(0.5, 0, -100)).toBe(-50);
  expect(interpolate(1, 0, -100)).toBe(-100);

  const f = interpolate(0, 100);
  expect(typeof f === `function`).toBe(true);
  expect(f(0)).toBe(0);
  expect(f(0.5)).toBe(50);
  expect(f(1)).toBe(100);

  // @ts-expect-error
  expect(() => interpolate(false)).toThrow();

});

// test(`angle`, () => {
//   expect(interpolateAngle(1, 0, Math.PI * 2)).toEqual(0);
//   expect(interpolateAngle(0, 0, Math.PI * 2)).toEqual(0);
//   expect(interpolateAngle(0.5, 0, Math.PI * 2)).toEqual(Math.PI);

// })
test(`limits`, () => {
  // Default is clamp
  expect(interpolate(1.1, 0, 100)).toBe(100);
  expect(interpolate(-0.1, 0, 100)).toBe(0);

  // Clamp
  expect(interpolate(1.1, 0, 100, { limits: `clamp` })).toBe(100);
  expect(interpolate(-0.1, 0, 100, { limits: `clamp` })).toBe(0);

  // Ignore
  expect(Math.floor(interpolate(1.1, 0, 100, { limits: `ignore` }))).toBe(110);
  expect(interpolate(-0.1, 0, 100, { limits: `ignore` })).toBe(-10);
  expect(interpolate(0, 0, 100, { limits: `ignore` })).toBe(0);
  expect(interpolate(0.5, 0, 100, { limits: `ignore` })).toBe(50);
  expect(interpolate(1, 0, 100, { limits: `ignore` })).toBe(100);

  // Wrap
  expect(Math.floor(interpolate(1.1, 0, 100, { limits: `wrap` }))).toBe(10);
  expect(Math.floor(interpolate(-0.1, 0, 100, { limits: `wrap` }))).toBe(90);
  expect(interpolate(0, 0, 100, { limits: `wrap` })).toBe(0);
  expect(interpolate(0.5, 0, 100, { limits: `wrap` })).toBe(50);
  expect(interpolate(1, 0, 100, { limits: `wrap` })).toBe(100);
});

test(`interpolatorStepped`, () => {
  const v = interpolatorStepped(0.1, 100, 200);
  const values: number[] = [];
  while (true) {
    const value = v();
    values.push(value);
    if (value >= 200) break;
  }
  expect(values.length).toBe(12);
  expect(values[ 0 ]).toBe(100);
  expect(values.at(-1)).toBe(200);

  // Re-targeting
  const v2 = interpolatorStepped(0.1, 100, 200);
  expect(v2()).toBe(100); // amount: 0
  expect(v2(300)).toBe(120); // amount: 0.1 of 200 (100->300)
  expect(v2()).toBe(140); // amount: 0.2 of 200 (100->300)
  expect(round(1, v2(1, 0))).toBe(0.3); // amount: 0.3 of 1 (0-1)
});
