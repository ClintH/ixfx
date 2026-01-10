import { assert, describe, test, expect, it } from "vitest";
import { CircularArray } from '../src/circular-array.js';

test(`circularArray`, () => {
  const ca1 = new CircularArray<string>(5);
  const ca2 = ca1.add(`a`);
  const ca3 = ca2.add(`b`);
  const ca4 = ca3.add(`c`);
  const ca5 = ca4.add(`d`);
  const ca6 = ca5.add(`e`);

  expect(ca1.length === 0).toBe(true);
  expect(ca2.length === 1).toBe(true);
  expect(ca3.length === 2).toBe(true);
  expect(ca4.length === 3).toBe(true);
  expect(ca5.length === 4).toBe(true);
  expect(ca6.length === 5).toBe(true);

  expect(ca1 !== ca2).toBe(true);
  expect(ca2 !== ca3).toBe(true);
  expect(ca3 !== ca4).toBe(true);
  expect(ca4 !== ca5).toBe(true);
  expect(ca5 !== ca6).toBe(true);

  //t.like(ca6 as string[], [ `a`, `b`, `c`, `d`, `e` ]);
  expect(ca6 as string[]).toEqual([ `a`, `b`, `c`, `d`, `e` ]);

  expect(ca1.isFull).toBe(false);
  expect(ca2.isFull).toBe(false);
  expect(ca3.isFull).toBe(false);
  expect(ca4.isFull).toBe(false);
  expect(ca5.isFull).toBe(false);
  expect(ca6.isFull).toBe(true);

  expect(ca1.pointer === 0).toBe(true);
  expect(ca2.pointer === 1).toBe(true);
  expect(ca3.pointer === 2).toBe(true);
  expect(ca4.pointer === 3).toBe(true);
  expect(ca5.pointer === 4).toBe(true);
  expect(ca6.pointer === 0).toBe(true);


  const ca7 = ca6.add(`f`);
  expect(ca7.length === 5).toBe(true);
  expect(ca7.pointer === 1).toBe(true);

  expect(ca6 as string[]).toEqual([ `a`, `b`, `c`, `d`, `e` ]);
  expect(ca7 as string[]).toEqual([ `f`, `b`, `c`, `d`, `e` ]);

});