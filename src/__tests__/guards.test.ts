/* eslint-disable */
import { expect, test } from '@jest/globals';
import {integer, integerParse, percent} from '../Guards';

test (`percent`, () => {
  expect(() => percent(2)).toThrow();
  expect(() => percent(-2)).toThrow();
  expect(() => percent(Number.NaN)).toThrow();
  // @ts-ignore
  expect(() => percent(`string`)).toThrow();
  // @ts-ignore
  expect(() => percent(true)).toThrow();
  // @ts-ignore
  expect(() => percent(false)).toThrow();
  // @ts-ignore
  expect(() => percent({a:true})).toThrow();


  expect(() => percent(1)).not.toThrow();
  expect(() => percent(0)).not.toThrow();
  expect(() => percent(0.5)).not.toThrow();

});

test(`integer`, () => {
  // @ts-ignore
  expect(() => integer(`string`)).toThrow();
  // @ts-ignore
  expect(() => integer(true)).toThrow();
  // @ts-ignore
  expect(() => integer(false)).toThrow();
  // @ts-ignore
  expect(() => integer({a:true})).toThrow();

  expect(() => integer(-0.5)).toThrow();
  expect(() => integer(0.5)).toThrow();
  expect(() => integer(Number.NaN)).toThrow();

  expect(() => integer(0)).not.toThrow();
  expect(() => integer(1)).not.toThrow();
  expect(() => integer(100)).not.toThrow();

});

test(`integerParse`, () => {
  expect(integerParse('10', 'positive')).toEqual(10);
  expect(integerParse('10.89', 'positive')).toEqual(10);
  expect(integerParse('0', 'positive', 0)).toEqual(0);
  expect(integerParse('-10', 'positive', 0)).toEqual(0);

  expect(integerParse('-10', 'negative')).toEqual(-10);
  expect(integerParse('-10.99', 'negative')).toEqual(-10);
  expect(integerParse('0', 'negative')).toEqual(0);
  expect(integerParse('10', 'negative')).toBeNaN();
  expect(integerParse('10', 'negative', 0)).toEqual(0);
  
  expect(integerParse('10', 'aboveZero')).toEqual(10);
  expect(integerParse('0', 'aboveZero')).toBeNaN();
  expect(integerParse('-10', 'aboveZero')).toBeNaN();

  expect(integerParse('-10', 'belowZero')).toEqual(-10);
  expect(integerParse('0', 'belowZero')).toBeNaN();
  expect(integerParse('10', 'belowZero')).toBeNaN();

  expect(integerParse('-1', 'bipolar')).toEqual(-1);
  expect(integerParse('1', 'bipolar')).toEqual(1);
  expect(integerParse('0', 'bipolar')).toEqual(0);
  expect(integerParse('-2', 'bipolar')).toBeNaN();
  expect(integerParse('2', 'bipolar')).toBeNaN();

  expect(integerParse('-10', 'nonZero')).toEqual(-10);
  expect(integerParse('0', 'aboveZero')).toBeNaN();
  expect(integerParse('10', 'aboveZero')).toEqual(10);

  expect(integerParse('1', 'percentage')).toEqual(1);
  expect(integerParse('0', 'percentage')).toEqual(0);
  expect(integerParse('-1', 'percentage')).toBeNaN();
  expect(integerParse('-2', 'percentage')).toBeNaN();
  expect(integerParse('2', 'percentage')).toBeNaN();


});