import { test, expect } from 'vitest';
import { ifNaN, percentTest, integerTest, integerParse, isInteger, integerArrayTest, numberDecimalTest } from '../src/numbers.js';

test('ifNaN', () => {
  expect(ifNaN(Number.NaN, 10)).toBe(10);
  expect(ifNaN(200, 10)).toBe(200);
  expect(() => ifNaN(null, 10)).toThrow();
  expect(() => ifNaN(undefined, 10)).toThrow();
  expect(() => ifNaN('100', 10)).toThrow();
});

test(`integerArrayTest`, () => {
  expect(integerArrayTest([ 1, 2, 3 ]).success).toBeTruthy()
  expect(integerArrayTest([ 1, 2.3, 3 ]).success).toBeFalsy();


})

test(`numberDecimalTest`, () => {
  expect(numberDecimalTest(10, 10, 0).success).toBeTruthy();
  expect(numberDecimalTest(10.1234, 10.1234, 0).success).toBeTruthy();
  expect(numberDecimalTest(10.1234, 10, 0).success).toBeTruthy();
  expect(numberDecimalTest(10.1234, 10.5, 0).success).toBeTruthy();
  expect(numberDecimalTest(10.1234, 9, 0).success).toBeFalsy();

  expect(numberDecimalTest(10.1234, 10.1234, 4).success).toBeTruthy();
  expect(numberDecimalTest(10.1234, 10.12345, 4).success).toBeTruthy();

  expect(numberDecimalTest(10.1234, 10.1235, 3).success).toBeTruthy();
  expect(numberDecimalTest(10.1234, 10.123, 3).success).toBeTruthy();
  expect(numberDecimalTest(10.1234, 10.124, 3).success).toBeFalsy();

  expect(numberDecimalTest(10.1234, 10.1234, 2).success).toBeTruthy();
  expect(numberDecimalTest(10.1234, 10.12356, 2).success).toBeTruthy();
  expect(numberDecimalTest(10.1234, 10.124, 2).success).toBeTruthy();
  expect(numberDecimalTest(10.1234, 10.2, 2).success).toBeFalsy();
  expect(numberDecimalTest(10.1234, 11, 2).success).toBeFalsy();



});

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
  expect(percentTest(2).success).toBe(false);
  expect(percentTest(-2).success).toBe(false);
  expect(percentTest(Number.NaN).success).toBe(false);
  // @ts-expect-error
  expect(percentTest(`string`).success).toBe(false);
  // @ts-expect-error
  expect(percentTest(true).success).toBe(false);
  // @ts-expect-error
  expect(percentTest(false).success).toBe(false);
  // @ts-expect-error
  expect(percentTest({ a: true }).success).toBe(false);

  expect(percentTest(1).success).toBe(true);
  expect(percentTest(0).success).toBe(true);
  expect(percentTest(0.5).success).toBe(true);
});

test(`integer`, () => {
  expect(integerTest(`string`).success).toBe(false);
  expect(integerTest(true).success).toBe(false);
  expect(integerTest(false).success).toBe(false);
  expect(integerTest({ a: true }).success).toBe(false);

  expect(integerTest(-0.5).success).toBe(false);
  expect(integerTest(0.5).success).toBe(false);
  expect(integerTest(Number.NaN).success).toBe(false);

  expect(integerTest(0).success).toBe(true);
  expect(integerTest(1).success).toBe(true);
  expect(integerTest(100).success).toBe(true);
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
