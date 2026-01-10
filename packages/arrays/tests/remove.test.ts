/* eslint-disable @typescript-eslint/ban-ts-comment */

import { test, expect, assert } from 'vitest';
import * as Arrays from '../src/index.js';
test(`remove`, () => {
  expect(Arrays.remove([ 1, 2, 3 ], 2)).toEqual([ 1, 2 ]);
  expect(Arrays.remove([ 1, 2, 3 ], 0)).toEqual([ 2, 3 ]);
  expect(Arrays.remove([ 1, 2, 3 ], 1)).toEqual([ 1, 3 ]);

  // Index past length
  expect(() => Arrays.remove([ 1, 2, 3 ], 3)).toThrow();
  // Not an array
  expect(() => Arrays.remove(10 as any as [], 3)).toThrow();

  /** @ts-expect-error */
  expect(() => Arrays.remove(null)).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.remove("")).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.remove({})).toThrow();

});

test(`remove-by-filter`, () => {
  const testData = [ 1, 2, 3 ];
  expect(Arrays.removeByFilter(testData, v => v === 2)).toEqual([ [ 1, 3 ], 1 ]);
  expect(Arrays.removeByFilter(testData, v => v > 1)).toEqual([ [ 1 ], 2 ]);
  expect(Arrays.removeByFilter(testData, v => v > 10)).toEqual([ [ 1, 2, 3 ], 0 ]);
  expect(testData).toEqual([ 1, 2, 3 ]);

  /** @ts-expect-error */
  expect(() => Arrays.remove(null)).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.remove("")).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.remove({})).toThrow();
});

test('without-undefined', () => {
  expect(Arrays.withoutUndefined([ `a`, `b`, undefined, `c` ])).toEqual([ `a`, `b`, `c` ]);
  expect(Arrays.withoutUndefined([ undefined, undefined ])).toEqual([]);

  /** @ts-expect-error */
  expect(() => Arrays.withoutUndefined(null)).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.withoutUndefined("")).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.withoutUndefined({})).toThrow();
});

test('without', () => {
  expect(Arrays.without([ `a`, `b`, `c` ], `b`)).toEqual([ `a`, `c` ]);
  expect(Arrays.without([ `a`, `b`, `c` ], [ `b`, `c` ])).toEqual([ `a` ]);
  expect(Arrays.without([ `a`, `b`, `c` ], [ `a`, `b`, `c` ])).toEqual([]);
  expect(Arrays.without([ `a`, `b`, `c` ], `d`)).toEqual([ `a`, `b`, `c` ]);

  /** @ts-expect-error */
  expect(() => Arrays.without(null)).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.without("")).toThrow();
  /** @ts-expect-error */
  expect(() => Arrays.without({})).toThrow();
});