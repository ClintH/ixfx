/* eslint-disable */
import { expect, test } from '@jest/globals';
import {integer, percent} from '../Guards';

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
