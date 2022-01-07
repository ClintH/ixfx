import {average, clamp, clampZeroBounds} from '../util.js';


test(`average`, () => {
  const a = [1];
  expect(average(...a)).toEqual(1);

  const b =[1, 2, 3, 4, 5];
  expect(average(...b)).toEqual(3);

  const c = [-5, 5];
  expect(average(...c)).toEqual(0);

  const d = [1, 0, null, undefined, NaN];
  // @ts-ignore
  expect(average(...d)).toEqual(0.5);

  const e = [1, 1.4, 0.9, 0.1];
  expect(average(...e)).toEqual(0.85);
});

test(`clamp-inclusivity`, () => {
  expect(clamp(0, 0, 1)).toBe(0);
  expect(clamp(-1, 0, 1)).toBe(0);

  expect(clamp(1, 0, 1)).toBe(1);
  expect(clamp(1.1, 0, 1)).toBe(1);
});

test(`clamp-range`, () => {
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

test(`clamp-zero-bounds`, () => {
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
