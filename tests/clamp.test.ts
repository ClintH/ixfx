import {clamp, clampZeroBounds} from '../src/util.js';

test('inclusivity', () => {
  expect(clamp(0, 0, 1)).toBe(0);
  expect(clamp(-1, 0, 1)).toBe(0);

  expect(clamp(1, 0, 1)).toBe(1);
  expect(clamp(1.1, 0, 1)).toBe(1);
});

test('range', () => {
  expect(clamp(0.5, 0, 1)).toBe(0.5);
  expect(clamp(0.000000005, 0, 1)).toBe(0.000000005);

  expect(clamp(100, -100, 100)).toBe(100);
  expect(clamp(-100, -100, 100)).toBe(-100);
  expect(clamp(0, -100, 100)).toBe(0);

  // test guards
  expect(() => clamp(NaN, 0, 100)).toThrow();
  expect(() => clamp(10, NaN, 100)).toThrow();
  expect(() => clamp(10, 0, NaN)).toThrow();
});

test('zero bounds', () => {
  expect(clampZeroBounds(0, 5)).toBe(0);
  expect(clampZeroBounds(4, 5)).toBe(4);
  expect(clampZeroBounds(5, 5)).toBe(4);
  expect(clampZeroBounds(-5, 5)).toBe(0);

  // test throwing for non-ints
  expect(() => clampZeroBounds(0, 5.5)).toThrow();
  expect(() => clampZeroBounds(0.5, 5)).toThrow();
  expect(() => clampZeroBounds(NaN, 5)).toThrow();
  expect(() => clampZeroBounds(0, NaN)).toThrow();

});
