/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect } from 'vitest';
import { immutable, fromScalar, clamp, towardZero, scale, toScalar, scaleUnclamped } from '../src/bipolar.js';

test('immutable', () => {
  const b = immutable(1);

  expect(+b + 10).toBe(11);

  expect(immutable(0.5).inverse().value).toBe(-0.5);
  expect(immutable(0.5).add(0.1).value).toBe(0.6);
  expect(immutable(0.1).multiply(2).value).toBe(0.2);
  expect(immutable(-1).asScalar()).toBe(0);
  expect(immutable(0).asScalar()).toBe(0.5);
  expect(immutable(1).asScalar()).toBe(1);

  expect(immutable(0).interpolate(0.5, 1).value).toBe(0.5);
  expect(immutable(0.5).towardZero(0.1).value).toBe(0.4);
  expect(() => immutable(1.1)).toThrow();
  expect(() => immutable(-1.1)).toThrow();
  expect(() => immutable(Number.NaN)).toThrow();
  // @ts-expect-error
  expect(() => immutable(null)).toThrow();


  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-base-to-string
  expect('' + immutable(1)).toBe(`1`);
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  expect(1 + immutable(1)).toBe(2);

});

test('scaleUnclamped', () => {
  expect(scaleUnclamped(100, 0, 100)).toBe(1);
  expect(scaleUnclamped(50, 0, 100)).toBe(0);
  expect(scaleUnclamped(0, 0, 100)).toBe(-1);

});

test(`toScalar`, () => {
  expect(toScalar(-1)).toBe(0);
  expect(toScalar(0)).toBe(0.5);
  expect(toScalar(1)).toBe(1);

  expect(toScalar(-1, 100)).toBe(0);
  expect(toScalar(0, 100)).toBe(50);
  expect(toScalar(1, 100)).toBe(100);

  expect(toScalar(-1, 100, 50)).toBe(50);
  expect(toScalar(0, 100, 50)).toBe(75);
  expect(toScalar(1, 100, 50)).toBe(100);

  // @ts-expect-error
  expect(() => toScalar(null)).toThrow();
  expect(() => toScalar(Number.NaN)).toThrow();

});

test(`towardZero`, () => {
  expect(towardZero(-1, 0.1)).toBe(-0.9);
  expect(towardZero(1, 0.1)).toBe(0.9);
  expect(towardZero(0, 0.1)).toBe(0);
  expect(towardZero(0.9, 10)).toBe(0);
  expect(towardZero(-0.9, 10)).toBe(0);

  // @ts-expect-error
  expect(() => towardZero(null)).toThrow();
  // @ts-expect-error
  expect(() => towardZero(-1, null)).toThrow();
  expect(() => towardZero(-1, -0.1)).toThrow();

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

test(`fromScalar`, () => {
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