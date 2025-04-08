import expect from 'expect';
import { immutable, fromScalar, clamp, towardZero, scale } from '../../numbers/Bipolar.js';

test('bipolar', () => {
  const b = immutable(1);

  expect(+b + 10).toBe(11);

  expect(immutable(0.5).inverse().value).toBe(-0.5);
  expect(immutable(0.5).add(0.1).value).toBe(0.6);
  expect(immutable(0.1).multiply(2).value).toBe(0.2);
  expect(immutable(-1).asScalar()).toBe(0);
  expect(immutable(0).asScalar()).toBe(0.5);
  expect(immutable(1).asScalar()).toBe(1);

});

test(`bipolarTowardsZero`, () => {
  expect(towardZero(-1, 0.1)).toBe(-0.9);
  expect(towardZero(1, 0.1)).toBe(0.9);
  expect(towardZero(0, 0.1)).toBe(0);
  expect(towardZero(0.9, 10)).toBe(0);
  expect(towardZero(-0.9, 10)).toBe(0);
});

test(`clamp`, () => {
  expect(clamp(0)).toBe(0);
  expect(clamp(1)).toBe(1);
  expect(clamp(-1)).toBe(-1);
  expect(clamp(1.1)).toBe(1);
  expect(clamp(-1.1)).toBe(-1);

  expect(() => clamp(NaN)).toThrow();
  // @ts-expect-error
  expect(() => clamp(false)).toThrow();
  // @ts-expect-error
  expect(() => clamp("hello")).toThrow();

});

test(`scalarToBipolar`, () => {
  expect(fromScalar(1)).toBe(1);
  expect(fromScalar(0)).toBe(-1);
  expect(fromScalar(0.5)).toBe(0);

  expect(() => fromScalar(Number.NaN)).toThrow();
  // @ts-expect-error
  expect(() => fromScalar(true)).toThrow();
  expect(() => fromScalar(1.01)).toThrow();
  expect(() => fromScalar(-0.01)).toThrow();
});

test(`scale`, () => {
  expect(scale(-10, -10, 10)).toBe(-1);
  expect(scale(0, -10, 10)).toBe(0);
  expect(scale(10, -10, 10)).toBe(1);
  expect(scale(-5, -10, 10)).toBe(-0.5);
  expect(scale(5, -10, 10)).toBe(0.5);



})