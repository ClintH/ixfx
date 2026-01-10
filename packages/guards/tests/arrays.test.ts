import { test, expect } from 'vitest';
import { arrayIndexTest, arrayStringsTest } from '../src/arrays.js';

test(`isStringArray`, () => {
  expect(arrayStringsTest([ `a`, `b`, `c` ]).success).toBeTruthy();
  expect(arrayStringsTest([ 'a' ]).success).toBeTruthy();
  expect(arrayStringsTest([ `a`, `b`, false ]).success).toBeFalsy();
  expect(arrayStringsTest([ `a`, `b`, null ]).success).toBeFalsy();
  expect(arrayStringsTest([ `a`, `b`, true ]).success).toBeFalsy();
  expect(arrayStringsTest([ `a`, `b`, {} ]).success).toBeFalsy();
});


test(`arrayIndexTest`, () => {
  expect(arrayIndexTest([ 1, 2, 3 ], -1).success).toBeFalsy();

  expect(arrayIndexTest([ 1, 2, 3 ], 0).success).toBeTruthy();
  expect(arrayIndexTest([ 1, 2, 3 ], 1).success).toBeTruthy();
  expect(arrayIndexTest([ 1, 2, 3 ], 2).success).toBeTruthy();
  expect(arrayIndexTest([ 1, 2, 3 ], 3).success).toBeFalsy();

  expect(arrayIndexTest([ 1, 2, 3 ], false as any as number).success).toBeFalsy();
  expect(arrayIndexTest([ 1, 2, 3 ], {} as any as number).success).toBeFalsy();
  expect(arrayIndexTest([ 1, 2, 3 ], Number.NaN).success).toBeFalsy();
  expect(arrayIndexTest([ 1, 2, 3 ], `hello` as any as number).success).toBeFalsy();


})