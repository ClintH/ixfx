/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect, assert } from 'vitest';
import * as Arrays from '../src/index.js';

test(`chunk`, () => {
  expect(Arrays.chunks([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ], 3)).toEqual([ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ], [ 10 ] ]);

  expect(Arrays.chunks([ 1, 2, 3 ], 3)).toEqual([ [ 1, 2, 3 ] ]);
  expect(Arrays.chunks([], 3)).toEqual([]);
  expect(Arrays.chunks([ 1, 2, 3 ], 5)).toEqual([ [ 1, 2, 3 ] ]);


  // @ts-expect-error
  expect(() => Arrays.chunks({ hello: `there` })).toThrow();
  // @ts-expect-error
  expect(() => Arrays.chunks(false)).toThrow();
  // @ts-expect-error
  expect(() => Arrays.chunks([ 1, 2, 3 ], `horse`)).toThrow();
  expect(() => Arrays.chunks([ 1, 2, 3 ], 1.4)).toThrow();


});