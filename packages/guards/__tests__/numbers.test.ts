import { test, expect } from 'vitest';
import { ifNaN, percentTest, integerTest, integerParse, isInteger, integerArrayTest } from '../src/numbers.js';

test('ifNaN', () => {
  expect(ifNaN(Number.NaN, 10)).toBe(10);
  expect(ifNaN(200, 10)).toBe(200);
  // @ts-ignore
  expect(() => ifNaN(null, 10)).toThrow();
  // @ts-ignore
  expect(() => ifNaN(undefined, 10)).toThrow();
  // @ts-ignore
  expect(() => ifNaN('100', 10)).toThrow();
});

test(`integerArrayTest`, () => {
  expect(integerArrayTest([ 1, 2, 3 ])[ 0 ]).toBeTruthy()
  expect(integerArrayTest([ 1, 2.3, 3 ])[ 0 ]).toBeFalsy();


})
test('isInteger', () => {
  // Nunber inputs
  expect(isInteger(1)).toBe(true);
  expect(isInteger(0)).toBe(true);
  expect(isInteger(0.1)).toBe(false);
  expect(isInteger(0.9)).toBe(false);
  expect(isInteger(99.9)).toBe(false);
  expect(isInteger(Number.NaN)).toBe(false);

  // String inputs
  expect(isInteger(`1`)).toBe(true);
  expect(isInteger(`0`)).toBe(true);
  expect(isInteger(`1.1`)).toBe(false);

  // @ts-expect-error
  expect(isInteger({})).toBe(false);
  // @ts-expect-error
  expect(isInteger(false)).toBe(false);
  // @ts-expect-error
  expect(isInteger(true)).toBe(false);
  // @ts-expect-error
  expect(isInteger(new Map())).toBe(false);

});

test(`percent`, () => {
  expect(percentTest(2)[ 0 ]).toBe(false);
  expect(percentTest(-2)[ 0 ]).toBe(false);
  expect(percentTest(Number.NaN)[ 0 ]).toBe(false);
  // @ts-expect-error
  expect(percentTest(`string`)[ 0 ]).toBe(false);
  // @ts-expect-error
  expect(percentTest(true)[ 0 ]).toBe(false);
  // @ts-expect-error
  expect(percentTest(false)[ 0 ]).toBe(false);
  // @ts-expect-error
  expect(percentTest({ a: true })[ 0 ]).toBe(false);

  expect(percentTest(1)[ 0 ]).toBe(true);
  expect(percentTest(0)[ 0 ]).toBe(true);
  expect(percentTest(0.5)[ 0 ]).toBe(true);
});

test(`integer`, () => {
  // @ts-ignore
  expect(integerTest(`string`)[ 0 ]).toBe(false);
  // @ts-ignore
  expect(integerTest(true)[ 0 ]).toBe(false);
  // @ts-ignore
  expect(integerTest(false)[ 0 ]).toBe(false);
  // @ts-ignore
  expect(integerTest({ a: true })[ 0 ]).toBe(false);

  expect(integerTest(-0.5)[ 0 ]).toBe(false);
  expect(integerTest(0.5)[ 0 ]).toBe(false);
  expect(integerTest(Number.NaN)[ 0 ]).toBe(false);

  expect(integerTest(0)[ 0 ]).toBe(true);
  expect(integerTest(1)[ 0 ]).toBe(true);
  expect(integerTest(100)[ 0 ]).toBe(true);
});

test(`integerParse`, () => {
  expect(integerParse(`10`, `positive`)).toBe(10);
  expect(integerParse(`10.89`, `positive`)).toBe(10);
  expect(integerParse(`0`, `positive`, 0)).toBe(0);
  expect(integerParse(`-10`, `positive`, 0)).toBe(0);

  expect(integerParse(`-10`, `negative`)).toBe(-10);
  expect(integerParse(`-10.99`, `negative`)).toBe(-10);
  expect(integerParse(`0`, `negative`)).toBe(0);
  expect(Number.isNaN(integerParse(`10`, `negative`))).toBe(true);
  expect(integerParse(`10`, `negative`, 0)).toBe(0);

  expect(integerParse(`10`, `aboveZero`)).toBe(10);
  expect(Number.isNaN(integerParse(`0`, `aboveZero`))).toBe(true);
  expect(Number.isNaN(integerParse(`-10`, `aboveZero`))).toBe(true);

  expect(integerParse(`-10`, `belowZero`) === -10).toBe(true);
  expect(Number.isNaN(integerParse(`0`, `belowZero`))).toBe(true);
  expect(Number.isNaN(integerParse(`10`, `belowZero`))).toBe(true);

  expect(integerParse(`-1`, `bipolar`) === -1).toBe(true);
  expect(integerParse(`1`, `bipolar`) === 1).toBe(true);
  expect(integerParse(`0`, `bipolar`) === 0).toBe(true);
  expect(Number.isNaN(integerParse(`-2`, `bipolar`))).toBe(true);
  expect(Number.isNaN(integerParse(`2`, `bipolar`))).toBe(true);

  expect(integerParse(`-10`, `nonZero`)).toBe(-10);
  expect(Number.isNaN(integerParse(`0`, `aboveZero`))).toBe(true);
  expect(integerParse(`10`, `aboveZero`)).toBe(10);

  expect(integerParse(`1`, `percentage`)).toBe(1);
  expect(integerParse(`0`, `percentage`)).toBe(0);
  expect(Number.isNaN(integerParse(`-1`, `percentage`))).toBe(true);
  expect(Number.isNaN(integerParse(`-2`, `percentage`))).toBe(true);
  expect(Number.isNaN(integerParse(`2`, `percentage`))).toBe(true);
});
