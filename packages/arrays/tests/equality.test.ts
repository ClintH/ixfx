/* eslint-disable @typescript-eslint/ban-ts-comment */

import { test, expect, assert } from 'vitest';

import * as Arrays from '../src/index.js';
test(`isContentsTheSame`, () => {
  expect(Arrays.containsIdenticalValues([ 10, 10, 10 ])).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ `hello`, `hello`, `hello` ])).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ true, true, true ])).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ 100 ])).toBeTruthy();
  expect(Arrays.containsIdenticalValues([])).toBeTruthy();

  expect(Arrays.containsIdenticalValues([ 10, 10, 11 ])).toBeFalsy();
  expect(Arrays.containsIdenticalValues([ `Hello`, `hello` ])).toBeFalsy();
  expect(Arrays.containsIdenticalValues([ true, false ])).toBeFalsy();

  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 1 } ])).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 2 } ])).toBeFalsy();
  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 1, blah: 2 } ])).toBeFalsy();

  const eq = (a: any, b: any) => a.len === b.len;

  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 1 } ], eq)).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 1, blah: 2 } ], eq)).toBeTruthy();
  expect(Arrays.containsIdenticalValues([ { len: 1 }, { len: 1 }, { len: 2 } ], eq)).toBeFalsy();
});

test(`isEqualIgnoreOrder`, () => {
  // Default === based checking
  expect(Arrays.isEqualIgnoreOrder([ 1, 2, 3 ], [ 1, 2, 3 ])).toBeTruthy();
  expect(Arrays.isEqualIgnoreOrder([ 1, 2, 3 ], [ 3, 1, 2 ])).toBeTruthy();
  expect(Arrays.isEqualIgnoreOrder([ 1, 2, 3, 4 ], [ 3, 1, 2 ])).toBeFalsy();
  expect(Arrays.isEqualIgnoreOrder([ "a", "b", "c" ], [ "c", "a", "b" ])).toBeTruthy();
  expect(Arrays.isEqualIgnoreOrder([ "a", "b", "c" ], [ "c", "a" ])).toBeFalsy();

  const p1 = { name: 'Bob', v: 1 }
  const p2 = { name: 'Sally', v: 2 }
  const p3 = { name: 'Bob', v: 3 }
  const p4 = { name: 'Jane', v: 3 }
  const p5 = { name: 'Sally', v: 2 }

  const pp1 = { name: 'Bob', v: 1 }
  const pp2 = { name: 'Sally', v: 2 }
  const pp3 = { name: 'Bob', v: 3 }
  const pp4 = { name: 'Jane', v: 3 }
  const pp5 = { name: 'Sally', v: 2 }

  // Checking based on === still
  expect(Arrays.isEqualIgnoreOrder([ p1, p2, p3 ], [ p1, p2, p3 ])).toBeTruthy();
  expect(Arrays.isEqualIgnoreOrder([ p1, p2, p3 ], [ p3, p1, p2 ])).toBeTruthy();
  expect(Arrays.isEqualIgnoreOrder([ p1, p2, p3 ], [ pp1, pp2, pp3 ])).toBeFalsy();
  expect(Arrays.isEqualIgnoreOrder([ p1, p2, p3 ], [ p1, p2, p3, p4 ])).toBeFalsy();
  expect(Arrays.isEqualIgnoreOrder([ p1, p2, p3, p4 ], [ p1, p2, p3 ])).toBeFalsy();

  // Check based on string representation
  const key = (v: any) => JSON.stringify(v);
  expect(Arrays.isEqualIgnoreOrder([ p1, p2, p3 ], [ p1, p2, p3 ], key)).toBeTruthy();
  expect(Arrays.isEqualIgnoreOrder([ p1, p2, p3 ], [ p3, p1, p2 ], key)).toBeTruthy();
  expect(Arrays.isEqualIgnoreOrder([ p1, p2, p3 ], [ pp1, pp2, pp3 ], key)).toBeTruthy();

  /** @ts-expect-error */
  expect(() => Arrays.isEqualIgnoreOrder()).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.isEqualIgnoreOrder([], null)).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.isEqualIgnoreOrder(undefined, null)).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.isEqualIgnoreOrder("asdf", [])).toThrow();
})

test(`isEqual`, () => {
  // Default === based checking
  expect(Arrays.isEqual([ 1, 2, 3 ], [ 1, 2, 3 ])).toBeTruthy();
  expect(Arrays.isEqual([ 1, 2, 3 ], [ 3, 1, 2 ])).toBeFalsy();
  expect(Arrays.isEqual([ 1, 2, 3, 4 ], [ 1, 2, 3 ])).toBeFalsy();
  expect(Arrays.isEqual([ "a", "b", "c" ], [ "a", "b", "c" ])).toBeTruthy();
  expect(Arrays.isEqual([ "a", "b", "c" ], [ "c", "a", "b" ])).toBeFalsy();

  const p1 = { name: 'Bob', v: 1 }
  const p2 = { name: 'Sally', v: 2 }
  const p3 = { name: 'Bob', v: 3 }
  const p4 = { name: 'Jane', v: 3 }
  const p5 = { name: 'Sally', v: 2 }

  const pp1 = { name: 'Bob', v: 1 }
  const pp2 = { name: 'Sally', v: 2 }
  const pp3 = { name: 'Bob', v: 3 }
  const pp4 = { name: 'Jane', v: 3 }
  const pp5 = { name: 'Sally', v: 2 }

  // Checking based on === still
  expect(Arrays.isEqual([ p1, p2, p3 ], [ p1, p2, p3 ])).toBeTruthy();
  expect(Arrays.isEqual([ p1, p2, p3 ], [ p3, p1, p2 ])).toBeFalsy();
  expect(Arrays.isEqual([ p1, p2, p3 ], [ pp1, pp2, pp3 ])).toBeFalsy();
  expect(Arrays.isEqual([ p1, p2, p3 ], [ p1, p2, p3, p4 ])).toBeFalsy();
  expect(Arrays.isEqual([ p1, p2, p3, p4 ], [ p1, p2, p3 ])).toBeFalsy();

  // Check based on string representation
  const key = (v: any) => JSON.stringify(v);
  expect(Arrays.isEqual([ p1, p2, p3 ], [ p1, p2, p3 ], key)).toBeTruthy();
  expect(Arrays.isEqual([ p1, p2, p3 ], [ p3, p1, p2 ], key)).toBeFalsy();
  expect(Arrays.isEqual([ p1, p2, p3 ], [ pp1, pp2, pp3 ], key)).toBeTruthy();

  /** @ts-expect-error */
  expect(() => Arrays.isEqual()).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.isEqual([], null)).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.isEqual(undefined, null)).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.isEqual("asdf", [])).toThrow();
})