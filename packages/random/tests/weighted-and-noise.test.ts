import { test, expect } from 'vitest';
import { weightedIndex } from '../src/weighted-index.js';
import { weighted, weightedSource } from '../src/weighted.js';
import { weightedInteger, weightedIntegerSource } from '../src/weighted-integer.js';
import { minutesMs, minutesMsSource, secondsMs, secondsMsSource } from '../src/time.js';
import { gaussian, gaussianSource } from '../src/gaussian.js';
import { noise2d } from '../src/noise.js';
import { clamp } from '../src/util/clamp.js';

// Deterministic random source cycling through given values
const source = (...values: number[]) => {
  let i = 0;
  return () => values[ i++ % values.length ];
};

test(`weightedIndex`, () => {
  // Distribution boundaries: 0.2 / 0.5 / 0.3
  // weightedIndex returns a generator function; bind the source value
  const at = (v: number) => weightedIndex([ 0.2, 0.5, 0.3 ], () => v)();
  // Cumulative bounds are inclusive on the upper edge
  expect(at(0)).toBe(0);
  expect(at(0.2)).toBe(0);
  expect(at(0.21)).toBe(1);
  expect(at(0.7)).toBe(1);
  expect(at(0.71)).toBe(2);
  expect(at(0.999)).toBe(2);

  // Weightings must total 1
  expect(() => weightedIndex([ 0.5, 0.5 ], () => 0.5)).not.toThrow();
  expect(() => weightedIndex([ 0.2, 0.5 ], () => 0.5)).toThrow(/Weightings should add up to 1/);
});

test(`weighted and weightedSource`, () => {
  // Applies the easing function to the raw source value
  expect(weighted({ easingFunction: (v) => v * 2, source: source(0.25) })).toBe(0.5);
  expect(weighted({ easingFunction: () => 0.9, source: source(0.1) })).toBe(0.9);

  const f = weightedSource({ easingFunction: (v) => 1 - v, source: source(0.3, 0.6) });
  expect(f()).toBe(0.7);
  expect(f()).toBe(0.4);

  // Named easings belong to @ixfx/modulation
  expect(() => weighted({ easing: `quadIn`, easingFunction: (v) => v } as any)).toThrow();
  expect(() => weightedSource({ easingFunction: undefined } as any)).toThrow(/easingFunction/);
});

test(`weightedInteger`, () => {
  // Easing output clamped to 0..1, then scaled to range
  const r = weightedInteger({ min: 20, max: 30, easingFunction: (v) => v, source: source(0.55) });
  expect(r).toBe(25);

  // Easing results outside 0..1 are clamped. NB: clamping to exactly 1
  // can yield 'max' itself (boundary quirk).
  expect(weightedInteger({ min: 0, max: 10, easingFunction: () => 5, source: source(0.5) })).toBe(10);
  expect(weightedInteger({ min: 0, max: 10, easingFunction: () => -5, source: source(0.5) })).toBe(0);
  expect(weightedInteger({ min: 0, max: 10, easingFunction: (v) => v, source: source(0.999) })).toBe(9);

  const gen = weightedIntegerSource({ max: 100, easingFunction: (v) => v * v, source: source(0.5) });
  expect(gen()).toBe(25); // floor(0.25 * 100)

  // Bad ranges
  expect(() => weightedIntegerSource({ min: 5, max: 5, easingFunction: (v) => v })).toThrow(/same as/);
  expect(() => weightedIntegerSource({ min: 10, max: 5, easingFunction: (v) => v })).toThrow(/greater than/);
  expect(() => weightedIntegerSource({ min: 0, max: 5 } as any)).toThrow(/easingFunction/);
});

test(`minutesMs and secondsMs`, () => {
  // Deterministic via injected source: integer() = floor(v * (max-min)) + min
  expect(minutesMs({ min: 1, max: 5, source: source(0.5) })).toBe(3 * 60 * 1000);
  expect(minutesMsSource(5, )()).toBeGreaterThan(-1);

  expect(secondsMs({ min: 1, max: 5, source: source(0.5) })).toBe(3000);
  expect(secondsMs(5)).toBeGreaterThanOrEqual(0);
  expect(secondsMs(5)).toBeLessThan(5000);
});

test(`gaussian`, () => {
  const r = gaussianSource();
  for (let i = 0; i < 200; i++) {
    const v = r();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(1);
  }

  // Skewing applies a power curve: skew > 1 pushes values toward 0
  const skewHigh = gaussianSource(10);
  let sum = 0;
  for (let i = 0; i < 100; i++) sum += skewHigh();
  expect(sum / 100).toBeLessThan(0.5);
  expect(gaussian(1)).toBeGreaterThanOrEqual(0);
});

test(`noise2d`, async () => {
  // Seeded source: deterministic field
  const f = await noise2d(`simplex`, source(0.1, 0.9, 0.3, 0.7));
  const a = f(0.5, 0.5);
  // Range -1..1
  expect(a).toBeGreaterThanOrEqual(-1);
  expect(a).toBeLessThanOrEqual(1);
  // Deterministic for the same coordinates
  expect(f(0.5, 0.5)).toBe(a);
  // Changes across the field (with overwhelming likelihood)
  const b = f(12.5, -3.5);
  expect(b).not.toBe(a);

  await expect(noise2d(`perlin` as any)).rejects.toThrow(/Unknown noise kind/);
});

test(`clamp`, () => {
  expect(clamp(0.5)).toBe(0.5);
  expect(clamp(-1)).toBe(0);
  expect(clamp(2)).toBe(1);
  expect(clamp(5, 0, 10)).toBe(5);
  expect(clamp(-5, 0, 10)).toBe(0);
  expect(clamp(50, 0, 10)).toBe(10);
});
