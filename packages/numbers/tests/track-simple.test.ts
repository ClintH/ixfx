
import { test, expect } from 'vitest';
import { trackSimple } from '../src/track-simple.js';

test(`test`, () => {
  const t = trackSimple();
  expect(t.count).toBe(0);
  expect(t.total).toBe(0);
  expect(t.min).toBe(Number.MAX_SAFE_INTEGER);
  expect(t.max).toBe(Number.MIN_SAFE_INTEGER);

  t.seen(10);
  expect(t.count).toBe(1);
  expect(t.min).toBe(10);
  expect(t.max).toBe(10);
  expect(t.total).toBe(10);
  expect(t.rangeToString(0)).toBe(`10.00 - 10.00`);

  t.seen(20);
  expect(t.count).toBe(2);
  expect(t.min).toBe(10);
  expect(t.max).toBe(20);
  expect(t.total).toBe(30);
  expect(t.rangeToString()).toBe(`10.00 - 20.00`);


  t.seen(5);
  expect(t.count).toBe(3);
  expect(t.min).toBe(5);
  expect(t.max).toBe(20);
  expect(t.total).toBe(35);
  expect(t.rangeToString()).toBe(`5.00 - 20.00`);

  t.reset();
  expect(t.count).toBe(0);
  expect(t.total).toBe(0);
  expect(t.min).toBe(Number.MAX_SAFE_INTEGER);
  expect(t.max).toBe(Number.MIN_SAFE_INTEGER);

});